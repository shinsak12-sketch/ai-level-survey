import { query, roomOf } from '../lib/db.js';
import { isMeh } from '../public/survey.js';

export default async function handler(req, res) {
  try {
    const room = roomOf(req.query.room);
    const rows = await query(
      `SELECT name, score, level, paid, uses, wish, answers->'meh' AS meh, extract(epoch FROM updated_at) * 1000 AS at
         FROM responses WHERE room = $1 ORDER BY updated_at DESC`,
      [room],
    );
    const levels = [0, 0, 0, 0];
    const feats = {};
    let paid = 0;
    let meh = 0;
    let mehN = 0;
    let total = 0;
    for (const r of rows) {
      levels[r.level]++;
      total += r.score;
      if (r.paid) paid++;
      for (const k of r.uses || []) feats[k] = (feats[k] || 0) + 1;
      if (r.meh != null) { mehN++; if (isMeh({ meh: Number(r.meh) })) meh++; }
    }
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      room,
      count: rows.length,
      levels,
      paid,
      avgScore: rows.length ? total / rows.length : 0,
      feats,
      meh,
      mehN,
      recent: rows.slice(0, 30).map((r) => ({ name: r.name, level: r.level, at: Number(r.at) })),
      wishes: rows.filter((r) => r.wish).slice(0, 40).map((r) => ({ text: r.wish, level: r.level, at: Number(r.at) })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
