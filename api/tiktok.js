export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL diperlukan' });
  }

  try {
    const response = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://www.tikwm.com',
        'Referer': 'https://www.tikwm.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: new URLSearchParams({ url, count: 12, cursor: 0, web: 1, hd: 1 })
    });

    const data = await response.json();
    const resData = data.data;

    // Fallback cover: jika cover kosong, pakai gambar pertama (untuk slide)
    const cover = resData.cover 
      ? 'https://www.tikwm.com' + resData.cover 
      : (resData.images && resData.images.length > 0 
          ? 'https://www.tikwm.com' + resData.images[0] 
          : '');

    const result = {
      title: resData.title || 'Tanpa Judul',
      cover: cover,
      duration: resData.duration || 0,
      type: resData.duration > 0 ? 'video' : 'slide', // jika durasi > 0 maka video, selain itu slide
      video: {
        watermark: 'https://www.tikwm.com' + resData.wmplay,
        nowatermark: 'https://www.tikwm.com' + resData.play,
        hd: 'https://www.tikwm.com' + resData.hdplay,
      },
      images: (resData.images || []).map(img => 'https://www.tikwm.com' + img),
      music: 'https://www.tikwm.com' + resData.music,
      stats: {
        views: resData.play_count,
        likes: resData.digg_count,
        comments: resData.comment_count,
        shares: resData.share_count,
        downloads: resData.download_count,
      },
      author: {
        name: resData.author.nickname || 'Unknown',
        avatar: 'https://www.tikwm.com' + resData.author.avatar,
      }
    };

    res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Gagal memproses URL TikTok' });
  }
}
