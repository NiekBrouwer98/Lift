// Vercel's storage integration lets you pick a custom prefix, so match on the suffix
const envBySuffix = (...suffixes) =>
  Object.entries(process.env).find(([k]) => suffixes.some(s => k.endsWith(s)) && !k.includes('READ_ONLY'))?.[1];
const REDIS_URL   = envBySuffix('REST_API_URL', 'REDIS_REST_URL');
const REDIS_TOKEN = envBySuffix('REST_API_TOKEN', 'REDIS_REST_TOKEN');
const MAX_BYTES   = 2_000_000;

module.exports = async (req, res) => {
  const code = String(req.query.code || '');
  if (!/^[a-zA-Z0-9-]{16,64}$/.test(code)) return res.status(400).json({ error: 'Invalid sync code' });
  if (!REDIS_URL || !REDIS_TOKEN) return res.status(500).json({ error: 'Storage not configured' });

  const key  = `lift:${code}`;
  const auth = { Authorization: `Bearer ${REDIS_TOKEN}` };

  if (req.method === 'GET') {
    const r = await fetch(`${REDIS_URL}/get/${key}`, { headers: auth });
    if (!r.ok) return res.status(502).json({ error: 'Storage error' });
    const { result } = await r.json();
    return res.status(200).json(result ? JSON.parse(result) : {});
  }

  if (req.method === 'PUT') {
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    if (body.length > MAX_BYTES) return res.status(413).json({ error: 'Too large' });
    const r = await fetch(`${REDIS_URL}/set/${key}`, { method: 'POST', headers: auth, body });
    if (!r.ok) return res.status(502).json({ error: 'Storage error' });
    return res.status(204).end();
  }

  res.status(405).end();
};
