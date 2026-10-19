import { query, roomOf } from '../lib/db.js';
import { clean, isPaid } from '../public/survey.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 받아요' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const room = roomOf(body.room);
    const cid = String(body.cid || '').slice(0, 64);
    if (cid.length < 8) return res.status(400).json({ error: '잘못된 요청이에요' });
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    const answers = clean(body.answers);
    const feats = answers.feats.filter((k) => k !== 'none'); // 써 본 기능 (uses 칸에 저장)

    // 점수 · 등급은 쓰지 않는다 (score · level 칸은 0으로 둔다)
    await query(
      `INSERT INTO responses (room, cid, name, grp, answers, score, level, paid, uses, wish)
       VALUES ($1,$2,$3,null,$4,0,0,$5,$6,$7)
       ON CONFLICT (room, cid) DO UPDATE SET
         name = EXCLUDED.name, answers = EXCLUDED.answers, paid = EXCLUDED.paid,
         uses = EXCLUDED.uses, wish = EXCLUDED.wish, updated_at = now()`,
      [room, cid, name, JSON.stringify(answers), isPaid(answers), feats, answers.wish],
    );
    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
