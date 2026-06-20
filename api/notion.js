module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { dbid, cursor } = req.body;
  
  if (!dbid) {
    return res.status(400).json({ error: 'Missing dbid' });
  }

  const token = process.env.NOTION_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'NOTION_TOKEN environment variable not set' });
  }

  const body = { page_size: 100 };
  if (cursor) body.start_cursor = cursor;

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${dbid}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    const data = await notionRes.json();
    
    if (!notionRes.ok) {
      return res.status(notionRes.status).json({ error: data.message || 'Notion API error' });
    }

    return res.status(200).json(data);
  } catch (err) {
    console.error('Error fetching from Notion:', err);
    return res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
};
