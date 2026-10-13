import { query, roomOf } from '../lib/db.js';
import { clean, grade, isPaid } from '../public/survey.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST만 받아요' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
    const room = roomOf(body.room);
    const cid = String(body.cid || '').slice(0, 64);
    if (cid.length < 8) return res.status(400).json({ error: '잘못된 요청이에요' });
    const name = String(body.name || '').replace(/\s+/g, ' ').trim().slice(0, 12);
    const answers = clean(body.answers);
    const { score, level } = grade(answers);
    const feats = answers.feats.filter((k) => k !== 'none'); // 써 본 기능 (uses 칸에 저장)

    await query(
      `INSERT INTO responses (room, cid, name, grp, answers, score, level, paid, uses, wish)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (room, cid) DO UPDATE SET
         name = EXCLUDED.name, grp = EXCLUDED.grp, answers = EXCLUDED.answers,
         score = EXCLUDED.score, level = EXCLUDED.level, paid = EXCLUDED.paid,
         uses = EXCLUDED.uses, wish = EXCLUDED.wish, updated_at = now()`,
      [room, cid, name, null, JSON.stringify(answers), score, level, isPaid(answers), feats, answers.wish],
    );

    const [r] = await query(
      `SELECT count(*)::int AS count,
              count(*) FILTER (WHERE score < $2)::int AS below,
              count(*) FILTER (WHERE level = $3)::int AS same
         FROM responses WHERE room = $1`,
      [room, score, level],
    );
    res.status(200).json({ score, level, count: r.count, below: r.below, same: r.same });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
