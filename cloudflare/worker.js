/**
 * Cloudflare Worker Backend cho Gia Phả Phạm Tộc
 * Tích hợp Cloudflare D1 Database & Web Push Notification & Cron Triggers
 */

const VAPID_PUBLIC = 'BLMY9-zETzZBVOVYs-n4Cim0JPSDD97Z_QuLJDtR6UDd9HIrtM_WZ25_EvG9Io_A4AOv5ZlQGNfcyK_QuSLUHh4';
const VAPID_PRIVATE = 'I00d7UHt247QSxLHyasIBkpaQGcGml5E5OptWDmrLA8';
const VAPID_SUBJECT = 'mailto:phamphuongdong@gmail.com';

// Helper: base64url encode/decode
function b64ToUrl(b64) {
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function urlToB64(url) {
  let b64 = url.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  return b64;
}
function strToBuf(str) {
  return new TextEncoder().encode(str);
}
function bufToB64Url(buf) {
  let binary = '';
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return b64ToUrl(btoa(binary));
}
function b64UrlToBuf(b64url) {
  const binary = atob(urlToB64(b64url));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate VAPID Authorization JWT Header
async function createVapidAuthHeader(audience) {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400, // 24 hours
    sub: VAPID_SUBJECT
  };

  const unsignedToken = `${bufToB64Url(strToBuf(JSON.stringify(header)))}.${bufToB64Url(strToBuf(JSON.stringify(payload)))}`;
  
  // Import private key in JWK format
  const privKeyJwk = {
    kty: 'EC',
    crv: 'P-256',
    d: VAPID_PRIVATE,
    x: 'tZj37MRPtkFU5Viz6fgKKbQk9IMM_e2f0LiyQ7UelA0', // derived from public key
    y: '3fRyK7TP1mdufxLxvSKPwOADr-WZUBjX3Miv0Lki1B4'
  };

  const cryptoKey = await crypto.subtle.importKey(
    'jwk',
    privKeyJwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );

  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: { name: 'SHA-256' } },
    cryptoKey,
    strToBuf(unsignedToken)
  );

  // Convert DER/IEEE P1363 signature to raw R||S
  const jwt = `${unsignedToken}.${bufToB64Url(sig)}`;
  return `vapid t=${jwt}, k=${VAPID_PUBLIC}`;
}

// Send Web Push to a single subscription
async function sendWebPush(subscription, payloadData) {
  try {
    const endpoint = subscription.endpoint;
    const url = new URL(endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const authHeader = await createVapidAuthHeader(audience);

    const bodyString = typeof payloadData === 'string' ? payloadData : JSON.stringify(payloadData);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'TTL': '86400',
        'Urgency': 'high',
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: bodyString
    });

    return { success: response.status === 201 || response.status === 200 || response.status === 202, status: response.status };
  } catch (e) {
    console.error('SendWebPush Error:', e);
    return { success: false, error: e.message };
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. API: Lấy VAPID Public Key
      if (url.pathname === '/api/vapid-key' && request.method === 'GET') {
        return new Response(JSON.stringify({ 
          success: true,
          publicKey: VAPID_PUBLIC 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. API: Lấy toàn bộ danh sách thành viên gia phả từ Cloudflare D1
      if (url.pathname === '/api/members' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM members ORDER BY id ASC').all();
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. API: Thêm thành viên mới vào D1
      if (url.pathname === '/api/members' && request.method === 'POST') {
        const m = await request.json();
        const id = m.id || `M${Date.now().toString(36).toUpperCase()}`;
        
        await env.DB.prepare(`
          INSERT INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          id,
          m.parentId || null,
          m.name || 'Chưa rõ tên',
          m.gender || 'male',
          m.birth || null,
          m.death || null,
          m.isDead ? 1 : 0,
          m.bio || null,
          m.title || null,
          m.branch || null
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'Thêm thành viên thành công', id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 4. API: Cập nhật thông tin thành viên trong D1
      if (url.pathname.startsWith('/api/members/') && request.method === 'PUT') {
        const id = decodeURIComponent(url.pathname.replace('/api/members/', ''));
        const m = await request.json();

        await env.DB.prepare(`
          UPDATE members SET 
            parentId = ?, name = ?, gender = ?, birth = ?, death = ?, 
            isDead = ?, bio = ?, title = ?, branch = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).bind(
          m.parentId || null,
          m.name,
          m.gender || 'male',
          m.birth || null,
          m.death || null,
          m.isDead ? 1 : 0,
          m.bio || null,
          m.title || null,
          m.branch || null,
          id
        ).run();

        return new Response(JSON.stringify({ success: true, message: 'Cập nhật thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. API: Xóa thành viên khỏi D1
      if (url.pathname.startsWith('/api/members/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.replace('/api/members/', ''));
        await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(id).run();

        return new Response(JSON.stringify({ success: true, message: 'Xóa thành viên thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 6. API: Đăng ký Web Push Subscription
      if (url.pathname === '/api/subscribe' && request.method === 'POST') {
        const sub = await request.json();
        if (!sub || !sub.endpoint) {
          return new Response(JSON.stringify({ success: false, message: 'Invalid subscription' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const endpoint = sub.endpoint;
        const p256dh = sub.keys?.p256dh || '';
        const auth = sub.keys?.auth || '';
        const userAgent = request.headers.get('User-Agent') || '';

        await env.DB.prepare(`
          INSERT OR REPLACE INTO push_subscriptions (endpoint, p256dh, auth, user_agent, created_at)
          VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
        `).bind(endpoint, p256dh, auth, userAgent).run();

        return new Response(JSON.stringify({ success: true, message: 'Đăng ký nhận thông báo thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 7. API: Hủy đăng ký Web Push
      if (url.pathname === '/api/unsubscribe' && request.method === 'POST') {
        const { endpoint } = await request.json();
        if (endpoint) {
          await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(endpoint).run();
        }
        return new Response(JSON.stringify({ success: true, message: 'Đã hủy đăng ký' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 8. API: Gửi thông báo Test Push & Số đỏ trực tiếp
      if (url.pathname === '/api/send-test-push' && request.method === 'POST') {
        const { results: subscriptions } = await env.DB.prepare('SELECT * FROM push_subscriptions').all();
        if (!subscriptions || subscriptions.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Chưa có thiết bị nào đăng ký nhận thông báo' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const testPayload = {
          title: 'Gia Phả Phạm Tộc',
          body: 'Thử nghiệm thông báo đẩy từ Cloudflare Worker thành công! Icon đã gắn số đỏ.',
          badgeCount: 2,
          unreadCount: 2,
          url: '/giaphaphamtoc/',
          tag: 'giapha-test-push'
        };

        const results = [];
        for (const sub of subscriptions) {
          const res = await sendWebPush(sub, testPayload);
          results.push(res);
        }

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Đã gửi thông báo tới ${subscriptions.length} thiết bị`,
          details: results 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 9. Health check
      return new Response(JSON.stringify({ 
        name: 'Gia Phả Phạm Tộc API', 
        status: 'online', 
        database: 'Cloudflare D1',
        vapidPublicKey: VAPID_PUBLIC
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },

  // 10. Cron Trigger: Tự động chạy mỗi sáng (07:00 AM VN) để gửi Web Push
  async scheduled(event, env, ctx) {
    try {
      const { results: subscriptions } = await env.DB.prepare('SELECT * FROM push_subscriptions').all();
      if (!subscriptions || subscriptions.length === 0) return;

      console.log(`[Cron Push] Đang xử lý gửi push tới ${subscriptions.length} thiết bị...`);
      
      const payload = {
        title: 'Gia Phả Phạm Tộc',
        body: 'Hôm nay dòng họ có sự kiện / ngày giỗ cần tưởng nhớ.',
        badgeCount: 2,
        unreadCount: 2,
        url: '/giaphaphamtoc/',
        tag: 'giapha-daily-reminder'
      };

      for (const sub of subscriptions) {
        await sendWebPush(sub, payload);
      }
    } catch (e) {
      console.error('[Cron Push Error]', e);
    }
  }
};
