// Serverless API Endpoint to automatically log customer insights to Notion Database in real time
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
      service: 'OYL Global Customer Insight Real-Time Tracker',
      notion_database_id: '3f276146-c4cd-81a4-b7d8-f356fc2c7aff'
    });
  }

  if (req.method === 'POST') {
    try {
      let data = req.body;
      if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch (e) {}
      }
      data = data || {};

      const name = data.name || data.studentName || 'Học sinh ẩn danh';
      const phone = data.phone || data.studentPhone || 'Chưa có SĐT';
      const school = data.school || data.studentSchool || 'Chưa rõ trường';
      const className = data.className || data.class || (data.grade ? ('Khối ' + data.grade) : '');
      const refCode = data.refCode || data.ref || data.agent || 'OYL_TRUNG_TAM';
      const aPct = data.academicPct !== undefined ? (data.academicPct + '%') : '';
      const vPct = data.vocationalPct !== undefined ? (data.vocationalPct + '%') : '';
      const p1 = data.p1 || data.targetPathway || 'Chưa phân loại';
      const p2 = data.p2 || '';
      const p3 = data.p3 || '';
      const action = data.action || 'Khảo sát phân luồng';
      const dateStr = new Date().toISOString().split('T')[0];

      // Formulate title and tags
      const pageTitle = `[Insight WebApp] ${name} - ${school} ${className ? ('(' + className + ')') : ''}`;
      const contactInfo = `${name} (Zalo: ${phone}) • GĐ Tỉnh: ${refCode}`;

      let tags = [{ name: 'Hướng nghiệp' }, { name: 'Đề án 522' }];
      if (p1.includes('Học Thuật') || p1.includes('Galaxy')) tags.push({ name: 'Ngữ văn' });
      if (p1.includes('Thực Hành') || p1.includes('Cao Đẳng')) tags.push({ name: 'Khoa học tự nhiên' });

      // Insight Summary
      let insightNote = `Học sinh quan tâm đến ${p1}. Người bảo trợ: ${refCode}.`;
      if (vPct && parseInt(vPct) >= 60) {
        insightNote = `Học sinh có thiên hướng thực hành cao (${vPct}), phù hợp gói Cao Đẳng FDI miễn 100% học phí có lương 6-12Tr hoặc Kỹ sư quốc tế. Cần kết nối Zalo tư vấn tài chính gia đình.`;
      } else if (aPct && parseInt(aPct) >= 60) {
        insightNote = `Học sinh có năng lực học thuật vượt trội (${aPct}), mục tiêu Đại học Top đầu. Đề xuất giới thiệu giải pháp luyện thi ĐGNL & EasyIELTS của Galaxy Education (Mã AMS 15711).`;
      }

      const notionPayload = {
        parent: { database_id: '3f276146-c4cd-81a4-b7d8-f356fc2c7aff' },
        properties: {
          'Tên': {
            title: [{ text: { content: pageTitle } }]
          },
          'Khách': {
            rich_text: [{ text: { content: contactInfo } }]
          },
          'Loại': {
            select: { name: 'Insight phụ huynh' }
          },
          'Chủ đề': {
            multi_select: tags
          },
          'Ngày': {
            date: { start: dateStr }
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: {
              rich_text: [{ text: { content: '📊 KẾT QUẢ KHẢO SÁT & HÀNH VI TRÊN WEBAPP' } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{
                text: {
                  content: `• Họ tên: ${name}
• SĐT (Zalo): ${phone}
• Trường: ${school} (Lớp: ${className || 'Chưa rõ'})
• Tỷ lệ phân luồng: ${aPct} Học thuật — ${vPct} Thực hành
• Ưu Tiên 1: ${p1}
• Ưu Tiên 2: ${p2}
• Ưu Tiên 3: ${p3}
• Giám Đốc Thị Trường Phụ Trách: ${refCode}
• Thời gian ghi nhận: ${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}`
                }
              }]
            }
          },
          {
            object: 'block',
            type: 'callout',
            callout: {
              icon: { emoji: '💡' },
              rich_text: [{ text: { content: insightNote } }]
            }
          }
        ]
      };

      const notionRes = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer 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',
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notionPayload)
      });

      const notionData = await notionRes.json();

      return res.status(200).json({
        status: 'success',
        message: 'Insight logged to Notion successfully',
        page_id: notionData.id,
        url: notionData.url
      });

    } catch (err) {
      console.error('Error in tracking endpoint:', err);
      return res.status(500).json({ status: 'error', message: err.toString() });
    }
  }

  return res.status(405).json({ status: 'error', message: 'Method not allowed' });
};
