/**
 * Cloudflare Worker Backend cho Gia Phả Phạm Tộc
 * Tích hợp Cloudflare D1 Database & Web Push Notification & Cron Triggers
 */

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
          publicKey: env.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSPOSnfGIZMreM_CDFbC6W0q_bZozo56CVQ4' 
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

      // 8. Health check
      return new Response(JSON.stringify({ 
        name: 'Gia Phả Phạm Tộc API', 
        status: 'online', 
        database: 'Cloudflare D1' 
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

  // 9. Cron Trigger: Tự động chạy mỗi sáng để gửi Web Push
  async scheduled(event, env, ctx) {
    try {
      const { results: subscriptions } = await env.DB.prepare('SELECT * FROM push_subscriptions').all();
      if (!subscriptions || subscriptions.length === 0) return;

      console.log(`[Cron Push] Đang xử lý gửi push tới ${subscriptions.length} thiết bị...`);
      // Logic gửi Web Push
    } catch (e) {
      console.error('[Cron Push Error]', e);
    }
  }
};
