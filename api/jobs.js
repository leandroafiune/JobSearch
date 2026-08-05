export default async function handler(req, res) {
  const { what = 'software', where = 'Toronto', radius = '50' } = req.query;
  const apiKey = process.env.VITE_SERPAPI_KEY || process.env.SERPAPI_KEY || 'b3ee5bd11b205dedd16dc06c5e9a4249c408d9fc3405ff9541263cfcf8efab80';

  const queryStr = `${what} in ${where}`;
  const targetUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(queryStr)}&hl=en&gl=ca&api_key=${apiKey}`;

  try {
    const response = await fetch(targetUrl);
    const data = await response.json();

    if (data.error) {
      console.error("SerpApi Error:", data.error);
      return res.status(400).json({ error: data.error });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Serverless Handler Error:", error);
    return res.status(500).json({ error: 'Failed to fetch jobs' });
  }
}
