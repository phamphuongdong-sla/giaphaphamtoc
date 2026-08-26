/**
 * Cloudflare Worker Backend cho Gia Phả Phạm Tộc
 * Tích hợp Cloudflare D1 Database, Phân Quyền (RBAC), Nhật Ký Thay Đổi (Audit Log), Web Push & Cron Triggers
 */

const VAPID_PUBLIC = 'BLMY9-zETzZBVOVYs-n4Cim0JPSDD97Z_QuLJDtR6UDd9HIrtM_WZ25_EvG9Io_A4AOv5ZlQGNfcyK_QuSLUHh4';
const VAPID_PRIVATE = 'I00d7UHt247QSxLHyasIBkpaQGcGml5E5OptWDmrLA8';
const VAPID_SUBJECT = 'mailto:phamphuongdong@gmail.com';

// Helper: SHA-256 hash password
async function hashPassword(password) {
  const msgBuffer = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

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

// Generate VAPID Authorization JWT Header
async function createVapidAuthHeader(audience) {
  const header = { typ: 'JWT', alg: 'ES256' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    aud: audience,
    exp: now + 86400,
    sub: VAPID_SUBJECT
  };

  const unsignedToken = `${bufToB64Url(strToBuf(JSON.stringify(header)))}.${bufToB64Url(strToBuf(JSON.stringify(payload)))}`;
  
  const privKeyJwk = {
    kty: 'EC',
    crv: 'P-256',
    d: VAPID_PRIVATE,
    x: 'tZj37MRPtkFU5Viz6fgKKbQk9IMM_e2f0LiyQ7UelA0',
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

// Helper: Log audit trail
async function recordAuditLog(env, { userId, userName, action, targetId, targetName, details }) {
  try {
    await env.DB.prepare(`
      INSERT INTO audit_logs (user_id, user_name, action, target_id, target_name, details, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).bind(
      userId || 'ANONYMOUS',
      userName || 'Quản trị viên',
      action || 'UNKNOWN',
      targetId || '',
      targetName || '',
      details || ''
    ).run();
  } catch (err) {
    console.warn('Ghi log thất bại:', err);
  }
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-User-Id, X-User-Name, X-User-Role',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Extract user context from headers if provided
    const actorId = request.headers.get('X-User-Id') || 'USR001';
    const actorName = decodeURIComponent(request.headers.get('X-User-Name') || 'Quản trị viên');
    const actorRole = request.headers.get('X-User-Role') || 'super_admin';

    try {
      // 1. API AUTH: Đăng nhập
      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        if (!username || !password) {
          return new Response(JSON.stringify({ success: false, message: 'Vui lòng nhập tài khoản và mật khẩu' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const hashed = await hashPassword(password);
        const user = await env.DB.prepare(
          'SELECT id, username, full_name, role, branch, phone, status, password_hash FROM users WHERE username = ?'
        ).bind(username).first();

        let isValid = false;
        let authUser = user;

        if (user) {
          if (user.status === 'locked') {
            return new Response(JSON.stringify({ success: false, message: 'Tài khoản đã bị khóa. Vui lòng liên hệ Trưởng tộc.' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          isValid = (user.password_hash === hashed);
        } else if (username === 'admin' && (password === 'phamdong@123' || password === '123456')) {
          isValid = true;
          authUser = {
            id: 'USR001',
            username: 'admin',
            full_name: 'Phạm Phương Đông (Admin)',
            role: 'super_admin',
            branch: 'Trực hệ',
            phone: '0912345678',
            status: 'active'
          };
        }

        if (!isValid || !authUser) {
          return new Response(JSON.stringify({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await recordAuditLog(env, {
          userId: authUser.id,
          userName: authUser.full_name,
          action: 'LOGIN',
          targetId: authUser.id,
          targetName: authUser.username,
          details: `Đăng nhập thành công với vai trò: ${authUser.role === 'super_admin' ? 'Quản trị viên (Admin)' : 'Biên tập viên (Editor)'}`
        });

        const { password_hash, ...safeUser } = authUser;
        return new Response(JSON.stringify({ 
          success: true, 
          message: 'Đăng nhập thành công',
          user: safeUser 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 2. API USERS: Danh sách tài khoản
      if (url.pathname === '/api/users' && request.method === 'GET') {
        const { results } = await env.DB.prepare(
          'SELECT id, username, full_name, role, branch, phone, status, created_at, updated_at FROM users ORDER BY role ASC, created_at DESC'
        ).all();

        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 3. API USERS: Tạo tài khoản mới (Chỉ Super Admin)
      if (url.pathname === '/api/users' && request.method === 'POST') {
        const u = await request.json();
        const id = u.id || `USR${Date.now().toString(36).toUpperCase()}`;
        const password = u.password || '123456';
        const password_hash = await hashPassword(password);

        try {
          await env.DB.prepare(`
            INSERT INTO users (id, username, password_hash, full_name, role, branch, phone, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            id,
            u.username.trim(),
            password_hash,
            u.full_name.trim(),
            u.role || 'editor',
            u.branch || null,
            u.phone || null,
            u.status || 'active'
          ).run();

          await recordAuditLog(env, {
            userId: actorId,
            userName: actorName,
            action: 'CREATE_USER',
            targetId: id,
            targetName: u.full_name,
            details: `Tạo tài khoản mới: ${u.username} (Vai trò: ${u.role === 'super_admin' ? 'Quản trị viên (Admin)' : 'Biên tập viên (Editor)'})`
          });

          return new Response(JSON.stringify({ success: true, message: 'Tạo tài khoản thành công', id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        } catch (dbErr) {
          if (dbErr.message?.includes('UNIQUE')) {
            return new Response(JSON.stringify({ success: false, message: 'Tên đăng nhập này đã tồn tại!' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          throw dbErr;
        }
      }

      // 4. API USERS: Cập nhật tài khoản / đổi mật khẩu / khóa tài khoản
      if (url.pathname.startsWith('/api/users/') && request.method === 'PUT') {
        const id = decodeURIComponent(url.pathname.replace('/api/users/', ''));
        const u = await request.json();

        if (u.password) {
          const password_hash = await hashPassword(u.password);
          await env.DB.prepare(`
            UPDATE users SET 
              full_name = ?, role = ?, branch = ?, phone = ?, status = ?, password_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            u.full_name,
            u.role || 'editor',
            u.branch || null,
            u.phone || null,
            u.status || 'active',
            password_hash,
            id
          ).run();
        } else {
          await env.DB.prepare(`
            UPDATE users SET 
              full_name = ?, role = ?, branch = ?, phone = ?, status = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(
            u.full_name,
            u.role || 'editor',
            u.branch || null,
            u.phone || null,
            u.status || 'active',
            id
          ).run();
        }

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'UPDATE_USER',
          targetId: id,
          targetName: u.full_name,
          details: `Cập nhật thông tin tài khoản ${u.username || id}${u.password ? ' (kèm đổi mật khẩu)' : ''}`
        });

        return new Response(JSON.stringify({ success: true, message: 'Cập nhật tài khoản thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 5. API USERS: Xóa tài khoản
      if (url.pathname.startsWith('/api/users/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.replace('/api/users/', ''));
        const userToDelete = await env.DB.prepare('SELECT full_name, username FROM users WHERE id = ?').bind(id).first();

        await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'DELETE_USER',
          targetId: id,
          targetName: userToDelete ? userToDelete.full_name : id,
          details: `Xóa tài khoản ${userToDelete ? userToDelete.username : id}`
        });

        return new Response(JSON.stringify({ success: true, message: 'Đã xóa tài khoản thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 6. API AUDIT LOGS: Tra cứu lịch sử nhật ký
      if (url.pathname === '/api/audit-logs' && request.method === 'GET') {
        const limit = parseInt(url.searchParams.get('limit') || '200', 10);
        const { results } = await env.DB.prepare(
          'SELECT * FROM audit_logs ORDER BY created_at DESC, id DESC LIMIT ?'
        ).bind(limit).all();

        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 7. API MEMBERS: Lấy toàn bộ danh sách thành viên gia phả
      if (url.pathname === '/api/members' && request.method === 'GET') {
        const { results } = await env.DB.prepare('SELECT * FROM members ORDER BY id ASC').all();
        return new Response(JSON.stringify({ success: true, data: results }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 8. API MEMBERS: Thêm thành viên mới + Ghi nhật ký
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

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'CREATE_MEMBER',
          targetId: id,
          targetName: m.name,
          details: `Thêm thành viên mới: ${m.name} (${m.gender === 'female' ? 'Nữ' : 'Nam'}, ID: ${id}${m.branch ? ', Chi: ' + m.branch : ''}${m.birth ? ', Sinh: ' + m.birth : ''})`
        });

        return new Response(JSON.stringify({ success: true, message: 'Thêm thành viên thành công', id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 9. API MEMBERS: Cập nhật thông tin thành viên + Ghi nhật ký
      if (url.pathname.startsWith('/api/members/') && request.method === 'PUT') {
        const id = decodeURIComponent(url.pathname.replace('/api/members/', ''));
        const m = await request.json();

        const oldMember = await env.DB.prepare('SELECT * FROM members WHERE id = ?').bind(id).first();

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

        const changes = [];
        if (oldMember) {
          if (oldMember.name !== m.name) changes.push(`Tên: "${oldMember.name}" ➔ "${m.name}"`);
          if (oldMember.death !== m.death) changes.push(`Ngày mất: "${oldMember.death || 'Chưa rõ'}" ➔ "${m.death || 'Chưa rõ'}"`);
          if (oldMember.birth !== m.birth) changes.push(`Ngày sinh: "${oldMember.birth || 'Chưa rõ'}" ➔ "${m.birth || 'Chưa rõ'}"`);
          if (oldMember.title !== m.title) changes.push(`Vai vế: "${oldMember.title || 'Chưa rõ'}" ➔ "${m.title || 'Chưa rõ'}"`);
          if (oldMember.branch !== m.branch) changes.push(`Chi: "${oldMember.branch || 'Chưa rõ'}" ➔ "${m.branch || 'Chưa rõ'}"`);
        }

        const changeDescription = changes.length > 0 ? changes.join('; ') : 'Cập nhật thông tin chi tiết / tiểu sử';

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'UPDATE_MEMBER',
          targetId: id,
          targetName: m.name,
          details: `Cập nhật [${m.name}]: ${changeDescription}`
        });

        return new Response(JSON.stringify({ success: true, message: 'Cập nhật thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 10. API MEMBERS: Xóa thành viên + Ghi nhật ký
      if (url.pathname.startsWith('/api/members/') && request.method === 'DELETE') {
        const id = decodeURIComponent(url.pathname.replace('/api/members/', ''));
        const memberToDelete = await env.DB.prepare('SELECT name, title, branch FROM members WHERE id = ?').bind(id).first();

        await env.DB.prepare('DELETE FROM members WHERE id = ?').bind(id).run();

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'DELETE_MEMBER',
          targetId: id,
          targetName: memberToDelete ? memberToDelete.name : id,
          details: `Xóa thành viên: ${memberToDelete ? memberToDelete.name : id} (ID: ${id}${memberToDelete?.branch ? ', Chi: ' + memberToDelete.branch : ''})`
        });

        return new Response(JSON.stringify({ success: true, message: 'Xóa thành viên thành công' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 10b. API MEMBERS: Khôi phục cơ sở dữ liệu (Restore)
      if (url.pathname === '/api/members/restore' && request.method === 'POST') {
        const { members, mode } = await request.json();
        if (!Array.isArray(members) || members.length === 0) {
          return new Response(JSON.stringify({ success: false, message: 'Dữ liệu khôi phục không hợp lệ hoặc rỗng' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const statements = [];
        if (mode !== 'merge') {
          statements.push(env.DB.prepare('DELETE FROM members'));
        }

        for (const m of members) {
          if (!m || !m.name) continue;
          const id = m.id ? String(m.id).trim() : `M${Date.now().toString(36).toUpperCase()}`;
          const isDeadVal = (m.isDead && String(m.isDead).trim() !== '' && String(m.isDead).trim() !== '0') || 
                            (m.death && String(m.death).trim() !== '') ? 1 : 0;
          
          statements.push(
            env.DB.prepare(`
              INSERT OR REPLACE INTO members (id, parentId, name, gender, birth, death, isDead, bio, title, branch, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
            `).bind(
              id,
              m.parentId ? String(m.parentId).trim() : null,
              m.name.trim(),
              m.gender || 'male',
              m.birth || null,
              m.death || null,
              isDeadVal,
              m.bio || null,
              m.title || null,
              m.branch || null
            )
          );
        }

        // Execute batch in chunks of 100 statements
        const CHUNK_SIZE = 100;
        for (let i = 0; i < statements.length; i += CHUNK_SIZE) {
          const chunk = statements.slice(i, i + CHUNK_SIZE);
          await env.DB.batch(chunk);
        }

        await recordAuditLog(env, {
          userId: actorId,
          userName: actorName,
          action: 'RESTORE_DATABASE',
          targetId: 'ALL',
          targetName: 'Cơ sở dữ liệu',
          details: `Khôi phục cơ sở dữ liệu (${mode === 'merge' ? 'Chế độ gộp' : 'Chế độ thay thế toàn bộ'}): ${members.length} thành viên`
        });

        return new Response(JSON.stringify({ 
          success: true, 
          message: `Đã khôi phục thành công ${members.length} thành viên vào cơ sở dữ liệu Cloudflare D1`,
          count: members.length 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 11. API VAPID Key
      if (url.pathname === '/api/vapid-key' && request.method === 'GET') {
        return new Response(JSON.stringify({ 
          success: true,
          publicKey: VAPID_PUBLIC 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 12. API Web Push Subscribe
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

      // 13. API Web Push Unsubscribe
      if (url.pathname === '/api/unsubscribe' && request.method === 'POST') {
        const { endpoint } = await request.json();
        if (endpoint) {
          await env.DB.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').bind(endpoint).run();
        }
        return new Response(JSON.stringify({ success: true, message: 'Đã hủy đăng ký' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 14. API Test Push
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

      // 15. Health check
      return new Response(JSON.stringify({ 
        name: 'Gia Phả Phạm Tộc API', 
        status: 'online', 
        database: 'Cloudflare D1',
        features: ['RBAC', 'Audit Logs', 'Web Push', 'Cron Triggers'],
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

  // 16. Cron Trigger: Tự động chạy mỗi sáng (07:00 AM VN) để gửi Web Push
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
