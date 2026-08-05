export default async function handler(req, res) {
  const { what = 'software', where = 'Toronto', distance = '50' } = req.query;
  const appId = process.env.VITE_ADZUNA_APP_ID || 'a3d324d0';
  const appKey = process.env.VITE_ADZUNA_APP_KEY || 'bd2503dc17601ae96626021aeb946391';

  // Format multi-word terms with spaces to broaden matching
  const cleanWhat = String(what).trim().split(/\s+/).join(' ');

  const targetUrl = `https://api.adzuna.com/v1/api/jobs/ca/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=30&what=${encodeURIComponent(cleanWhat)}&where=${encodeURIComponent(where)}&distance=${distance}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
