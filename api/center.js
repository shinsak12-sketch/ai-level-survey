import { query, roomOf } from '../lib/db.js';

// 센터원 업무 공유: 공지(notice) · 할 일(todo) · 주소록(contact) · 비상연락망(emergency) · 메신저(message)
const KINDS = ['notice', 'todo', 'contact', 'emergency', 'message'];
const MAX_ITEMS = 1500;
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
  const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v || '') ? v : '');
  if (kind === 'notice') {
    const text = ml(d.text, 200);
    return text ? { text, pin: !!d.pin } : null;
  }
  if (kind === 'todo') {
    const title = s(d.title, 60);
    const date = day(d.date) || kstToday();
    return title ? { title, date, who: s(d.who, 12) } : null;
  }
  if (kind === 'contact') {
    const name = s(d.name, 12);
    return name ? { name, role: s(d.role, 12), team: s(d.team, 20), ext: s(d.ext, 10), phone: s(d.phone, 20) } : null;
  }
  if (kind === 'emergency') {
    const name = s(d.name, 20);
    if (!name) return null;
    const group = d.group === 'ext' ? 'ext' : 'chain';
    const step = Math.min(9, Math.max(1, Number(d.step) || 1));
    return { group, step, name, role: s(d.role, 30), phone: s(d.phone, 20) };
  }
  if (kind === 'message') {
    const text = ml(d.text, 300);
    return text ? { text } : null;
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
      const rows = await query(
        `SELECT id, kind, cid, author, data, done, extract(epoch FROM created_at) * 1000 AS at
           FROM center_items
          WHERE room = $1
            AND kind = ANY($2)
            AND NOT (kind = 'todo' AND done AND updated_at < now() - interval '14 days')
          ORDER BY created_at DESC
          LIMIT 1200`,
        [room, KINDS],
      );
      return res.status(200).json({
        room,
        today: kstToday(),
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
      if (!KINDS.includes(b.kind)) return res.status(400).json({ error: '알 수 없는 종류예요' });
      const data = clean(b.kind, b.data);
      if (!data) return res.status(400).json({ error: '필수 항목을 채워 주세요' });
      if ((await count(room)) >= MAX_ITEMS) return res.status(400).json({ error: '이 방은 더 이상 글을 받을 수 없어요' });
      const id = rid();
      await query('INSERT INTO center_items (id, room, kind, cid, author, data) VALUES ($1,$2,$3,$4,$5,$6)',
        [id, room, b.kind, cid, author, JSON.stringify(data)]);
      return res.status(200).json({ ok: true, id });
    }

    if (b.op === 'done') {
      // 할 일 완료 표시는 누구나 (담당자가 처리하니까)
      await query(`UPDATE center_items SET done = NOT done, updated_at = now() WHERE id = $1 AND room = $2 AND kind = 'todo'`, [s(b.id, 80), room]);
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
      const items = Array.isArray(b.items) ? b.items.slice(0, 40) : [];
      const seedCid = `seed-${rid()}`; // 예시 글은 누구의 것도 아니게 (내 글로 안 잡히고 삭제도 안 됨)
      for (const it of items) {
        if (!KINDS.includes(it.kind)) continue;
        const data = clean(it.kind, it.data);
        if (!data) continue;
        await query('INSERT INTO center_items (id, room, kind, cid, author, data, done) VALUES ($1,$2,$3,$4,$5,$6,$7)',
          [rid(), room, it.kind, seedCid, s(it.author, 12) || author, JSON.stringify(data), !!it.done && it.kind === 'todo']);
      }
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: '알 수 없는 요청이에요' });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: e.message });
  }
}
