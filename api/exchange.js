// Vercel Function - QQ OAuth Code Exchange
// 处理 /api/exchange 路径
export default async function handler(req, res) {
  const APP_ID = process.env.QQ_APP_ID;
  const APP_KEY = process.env.QQ_APP_KEY;
  const REDIRECT_URI = process.env.QQ_REDIRECT_URI || 'https://gaiqiangma.xyz/qq-callback.html';

  if (!APP_ID || !APP_KEY) {
    return res.status(500).json({ ok: false, error: 'QQ OAuth not configured' });
  }

  const code = req.query.code;
  if (!code) {
    return res.status(400).json({ ok: false, error: 'Missing code parameter' });
  }

  try {
    // 1. 用 code 换 access_token
    const tokenUrl =
      'https://graph.qq.com/oauth2.0/token' +
      '?grant_type=authorization_code' +
      '&client_id=' + encodeURIComponent(APP_ID) +
      '&client_secret=' + encodeURIComponent(APP_KEY) +
      '&code=' + encodeURIComponent(code) +
      '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
      '&fmt=json';

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      return res.status(400).json({ ok: false, error: 'Token exchange failed: ' + tokenData.error_description });
    }

    const accessToken = tokenData.access_token;

    // 2. 获取 OpenID
    const openIdUrl = 'https://graph.qq.com/oauth2.0/me?access_token=' + encodeURIComponent(accessToken) + '&fmt=json';
    const openIdRes = await fetch(openIdUrl);
    const openIdData = await openIdRes.json();

    if (openIdData.error) {
      return res.status(400).json({ ok: false, error: 'OpenID fetch failed: ' + openIdData.error_description });
    }

    const openid = openIdData.openid;

    // 3. 获取用户信息
    const userInfoUrl =
      'https://graph.qq.com/user/get_user_info' +
      '?access_token=' + encodeURIComponent(accessToken) +
      '&oauth_consumer_key=' + encodeURIComponent(APP_ID) +
      '&openid=' + encodeURIComponent(openid);

    const userInfoRes = await fetch(userInfoUrl);
    const userInfoData = await userInfoRes.json();

    if (userInfoData.ret !== 0) {
      return res.status(400).json({ ok: false, error: 'User info fetch failed: ' + (userInfoData.msg || 'unknown') });
    }

    // 4. 返回用户数据给前端
    const user = {
      id: openid,
      name: userInfoData.nickname,
      avatar: userInfoData.figureurl_qq_2 || userInfoData.figureurl_qq_1 || userInfoData.figureurl,
      provider: 'qq'
    };

    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}
