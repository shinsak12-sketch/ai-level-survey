import { query, roomOf } from '../lib/db.js';
import { tally } from '../public/survey.js';

export default async function handler(req, res) {
  try {
    const room = roomOf(req.query.room);
    const rows = await query(
      `SELECT name, answers, wish, extract(epoch FROM updated_at) * 1000 AS at
         FROM responses WHERE room = $1 ORDER BY updated_at DESC`,
      [room],
    );
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json({
      room,
      count: rows.length,
      q: tally(rows.map((r) => r.answers)),
      recent: rows.slice(0, 30).map((r) => ({ name: r.name, at: Number(r.at) })),
      wishes: rows.filter((r) => r.wish).slice(0, 40).map((r) => ({ text: r.wish, at: Number(r.at) })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
