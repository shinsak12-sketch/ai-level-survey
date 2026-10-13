import { query, roomOf } from '../lib/db.js';

// 센터원 업무 공유: 공지(notice) · 오늘 근무(status) · 인수인계(handover) · 노하우(tip)
const STATES = ['출근', '외근', '휴가', '반차', '교육', '재택'];
const CATS = ['공업사', '병원', '렌트', '견인', '노하우', '기타'];
const MAX_ITEMS = 600;
let ready;

function ensure() {
  if (!ready) {
    ready = (async () => {
      await query(`CREATE TABLE IF NOT EXISTS center_items (
        id         text        PRIMARY KEY,
        room       text        NOT NULL,
        kind       text        NOT NULL,
        cid        text        NOT NULL,
        author     text        NOT NULL DEFAULT '',
        data       jsonb       NOT NULL,
        done       boolean     NOT NULL DEFAULT false,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )`);
      await query('CREATE INDEX IF NOT EXISTS center_items_room ON center_items (room, kind)');
    })().catch((e) => { ready = null; throw e; });
  }
  return ready;
}

function kstToday() { return new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10); }
const s = (v, n) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, n);
const ml = (v, n) => String(v ?? '').replace(/\r/g, '').replace(/\n{3,}/g, '\n\n').trim().slice(0, n);
const rid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// 종류별로 받을 값만 골라 정리. 필수 값이 없으면 null
function clean(kind, d = {}) {
  if (kind === 'notice') {
    const text = ml(d.text, 200);
    return text ? { text, pin: !!d.pin } : null;
  }
  if (kind === 'status') {
    const state = STATES.includes(d.state) ? d.state : null;
    return state ? { date: kstToday(), state, note: s(d.note, 30), sub: s(d.sub, 12) } : null;
  }
  if (kind === 'handover') {
    const title = s(d.title, 40);
    const to = s(d.to, 12);
    if (!title || !to) return null;
    const due = /^\d{4}-\d{2}-\d{2}$/.test(d.due || '') ? d.due : '';
    return { caseNo: s(d.caseNo, 20), title, to, progress: ml(d.progress, 200), next: s(d.next, 120), due };
  }
  if (kind === 'tip') {
    const name = s(d.name, 40);
    if (!name) return null;
    return { cat: CATS.includes(d.cat) ? d.cat : '기타', name, area: s(d.area, 20), phone: s(d.phone, 20), text: ml(d.text, 300) };
  }
  return null;
}

async function count(room) {
  const [r] = await query('SELECT count(*)::int AS n FROM center_items WHERE room = $1', [room]);
  return r.n;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  try {
    await ensure();
    if (req.method === 'GET') {
      const room = roomOf(req.query.room);
      const cid = String(req.headers['x-cid'] || '');
      const today = kstToday();
      const rows = await query(
        `SELECT id, kind, cid, author, data, done, extract(epoch FROM updated_at) * 1000 AS at
           FROM center_items
          WHERE room = $1
            AND (kind <> 'status' OR data->>'date' = $2)
            AND NOT (kind = 'handover' AND done AND updated_at < now() - interval '7 days')
          ORDER BY updated_at DESC
          LIMIT 500`,
        [room, today],
      );
      return res.status(200).json({
        room,
        today,
        items: rows.map((r) => ({ id: r.id, kind: r.kind, author: r.author, data: r.data, done: r.done, at: Number(r.at), mine: !!cid && r.cid === cid })),
      });
    }

    if (req.method !== 'POST') return res.status(405).json({ error: 'GET 또는 POST만 받아요' });
    const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const room = roomOf(b.room);
    const cid = s(b.cid, 64);
    const author = s(b.author, 12);
    if (cid.length < 8) return res.status(400).json({ error: '잘못된 요청이에요' });
    if (!author) return res.status(400).json({ error: '이름을 먼저 설정해 주세요' });

    if (b.op === 'add') {
      const data = clean(b.kind, b.data);
      if (!data) return res.status(400).json({ error: '필수 항목을 채워 주세요' });
      if (b.kind === 'status') {
        const id = `st:${room}:${cid}:${data.date}`;
        await query(
          `INSERT INTO center_items (id, room, kind, cid, author, data) VALUES ($1,$2,'status',$3,$4,$5)
           ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, author = EXCLUDED.author, updated_at = now()`,
          [id, room, cid, author, JSON.stringify(data)],
        );
        return res.status(200).json({ ok: true, id });
      }
      if ((await count(room)) >= MAX_ITEMS) return res.status(400).json({ error: '이 방은 더 이상 글을 받을 수 없어요' });
      const id = rid();
      await query('INSERT INTO center_items (id, room, kind, cid, author, data) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, room, b.kind, cid, author, JSON.stringify(data)]);
      return res.status(200).json({ ok: true, id });
    }

    if (b.op === 'done') {
      // 인수인계 완료 표시는 누구나 (받은 사람이 처리하니까)
      await query(`UPDATE center_items SET done = NOT done, updated_at = now() WHERE id = $1 AND room = $2 AND kind = 'handover'`, [s(b.id, 80), room]);
      return res.status(200).json({ ok: true });
    }

    if (b.op === 'delete') {
      // 삭제는 쓴 사람만
      await query('DELETE FROM center_items WHERE id = $1 AND room = $2 AND cid = $3', [s(b.id, 80), room, cid]);
      return res.status(200).json({ ok: true });
    }

    if (b.op === 'seed') {
      // 빈 방에만 예시 채우기
      if ((await count(room)) > 0) return res.status(400).json({ error: '이미 글이 있는 방이에요' });
      const items = Array.isArray(b.items) ? b.items.slice(0, 30) : [];
      const seedCid = `seed-${rid()}`; // 예시 글은 누구의 것도 아니게 (내 글로 안 잡히고 삭제도 안 됨)
      for (const it of items) {
        const data = clean(it.kind, it.data);
        if (!data) continue;
        await query('INSERT INTO center_items (id, room, kind, cid, author, data, done) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [rid(), room, it.kind, seedCid, s(it.author, 12) || author, JSON.stringify(data), !!it.done && it.kind === 'handover']);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: '알 수 없는 요청이에요' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
