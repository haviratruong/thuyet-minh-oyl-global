module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'active',
      message: 'OYL Project Proposal Feedback API is running',
      timestamp: new Date().toISOString()
    });
  }

  if (req.method === 'POST') {
    try {
      const data = req.body || {};
      const payload = {
        id: data.id || Date.now(),
        author: data.author || 'Ban Lãnh Đạo OYL',
        category: data.category || 'Tính năng WebApp',
        priority: data.priority || 'Quan trọng & Làm ngay',
        title: data.title || '',
        content: data.content || '',
        documents: data.documents || '',
        created_at: data.created_at || new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        source: 'thuyet-minh-oyl.vercel.app'
      };

      // Gửi tiếp về Google Apps Script Sheet nếu có webhook URL
      const gsheetUrl = process.env.GSHEET_FEEDBACK_URL || "https://script.google.com/macros/s/AKfycbwgq5TksfyPPA8DQVOw5-oBfYFIrkO5BjRGLIpuIaAfzFU2IZ7cGQQ1mfbMKKGuhtMV/exec";
      if (gsheetUrl) {
        try {
          fetch(gsheetUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              timestamp: payload.created_at,
              name: payload.author,
              phone: 'Góp ý: ' + payload.category,
              email: payload.priority,
              role: payload.title,
              source: payload.content + (payload.documents ? ' | Tài liệu: ' + payload.documents : '')
            })
          }).catch(e => console.error('Sheet post error:', e.message));
        } catch (e) {
          console.error('Sheet error:', e.message);
        }
      }

      return res.status(200).json({
        status: 'success',
        message: 'Đã lưu ý tưởng thành công trên hệ thống OYL!',
        data: payload
      });

    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: error.message
      });
    }
  }

  return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
