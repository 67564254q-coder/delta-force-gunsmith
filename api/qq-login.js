// Vercel Function - QQ OAuth Login Redirect
// 处理 /api/qq-login 路径
export default function handler(req, res) {
  const APP_ID = process.env.QQ_APP_ID;
  const REDIRECT_URI = process.env.QQ_REDIRECT_URI || 'https://gaiqiangma.xyz/qq-callback.html';

  if (!APP_ID) {
    return res.status(500).json({ error: 'QQ_APP_ID not configured' });
  }

  // CSRF 防护
  const state = Math.random().toString(36).substring(2, 15);

  const qqAuthUrl =
    'https://graph.qq.com/oauth2.0/authorize' +
    '?response_type=code' +
    '&client_id=' + encodeURIComponent(APP_ID) +
    '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
    '&state=' + encodeURIComponent(state);

  res.redirect(302, qqAuthUrl);
}
