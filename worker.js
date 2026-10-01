/**
 * ==============================================================================
 * CLOUDFLARE WORKER BACKEND (Edge API Engine + D1 Database)
 * ระบบบริหารจัดการคลังยา | ศูนย์การแพทย์รามาธิบดีศรีอยุธยา
 * ==============================================================================
 * Features:
 * - Ultra Low Latency Cloudflare D1 Serverless SQLite
 * - High-speed REST & JSONP API Gateway
 * - Full Drug Inventory, Transactions, Vaccines, Temp Logs, Stock Takes & Inter-hospital Loans
 * - Backward Compatible Proxy / Fallback to Google Apps Script
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Line-Signature",
  "Access-Control-Max-Age": "86400"
};

const GAS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbxRAUryeaVsUt52ozb-vUZkwMaQMwytfOYu0gz1bxOMCZtMSEJ5QGvxtJ0Z6U-anDrX/exec";

// SHA-256 password hasher (Standard Web Crypto API)
async function hashSHA256(text) {
  if (!text) return "";
  const msgBuffer = new TextEncoder().encode(String(text));
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

function jsonResponse(data, status = 200, callback = "") {
  if (callback && callback.trim() !== "") {
    const safeCallback = callback.replace(/[^a-zA-Z0-9_$]/g, "");
    return new Response(`${safeCallback}(${JSON.stringify(data)});`, {
      status,
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/javascript; charset=utf-8"
      }
    });
  }
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export default {
  async scheduled(event, env, ctx) {
    console.log("⏰ Cloudflare Cron Trigger Fired at:", new Date().toISOString(), "Cron:", event.cron);
    // ตรวจสอบวันในสัปดาห์ตามเวลาประเทศไทย (UTC+7): 0=อาทิตย์, 1=จันทร์, 2=อังคาร
    const bangkokTime = new Date(Date.now() + (7 * 60 * 60 * 1000));
    const dayOfWeek = bangkokTime.getUTCDay();
    if (dayOfWeek !== 2) {
      console.log(`ℹ️ วันนี้ไม่ใช่วันอังคาร (Bangkok Day ${dayOfWeek}) ข้ามการส่งสรุปรายงานอัตโนมัติ`);
      return;
    }
    ctx.waitUntil(handleScheduledDailyBroadcast(env.DB));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. CORS Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // 2. LINE Webhook Check (if path is /webhook or contains line signature)
    const lineSignature = request.headers.get("X-Line-Signature");

    // 3. API Router: GET or POST to /api or if 'action' parameter is present
    const isApiRequest = url.pathname.startsWith("/api") || url.searchParams.has("action") || request.method === "POST";

    if (isApiRequest && !url.pathname.match(/\.(html|js|css|png|jpg|ico|svg|xlsx|csv)$/i)) {
      try {
        let action = url.searchParams.get("action") || "";
        let callback = url.searchParams.get("callback") || "";
        let payload = {};

        if (request.method === "POST") {
          const contentType = request.headers.get("content-type") || "";
          if (contentType.includes("application/json") || contentType.includes("text/plain")) {
            const bodyText = await request.text();
            try {
              const bodyJson = JSON.parse(bodyText);
              // Handle LINE Webhook Payload
              if (bodyJson.events && Array.isArray(bodyJson.events)) {
                return await handleLineWebhookD1(env.DB, bodyJson);
              }
              action = bodyJson.action || action;
              callback = bodyJson.callback || callback;
              payload = bodyJson.payload || bodyJson;
            } catch (pErr) {
              // Not JSON
            }
          }
        } else if (request.method === "GET") {
          const payloadParam = url.searchParams.get("payload");
          if (payloadParam) {
            try {
              payload = JSON.parse(payloadParam);
            } catch (e) {
              payload = {};
            }
          }
        }

        // REST Route Mapping for Stock Out / Dispense
        if (url.pathname === "/api/stock/out" || url.pathname === "/api/stock/dispense") {
          action = "OUTBOUND_STOCK";
          if (!payload.items && (payload.item_code || payload.ItemCode)) {
            payload = {
              items: [{
                ItemCode: payload.item_code || payload.ItemCode,
                ItemName: payload.item_name || payload.ItemName || "",
                Qty: payload.qty || payload.Qty || payload.qty_change || 0,
                LotNumber: payload.lot_number || payload.LotNumber || "",
                HN_VN: payload.hn_vn || payload.HN_VN || "",
                Note: payload.note || payload.Note || "Stock Out via REST API",
                By: payload.by_user || payload.By || "API"
              }]
            };
          }
        }

        // Handle the API action via D1 if DB binding exists
        if (env.DB && action) {
          const result = await handleD1Api(env.DB, action, payload, env, ctx);
          return jsonResponse(result, 200, callback);
        }

        // Fallback: If DB is not available or action is missing, proxy to Google Apps Script
        if (GAS_WEBAPP_URL) {
          const gasResponse = await fetch(GAS_WEBAPP_URL + (url.search || ""), {
            method: request.method,
            headers: { "Content-Type": request.headers.get("content-type") || "application/json" },
            body: request.method === "POST" ? JSON.stringify(payload) : null,
            redirect: "follow"
          });
          const text = await gasResponse.text();
          return new Response(text, {
            status: gasResponse.status,
            headers: { ...CORS_HEADERS, "Content-Type": gasResponse.headers.get("content-type") || "application/json" }
          });
        }

        return jsonResponse({ success: false, message: "No database binding or action specified" }, 400, callback);

      } catch (err) {
        return jsonResponse({ success: false, error: err.message, stack: err.stack }, 500);
      }
    }

    // 4. Custom Mobile Dashboard Routes (/dashboard, /m, /mobile)
    if (url.pathname === "/dashboard" || url.pathname === "/m" || url.pathname === "/mobile") {
      if (env.ASSETS) {
        const assetUrl = new URL(request.url);
        assetUrl.pathname = "/dashboard.html";
        return env.ASSETS.fetch(new Request(assetUrl.toString(), request));
      }
    }

    // 5. Serve Static Frontend Assets (index.html, logos, etc.)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Hospital Pharmacy System Online", { status: 200, headers: CORS_HEADERS });
  }
};

/**
 * ==============================================================================
 * D1 API DISPATCHER & BUSINESS LOGIC HANDLERS
 * ==============================================================================
 */
async function handleD1Api(db, action, payload = {}, env = {}, ctx = null) {
  switch (action) {
    // --------------------------------------------------------------------------
    // SYSTEM & AUTH
    // --------------------------------------------------------------------------
    case "PING":
      return {
        success: true,
        message: "ระบบเชื่อมต่อ Cloudflare D1 สำเร็จ (Edge SQL Online)",
        hospital: "ศูนย์การแพทย์รามาธิบดีศรีอยุธยา",
        latency: "Sub-10ms",
        timestamp: new Date().toISOString()
      };

    // --------------------------------------------------------------------------
    // REAL-TIME LINE LOW STOCK ALERT & TEST ACTIONS
    // --------------------------------------------------------------------------
    case "TEST_LINE_ALERT":
    case "SEND_LOW_STOCK_LINE": {
      const warningData = payload.warning || payload || {};
      const testItem = {
        is_low: true,
        item_code: warningData.item_code || "0301BISO01",
        item_name: warningData.item_name || "Bisolvon 8 mg tablet (ทดสอบระบบแจ้งเตือน LINE)",
        current_qty: Number(warningData.current_qty != null ? warningData.current_qty : 4),
        min_qty: Number(warningData.min_qty != null ? warningData.min_qty : 10),
        shortage: Number(warningData.shortage != null ? warningData.shortage : 6)
      };
      const alertResult = await sendLowStockLineAlert(env, testItem, db);
      return {
        success: true,
        message: "ส่งการแจ้งเตือนสต็อกยาต่ำกว่าเกณฑ์เข้า LINE สำเร็จแล้ว",
        result: alertResult,
        item: testItem
      };
    }

    case "SETUP_DB": {
      // Create tables if not exists
      await setupTables(db);
      return { success: true, message: "ตั้งค่าฐานข้อมูล Cloudflare D1 เรียบร้อยแล้ว" };
    }

    case "LOGIN": {
      const username = String(payload.username || "").trim();
      const password = String(payload.password || "").trim();
      if (!username || !password) {
        return { success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
      }
      const hashed = await hashSHA256(password);
      const user = await db.prepare("SELECT username, role, full_name, position, status FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ? AND status = 'Active'")
        .bind(username, hashed)
        .first();

      if (user) {
        return {
          success: true,
          message: "เข้าสู่ระบบสำเร็จ",
          user: {
            username: user.username,
            role: user.role,
            fullName: user.full_name,
            position: user.position
          }
        };
      }
      return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง หรือผู้ใช้ถูกระงับ" };
    }

    case "CHANGE_PASSWORD": {
      const username = String(payload.username || "").trim();
      const oldPass = String(payload.oldPassword || "").trim();
      const newPass = String(payload.newPassword || "").trim();
      if (!username || !oldPass || !newPass) {
        return { success: false, message: "ข้อมูลไม่ครบถ้วน" };
      }
      const oldHashed = await hashSHA256(oldPass);
      const user = await db.prepare("SELECT username FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ?")
        .bind(username, oldHashed)
        .first();

      if (!user) {
        return { success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" };
      }
      const newHashed = await hashSHA256(newPass);
      await db.prepare("UPDATE users SET password_hash = ? WHERE LOWER(username) = LOWER(?)")
        .bind(newHashed, username)
        .run();

      return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จ" };
    }

    // --------------------------------------------------------------------------
    // MOBILE DASHBOARD & LINE RICH MENU AUTH (HYBRID LIFF + QUICK PIN)
    // --------------------------------------------------------------------------
    case "VERIFY_LINE_USER": {
      const lineUserId = String(payload.lineUserId || "").trim();
      if (!lineUserId) {
        return { success: false, authorized: false, message: "ไม่พบรหัส LINE User ID" };
      }
      const user = await db.prepare(
        "SELECT username, role, full_name, position, status, line_user_id FROM users WHERE line_user_id = ? AND status = 'Active'"
      ).bind(lineUserId).first();

      if (user) {
        return {
          success: true,
          authorized: true,
          user: {
            username: user.username,
            fullName: user.full_name,
            role: user.role,
            position: user.position || user.role,
            lineUserId: user.line_user_id
          }
        };
      }
      return { success: false, authorized: false, message: "บัญชี LINE ยังไม่ได้ผูกกับระบบ หรือสถานะถูกระงับ" };
    }

    case "VERIFY_QUICK_PIN": {
      const pin = String(payload.pin || "").trim();
      if (!pin || pin.length !== 6) {
        return { success: false, message: "กรุณาระบุรหัส PIN 6 หลัก" };
      }

      // Query by user's specific 6-digit PIN in D1
      try {
        const user = await db.prepare(
          "SELECT username, role, full_name, position, status, line_user_id FROM users WHERE quick_pin = ? AND status = 'Active'"
        ).bind(pin).first();

        if (user) {
          return {
            success: true,
            authorized: true,
            user: {
              username: user.username,
              fullName: user.full_name,
              role: user.role,
              position: user.position || user.role,
              lineUserId: user.line_user_id
            }
          };
        }
      } catch (e) {
        console.error("PIN check error:", e);
      }

      return { success: false, message: "รหัส PIN 6 หลักไม่ถูกต้อง" };
    }

    case "BIND_LINE_ACCOUNT":
    case "LOGIN_AND_SET_PIN": {
      const username = String(payload.username || "").trim();
      const password = String(payload.password || "").trim();
      const lineUserId = String(payload.lineUserId || "").trim();
      const quickPin = String(payload.quickPin || payload.pin || "").trim();

      if (!username || !password) {
        return { success: false, message: "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน" };
      }
      const hashed = await hashSHA256(password);
      const user = await db.prepare(
        "SELECT username, role, full_name, position, status, line_user_id FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ?"
      ).bind(username, hashed).first();

      if (!user) {
        return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
      }
      if (user.status !== "Active") {
        return { success: false, message: "บัญชีผู้ใช้นี้ถูกระงับสิทธิ์การใช้งาน" };
      }

      if (quickPin) {
        if (!/^\d{6}$/.test(quickPin)) {
          return { success: false, message: "รหัส PIN ต้องเป็นตัวเลข 6 หลักเท่านั้น" };
        }
      }

      let finalLineUserId = user.line_user_id;
      if (lineUserId && !lineUserId.startsWith("MANUAL_")) {
        finalLineUserId = lineUserId;
      }

      try {
        if (quickPin && finalLineUserId) {
          await db.prepare("UPDATE users SET quick_pin = ?, line_user_id = ? WHERE LOWER(username) = LOWER(?)")
            .bind(quickPin, finalLineUserId, username).run();
        } else if (quickPin) {
          await db.prepare("UPDATE users SET quick_pin = ? WHERE LOWER(username) = LOWER(?)")
            .bind(quickPin, username).run();
        } else if (finalLineUserId) {
          await db.prepare("UPDATE users SET line_user_id = ? WHERE LOWER(username) = LOWER(?)")
            .bind(finalLineUserId, username).run();
        }
      } catch (err) {
        console.error("Save pin error:", err);
      }

      return {
        success: true,
        message: "เข้าสู่ระบบและบันทึกรหัส PIN 6 หลักสำเร็จแล้ว",
        user: {
          username: user.username,
          fullName: user.full_name,
          role: user.role,
          position: user.position || user.role,
          lineUserId: finalLineUserId,
          hasPin: !!quickPin
        }
      };
    }

    case "UPDATE_PIN": {
      const username = String(payload.username || "").trim();
      const pin = String(payload.pin || "").trim();
      if (!username || !/^\d{6}$/.test(pin)) {
        return { success: false, message: "กรุณาระบุรหัส PIN 6 หลักที่ถูกต้อง" };
      }
      await db.prepare("UPDATE users SET quick_pin = ? WHERE LOWER(username) = LOWER(?)")
        .bind(pin, username).run();
      return { success: true, message: "เปลี่ยนรหัส PIN 6 หลักสำเร็จ" };
    }

    case "GET_MOBILE_DASHBOARD": {
      return await handleGetMobileDashboard(db);
    }

    // --------------------------------------------------------------------------
    // MASTERDATA & INITIAL LOAD (HIGH SPEED COMBINED QUERY)
    // --------------------------------------------------------------------------
    case "GET_INIT_DATA": {
      const [masterRes, lotsRes, txRes, pkgRes, patPkgRes, vendorRes, hospRes, tempRes, takeRes, loanRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all(),
        db.prepare("SELECT * FROM stock_transactions ORDER BY id DESC LIMIT 5000").all(),
        db.prepare("SELECT * FROM vaccine_packages WHERE status = 'Active' ORDER BY package_code ASC").all(),
        db.prepare("SELECT * FROM patient_packages ORDER BY id DESC").all(),
        db.prepare("SELECT * FROM vendors WHERE status = 'Active' ORDER BY vendor_name ASC").all(),
        db.prepare("SELECT * FROM hospital_list WHERE status = 'Active' ORDER BY hospital_id ASC").all(),
        db.prepare("SELECT * FROM temp_logs ORDER BY timestamp DESC, id DESC LIMIT 200").all(),
        db.prepare("SELECT * FROM stock_takes WHERE status = 'Pending Verification' ORDER BY id DESC").all(),
        db.prepare("SELECT * FROM loan_balances ORDER BY id DESC").all()
      ]);

      const master = (masterRes.results || []).map(formatMasterRow);
      const lots = (lotsRes.results || []).map(formatLotRow);
      const txList = (txRes.results || []).map(formatTransactionRow);
      const vaccinePackages = (pkgRes.results || []).map(formatPackageRow);
      const patientPackages = (patPkgRes.results || []).map(formatPatientPackageRow);
      const vendors = (vendorRes.results || []).map(formatVendorRow);
      const hospitals = (hospRes.results || []).map(formatHospitalRow);
      const tempLogs = (tempRes.results || []).map(formatTempLogRow);
      const pendingTempLogs = tempLogs.filter(t => String(t.RecordStatus || "").toLowerCase().includes("pending"));
      const stockTakes = (takeRes.results || []).map(formatStockTakeRow);
      const loans = (loanRes.results || []).map(formatLoanRow);

      const dash = calculateDashboardInMemory(master, lots, txList);
      const vaccineOutstanding = calculateVaccineMatrixInMemory(master, lots, patientPackages);

      return {
        success: true,
        kpi: dash.kpi || {},
        items: dash.items || [],
        master,
        lots,
        dashboard: dash,
        vendors,
        vaccinePackages,
        patientPackages,
        vaccineOutstanding,
        tempLogs,
        pendingTempLogs,
        pendingStockAdjustments: stockTakes,
        pendingStockTakeCount: stockTakes.length,
        hospitals,
        loans,
        pendingLoanCount: loans.filter(l => String(l.LoanStatus).toLowerCase() !== "completed").length
      };
    }

    case "GET_MASTER": {
      const res = await db.prepare("SELECT * FROM masterdata ORDER BY item_code ASC").all();
      return { success: true, master: (res.results || []).map(formatMasterRow) };
    }

    case "SAVE_MASTER": {
      const item = payload;
      if (!item.ItemCode || !item.ItemName) {
        return { success: false, message: "กรุณาระบุรหัสยาและชื่อยา" };
      }
      await db.prepare(`
        INSERT INTO masterdata (item_code, item_name, generic_name, category, base_unit, pack_size, order_unit, min_level, vendor_name, standard_cost, selling_price, image_url)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(item_code) DO UPDATE SET
          item_name = excluded.item_name,
          generic_name = excluded.generic_name,
          category = excluded.category,
          base_unit = excluded.base_unit,
          pack_size = excluded.pack_size,
          order_unit = excluded.order_unit,
          min_level = excluded.min_level,
          vendor_name = excluded.vendor_name,
          standard_cost = excluded.standard_cost,
          selling_price = excluded.selling_price,
          image_url = excluded.image_url,
          updated_at = CURRENT_TIMESTAMP
      `).bind(
        String(item.ItemCode).trim(),
        String(item.ItemName).trim(),
        String(item.GenericName || "").trim(),
        String(item.Category || "ยาและเวชภัณฑ์").trim(),
        String(item.BaseUnit || "เม็ด").trim(),
        Number(item.PackSize) || 1,
        String(item.OrderUnit || "กล่อง").trim(),
        Number(item.Min) || 0,
        String(item.VendorName || "").trim(),
        Number(item.StandardCost) || 0,
        Number(item.SellingPrice) || 0,
        String(item.ImageLink || item["ลิงค์รูปภาพ"] || "").trim()
      ).run();

      return { success: true, message: "บันทึกข้อมูลยา/เวชภัณฑ์เรียบร้อยแล้ว" };
    }

    // --------------------------------------------------------------------------
    // VENDORS
    // --------------------------------------------------------------------------
    case "GET_VENDORS": {
      const res = await db.prepare("SELECT * FROM vendors ORDER BY vendor_name ASC").all();
      return { success: true, vendors: (res.results || []).map(formatVendorRow) };
    }

    case "SAVE_VENDOR": {
      const v = payload;
      if (!v.VendorCode || !v.VendorName) {
        return { success: false, message: "กรุณาระบุรหัสและชื่อบริษัทคู่ค้า" };
      }
      await db.prepare(`
        INSERT INTO vendors (vendor_code, vendor_name, contact_person, phone, email, tax_id, credit_term_days, address, note, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(vendor_code) DO UPDATE SET
          vendor_name = excluded.vendor_name,
          contact_person = excluded.contact_person,
          phone = excluded.phone,
          email = excluded.email,
          tax_id = excluded.tax_id,
          credit_term_days = excluded.credit_term_days,
          address = excluded.address,
          note = excluded.note,
          status = excluded.status
      `).bind(
        String(v.VendorCode).trim(),
        String(v.VendorName).trim(),
        String(v.ContactPerson || "").trim(),
        String(v.Phone || "").trim(),
        String(v.Email || "").trim(),
        String(v.TaxId || "").trim(),
        Number(v.CreditTermDays) || 30,
        String(v.Address || "").trim(),
        String(v.Note || "").trim(),
        String(v.Status || "Active").trim()
      ).run();

      return { success: true, message: "บันทึกข้อมูลบริษัทคู่ค้าเรียบร้อยแล้ว" };
    }

    case "DELETE_VENDOR": {
      const vendorCode = String(payload.VendorCode || "").trim();
      if (!vendorCode) return { success: false, message: "ไม่พบรหัสคู่ค้า" };
      await db.prepare("UPDATE vendors SET status = 'Inactive' WHERE vendor_code = ?").bind(vendorCode).run();
      return { success: true, message: "ลบคู่ค้าเรียบร้อยแล้ว" };
    }

    // --------------------------------------------------------------------------
    // DASHBOARD & SUMMARY STATS
    // --------------------------------------------------------------------------
    case "GET_DASHBOARD": {
      const [masterRes, lotsRes, txRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all(),
        db.prepare("SELECT * FROM stock_transactions ORDER BY id DESC LIMIT 5000").all()
      ]);
      const master = (masterRes.results || []).map(formatMasterRow);
      const lots = (lotsRes.results || []).map(formatLotRow);
      const txList = (txRes.results || []).map(formatTransactionRow);
      const dash = calculateDashboardInMemory(master, lots, txList);
      return {
        success: true,
        kpi: dash.kpi || {},
        items: dash.items || [],
        masterList: master,
        dashboard: dash
      };
    }

    // --------------------------------------------------------------------------
    // INBOUND (RECEIVE STOCK)
    // --------------------------------------------------------------------------
    case "INBOUND_STOCK": {
      const items = Array.isArray(payload.Items) ? payload.Items : (Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [payload]));
      if (!items || items.length === 0) {
        return { success: false, message: "ไม่มีรายการรับเข้า" };
      }

      const statements = [];
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);

      // Fetch existing lots for these items to know whether to UPDATE or INSERT
      const itemCodes = [...new Set(items.map(it => String(it.ItemCode || it.item_code || "").trim()).filter(Boolean))];
      const existingLotsMap = new Map();

      if (itemCodes.length > 0) {
        for (const code of itemCodes) {
          const res = await db.prepare("SELECT id, item_code, lot_number, qty, cost_price, unit_price FROM inventory_lots WHERE item_code = ?").bind(code).all();
          (res.results || []).forEach(row => {
            const key = `${String(row.item_code).trim().toUpperCase()}___${String(row.lot_number).trim().toUpperCase()}`;
            existingLotsMap.set(key, row);
          });
        }
      }

      let validCount = 0;
      const lotDeltas = new Map();

      for (const item of items) {
        const itemCode = String(item.ItemCode || item.item_code || "").trim();
        const itemName = String(item.ItemName || item.item_name || "").trim();
        const lotNumber = String(item.LotNumber || item.lot_number || "").trim();
        const expiryDate = formatDateStr(item.ExpiryDate || item.expiry_date);
        const receiveDate = formatDateStr(item.ReceiveDate || item.receive_date || payload.ReceiveDate || payload.receive_date) || timestamp.substring(0, 10);
        const qty = Number(item.Qty !== undefined ? item.Qty : (item.qty !== undefined ? item.qty : 0)) || 0;
        const costPrice = Number(item.CostPrice !== undefined ? item.CostPrice : (item.cost_price !== undefined ? item.cost_price : 0)) || 0;
        const unitPrice = Number(item.UnitPrice !== undefined ? item.UnitPrice : (item.unit_price !== undefined ? item.unit_price : (item.SellingPrice || item.selling_price || 0))) || 0;
        const isSample = (item.IsSample || item.is_sample) ? 1 : 0;
        const byUser = String(item.By || payload.By || item.by_user || payload.by_user || "Admin").trim();
        const note = String(item.Note || payload.Note || item.note || payload.note || "รับเข้าคลัง").trim();

        if (!itemCode || !lotNumber || qty <= 0) continue;
        validCount++;

        // 1. Audit Trail Transaction
        statements.push(db.prepare(`
          INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
          VALUES (?, ?, 'INBOUND', ?, ?, ?, ?, '', ?, ?, ?, ?, ?)
        `).bind(timestamp, receiveDate, itemCode, itemName, lotNumber, qty, costPrice, unitPrice, qty * costPrice, note, byUser));

        // Aggregate for lot insertion/update
        const key = `${itemCode.toUpperCase()}___${lotNumber.toUpperCase()}`;
        if (lotDeltas.has(key)) {
          const delta = lotDeltas.get(key);
          delta.qty += qty;
          if (costPrice > 0) delta.costPrice = costPrice;
          if (unitPrice > 0) delta.unitPrice = unitPrice;
          if (expiryDate) delta.expiryDate = expiryDate;
        } else {
          lotDeltas.set(key, {
            itemCode,
            itemName,
            lotNumber,
            expiryDate,
            receiveDate,
            qty,
            isSample,
            costPrice,
            unitPrice
          });
        }

        // Ensure masterdata contains this item
        statements.push(db.prepare(`
          INSERT OR IGNORE INTO masterdata (item_code, item_name, generic_name, category, base_unit, min_level, standard_cost, selling_price)
          VALUES (?, ?, '', 'ยา', 'หน่วย', 0, ?, ?)
        `).bind(itemCode, itemName, costPrice, unitPrice));

        if (costPrice > 0 || unitPrice > 0) {
          statements.push(db.prepare(`
            UPDATE masterdata 
            SET standard_cost = CASE WHEN ? > 0 THEN ? ELSE standard_cost END,
                selling_price = CASE WHEN ? > 0 THEN ? ELSE selling_price END
            WHERE item_code = ?
          `).bind(costPrice, costPrice, unitPrice, unitPrice, itemCode));
        }
      }

      // Apply lot updates or inserts
      for (const [key, lotData] of lotDeltas.entries()) {
        const expCalc = calculateExpiryStatus(lotData.expiryDate);
        if (existingLotsMap.has(key)) {
          const exLot = existingLotsMap.get(key);
          statements.push(db.prepare(`
            UPDATE inventory_lots 
            SET qty = qty + ?,
                stock_status = 'In Stock',
                expiry_status = ?,
                expiry_date = CASE WHEN ? != '' THEN ? ELSE expiry_date END,
                cost_price = CASE WHEN ? > 0 THEN ? ELSE cost_price END,
                unit_price = CASE WHEN ? > 0 THEN ? ELSE unit_price END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(lotData.qty, expCalc.status, lotData.expiryDate, lotData.expiryDate, lotData.costPrice, lotData.costPrice, lotData.unitPrice, lotData.unitPrice, exLot.id));
        } else {
          statements.push(db.prepare(`
            INSERT INTO inventory_lots (receive_date, item_code, item_name, lot_number, expiry_date, qty, stock_status, expiry_status, is_sample, cost_price, unit_price)
            VALUES (?, ?, ?, ?, ?, ?, 'In Stock', ?, ?, ?, ?)
          `).bind(lotData.receiveDate, lotData.itemCode, lotData.itemName, lotData.lotNumber, lotData.expiryDate, lotData.qty, expCalc.status, lotData.isSample, lotData.costPrice, lotData.unitPrice));
        }
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }

      if (validCount === 0) {
        return { success: false, message: "ไม่มีรายการรับเข้าที่ข้อมูลถูกต้อง (กรุณาระบุรหัสยา, Lot No. และจำนวนมากกว่า 0)" };
      }

      return { success: true, message: `บันทึกรับเข้าคลังเรียบร้อยแล้ว (${validCount} รายการ)` };
    }

    // --------------------------------------------------------------------------
    // OUTBOUND (DISPENSE STOCK - FIFO & TRANSACTION SAFE)
    // --------------------------------------------------------------------------
    case "OUTBOUND_STOCK": {
      const items = Array.isArray(payload.Items) ? payload.Items : (Array.isArray(payload.items) ? payload.items : (Array.isArray(payload) ? payload : [payload]));
      if (!items || items.length === 0) {
        return { success: false, message: "ไม่มีรายการจ่ายออก" };
      }

      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      const statements = [];
      const deductions = [];

      for (const item of items) {
        const itemCode = String(item.ItemCode || item.item_code || "").trim();
        const itemName = String(item.ItemName || item.item_name || "").trim();
        let qtyToDeduct = Number(item.QtyChange || item.Qty || item.qty) || 0;
        const hnVn = String(item.HN_VN || item.HN || item.hn_vn || "").trim();
        const byUser = String(item.By || payload.By || item.by_user || payload.by_user || "Staff").trim();
        const note = String(item.Note || payload.Note || item.note || payload.note || "จ่ายยา").trim();
        const actionType = String(item.ActionType || "OUTBOUND").trim();
        const requestedLot = (item.LotNumber || item.lot_number) ? String(item.LotNumber || item.lot_number).trim() : "";

        if (!itemCode || qtyToDeduct <= 0) continue;

        // Fetch active lots for this item (FIFO order by expiry_date)
        let lotsQuery = "SELECT id, lot_number, expiry_date, qty, cost_price, unit_price FROM inventory_lots WHERE item_code = ? AND qty > 0 ";
        let lotsParams = [itemCode];
        if (requestedLot) {
          lotsQuery += "AND lot_number = ? ";
          lotsParams.push(requestedLot);
        }
        lotsQuery += "ORDER BY expiry_date ASC, id ASC";

        const activeLotsRes = await db.prepare(lotsQuery).bind(...lotsParams).all();
        const activeLots = activeLotsRes.results || [];

        let remainingNeeded = qtyToDeduct;

        for (const lot of activeLots) {
          if (remainingNeeded <= 0) break;
          const lotQty = Number(lot.qty) || 0;
          const deductFromThisLot = Math.min(lotQty, remainingNeeded);
          const newLotQty = lotQty - deductFromThisLot;
          remainingNeeded -= deductFromThisLot;

          deductions.push({
            itemCode: itemCode,
            itemName: itemName,
            lotNumber: lot.lot_number,
            deductQty: deductFromThisLot,
            newQty: newLotQty
          });

          // Update Lot Qty
          if (newLotQty <= 0) {
            statements.push(db.prepare("UPDATE inventory_lots SET qty = 0, stock_status = 'Out of Stock' WHERE id = ?").bind(lot.id));
          } else {
            statements.push(db.prepare("UPDATE inventory_lots SET qty = ? WHERE id = ?").bind(newLotQty, lot.id));
          }

          // Insert Transaction record
          statements.push(db.prepare(`
            INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            timestamp,
            timestamp.substring(0, 10),
            actionType,
            itemCode,
            itemName,
            lot.lot_number,
            -deductFromThisLot,
            hnVn,
            lot.cost_price || 0,
            lot.unit_price || 0,
            deductFromThisLot * (lot.unit_price || 0),
            note,
            byUser
          ));
        }

        if (remainingNeeded > 0) {
          // Record over-deduction transaction if stock was insufficient
          statements.push(db.prepare(`
            INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
            VALUES (?, ?, ?, ?, ?, 'UNSPECIFIED', ?, ?, 0, 0, 0, ?, ?)
          `).bind(timestamp, timestamp.substring(0, 10), actionType, itemCode, itemName, -remainingNeeded, hnVn, note + " (สต็อกไม่พอในระบบ)", byUser));
        }
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }

      // --------------------------------------------------------------------------
      // REAL-TIME LOW STOCK CHECK & ALERT CALCULATION
      // --------------------------------------------------------------------------
      const processedItemCodes = [...new Set(items.map(it => String(it.ItemCode || it.item_code || "").trim()).filter(Boolean))];
      const lowStockWarnings = [];

      for (const itCode of processedItemCodes) {
        try {
          // Calculate total remaining active stock across all lots
          let stockRes = null;
          try {
            stockRes = await db.prepare("SELECT COALESCE(SUM(qty), 0) AS total_qty FROM inventory_lots WHERE item_code = ?").bind(itCode).first();
          } catch (e) {
            stockRes = await db.prepare("SELECT COALESCE(SUM(qty), 0) AS total_qty FROM inventory_lot WHERE item_code = ?").bind(itCode).first();
          }
          const totalQty = stockRes ? (Number(stockRes.total_qty) || 0) : 0;

          // Fetch min_level and item_name from masterdata
          let masterRes = null;
          try {
            masterRes = await db.prepare("SELECT item_name, COALESCE(min_level, 0) AS min_qty FROM masterdata WHERE item_code = ?").bind(itCode).first();
          } catch (e) {
            masterRes = await db.prepare("SELECT item_name, COALESCE(min_qty, 0) AS min_qty FROM master_data WHERE item_code = ?").bind(itCode).first();
          }

          if (masterRes) {
            const minQty = Number(masterRes.min_qty) || 0;
            const itemName = masterRes.item_name || itCode;

            // Check if stock is lower than or equal to min safety stock
            if (totalQty <= minQty) {
              const shortage = Math.max(0, minQty - totalQty);
              const warningObj = {
                is_low: true,
                item_code: itCode,
                item_name: itemName,
                current_qty: totalQty,
                min_qty: minQty,
                shortage: shortage
              };
              lowStockWarnings.push(warningObj);

              // Trigger External LINE Notify / Messaging Webhook
              if (ctx && typeof ctx.waitUntil === "function") {
                ctx.waitUntil(sendLowStockLineAlert(env, warningObj, db));
              } else {
                await sendLowStockLineAlert(env, warningObj, db);
              }
            }
          }
        } catch (chkErr) {
          console.error("Error during low stock calculation for item " + itCode, chkErr);
        }
      }

      return {
        success: true,
        message: `ตัดจ่ายสต็อกเรียบร้อยแล้ว (${items.length} รายการ)`,
        deductions: deductions,
        low_stock_warning: lowStockWarnings.length > 0 ? lowStockWarnings[0] : null,
        low_stock_warnings: lowStockWarnings
      };
    }

    // --------------------------------------------------------------------------
    // ADVANCED REPORTS & REPORT CENTER (100% CLOUDFLARE D1 POWERED)
    // --------------------------------------------------------------------------
    case "GET_REPORTS":
    case "GET_ADVANCED_REPORTS":
    case "STOCK_BALANCE":
    case "STOCK_EXPIRY_BATCH":
    case "BATCH_EXPIRY":
    case "MOVEMENT":
    case "EXPIRY":
    case "SMART_PR":
    case "DEAD_STOCK":
    case "ADJUSTMENT":
    case "TOP_DISPENSED": {
      return await handleD1AdvancedReports(db, payload, action);
    }

    // --------------------------------------------------------------------------
    // VACCINE PACKAGES
    // --------------------------------------------------------------------------
    case "GET_VACCINE_PACKAGES": {
      const res = await db.prepare("SELECT * FROM vaccine_packages WHERE status = 'Active' ORDER BY package_code ASC").all();
      return { success: true, packages: (res.results || []).map(formatPackageRow) };
    }

    case "SAVE_VACCINE_PACKAGE": {
      const p = payload;
      if (!p.PackageCode || !p.PackageName) {
        return { success: false, message: "กรุณาระบุรหัสและชื่อแพ็กเกจ" };
      }
      await db.prepare(`
        INSERT INTO vaccine_packages (package_code, package_name, linked_item_code, total_doses, single_price, package_price, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(package_code) DO UPDATE SET
          package_name = excluded.package_name,
          linked_item_code = excluded.linked_item_code,
          total_doses = excluded.total_doses,
          single_price = excluded.single_price,
          package_price = excluded.package_price,
          description = excluded.description,
          status = excluded.status
      `).bind(
        String(p.PackageCode).trim(),
        String(p.PackageName).trim(),
        String(p.LinkedItemCode || "").trim(),
        Number(p.TotalDoses) || 1,
        Number(p.SinglePrice) || 0,
        Number(p.PackagePrice) || 0,
        String(p.Description || "").trim(),
        String(p.Status || "Active").trim()
      ).run();

      return { success: true, message: "บันทึกแพ็กเกจวัคซีนเรียบร้อยแล้ว" };
    }

    case "GET_PATIENT_PACKAGES": {
      const hn = payload.HN ? String(payload.HN).trim() : "";
      let query = "SELECT * FROM patient_packages ";
      let params = [];
      if (hn) {
        query += "WHERE hn = ? ";
        params.push(hn);
      }
      query += "ORDER BY id DESC";

      const res = await db.prepare(query).bind(...params).all();
      return { success: true, patientPackages: (res.results || []).map(formatPatientPackageRow) };
    }

    case "GET_VACCINE_ANALYTICS": {
      const txRes = await db.prepare(`
        SELECT t.*, m.category, m.selling_price as master_selling_price
        FROM stock_transactions t
        LEFT JOIN masterdata m ON UPPER(t.item_code) = UPPER(m.item_code)
        WHERE (t.action_type LIKE '%Outbound%' OR t.action_type LIKE '%Vaccine%' OR t.action_type LIKE '%DISPENSE%')
          AND (m.category = 'วัคซีน' OR UPPER(m.category) LIKE '%VACCINE%' OR t.action_type LIKE '%Vaccine%' OR t.item_code LIKE '1204%' OR UPPER(t.item_name) LIKE '%VAX%' OR UPPER(t.item_name) LIKE '%INJ%')
        ORDER BY COALESCE(NULLIF(t.receive_date, ''), SUBSTR(t.timestamp, 1, 10)) DESC, t.id DESC
      `).all();

      const patPkgRes = await db.prepare("SELECT * FROM patient_packages ORDER BY id DESC").all();

      const lotsRes = await db.prepare(`
        SELECT l.*, m.min_level
        FROM inventory_lots l
        LEFT JOIN masterdata m ON UPPER(l.item_code) = UPPER(m.item_code)
        WHERE (m.category = 'วัคซีน' OR UPPER(m.category) LIKE '%VACCINE%' OR l.item_code LIKE '1204%' OR UPPER(l.item_name) LIKE '%VAX%')
        ORDER BY l.item_code ASC, l.expiry_date ASC
      `).all();

      const pkgDefRes = await db.prepare("SELECT * FROM vaccine_packages WHERE status = 'Active' ORDER BY package_code ASC").all();

      const transactions = (txRes.results || []).map(formatTransactionRow);
      const patientPackages = (patPkgRes.results || []).map(formatPatientPackageRow);
      const lots = (lotsRes.results || []).map(formatLotRow);
      const vaccinePackages = (pkgDefRes.results || []).map(formatPackageRow);

      return {
        success: true,
        transactions,
        patientPackages,
        lots,
        vaccinePackages
      };
    }

    case "GET_FLU_PROMO_ANALYTICS": {
      return await handleGetFluPromoAnalytics(db, payload);
    }

    case "REGISTER_PATIENT_PACKAGE": {
      const p = payload;
      const hn = String(p.HN || "").trim();
      const packageCode = String(p.PackageCode || "").trim().toUpperCase();
      const patientName = String(p.PatientName || "").trim();
      const registerDate = String(p.RegisterDate || p.DispenseDate || "").trim();
      const nextDueDate = String(p.NextDueDate || "").trim();
      const dispenseNow = p.DispenseFirstDoseImmediately === true || p.DispenseFirstDoseImmediately === "true" || p.DispenseFirstDoseImmediately === 1;
      const byUser = String(p.By || "Admin").trim();

      if (!hn || !packageCode) {
        return { success: false, message: "กรุณาระบุ HN และแพ็กเกจวัคซีน" };
      }

      // Lookup Vaccine Package definition
      let vPkg = await db.prepare("SELECT * FROM vaccine_packages WHERE package_code = ?").bind(packageCode).first();
      if (!vPkg) {
        vPkg = await db.prepare("SELECT * FROM vaccine_packages WHERE UPPER(package_code) = UPPER(?)").bind(packageCode).first();
      }

      const packageName = vPkg ? vPkg.package_name : String(p.PackageName || "").trim();
      const linkedItemCode = vPkg ? String(vPkg.linked_item_code || "").trim().toUpperCase() : String(p.LinkedItemCode || "").trim().toUpperCase();
      const totalDoses = vPkg ? (Number(vPkg.total_doses) || 1) : (Number(p.TotalDoses) || 1);
      const packagePrice = vPkg ? (Number(vPkg.package_price) || 0) : 0;
      const pricePerDose = totalDoses > 0 ? (packagePrice / totalDoses) : packagePrice;

      const now = new Date();
      const todayStr = now.toISOString().substring(0, 10);
      const effectiveDate = registerDate || todayStr;
      const timestamp = now.toISOString().replace("T", " ").substring(0, 19);
      const patientPkgId = "PP-" + todayStr.replace(/-/g, "") + "-" + Math.floor(Math.random() * 9000 + 1000);

      let completedDoses = 0;
      let remainingDoses = totalDoses;
      let lastDoseDate = "";
      let deductedLotNumber = null;

      // If immediate first dose dispensing is requested
      if (dispenseNow && linkedItemCode) {
        // Check FEFO active lots
        const lot = await db.prepare("SELECT * FROM inventory_lots WHERE item_code = ? AND qty > 0 ORDER BY expiry_date ASC, id ASC LIMIT 1").bind(linkedItemCode).first();
        if (!lot) {
          return { success: false, message: `ไม่สามารถเปิดแพ็กเกจพร้อมตัดเข็มแรกได้ เนื่องจากวัคซีน ${packageName || linkedItemCode} ในคลังยาหมดสต็อก` };
        }

        const newQty = (Number(lot.qty) || 0) - 1;
        if (newQty <= 0) {
          await db.prepare("UPDATE inventory_lots SET qty = 0, stock_status = 'Out of Stock' WHERE id = ?").bind(lot.id).run();
        } else {
          await db.prepare("UPDATE inventory_lots SET qty = ? WHERE id = ?").bind(newQty, lot.id).run();
        }

        // Insert stock transaction
        await db.prepare(`
          INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
          VALUES (?, ?, 'Outbound (Vaccine Package)', ?, ?, ?, -1, ?, ?, ?, ?, ?, ?)
        `).bind(
          timestamp,
          effectiveDate,
          lot.item_code,
          lot.item_name,
          lot.lot_number,
          hn,
          lot.cost_price || 0,
          pricePerDose,
          pricePerDose,
          `ฉีดวัคซีนตามแพ็กเกจ ${packageName} (เข็มที่ 1/${totalDoses})`,
          byUser
        ).run();

        completedDoses = 1;
        remainingDoses = totalDoses - 1;
        lastDoseDate = effectiveDate;
        deductedLotNumber = lot.lot_number;
      }

      const status = remainingDoses === 0 ? "Completed" : "In Progress";

      await db.prepare(`
        INSERT INTO patient_packages (timestamp, patient_package_id, hn, patient_name, package_code, package_name, linked_item_code, total_doses, completed_doses, remaining_doses, last_dose_date, next_due_date, status, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        timestamp,
        patientPkgId,
        hn,
        patientName,
        packageCode,
        packageName,
        linkedItemCode,
        totalDoses,
        completedDoses,
        remainingDoses,
        lastDoseDate,
        nextDueDate,
        status,
        byUser
      ).run();

      return {
        success: true,
        message: `ลงทะเบียนแพ็กเกจ ${packageName} ให้ HN: ${hn} สำเร็จ` + (dispenseNow ? ` (ตัดสต็อกเข็มที่ 1 เรียบร้อย Lot: ${deductedLotNumber})` : ""),
        patientPackageId: patientPkgId,
        completedDoses,
        remainingDoses,
        lotNumber: deductedLotNumber,
        status
      };
    }

    case "DISPENSE_PACKAGE_DOSE": {
      const patientPkgId = String(payload.PatientPackageId || "").trim();
      const hn = String(payload.HN || "").trim();
      const dispenseDate = String(payload.DispenseDate || "").trim();
      const nextDueDate = String(payload.NextDueDate || "").trim();
      const note = String(payload.Note || "").trim();
      const byUser = String(payload.By || "Admin").trim();

      if (!patientPkgId && !hn) return { success: false, message: "กรุณาระบุรหัสแพ็กเกจผู้ป่วย หรือ HN" };

      let pkg = null;
      if (patientPkgId) {
        pkg = await db.prepare("SELECT * FROM patient_packages WHERE patient_package_id = ?").bind(patientPkgId).first();
      } else if (hn) {
        pkg = await db.prepare("SELECT * FROM patient_packages WHERE hn = ? AND remaining_doses > 0 ORDER BY id DESC LIMIT 1").bind(hn).first();
      }

      if (!pkg) return { success: false, message: "ไม่พบข้อมูลแพ็กเกจผู้ป่วยที่ยังคงเหลือสิทธิ์ฉีดในระบบ" };

      const totalDoses = Number(pkg.total_doses) || 1;
      const currentCompleted = Number(pkg.completed_doses) || 0;
      const currentRemaining = Number(pkg.remaining_doses) || 0;

      if (currentRemaining <= 0) {
        return { success: false, message: `แพ็กเกจนี้ฉีดครบตามสิทธิ์แล้ว (${currentCompleted}/${totalDoses} เข็ม)` };
      }

      // If linked item code or package name is missing, try to lookup from vaccine_packages
      let linkedItemCode = String(pkg.linked_item_code || "").trim().toUpperCase();
      let packageName = String(pkg.package_name || "").trim();
      let packagePrice = 0;

      if (!linkedItemCode || !packageName) {
        const vPkg = await db.prepare("SELECT * FROM vaccine_packages WHERE package_code = ?").bind(pkg.package_code).first();
        if (vPkg) {
          if (!linkedItemCode) linkedItemCode = String(vPkg.linked_item_code || "").trim().toUpperCase();
          if (!packageName) packageName = String(vPkg.package_name || "").trim();
          packagePrice = Number(vPkg.package_price) || 0;
        }
      }

      if (!linkedItemCode) {
        return { success: false, message: "แพ็กเกจนี้ไม่ได้ผูกรหัสยาวัคซีนใน Masterdata ไม่สามารถตัดสต็อกได้" };
      }

      // FEFO Lot deduction
      const lot = await db.prepare("SELECT * FROM inventory_lots WHERE item_code = ? AND qty > 0 ORDER BY expiry_date ASC, id ASC LIMIT 1").bind(linkedItemCode).first();
      if (!lot) {
        return { success: false, message: `วัคซีนรหัส ${linkedItemCode} (${packageName}) ในคลังยาหมดสต็อก ไม่สามารถตัดจ่ายได้` };
      }

      const now = new Date();
      const todayStr = now.toISOString().substring(0, 10);
      const effectiveDate = dispenseDate || todayStr;
      const timestamp = now.toISOString().replace("T", " ").substring(0, 19);

      // Deduct from lot
      const newQty = (Number(lot.qty) || 0) - 1;
      if (newQty <= 0) {
        await db.prepare("UPDATE inventory_lots SET qty = 0, stock_status = 'Out of Stock' WHERE id = ?").bind(lot.id).run();
      } else {
        await db.prepare("UPDATE inventory_lots SET qty = ? WHERE id = ?").bind(newQty, lot.id).run();
      }

      const newCompleted = currentCompleted + 1;
      const newRemaining = Math.max(0, totalDoses - newCompleted);
      const newStatus = newRemaining === 0 ? "Completed" : "In Progress";
      const pricePerDose = totalDoses > 0 ? (packagePrice / totalDoses) : packagePrice;

      // Insert stock transaction
      await db.prepare(`
        INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
        VALUES (?, ?, 'Outbound (Vaccine Package)', ?, ?, ?, -1, ?, ?, ?, ?, ?, ?)
      `).bind(
        timestamp,
        effectiveDate,
        lot.item_code,
        lot.item_name,
        lot.lot_number,
        pkg.hn,
        lot.cost_price || 0,
        pricePerDose || lot.unit_price || 0,
        pricePerDose || lot.unit_price || 0,
        note || `ฉีดวัคซีนตามแพ็กเกจ ${packageName} (เข็มที่ ${newCompleted}/${totalDoses})`,
        byUser
      ).run();

      // Update patient package
      await db.prepare(`
        UPDATE patient_packages 
        SET completed_doses = ?, remaining_doses = ?, last_dose_date = ?, next_due_date = ?, status = ?,
            package_name = CASE WHEN package_name = '' OR package_name IS NULL THEN ? ELSE package_name END,
            linked_item_code = CASE WHEN linked_item_code = '' OR linked_item_code IS NULL THEN ? ELSE linked_item_code END
        WHERE id = ?
      `).bind(
        newCompleted,
        newRemaining,
        effectiveDate,
        nextDueDate || pkg.next_due_date || "",
        newStatus,
        packageName,
        linkedItemCode,
        pkg.id
      ).run();

      // Check low stock for the dispensed vaccine
      let lowStockWarning = null;
      try {
        let stockRes = null;
        try {
          stockRes = await db.prepare("SELECT COALESCE(SUM(qty), 0) AS total_qty FROM inventory_lots WHERE item_code = ?").bind(linkedItemCode).first();
        } catch (e) {
          stockRes = await db.prepare("SELECT COALESCE(SUM(qty), 0) AS total_qty FROM inventory_lot WHERE item_code = ?").bind(linkedItemCode).first();
        }
        const totalQty = stockRes ? (Number(stockRes.total_qty) || 0) : 0;

        let masterRes = null;
        try {
          masterRes = await db.prepare("SELECT item_name, COALESCE(min_level, 0) AS min_qty FROM masterdata WHERE item_code = ?").bind(linkedItemCode).first();
        } catch (e) {
          masterRes = await db.prepare("SELECT item_name, COALESCE(min_qty, 0) AS min_qty FROM master_data WHERE item_code = ?").bind(linkedItemCode).first();
        }

        if (masterRes) {
          const minQty = Number(masterRes.min_qty) || 0;
          if (totalQty <= minQty) {
            const shortage = Math.max(0, minQty - totalQty);
            lowStockWarning = {
              is_low: true,
              item_code: linkedItemCode,
              item_name: masterRes.item_name || packageName,
              current_qty: totalQty,
              min_qty: minQty,
              shortage: shortage
            };
            if (ctx && typeof ctx.waitUntil === "function") {
              ctx.waitUntil(sendLowStockLineAlert(env, lowStockWarning, db));
            } else {
              await sendLowStockLineAlert(env, lowStockWarning, db);
            }
          }
        }
      } catch (chkErr) {
        console.error("Error calculating low stock for vaccine " + linkedItemCode, chkErr);
      }

      return {
        success: true,
        message: `ตัดจ่ายวัคซีนเข็มที่ ${newCompleted}/${totalDoses} สำเร็จ (FEFO)`,
        lotNumber: lot.lot_number,
        status: newStatus,
        completedDoses: newCompleted,
        remainingDoses: newRemaining,
        low_stock_warning: lowStockWarning
      };
    }

    case "GET_VACCINE_OUTSTANDING_REPORT": {
      const res = await db.prepare("SELECT * FROM patient_packages WHERE remaining_doses > 0 ORDER BY next_due_date ASC").all();
      return { success: true, outstanding: (res.results || []).map(formatPatientPackageRow) };
    }

    // --------------------------------------------------------------------------
    // TEMPERATURE & ENVIRONMENTAL MONITORING
    // --------------------------------------------------------------------------
    case "SAVE_TEMP_HUMIDITY_LOG":
    case "SAVE_TEMP_LOG": {
      const t = payload || {};
      const locationType = String(t.locationType || t.LocationType || (t.fridgeId || t.FridgeID ? "Fridge" : "Room")).trim();
      let locationId = String(t.locationId || t.LocationID || t.fridgeId || t.FridgeID || "").trim();
      let locationName = String(t.locationName || t.LocationName || t.fridgeName || t.FridgeName || "").trim();

      if (!locationId) {
        locationId = locationType.toLowerCase() === "room" ? "ROOM-MAIN" : "FRIDGE-01";
      }
      if (!locationName) {
        if (locationId === "FRIDGE-01") locationName = "ตู้เย็นห้องยา";
        else if (locationId === "FRIDGE-02") locationName = "ตู้เย็นคลังยา";
        else if (locationId === "ROOM-MAIN") locationName = "ห้องยาหลัก (Main Pharmacy)";
        else if (locationId === "ROOM-STORE") locationName = "คลังเก็บยาและเวชภัณฑ์ (Main Drug Store)";
        else locationName = locationId;
      }

      const shift = String(t.shift || t.Shift || "เช้า (08:30)").trim();
      const tempRaw = t.temperature !== undefined ? t.temperature : t.Temperature;
      if (tempRaw === undefined || tempRaw === null || String(tempRaw).trim() === "") {
        return { success: false, message: "กรุณาระบุอุณหภูมิ (°C)" };
      }
      const temperature = Math.round(parseFloat(tempRaw) * 10) / 10;
      if (isNaN(temperature)) {
        return { success: false, message: "ค่าอุณหภูมิไม่ถูกต้อง กรุณาระบุเป็นตัวเลข" };
      }

      let humidity = null;
      if (locationType.toLowerCase() === "room") {
        const humRaw = t.humidity !== undefined ? t.humidity : t.Humidity;
        if (humRaw !== undefined && humRaw !== null && String(humRaw).trim() !== "") {
          humidity = Math.round(parseFloat(humRaw) * 10) / 10;
          if (isNaN(humidity)) {
            return { success: false, message: "ค่าความชื้นสัมพัทธ์ไม่ถูกต้อง กรุณาระบุเป็นตัวเลข (%RH)" };
          }
        }
      }

      const recordedBy = String(t.recordedBy || t.RecordedBy || "เจ้าหน้าที่คลังยา").trim();
      const note = String(t.note || t.Note || "").trim();

      let status = "Normal";
      if (locationType.toLowerCase() === "fridge") {
        if (temperature < 2.0) status = "Warning_Low";
        else if (temperature > 8.0) status = "Warning_High";
      } else {
        const tempExceeded = temperature > 30.0;
        const humExceeded = humidity !== null && humidity > 60.0;
        if (tempExceeded && humExceeded) status = "Warning_Both";
        else if (tempExceeded) status = "Warning_Temp";
        else if (humExceeded) status = "Warning_Hum";
      }

      if (t.status || t.Status) {
        status = String(t.status || t.Status).trim();
      }

      const now = new Date();
      const recordedAt = now.toISOString().replace("T", " ").substring(0, 19);
      const recordDate = t.recordDate || t.RecordDate || t.date || t.Date ? String(t.recordDate || t.RecordDate || t.date || t.Date).trim() : "";
      
      let timestamp = recordedAt;
      if (recordDate && recordDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const isMorning = shift.includes("เช้า") || shift.toLowerCase().includes("morning") || shift.includes("08:30");
        const isEvening = shift.includes("เย็น") || shift.toLowerCase().includes("evening") || shift.toLowerCase().includes("afternoon") || shift.includes("16:30");
        const timePart = isMorning ? "08:30:00" : (isEvening ? "16:30:00" : recordedAt.substring(11));
        timestamp = `${recordDate} ${timePart}`;
      }

      const insertRes = await db.prepare(`
        INSERT INTO temp_logs (timestamp, location_type, location_id, location_name, shift, temperature, humidity, status, note, record_status, recorded_by, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
      `).bind(
        timestamp,
        locationType,
        locationId,
        locationName,
        shift,
        temperature,
        humidity,
        status,
        note,
        recordedBy,
        recordedAt
      ).run();

      const newId = insertRes.meta?.last_row_id || 0;

      return {
        success: true,
        message: `บันทึกข้อมูลสิ่งแวดล้อม ${locationName} (${shift}) เรียบร้อยแล้ว (รอการตรวจสอบ 2-Person Verification)`,
        data: {
          id: newId,
          _rowNumber: newId,
          LocationType: locationType,
          LocationID: locationId,
          LocationName: locationName,
          FridgeID: locationId,
          FridgeName: locationName,
          Shift: shift,
          Temperature: temperature,
          Humidity: humidity,
          Status: status,
          RecordStatus: "Pending",
          RecordedBy: recordedBy,
          Timestamp: timestamp,
          RecordedAt: recordedAt
        }
      };
    }

    case "GET_PENDING_TEMP_LOGS": {
      const res = await db.prepare("SELECT * FROM temp_logs WHERE LOWER(record_status) LIKE '%pending%' ORDER BY timestamp DESC, id DESC").all();
      const list = (res.results || []).map(formatTempLogRow);
      return {
        success: true,
        count: list.length,
        data: list,
        pendingLogs: list
      };
    }

    case "VERIFY_TEMP_LOG": {
      const id = Number(payload.LogID || payload.id || payload.rowIndex);
      const verifiedBy = String(payload.VerifiedBy || payload.verifierName || "Pharmacist").trim();
      const verifyNote = String(payload.VerifyNote || payload.verifyNote || "").trim();
      const action = String(payload.action || payload.Action || "Approved").trim();
      const newStatus = action.toLowerCase().includes("reject") ? "Rejected" : "Approved";
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);

      if (!id || isNaN(id)) {
        return { success: false, message: "ไม่พบรหัสรายการบันทึกอุณหภูมิที่ต้องการตรวจสอบ" };
      }

      await db.prepare(`
        UPDATE temp_logs 
        SET record_status = ?, verified_by = ?, verified_at = ?, verify_note = ?
        WHERE id = ?
      `).bind(newStatus, verifiedBy, now, verifyNote, id).run();

      const actionText = newStatus === "Approved" ? "อนุมัติ" : "ปฏิเสธ";
      return { success: true, message: `${actionText}ผลการตรวจวัดอุณหภูมิเรียบร้อยแล้ว` };
    }

    case "GET_ENVIRONMENT_REPORT":
    case "GET_TEMP_REPORT": {
      const monthFilter = payload && payload.month ? String(payload.month).trim() : "";
      const locationTypeFilter = payload && payload.locationType ? String(payload.locationType).trim().toUpperCase() : "ALL";
      const locationFilter = payload && (payload.locationId || payload.fridgeId) ? String(payload.locationId || payload.fridgeId).trim().toUpperCase() : "";
      const statusFilter = payload && payload.recordStatus ? String(payload.recordStatus).trim().toLowerCase() : "";
      const startDate = payload && payload.startDate ? String(payload.startDate).trim() : "";
      const endDate = payload && payload.endDate ? String(payload.endDate).trim() : "";

      const res = await db.prepare("SELECT * FROM temp_logs ORDER BY timestamp DESC, id DESC LIMIT 1000").all();
      let allLogs = (res.results || []).map(formatTempLogRow);
      let filtered = allLogs;

      if (monthFilter) {
        filtered = filtered.filter(item => String(item.Timestamp || item.RecordedAt || "").startsWith(monthFilter));
      }
      if (locationTypeFilter && locationTypeFilter !== "ALL") {
        filtered = filtered.filter(item => String(item.LocationType || "").trim().toUpperCase() === locationTypeFilter);
      }
      if (locationFilter && locationFilter !== "ALL") {
        filtered = filtered.filter(item => {
          const locId = String(item.LocationID || "").toUpperCase();
          const locName = String(item.LocationName || "").toUpperCase();
          return locId === locationFilter || locName.includes(locationFilter);
        });
      }
      if (statusFilter && statusFilter !== "all") {
        filtered = filtered.filter(item => String(item.RecordStatus || "").trim().toLowerCase() === statusFilter);
      }
      if (startDate) {
        filtered = filtered.filter(item => {
          const ts = String(item.Timestamp || item.RecordedAt || "").split(" ")[0];
          return ts >= startDate;
        });
      }
      if (endDate) {
        filtered = filtered.filter(item => {
          const ts = String(item.Timestamp || item.RecordedAt || "").split(" ")[0];
          return ts <= endDate;
        });
      }

      // Calculate Summary Stats
      let totalCount = filtered.length;
      let normalCount = 0;
      let warningCount = 0;
      let warningLowCount = 0;
      let warningHighCount = 0;
      let warningTempCount = 0;
      let warningHumCount = 0;
      let warningBothCount = 0;
      let approvedCount = 0;
      let pendingCount = 0;
      let rejectedCount = 0;
      let temps = [];
      let humidities = [];

      filtered.forEach(log => {
        const st = String(log.Status || "");
        if (st === "Normal") normalCount++;
        else {
          warningCount++;
          if (st === "Warning_Low") warningLowCount++;
          else if (st === "Warning_High") warningHighCount++;
          else if (st === "Warning_Temp") warningTempCount++;
          else if (st === "Warning_Humidity" || st === "Warning_Hum") warningHumCount++;
          else if (st === "Warning_Both") warningBothCount++;
        }

        const rst = String(log.RecordStatus || "").toLowerCase();
        if (rst === "approved" || rst === "verified") approvedCount++;
        else if (rst === "rejected") rejectedCount++;
        else pendingCount++;

        const tVal = parseFloat(log.Temperature);
        if (!isNaN(tVal)) temps.push(tVal);

        const hVal = parseFloat(log.Humidity);
        if (!isNaN(hVal)) humidities.push(hVal);
      });

      const minTemp = temps.length > 0 ? Math.min(...temps).toFixed(1) : "-";
      const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : "-";
      const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "-";

      const minHum = humidities.length > 0 ? Math.min(...humidities).toFixed(1) : "-";
      const maxHum = humidities.length > 0 ? Math.max(...humidities).toFixed(1) : "-";
      const avgHum = humidities.length > 0 ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1) : "-";

      const stats = {
        totalCount,
        normalCount,
        warningCount,
        warningLowCount,
        warningHighCount,
        warningTempCount,
        warningHumCount,
        warningBothCount,
        approvedCount,
        pendingCount,
        rejectedCount,
        minTemp,
        maxTemp,
        avgTemp,
        minHumidity: minHum,
        maxHumidity: maxHum,
        avgHumidity: avgHum
      };

      return {
        success: true,
        stats,
        data: filtered,
        report: filtered
      };
    }

    // --------------------------------------------------------------------------
    // STOCK TAKE & BLIND COUNT ADJUSTMENTS
    // --------------------------------------------------------------------------
    case "GET_STOCK_TAKE_LIST": {
      const res = await db.prepare("SELECT * FROM stock_takes ORDER BY id DESC LIMIT 500").all();
      return { success: true, stockTakes: (res.results || []).map(formatStockTakeRow) };
    }

    case "SUBMIT_STOCK_TAKE": {
      const takes = Array.isArray(payload.takes) ? payload.takes : [payload];
      const takeId = "ST-" + Date.now().toString(36).toUpperCase();
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      const statements = [];

      for (const t of takes) {
        const itemCode = String(t.ItemCode || "").trim();
        const itemName = String(t.ItemName || "").trim();
        const lotNumber = String(t.LotNumber || "").trim();
        const expiryDate = formatDateStr(t.ExpiryDate);
        const systemQty = Number(t.SystemQty) || 0;
        const countQty = Number(t.CountQty) || 0;
        const variance = countQty - systemQty;
        const reason = String(t.Reason || "").trim();
        const countedBy = String(t.CountedBy || payload.CountedBy || "Staff").trim();

        statements.push(db.prepare(`
          INSERT INTO stock_takes (take_id, timestamp, item_code, item_name, lot_number, expiry_date, system_qty, count_qty, variance, reason, counted_by, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending Verification')
        `).bind(takeId, timestamp, itemCode, itemName, lotNumber, expiryDate, systemQty, countQty, variance, reason, countedBy));
      }

      if (statements.length > 0) {
        await db.batch(statements);
      }

      return { success: true, message: `ส่งผลการตรวจนับสต็อกเรียบร้อยแล้ว (${takes.length} รายการ)` };
    }

    case "GET_PENDING_STOCK_ADJUSTMENTS": {
      const res = await db.prepare("SELECT * FROM stock_takes WHERE status = 'Pending Verification' ORDER BY id DESC").all();
      return { success: true, pendingAdjustments: (res.results || []).map(formatStockTakeRow) };
    }

    case "VERIFY_STOCK_ADJUSTMENT": {
      const id = Number(payload.id);
      const verifiedBy = String(payload.VerifiedBy || "Pharmacist").trim();
      const verifyNote = String(payload.VerifyNote || "").trim();
      const isApproved = payload.IsApproved !== false;
      const now = new Date().toISOString().replace("T", " ").substring(0, 19);

      const take = await db.prepare("SELECT * FROM stock_takes WHERE id = ?").bind(id).first();
      if (!take) return { success: false, message: "ไม่พบรายการตรวจนับ" };

      if (isApproved && Number(take.variance) !== 0) {
        // Adjust inventory lot to match counted qty
        await db.prepare(`
          UPDATE inventory_lots 
          SET qty = ? 
          WHERE item_code = ? AND lot_number = ?
        `).bind(take.count_qty, take.item_code, take.lot_number).run();

        // Record adjustment transaction
        await db.prepare(`
          INSERT INTO stock_transactions (timestamp, receive_date, action_type, item_code, item_name, lot_number, qty_change, hn_vn, cost_price, selling_price, total_price, note, by_user)
          VALUES (?, ?, 'STOCK_TAKE_ADJUST', ?, ?, ?, ?, '', 0, 0, 0, ?, ?)
        `).bind(now, now.substring(0, 10), take.item_code, take.item_name, take.lot_number, take.variance, `ปรับยอดสต็อกตรวจนับ: ${take.reason || 'ตรวจนับประจำเดือน'}`, verifiedBy).run();
      }

      await db.prepare(`
        UPDATE stock_takes 
        SET status = ?, verified_by = ?, verified_at = ?, verify_note = ?
        WHERE id = ?
      `).bind(isApproved ? "Verified" : "Rejected", verifiedBy, now, verifyNote, id).run();

      return { success: true, message: isApproved ? "อนุมัติและปรับปรุงยอดสต็อกเรียบร้อยแล้ว" : "ปฏิเสธการปรับยอดสต็อก" };
    }

    case "GET_STOCK_TAKE_REPORT":
    case "GET_STOCK_TAKE_AUDIT_REPORT": {
      const res = await db.prepare("SELECT * FROM stock_takes ORDER BY id DESC LIMIT 500").all();
      return { success: true, report: (res.results || []).map(formatStockTakeRow), lots: (res.results || []).map(formatStockTakeRow) };
    }

    case "APPROVE_LOAN_TRANSACTION": {
      const loanId = String(payload.LoanID || payload.loan_id || "").trim();
      const status = payload.status || "Approved";
      await db.prepare("UPDATE loan_balances SET loan_status = ? WHERE loan_id = ?").bind(status, loanId).run();
      return { success: true, message: "ปรับสถานะรายการยืมเรียบร้อยแล้ว" };
    }

    case "CHECK_EXPIRY_ALERT": {
      const res = await handleD1AdvancedReports(db, { thresholdDays: "90" }, "EXPIRY");
      return res;
    }

    case "LINE_WEBHOOK": {
      return await handleLineWebhookD1(db, payload);
    }

    case "SEND_DAILY_BROADCAST":
    case "TRIGGER_DAILY_BROADCAST": {
      const targetUser = payload.targetUserId || payload.userId || null;
      return await handleScheduledDailyBroadcast(db, targetUser);
    }

    case "GET_USERS": {
      const res = await db.prepare("SELECT username, role, full_name, position, status, line_user_id, created_at FROM users ORDER BY username ASC").all();
      return { success: true, users: res.results || [] };
    }

    case "SAVE_USER": {
      const u = payload;
      if (!u.username || !u.full_name) {
        return { success: false, message: "กรุณาระบุชื่อผู้ใช้และชื่อ-นามสกุล" };
      }
      const existing = await db.prepare("SELECT username FROM users WHERE LOWER(username) = LOWER(?)").bind(u.username).first();
      if (existing) {
        if (u.password && u.password.trim()) {
          const hashed = await hashSHA256(u.password);
          await db.prepare("UPDATE users SET password_hash = ?, role = ?, full_name = ?, position = ?, status = ? WHERE LOWER(username) = LOWER(?)")
            .bind(hashed, u.role || 'Staff', u.full_name, u.position || '', u.status || 'Active', u.username).run();
        } else {
          await db.prepare("UPDATE users SET role = ?, full_name = ?, position = ?, status = ? WHERE LOWER(username) = LOWER(?)")
            .bind(u.role || 'Staff', u.full_name, u.position || '', u.status || 'Active', u.username).run();
        }
      } else {
        const hashed = await hashSHA256(u.password || '123456');
        await db.prepare("INSERT INTO users (username, password_hash, role, full_name, position, status) VALUES (?, ?, ?, ?, ?, ?)")
          .bind(u.username, hashed, u.role || 'Staff', u.full_name, u.position || '', u.status || 'Active').run();
      }
      return { success: true, message: "บันทึกข้อมูลผู้ใช้สำเร็จ" };
    }

    case "UNLINK_LINE_USER": {
      const target = payload.username;
      if (!target) return { success: false, message: "Username required" };
      await db.prepare("UPDATE users SET line_user_id = NULL WHERE LOWER(username) = LOWER(?)").bind(target).run();
      return { success: true, message: "ยกเลิกการผูกบัญชี LINE เรียบร้อยแล้ว" };
    }

    case "SET_USER_STATUS": {
      const { username, status } = payload;
      if (!username || !status) return { success: false, message: "Username and status required" };
      await db.prepare("UPDATE users SET status = ? WHERE LOWER(username) = LOWER(?)").bind(status, username).run();
      return { success: true, message: `เปลี่ยนสถานะเป็น ${status} สำเร็จ` };
    }

    // --------------------------------------------------------------------------
    // HOSPITAL LIST & INTER-HOSPITAL LOANS
    // --------------------------------------------------------------------------
    case "GET_HOSPITALS": {
      const res = await db.prepare("SELECT * FROM hospital_list WHERE status = 'Active' ORDER BY hospital_id ASC").all();
      const list = (res.results || []).map(formatHospitalRow);
      return { success: true, hospitals: list, data: list };
    }

    case "SAVE_HOSPITAL": {
      const h = payload;
      if (!h.HospitalName || !String(h.HospitalName).trim()) {
        return { success: false, message: "กรุณาระบุชื่อโรงพยาบาล" };
      }

      let hospitalId = String(h.HospitalID || "").trim().toUpperCase();
      if (!hospitalId) {
        const allHospRes = await db.prepare("SELECT hospital_id FROM hospital_list").all();
        const existing = allHospRes.results || [];
        let maxNum = 0;
        for (const row of existing) {
          const match = String(row.hospital_id || "").match(/HOSP-(\d+)/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) maxNum = num;
          }
        }
        hospitalId = "HOSP-" + String(maxNum + 1).padStart(3, "0");
      }

      await db.prepare(`
        INSERT INTO hospital_list (hospital_id, hospital_name, contact_person, phone, address, status)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(hospital_id) DO UPDATE SET
          hospital_name = excluded.hospital_name,
          contact_person = excluded.contact_person,
          phone = excluded.phone,
          address = excluded.address,
          status = excluded.status
      `).bind(
        hospitalId,
        String(h.HospitalName).trim(),
        String(h.ContactPerson || "").trim(),
        String(h.Phone || "").trim(),
        String(h.Address || "").trim(),
        String(h.Status || "Active").trim()
      ).run();

      return { success: true, message: "บันทึกข้อมูลโรงพยาบาลเรียบร้อยแล้ว", hospitalId };
    }

    case "GET_LOANS": {
      const res = await db.prepare("SELECT * FROM loan_balances ORDER BY id DESC").all();
      const list = (res.results || []).map(formatLoanRow);
      return { success: true, loans: list, data: list };
    }

    case "SAVE_LOAN_TRANSACTION": {
      const l = payload;
      const baseLoanId = "LN-" + Date.now().toString(36).toUpperCase();
      const timestamp = new Date().toISOString().replace("T", " ").substring(0, 19);
      const items = (Array.isArray(l.Items) && l.Items.length > 0) ? l.Items : [l];

      for (let idx = 0; idx < items.length; idx++) {
        const it = items[idx];
        const loanId = items.length > 1 ? `${baseLoanId}-${idx + 1}` : baseLoanId;
        const itemCode = String(it.ItemCode || it.item_code || l.ItemCode || "").trim();
        const itemName = String(it.ItemName || it.item_name || l.ItemName || itemCode).trim();
        const lotNumber = String(it.LotNumber || it.lot_number || l.LotNumber || "").trim();
        const expiryDate = formatDateStr(it.ExpiryDate || it.expiry_date || l.ExpiryDate);
        const qty = Number(it.Qty || it.qty || it.QtyBorrowed || l.QtyBorrowed || l.Qty) || 0;

        await db.prepare(`
          INSERT INTO loan_balances (
            loan_id, timestamp, transaction_type, ref_hospital_id, ref_hospital_name,
            item_code, item_name, lot_number, expiry_date, qty_borrowed, qty_returned, qty_outstanding,
            item_category, borrower_name, borrower_pos, borrower_approve_name, borrower_approve_pos,
            lender_name, lender_pos, lender_approve_name, lender_approve_pos,
            receiver_name, receiver_pos, return_date, returner_name, returner_pos,
            return_receiver_name, return_receiver_pos, return_carrier_name, return_carrier_pos,
            loan_status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Approved')
        `).bind(
          loanId,
          timestamp,
          String(l.TransactionType || "LEND_OUT").trim(),
          String(l.RefHospitalID || "").trim(),
          String(l.RefHospitalName || "").trim(),
          itemCode,
          itemName,
          lotNumber,
          expiryDate,
          qty,
          qty,
          String(l.ItemCategory || "ยาและเวชภัณฑ์").trim(),
          String(l.BorrowerName || "").trim(),
          String(l.BorrowerPos || "").trim(),
          String(l.BorrowerApproveName || "").trim(),
          String(l.BorrowerApprovePos || "").trim(),
          String(l.LenderName || "").trim(),
          String(l.LenderPos || "").trim(),
          String(l.LenderApproveName || "").trim(),
          String(l.LenderApprovePos || "").trim(),
          String(l.ReceiverName || "").trim(),
          String(l.ReceiverPos || "").trim(),
          String(l.ReturnDate || "").trim(),
          String(l.ReturnerName || "").trim(),
          String(l.ReturnerPos || "").trim(),
          String(l.ReturnReceiverName || "").trim(),
          String(l.ReturnReceiverPos || "").trim(),
          String(l.ReturnCarrierName || "").trim(),
          String(l.ReturnCarrierPos || "").trim()
        ).run();

        // If LEND_OUT, deduct stock from inventory
        if (l.TransactionType === "LEND_OUT" && itemCode && qty > 0) {
          await handleD1Api(db, "OUTBOUND_STOCK", {
            items: [{
              ItemCode: itemCode,
              ItemName: itemName,
              LotNumber: lotNumber,
              Qty: qty,
              ActionType: "LOAN_LEND_OUT",
              Note: `ยืมยาไปให้ ${l.RefHospitalName} (Loan ID: ${loanId})`,
              By: l.LenderName || "Pharmacist"
            }]
          });
        }
      }

      return { success: true, message: "บันทึกการยืม-คืนยาเรียบร้อยแล้ว", loanId: baseLoanId };
    }

    case "RETURN_LOAN_ITEM": {
      const loanId = String(payload.LoanID || "").trim();
      const returnQty = Number(payload.ReturnQty || payload.QtyReturned) || 0;
      if (!loanId || returnQty <= 0) return { success: false, message: "ข้อมูลไม่ถูกต้อง" };

      const loan = await db.prepare("SELECT * FROM loan_balances WHERE loan_id = ?").bind(loanId).first();
      if (!loan) return { success: false, message: "ไม่พบรายการยืม-คืนยา" };

      const returnedTotal = (Number(loan.qty_returned) || 0) + returnQty;
      const outstanding = Math.max(0, (Number(loan.qty_borrowed) || 0) - returnedTotal);
      const status = outstanding === 0 ? "Returned Complete" : "Partially Returned";
      const now = new Date().toISOString().substring(0, 10);

      await db.prepare(`
        UPDATE loan_balances 
        SET qty_returned = ?, qty_outstanding = ?, return_date = ?, returner_name = ?, return_receiver_name = ?, loan_status = ?
        WHERE loan_id = ?
      `).bind(
        returnedTotal,
        outstanding,
        String(payload.ReturnDate || now).trim(),
        String(payload.ReturnerName || "").trim(),
        String(payload.ReturnReceiverName || "").trim(),
        status,
        loanId
      ).run();

      // If LEND_OUT returned, add back to inventory
      if (loan.transaction_type === "LEND_OUT") {
        await handleD1Api(db, "INBOUND_STOCK", {
          items: [{
            ItemCode: loan.item_code,
            ItemName: loan.item_name,
            LotNumber: loan.lot_number || "RETURN-LOT",
            ExpiryDate: loan.expiry_date || now,
            Qty: returnQty,
            ActionType: "LOAN_RETURN_IN",
            Note: `รับคืนยาจาก ${loan.ref_hospital_name} (Loan ID: ${loanId})`,
            By: payload.ReturnReceiverName || "Pharmacist"
          }]
        });
      }

      return { success: true, message: `บันทึกการคืนยาเรียบร้อยแล้ว (คงเหลือค้าง ${outstanding})` };
    }

    case "UPDATE_LOAN_TRANSACTION": {
      const loanId = String(payload.LoanID || payload.loan_id || "").trim();
      if (!loanId) return { success: false, message: "กรุณาระบุเลขที่รายการ (Loan ID)" };

      const existing = await db.prepare("SELECT * FROM loan_balances WHERE loan_id = ?").bind(loanId).first();
      if (!existing) return { success: false, message: "ไม่พบรายการยืม-คืนยาเลขที่ " + loanId };

      const lotNumber = payload.LotNumber !== undefined ? String(payload.LotNumber).trim() : existing.lot_number;
      const expiryDate = payload.ExpiryDate !== undefined ? formatDateStr(payload.ExpiryDate) : existing.expiry_date;
      const itemCode = (payload.ItemCode && String(payload.ItemCode).trim() !== "undefined") ? String(payload.ItemCode).trim() : existing.item_code;
      const itemName = (payload.ItemName && String(payload.ItemName).trim() !== "undefined") ? String(payload.ItemName).trim() : existing.item_name;
      
      let qtyBorrowed = Number(existing.qty_borrowed) || 0;
      if (payload.QtyBorrowed !== undefined && Number(payload.QtyBorrowed) >= 0) {
        qtyBorrowed = Number(payload.QtyBorrowed);
      }
      const qtyReturned = Number(existing.qty_returned) || 0;
      const qtyOutstanding = Math.max(0, qtyBorrowed - qtyReturned);
      const status = qtyOutstanding === 0 ? "Completed" : (existing.loan_status === "Pending Approval" ? "Pending Approval" : "Approved");

      const borrowerName = payload.BorrowerName !== undefined ? String(payload.BorrowerName).trim() : existing.borrower_name;
      const borrowerPos = payload.BorrowerPos !== undefined ? String(payload.BorrowerPos).trim() : existing.borrower_pos;
      const borrowerApproveName = payload.BorrowerApproveName !== undefined ? String(payload.BorrowerApproveName).trim() : existing.borrower_approve_name;
      const borrowerApprovePos = payload.BorrowerApprovePos !== undefined ? String(payload.BorrowerApprovePos).trim() : existing.borrower_approve_pos;
      const lenderName = payload.LenderName !== undefined ? String(payload.LenderName).trim() : existing.lender_name;
      const lenderPos = payload.LenderPos !== undefined ? String(payload.LenderPos).trim() : existing.lender_pos;
      const lenderApproveName = payload.LenderApproveName !== undefined ? String(payload.LenderApproveName).trim() : existing.lender_approve_name;
      const lenderApprovePos = payload.LenderApprovePos !== undefined ? String(payload.LenderApprovePos).trim() : existing.lender_approve_pos;
      const receiverName = payload.ReceiverName !== undefined ? String(payload.ReceiverName).trim() : existing.receiver_name;
      const receiverPos = payload.ReceiverPos !== undefined ? String(payload.ReceiverPos).trim() : existing.receiver_pos;

      const returnDate = payload.ReturnDate !== undefined ? (payload.ReturnDate ? formatDateStr(payload.ReturnDate) : "") : existing.return_date;
      const returnerName = payload.ReturnerName !== undefined ? String(payload.ReturnerName).trim() : existing.returner_name;
      const returnerPos = payload.ReturnerPos !== undefined ? String(payload.ReturnerPos).trim() : existing.returner_pos;
      const returnReceiverName = payload.ReturnReceiverName !== undefined ? String(payload.ReturnReceiverName).trim() : existing.return_receiver_name;
      const returnReceiverPos = payload.ReturnReceiverPos !== undefined ? String(payload.ReturnReceiverPos).trim() : existing.return_receiver_pos;
      const returnCarrierName = payload.ReturnCarrierName !== undefined ? String(payload.ReturnCarrierName).trim() : existing.return_carrier_name;
      const returnCarrierPos = payload.ReturnCarrierPos !== undefined ? String(payload.ReturnCarrierPos).trim() : existing.return_carrier_pos;

      const refHospitalName = payload.RefHospitalName !== undefined ? String(payload.RefHospitalName).trim() : existing.ref_hospital_name;
      const itemCategory = payload.ItemCategory !== undefined ? String(payload.ItemCategory).trim() : existing.item_category;

      await db.prepare(`
        UPDATE loan_balances 
        SET lot_number = ?, expiry_date = ?, item_code = ?, item_name = ?, qty_borrowed = ?, qty_outstanding = ?, loan_status = ?,
            borrower_name = ?, borrower_pos = ?, borrower_approve_name = ?, borrower_approve_pos = ?,
            lender_name = ?, lender_pos = ?, lender_approve_name = ?, lender_approve_pos = ?,
            receiver_name = ?, receiver_pos = ?, return_date = ?, returner_name = ?, returner_pos = ?,
            return_receiver_name = ?, return_receiver_pos = ?, return_carrier_name = ?, return_carrier_pos = ?,
            ref_hospital_name = ?, item_category = ?
        WHERE loan_id = ?
      `).bind(
        lotNumber,
        expiryDate,
        itemCode,
        itemName,
        qtyBorrowed,
        qtyOutstanding,
        status,
        borrowerName,
        borrowerPos,
        borrowerApproveName,
        borrowerApprovePos,
        lenderName,
        lenderPos,
        lenderApproveName,
        lenderApprovePos,
        receiverName,
        receiverPos,
        returnDate,
        returnerName,
        returnerPos,
        returnReceiverName,
        returnReceiverPos,
        returnCarrierName,
        returnCarrierPos,
        refHospitalName,
        itemCategory,
        loanId
      ).run();

      return { success: true, message: "แก้ไขข้อมูลรายการยืม-คืนยาเรียบร้อยแล้ว" };
    }

    // --------------------------------------------------------------------------
    // BULK DATA IMPORT & SYNC (FROM GOOGLE SHEETS / EXCEL)
    // --------------------------------------------------------------------------
    case "IMPORT_SHEET_DATA": {
      const { masterData, inventoryLots, vendors, packages, hospitals } = payload;
      let count = 0;

      if (Array.isArray(masterData) && masterData.length > 0) {
        for (const m of masterData) {
          await handleD1Api(db, "SAVE_MASTER", m);
          count++;
        }
      }

      if (Array.isArray(inventoryLots) && inventoryLots.length > 0) {
        await handleD1Api(db, "INBOUND_STOCK", { items: inventoryLots, Note: "Imported from Sheet" });
        count += inventoryLots.length;
      }

      if (Array.isArray(vendors) && vendors.length > 0) {
        for (const v of vendors) {
          await handleD1Api(db, "SAVE_VENDOR", v);
          count++;
        }
      }

      if (Array.isArray(packages) && packages.length > 0) {
        for (const p of packages) {
          await handleD1Api(db, "SAVE_VACCINE_PACKAGE", p);
          count++;
        }
      }

      return { success: true, message: `นำเข้าข้อมูลเรียบร้อยแล้ว (${count} รายการ)` };
    }

    case "DELETE_HOSPITAL": {
      const id = String(payload.HospitalID || payload.id || "").trim();
      await db.prepare("UPDATE hospital_list SET status = 'Inactive' WHERE hospital_id = ?").bind(id).run();
      return { success: true, message: "ลบโรงพยาบาลเรียบร้อยแล้ว" };
    }

    case "RECONCILE_DB": {
      await db.prepare("UPDATE inventory_lots SET stock_status = 'Out of Stock' WHERE qty <= 0").run();
      await db.prepare("UPDATE inventory_lots SET stock_status = 'In Stock' WHERE qty > 0").run();
      return { success: true, message: "ปรับปรุงฐานข้อมูล D1 เรียบร้อยแล้ว" };
    }

    default:
      return { success: false, message: "Action not recognized: " + action };
  }
}

/**
 * ==============================================================================
 * TABLE INITIALIZER / AUTO MIGRATION HELPER
 * ==============================================================================
 */
async function setupTables(db) {
  const statements = [
    `CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'Staff',
      full_name TEXT NOT NULL,
      position TEXT,
      status TEXT NOT NULL DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS masterdata (
      item_code TEXT PRIMARY KEY,
      item_name TEXT NOT NULL,
      generic_name TEXT,
      category TEXT,
      base_unit TEXT,
      pack_size REAL DEFAULT 1,
      order_unit TEXT,
      min_level REAL DEFAULT 0,
      vendor_name TEXT,
      standard_cost REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      image_url TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS inventory_lots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receive_date TEXT,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      lot_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      qty REAL NOT NULL DEFAULT 0,
      stock_status TEXT DEFAULT 'In Stock',
      expiry_status TEXT DEFAULT 'Normal',
      is_sample INTEGER DEFAULT 0,
      cost_price REAL DEFAULT 0,
      unit_price REAL DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );`,
    `CREATE TABLE IF NOT EXISTS stock_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      receive_date TEXT,
      action_type TEXT NOT NULL,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      lot_number TEXT,
      qty_change REAL NOT NULL,
      hn_vn TEXT,
      cost_price REAL DEFAULT 0,
      selling_price REAL DEFAULT 0,
      total_price REAL DEFAULT 0,
      note TEXT,
      by_user TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS vendors (
      vendor_code TEXT PRIMARY KEY,
      vendor_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      email TEXT,
      tax_id TEXT,
      credit_term_days INTEGER DEFAULT 30,
      address TEXT,
      note TEXT,
      status TEXT DEFAULT 'Active'
    );`,
    `CREATE TABLE IF NOT EXISTS vaccine_packages (
      package_code TEXT PRIMARY KEY,
      package_name TEXT NOT NULL,
      linked_item_code TEXT,
      total_doses INTEGER NOT NULL DEFAULT 1,
      single_price REAL DEFAULT 0,
      package_price REAL DEFAULT 0,
      description TEXT,
      status TEXT DEFAULT 'Active'
    );`,
    `CREATE TABLE IF NOT EXISTS patient_packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      patient_package_id TEXT UNIQUE NOT NULL,
      hn TEXT NOT NULL,
      patient_name TEXT NOT NULL,
      package_code TEXT NOT NULL,
      package_name TEXT NOT NULL,
      linked_item_code TEXT,
      total_doses INTEGER NOT NULL DEFAULT 1,
      completed_doses INTEGER DEFAULT 0,
      remaining_doses INTEGER DEFAULT 1,
      last_dose_date TEXT,
      next_due_date TEXT,
      status TEXT DEFAULT 'In Progress',
      created_by TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS temp_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      location_type TEXT,
      location_id TEXT,
      location_name TEXT NOT NULL,
      shift TEXT,
      temperature REAL NOT NULL,
      humidity REAL,
      status TEXT DEFAULT 'Normal',
      note TEXT,
      record_status TEXT DEFAULT 'Pending Verification',
      recorded_by TEXT,
      recorded_at TEXT,
      verified_by TEXT,
      verified_at TEXT,
      verify_note TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS stock_takes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      take_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      lot_number TEXT,
      expiry_date TEXT,
      system_qty REAL NOT NULL DEFAULT 0,
      count_qty REAL NOT NULL DEFAULT 0,
      variance REAL NOT NULL DEFAULT 0,
      reason TEXT,
      counted_by TEXT,
      status TEXT DEFAULT 'Pending Verification',
      verified_by TEXT,
      verified_at TEXT,
      verify_note TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS hospital_list (
      hospital_id TEXT PRIMARY KEY,
      hospital_name TEXT NOT NULL,
      contact_person TEXT,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'Active'
    );`,
    `CREATE TABLE IF NOT EXISTS loan_balances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      loan_id TEXT UNIQUE NOT NULL,
      timestamp TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      ref_hospital_id TEXT NOT NULL,
      ref_hospital_name TEXT NOT NULL,
      item_code TEXT NOT NULL,
      item_name TEXT NOT NULL,
      lot_number TEXT,
      expiry_date TEXT,
      qty_borrowed REAL NOT NULL DEFAULT 0,
      qty_returned REAL DEFAULT 0,
      qty_outstanding REAL NOT NULL DEFAULT 0,
      item_category TEXT,
      borrower_name TEXT,
      borrower_pos TEXT,
      borrower_approve_name TEXT,
      borrower_approve_pos TEXT,
      lender_name TEXT,
      lender_pos TEXT,
      lender_approve_name TEXT,
      lender_approve_pos TEXT,
      receiver_name TEXT,
      receiver_pos TEXT,
      return_date TEXT,
      returner_name TEXT,
      returner_pos TEXT,
      return_receiver_name TEXT,
      return_receiver_pos TEXT,
      return_carrier_name TEXT,
      return_carrier_pos TEXT,
      loan_status TEXT DEFAULT 'Pending Approval'
    );`
  ];

  for (const sql of statements) {
    await db.prepare(sql).run();
  }

  // Seed default admin
  await db.prepare(`
    INSERT OR IGNORE INTO users (username, password_hash, role, full_name, position, status)
    VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'ผู้ดูแลระบบ (System Admin)', 'ผู้จัดการฝ่ายเภสัชกรรม', 'Active')
  `).run();

  // Auto-migration checks for users table columns
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN line_user_id TEXT").run();
  } catch (e) {}
  try {
    await db.prepare("ALTER TABLE users ADD COLUMN quick_pin TEXT DEFAULT '1234'").run();
  } catch (e) {}
}

/**
 * ==============================================================================
 * ULTRA-FAST MOBILE DASHBOARD (D1 Edge SQLite Engine for LINE Rich Menu)
 * ==============================================================================
 */
async function handleGetMobileDashboard(db) {
  try {
    const [masterRes, lotsRes] = await Promise.all([
      db.prepare("SELECT item_code, item_name, generic_name, category, base_unit, min_level, image_url, vendor_name FROM masterdata ORDER BY item_name ASC").all(),
      db.prepare("SELECT id, receive_date, item_code, item_name, lot_number, expiry_date, qty, stock_status, expiry_status, is_sample, cost_price, unit_price FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all()
    ]);

    const masterRows = masterRes.results || [];
    const lotRows = lotsRes.results || [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixMonthsFromNow = new Date();
    sixMonthsFromNow.setHours(23, 59, 59, 999);
    sixMonthsFromNow.setMonth(today.getMonth() + 6);

    const oneYearFromNow = new Date();
    oneYearFromNow.setHours(23, 59, 59, 999);
    oneYearFromNow.setFullYear(today.getFullYear() + 1);

    // Group lots by item_code
    const lotsByItem = {};
    for (const lot of lotRows) {
      const code = String(lot.item_code || "").trim().toUpperCase();
      if (!code) continue;
      if (!lotsByItem[code]) lotsByItem[code] = [];

      const expDate = parseFlexibleDate(lot.expiry_date);
      let remainingDays = 9999;
      let isExpired = false;
      let isExpiring6M = false;
      let isExpiring1Y = false;

      if (expDate) {
        expDate.setHours(0, 0, 0, 0);
        remainingDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (remainingDays <= 0 || expDate < today) {
          isExpired = true;
        } else {
          if (remainingDays <= 180 || expDate <= sixMonthsFromNow) isExpiring6M = true;
          if (remainingDays <= 365 || expDate <= oneYearFromNow) isExpiring1Y = true;
        }
      }

      lotsByItem[code].push({
        id: lot.id,
        lot: lot.lot_number || "-",
        expDate: lot.expiry_date || "-",
        qty: Number(lot.qty) || 0,
        isSample: lot.is_sample === 1 || String(lot.is_sample).toLowerCase() === "true",
        costPrice: Number(lot.cost_price) || 0,
        unitPrice: Number(lot.unit_price) || 0,
        remainingDays,
        isExpired,
        isExpiring6M,
        isExpiring1Y
      });
    }

    const vaccines = [];
    const medicines = [];

    // Process each master item
    for (const m of masterRows) {
      const code = String(m.item_code || "").trim().toUpperCase();
      const cat = String(m.category || "").trim();
      const isVaccine = cat.includes("วัคซีน") || cat.toUpperCase().includes("VACCINE") ||
                        String(m.item_name || "").includes("วัคซีน") || String(m.item_name || "").toUpperCase().includes("VACCINE");

      const itemLots = lotsByItem[code] || [];
      const totalQty = itemLots.reduce((sum, l) => sum + l.qty, 0);
      const minLevel = Number(m.min_level) || 0;
      const isLowStock = totalQty < minLevel && minLevel > 0;

      let hasExpired = false;
      let hasExpiring = false; // 6M for vaccine, 1Y for medicine
      let minRemainingDays = 9999;

      itemLots.forEach(l => {
        if (l.isExpired) hasExpired = true;
        if (isVaccine && l.isExpiring6M) hasExpiring = true;
        if (!isVaccine && l.isExpiring1Y) hasExpiring = true;
        if (l.remainingDays < minRemainingDays) minRemainingDays = l.remainingDays;
      });

      // Item Status
      let status = "NORMAL";
      if (totalQty <= 0) {
        status = "OUT_OF_STOCK";
      } else if (hasExpired) {
        status = "EXPIRED";
      } else if (isLowStock) {
        status = "LOW_STOCK";
      } else if (hasExpiring) {
        status = "EXPIRING";
      }

      // Sort lots by FEFO (earliest expiry first)
      itemLots.sort((a, b) => a.remainingDays - b.remainingDays);

      const itemObj = {
        itemCode: m.item_code,
        itemNameTH: m.item_name,
        itemNameEN: m.generic_name || "",
        category: m.category || (isVaccine ? "วัคซีน" : "ยา"),
        baseUnit: m.base_unit || (isVaccine ? "Dose" : "หน่วย"),
        minLevel,
        imageUrl: m.image_url || "",
        vendorName: m.vendor_name || "",
        totalQty,
        isLowStock,
        hasExpired,
        hasExpiring,
        status,
        minRemainingDays,
        lots: itemLots
      };

      if (isVaccine) {
        vaccines.push(itemObj);
      } else {
        medicines.push(itemObj);
      }
    }

    // Sort order: Critical items first (Expired -> Expiring -> Low stock -> Normal)
    const priorityScore = (item) => {
      if (item.status === 'EXPIRED') return 1;
      if (item.status === 'EXPIRING') return 2;
      if (item.status === 'LOW_STOCK') return 3;
      if (item.status === 'OUT_OF_STOCK') return 4;
      return 5;
    };

    const sortFn = (a, b) => {
      const pDiff = priorityScore(a) - priorityScore(b);
      if (pDiff !== 0) return pDiff;
      return (a.itemNameTH || "").localeCompare(b.itemNameTH || "", 'th');
    };

    vaccines.sort(sortFn);
    medicines.sort(sortFn);

    // Calculate KPIs
    const calcKpi = (list, isVac) => {
      let totalItems = list.length;
      let normalCount = 0;
      let lowCount = 0;
      let expiringCount = 0;
      let expiredCount = 0;
      let totalQtySum = 0;

      list.forEach(i => {
        totalQtySum += i.totalQty;
        if (i.status === 'NORMAL') normalCount++;
        if (i.isLowStock) lowCount++;
        if (i.hasExpiring) expiringCount++;
        if (i.hasExpired) expiredCount++;
      });

      return {
        totalItems,
        normalCount,
        lowCount,
        expiringCount,
        expiredCount,
        totalQtySum
      };
    };

    const vaccinesKpi = calcKpi(vaccines, true);
    const medicinesKpi = calcKpi(medicines, false);

    const overallKpi = {
      totalSKU: vaccines.length + medicines.length,
      totalLowStock: vaccinesKpi.lowCount + medicinesKpi.lowCount,
      totalExpiring: vaccinesKpi.expiringCount + medicinesKpi.expiringCount,
      totalExpired: vaccinesKpi.expiredCount + medicinesKpi.expiredCount,
      totalDoses: vaccinesKpi.totalQtySum,
      totalMedicineUnits: medicinesKpi.totalQtySum
    };

    // Doctor Items (Critical alerts: Expiring, Expired, Low Stock)
    const doctorItems = [...vaccines, ...medicines]
      .filter(i => i.hasExpired || i.hasExpiring || i.isLowStock)
      .sort((a, b) => a.minRemainingDays - b.minRemainingDays);

    return {
      success: true,
      vaccines,
      medicines,
      doctorItems,
      vaccinesKpi,
      medicinesKpi,
      overallKpi,
      timestamp: new Date().toISOString()
    };
  } catch (err) {
    console.error("Error in handleGetMobileDashboard:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Format Helpers for Data Objects
 */
function formatMasterRow(row) {
  return {
    ItemCode: row.item_code,
    ItemName: row.item_name,
    GenericName: row.generic_name || "",
    Category: row.category || "ยาและเวชภัณฑ์",
    BaseUnit: row.base_unit || "เม็ด",
    PackSize: row.pack_size || 1,
    OrderUnit: row.order_unit || "กล่อง",
    Min: row.min_level || 0,
    VendorName: row.vendor_name || "",
    StandardCost: row.standard_cost || 0,
    SellingPrice: row.selling_price || 0,
    ImageLink: row.image_url || "",
    "ลิงค์รูปภาพ": row.image_url || ""
  };
}

function formatLotRow(row) {
  return {
    id: row.id,
    ReceiveDate: row.receive_date || "",
    ItemCode: row.item_code,
    ItemName: row.item_name,
    LotNumber: row.lot_number,
    ExpiryDate: row.expiry_date,
    Qty: row.qty,
    StockStatus: row.stock_status,
    ExpiryStatus: row.expiry_status,
    IsSample: row.is_sample,
    CostPrice: row.cost_price,
    UnitPrice: row.unit_price
  };
}

function formatTransactionRow(row) {
  return {
    Timestamp: row.timestamp,
    ReceiveDate: row.receive_date || "",
    ActionType: row.action_type,
    ItemCode: row.item_code,
    ItemName: row.item_name,
    LotNumber: row.lot_number,
    QtyChange: row.qty_change,
    HN_VN: row.hn_vn || "",
    CostPrice: row.cost_price,
    SellingPrice: row.selling_price,
    TotalPrice: row.total_price,
    Note: row.note || "",
    By: row.by_user || ""
  };
}

function formatVendorRow(row) {
  return {
    VendorCode: row.vendor_code,
    VendorName: row.vendor_name,
    ContactPerson: row.contact_person || "",
    Phone: row.phone || "",
    Email: row.email || "",
    TaxId: row.tax_id || "",
    CreditTermDays: row.credit_term_days || 30,
    Address: row.address || "",
    Note: row.note || "",
    Status: row.status || "Active"
  };
}

function formatPackageRow(row) {
  return {
    PackageCode: row.package_code,
    PackageName: row.package_name,
    LinkedItemCode: row.linked_item_code || "",
    TotalDoses: row.total_doses,
    SinglePrice: row.single_price,
    PackagePrice: row.package_price,
    Description: row.description || "",
    Status: row.status || "Active"
  };
}

function formatPatientPackageRow(row) {
  return {
    Timestamp: row.timestamp,
    PatientPackageId: row.patient_package_id,
    HN: row.hn,
    PatientName: row.patient_name,
    PackageCode: row.package_code,
    PackageName: row.package_name,
    LinkedItemCode: row.linked_item_code,
    TotalDoses: row.total_doses,
    CompletedDoses: row.completed_doses,
    RemainingDoses: row.remaining_doses,
    LastDoseDate: row.last_dose_date || "",
    NextDueDate: row.next_due_date || "",
    Status: row.status,
    CreatedBy: row.created_by
  };
}

function formatTempLogRow(row) {
  return {
    id: row.id,
    _rowNumber: row.id,
    Timestamp: row.timestamp,
    LocationType: row.location_type,
    LocationID: row.location_id,
    LocationName: row.location_name,
    FridgeID: row.location_id,
    FridgeName: row.location_name,
    Shift: row.shift,
    Temperature: (row.temperature !== null && row.temperature !== undefined) ? Number(row.temperature) : null,
    Humidity: (row.humidity !== null && row.humidity !== undefined && row.humidity !== "") ? Number(row.humidity) : null,
    Status: row.status,
    Note: row.note || "",
    RecordStatus: row.record_status,
    RecordedBy: row.recorded_by,
    RecordedAt: row.recorded_at,
    VerifiedBy: row.verified_by || "",
    VerifiedAt: row.verified_at || "",
    VerifyNote: row.verify_note || ""
  };
}

function formatStockTakeRow(row) {
  return {
    id: row.id,
    TakeId: row.take_id,
    Timestamp: row.timestamp,
    ItemCode: row.item_code,
    ItemName: row.item_name,
    LotNumber: row.lot_number,
    ExpiryDate: row.expiry_date,
    SystemQty: row.system_qty,
    CountQty: row.count_qty,
    Variance: row.variance,
    Reason: row.reason || "",
    CountedBy: row.counted_by,
    Status: row.status,
    VerifiedBy: row.verified_by || "",
    VerifiedAt: row.verified_at || "",
    VerifyNote: row.verify_note || ""
  };
}

function formatHospitalRow(row) {
  return {
    HospitalID: row.hospital_id,
    HospitalName: row.hospital_name,
    ContactPerson: row.contact_person || "",
    Phone: row.phone || "",
    Address: row.address || "",
    Status: row.status || "Active"
  };
}

function formatLoanRow(row) {
  return {
    LoanID: row.loan_id,
    Timestamp: row.timestamp,
    TransactionType: row.transaction_type,
    RefHospitalID: row.ref_hospital_id,
    RefHospitalName: row.ref_hospital_name,
    ItemCode: row.item_code,
    ItemName: row.item_name,
    LotNumber: row.lot_number || "",
    ExpiryDate: row.expiry_date || "",
    QtyBorrowed: row.qty_borrowed,
    QtyReturned: row.qty_returned,
    QtyOutstanding: row.qty_outstanding,
    ItemCategory: row.item_category || "ยาและเวชภัณฑ์",
    BorrowerName: row.borrower_name || "",
    BorrowerPos: row.borrower_pos || "",
    BorrowerApproveName: row.borrower_approve_name || "",
    BorrowerApprovePos: row.borrower_approve_pos || "",
    LenderName: row.lender_name || "",
    LenderPos: row.lender_pos || "",
    LenderApproveName: row.lender_approve_name || "",
    LenderApprovePos: row.lender_approve_pos || "",
    ReceiverName: row.receiver_name || "",
    ReceiverPos: row.receiver_pos || "",
    ReturnDate: row.return_date || "",
    ReturnerName: row.returner_name || "",
    ReturnerPos: row.returner_pos || "",
    ReturnReceiverName: row.return_receiver_name || "",
    ReturnReceiverPos: row.return_receiver_pos || "",
    ReturnCarrierName: row.return_carrier_name || "",
    ReturnCarrierPos: row.return_carrier_pos || "",
    LoanStatus: row.loan_status
  };
}

function calculateDashboardStats(master = [], lots = []) {
  const stockByItem = {};
  let totalValue = 0;
  const now = new Date();
  const threeMonthsLater = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  let nearExpiryCount = 0;
  let expiredCount = 0;

  for (const lot of lots) {
    const code = lot.ItemCode;
    const qty = Number(lot.Qty) || 0;
    const cost = Number(lot.CostPrice) || 0;
    totalValue += qty * cost;

    stockByItem[code] = (stockByItem[code] || 0) + qty;

    if (lot.ExpiryDate) {
      const expDate = new Date(lot.ExpiryDate);
      if (!isNaN(expDate.getTime())) {
        if (expDate <= now) {
          expiredCount++;
        } else if (expDate <= threeMonthsLater) {
          nearExpiryCount++;
        }
      }
    }
  }

  let lowStockCount = 0;
  for (const m of master) {
    const totalQty = stockByItem[m.ItemCode] || 0;
    const min = Number(m.Min) || 0;
    if (totalQty <= min) {
      lowStockCount++;
    }
  }

  return {
    totalItems: master.length,
    lowStockCount,
    nearExpiryCount,
    expiredCount,
    totalInventoryValue: totalValue,
    activeLotsCount: lots.length
  };
}

function formatDateStr(val) {
  if (!val) return "";
  if (typeof val === "string") {
    // If already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}/.test(val)) return val.substring(0, 10);
    // If DD/MM/YYYY
    const parts = val.split("/");
    if (parts.length === 3) {
      let year = parseInt(parts[2], 10);
      if (year > 2500) year -= 543; // Thai BE
      return `${year}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    }
  }
  try {
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d.toISOString().substring(0, 10);
  } catch (e) {}
  return String(val);
}


// ==============================================================================
// 100% D1-POWERED ADVANCED REPORT ENGINE & BUSINESS LOGIC
// ==============================================================================

async function handleD1AdvancedReports(db, payload = {}, action = "") {
  let reportType = String(payload.reportType || action || "STOCK_BALANCE").toUpperCase();
  if (reportType === "GET_REPORTS") reportType = "STOCK_BALANCE";
  if (reportType === "GET_ADVANCED_REPORTS") reportType = String(payload.reportType || "STOCK_BALANCE").toUpperCase();

  switch (reportType) {
    case "STOCK_BALANCE": {
      const [mRes, lRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      return generateD1StockBalanceReport(masterList, lotList, payload);
    }
    case "STOCK_EXPIRY_BATCH":
    case "BATCH_EXPIRY": {
      const [mRes, lRes, tRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots ORDER BY expiry_date ASC").all(),
        db.prepare("SELECT * FROM stock_transactions ORDER BY id ASC").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      const txList = (tRes.results || []).map(formatTransactionRow);
      return generateD1StockExpiryBatchReport(masterList, lotList, txList, payload);
    }
    case "MOVEMENT": {
      const [mRes, lRes, tRes, pRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata").all(),
        db.prepare("SELECT * FROM inventory_lots").all(),
        db.prepare("SELECT * FROM stock_transactions ORDER BY id DESC LIMIT 5000").all(),
        db.prepare("SELECT * FROM vaccine_packages").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      const txList = (tRes.results || []).map(formatTransactionRow);
      const pkgList = (pRes.results || []).map(formatPackageRow);
      return generateD1MovementReport(masterList, lotList, txList, pkgList, payload);
    }
    case "EXPIRY": {
      const lRes = await db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all();
      const lotList = (lRes.results || []).map(formatLotRow);
      return generateD1ExpiryReport(lotList, payload);
    }
    case "SMART_PR": {
      const [mRes, lRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      return generateD1SmartPRReport(masterList, lotList, payload);
    }
    case "DEAD_STOCK": {
      const [mRes, lRes, tRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0").all(),
        db.prepare("SELECT * FROM stock_transactions WHERE action_type LIKE '%Outbound%' ORDER BY id DESC").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      const txList = (tRes.results || []).map(formatTransactionRow);
      return generateD1DeadStockReport(masterList, lotList, txList, payload);
    }
    case "ADJUSTMENT": {
      const tRes = await db.prepare("SELECT * FROM stock_transactions WHERE lower(action_type) LIKE '%adjust%' ORDER BY id DESC").all();
      const txList = (tRes.results || []).map(formatTransactionRow);
      return generateD1AdjustmentReport(txList, payload);
    }
    case "TOP_DISPENSED": {
      const [mRes, tRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata").all(),
        db.prepare("SELECT * FROM stock_transactions WHERE action_type LIKE '%Outbound%' ORDER BY id DESC").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const txList = (tRes.results || []).map(formatTransactionRow);
      return generateD1TopDispensedReport(masterList, txList, payload);
    }
    default: {
      const [mRes, lRes] = await Promise.all([
        db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
        db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all()
      ]);
      const masterList = (mRes.results || []).map(formatMasterRow);
      const lotList = (lRes.results || []).map(formatLotRow);
      return generateD1StockBalanceReport(masterList, lotList, payload);
    }
  }
}

// 0. Stock Balance Report
function generateD1StockBalanceReport(masterList, lotList, payload = {}) {
  const categoryFilter = String(payload.category || "ALL").trim();
  const statusFilter = String(payload.status || "ALL").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || payload.itemCode || "").trim().toUpperCase();

  const lotMap = {};
  lotList.forEach(lot => {
    const code = String(lot.ItemCode || "").trim().toUpperCase();
    if (!code) return;
    const qty = Number(lot.Qty) || 0;
    if (qty <= 0) return;

    if (!lotMap[code]) {
      lotMap[code] = { totalQty: 0, totalValue: 0, lotCount: 0, earliestExpiry: null };
    }
    const cost = Number(lot.CostPrice) || 0;
    lotMap[code].totalQty += qty;
    lotMap[code].totalValue += (qty * cost);
    lotMap[code].lotCount += 1;

    if (lot.ExpiryDate) {
      const expDate = parseFlexibleDate(lot.ExpiryDate);
      if (expDate && (!lotMap[code].earliestExpiry || expDate < lotMap[code].earliestExpiry)) {
        lotMap[code].earliestExpiry = expDate;
      }
    }
  });

  let totalSKUs = 0;
  let totalUnits = 0;
  let totalStockValue = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let normalStockCount = 0;
  const rows = [];

  masterList.forEach(m => {
    const code = String(m.ItemCode || "").trim();
    if (!code) return;
    const codeUpper = code.toUpperCase();
    const name = String(m.ItemName || "").trim();
    const generic = String(m.GenericName || "").trim();
    const category = String(m.Category || "ยา").trim();
    const baseUnit = String(m.BaseUnit || "หน่วย").trim();
    const minLevel = Number(m.Min) || 0;
    const stdCost = Number(m.StandardCost) || 0;

    const lotData = lotMap[codeUpper] || { totalQty: 0, totalValue: 0, lotCount: 0, earliestExpiry: null };
    const currentQty = lotData.totalQty;
    const itemValue = lotData.totalValue > 0 ? lotData.totalValue : (currentQty * stdCost);

    let stockStatus = "NORMAL";
    let statusLabel = "ปกติ";
    if (currentQty === 0) {
      stockStatus = "OUT_OF_STOCK";
      statusLabel = "สินค้าหมด";
      outOfStockCount++;
    } else if (minLevel > 0 && currentQty <= minLevel) {
      stockStatus = "LOW_STOCK";
      statusLabel = "ถึงจุดสั่งซื้อ (ต่ำกว่า Min)";
      lowStockCount++;
    } else {
      normalStockCount++;
    }

    if (categoryFilter !== "ALL" && category !== categoryFilter) return;
    if (statusFilter === "OUT_OF_STOCK" && stockStatus !== "OUT_OF_STOCK") return;
    if (statusFilter === "LOW_STOCK" && stockStatus !== "LOW_STOCK") return;
    if (statusFilter === "NORMAL" && stockStatus !== "NORMAL") return;

    if (searchKeyword) {
      const matchCode = codeUpper.includes(searchKeyword);
      const matchName = name.toUpperCase().includes(searchKeyword);
      const matchGeneric = generic.toUpperCase().includes(searchKeyword);
      if (!matchCode && !matchName && !matchGeneric) return;
    }

    totalSKUs++;
    totalUnits += currentQty;
    totalStockValue += itemValue;

    rows.push({
      ItemCode: code,
      ItemName: name,
      GenericName: generic,
      Category: category,
      BaseUnit: baseUnit,
      CurrentQty: currentQty,
      Min: minLevel,
      CostPrice: stdCost,
      TotalValue: itemValue,
      LotCount: lotData.lotCount,
      EarliestExpiry: lotData.earliestExpiry ? formatDateTime(lotData.earliestExpiry, "yyyy-MM-dd") : "-",
      StockStatus: stockStatus,
      StatusLabel: statusLabel
    });
  });

  rows.sort((a, b) => {
    const rank = { "OUT_OF_STOCK": 1, "LOW_STOCK": 2, "NORMAL": 3 };
    if (rank[a.StockStatus] !== rank[b.StockStatus]) {
      return (rank[a.StockStatus] || 3) - (rank[b.StockStatus] || 3);
    }
    return a.ItemName.localeCompare(b.ItemName, 'th');
  });

  return {
    success: true,
    reportType: "STOCK_BALANCE",
    reportTitle: "รายงานยอดคงเหลือ ณ ปัจจุบัน (Current Stock Balance Report)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalSKUs,
      totalUnits,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      outOfStockCount,
      lowStockCount,
      normalStockCount
    },
    data: rows
  };
}

// 7/8. Stock Balance & Expiry by Batch / Monthly Inbound Report
function generateD1StockExpiryBatchReport(masterList, lotList, txList, payload = {}) {
  let refDate = parseFlexibleDate(payload.asOfDate || payload.date || payload.endDate);
  if (!refDate) refDate = new Date();
  refDate.setHours(23, 59, 59, 999);

  const masterMap = {};
  masterList.forEach(m => {
    const code = String(m.ItemCode || "").trim().toUpperCase();
    if (code) masterMap[code] = m;
  });

  const categoryFilter = String(payload.category || "ALL").trim();
  const expiryStatusFilter = String(payload.expiryStatus || payload.status || "ALL").trim().toUpperCase();
  const sampleFilter = String(payload.sampleFilter || payload.isSample || "ALL").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || payload.itemCode || "").trim().toUpperCase();

  const lotTxMap = {};
  const allInboundMonthsSet = new Set();
  const allOutboundMonthsSet = new Set();

  txList.forEach(t => {
    const tDate = parseFlexibleDate(t.Timestamp || t.ReceiveDate || t.Date);
    if (!tDate || tDate > refDate) return;

    const itemCode = String(t.ItemCode || "").trim().toUpperCase();
    const lotNo = String(t.LotNumber || t.LotNo || "-").trim();
    if (!itemCode) return;

    const lotKey = itemCode + "_" + lotNo;
    if (!lotTxMap[lotKey]) {
      lotTxMap[lotKey] = { inboundsByMonth: {}, outboundsByMonth: {}, totalInbound: 0, totalOutbound: 0 };
    }

    const action = String(t.ActionType || "");
    const qty = Math.abs(Number(t.QtyChange) || 0);

    if (action.toLowerCase().includes("inbound") || action.toLowerCase().includes("receive")) {
      const recDate = parseFlexibleDate(t.ReceiveDate) || tDate;
      const inYm = formatDateTime(recDate, "yyyy-MM");
      lotTxMap[lotKey].inboundsByMonth[inYm] = (lotTxMap[lotKey].inboundsByMonth[inYm] || 0) + qty;
      lotTxMap[lotKey].totalInbound += qty;
      allInboundMonthsSet.add(inYm);
    } else if (action.toLowerCase().includes("outbound") || action.toLowerCase().includes("dispense") || action.toLowerCase().includes("loan_out")) {
      const ym = formatDateTime(tDate, "yyyy-MM");
      lotTxMap[lotKey].outboundsByMonth[ym] = (lotTxMap[lotKey].outboundsByMonth[ym] || 0) + qty;
      lotTxMap[lotKey].totalOutbound += qty;
      allOutboundMonthsSet.add(ym);
    }
  });

  const THAI_SHORT_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  const sortedInboundMonths = Array.from(allInboundMonthsSet).sort();
  const inboundMonths = sortedInboundMonths.map(ym => {
    const parts = ym.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const thaiYearShort = String((y > 2400 ? y : y + 543) % 100).padStart(2, "0");
    const thaiMonthName = THAI_SHORT_MONTHS[m - 1] || ym;
    return {
      monthKey: "in_month_" + ym.replace("-", "_"),
      yearMonth: ym,
      label: thaiMonthName + " " + thaiYearShort
    };
  });

  const sortedOutboundMonths = Array.from(allOutboundMonthsSet).sort();
  const outboundMonths = sortedOutboundMonths.map(ym => {
    const parts = ym.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const thaiYearShort = String((y > 2400 ? y : y + 543) % 100).padStart(2, "0");
    const thaiMonthName = THAI_SHORT_MONTHS[m - 1] || ym;
    return {
      monthKey: "month_" + ym.replace("-", "_"),
      yearMonth: ym,
      label: thaiMonthName + " " + thaiYearShort
    };
  });

  if (inboundMonths.length === 0) {
    const ym = formatDateTime(refDate, "yyyy-MM");
    const parts = ym.split("-");
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    const thaiYearShort = String((y > 2400 ? y : y + 543) % 100).padStart(2, "0");
    const thaiMonthName = THAI_SHORT_MONTHS[m - 1] || ym;
    inboundMonths.push({
      monthKey: "in_month_" + ym.replace("-", "_"),
      yearMonth: ym,
      label: thaiMonthName + " " + thaiYearShort
    });
  }

  let grandTotalInbound = 0;
  let grandTotalOutbound = 0;
  let grandTotalRemaining = 0;
  let grandTotalCostValue = 0;
  let grandTotalSellingValue = 0;
  let expiring6MCount = 0;
  let expiring1YCount = 0;
  let expiredCount = 0;
  let normalCount = 0;

  const rows = [];
  let seqNumber = 1;

  lotList.forEach(lot => {
    const itemCode = String(lot.ItemCode || "").trim().toUpperCase();
    if (!itemCode) return;

    const master = masterMap[itemCode] || {};
    const itemName = String(lot.ItemName || master.ItemName || itemCode).trim();
    const category = String(master.Category || "ยา").trim();
    const lotNumber = String(lot.LotNumber || "-").trim();
    const isSample = (String(lot.IsSample || "").toUpperCase() === "YES" || String(lot.IsSample || "").toUpperCase() === "1" || lot.IsSample === 1) ? "YES" : "NO";

    const expDate = parseFlexibleDate(lot.ExpiryDate);
    let daysRemaining = 9999;
    let expiryStatus = "ปกติ";
    let expiryStatusCode = "NORMAL";
    let formattedExpDate = lot.ExpiryDate || "-";

    if (expDate) {
      formattedExpDate = formatDateTime(expDate, "yyyy/MM/dd");
      const diffMs = expDate.getTime() - refDate.getTime();
      daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (daysRemaining <= 0) {
        expiryStatus = "หมดอายุแล้ว";
        expiryStatusCode = "EXPIRED";
        expiredCount++;
      } else if (daysRemaining <= 180) {
        expiryStatus = "หมดอายุภายใน 6 เดือน";
        expiryStatusCode = "EXPIRING_6M";
        expiring6MCount++;
      } else if (daysRemaining <= 365) {
        expiryStatus = "หมดอายุภายใน 1 ปี";
        expiryStatusCode = "EXPIRING_1Y";
        expiring1YCount++;
      } else {
        expiryStatus = "ปกติ";
        expiryStatusCode = "NORMAL";
        normalCount++;
      }
    } else {
      normalCount++;
    }

    const costPrice = Number(lot.CostPrice) > 0 ? Number(lot.CostPrice) : (Number(master.StandardCost) || 0);
    const sellingPrice = Number(lot.UnitPrice) > 0 ? Number(lot.UnitPrice) : (Number(master.SellingPrice) || 0);

    const lotKey = itemCode + "_" + lotNumber;
    const txInfo = lotTxMap[lotKey] || { inboundsByMonth: {}, outboundsByMonth: {}, totalInbound: 0, totalOutbound: 0 };

    const inboundValues = {};
    let calcTotalInbound = txInfo.totalInbound;
    if (calcTotalInbound === 0) {
      calcTotalInbound = Number(lot.Qty) || 0;
      if (inboundMonths.length > 0) {
        inboundValues[inboundMonths[0].monthKey] = calcTotalInbound;
      }
    } else {
      inboundMonths.forEach(m => {
        const q = txInfo.inboundsByMonth ? (txInfo.inboundsByMonth[m.yearMonth] || 0) : 0;
        inboundValues[m.monthKey] = q > 0 ? q : "-";
      });
    }

    const outboundValues = {};
    outboundMonths.forEach(m => {
      const q = txInfo.outboundsByMonth[m.yearMonth] || 0;
      outboundValues[m.monthKey] = q > 0 ? q : "-";
    });

    const totalOutbound = txInfo.totalOutbound;
    const remainingQty = (calcTotalInbound >= totalOutbound && calcTotalInbound > 0)
      ? (calcTotalInbound - totalOutbound) 
      : (Number(lot.Qty) || 0);

    const rowCostValue = remainingQty * costPrice;
    const rowSellingValue = remainingQty * sellingPrice;

    if (categoryFilter !== "ALL" && category !== categoryFilter) return;
    if (expiryStatusFilter === "EXPIRED" && expiryStatusCode !== "EXPIRED") return;
    if (expiryStatusFilter === "EXPIRING_6M" && expiryStatusCode !== "EXPIRING_6M" && expiryStatusCode !== "EXPIRED") return;
    if (expiryStatusFilter === "EXPIRING_1Y" && expiryStatusCode !== "EXPIRING_1Y" && expiryStatusCode !== "EXPIRING_6M" && expiryStatusCode !== "EXPIRED") return;
    if (expiryStatusFilter === "NORMAL" && expiryStatusCode !== "NORMAL") return;

    if (sampleFilter === "YES" && isSample !== "YES") return;
    if (sampleFilter === "NO" && isSample !== "NO") return;

    if (searchKeyword) {
      const match = itemCode.includes(searchKeyword) ||
                    itemName.toUpperCase().includes(searchKeyword) ||
                    lotNumber.toUpperCase().includes(searchKeyword) ||
                    category.toUpperCase().includes(searchKeyword);
      if (!match) return;
    }

    grandTotalInbound += calcTotalInbound;
    grandTotalOutbound += totalOutbound;
    grandTotalRemaining += remainingQty;
    grandTotalCostValue += rowCostValue;
    grandTotalSellingValue += rowSellingValue;

    rows.push({
      Sequence: seqNumber++,
      ItemCode: itemCode,
      ItemName: itemName,
      GenericName: master.GenericName || "-",
      Category: category,
      BaseUnit: master.BaseUnit || "หน่วย",
      LotNumber: lotNumber,
      ExpiryDate: formattedExpDate,
      DaysRemaining: daysRemaining < 9999 ? daysRemaining : "-",
      ExpiryStatus: expiryStatus,
      ExpiryStatusCode: expiryStatusCode,
      IsSample: isSample,
      InboundMonths: inboundValues,
      InboundRounds: inboundValues,
      TotalInboundQty: calcTotalInbound,
      OutboundMonths: outboundValues,
      TotalOutboundQty: totalOutbound,
      RemainingQty: remainingQty,
      CostPrice: costPrice,
      SellingPrice: sellingPrice,
      TotalCostValue: rowCostValue,
      TotalSellingValue: rowSellingValue
    });
  });

  const thaiRefDate = formatThaiDateFull(refDate);

  return {
    success: true,
    reportType: "STOCK_EXPIRY_BATCH",
    reportTitle: "รายงานจำนวนคงเหลือและวันหมดอายุ ณ วันที่ " + thaiRefDate,
    asOfDate: formatDateTime(refDate, "yyyy-MM-dd"),
    asOfDateThai: thaiRefDate,
    inboundMonths,
    inboundRounds: inboundMonths,
    outboundMonths,
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rows.length,
      grandTotalInbound,
      grandTotalOutbound,
      grandTotalRemaining,
      grandTotalCostValue,
      grandTotalSellingValue,
      expiredCount,
      expiring6MCount,
      expiring1YCount,
      normalCount
    },
    data: rows
  };
}

// 1. Movement Report
function generateD1MovementReport(masterList, lotList, txList, pkgList, payload = {}) {
  const startD = parseFlexibleDate(payload.startDate);
  if (startD) startD.setHours(0, 0, 0, 0);
  const endD = parseFlexibleDate(payload.endDate);
  if (endD) endD.setHours(23, 59, 59, 999);

  const masterMap = {};
  masterList.forEach(m => {
    const code = String(m.ItemCode || "").toUpperCase().trim();
    if (code) masterMap[code] = m;
  });

  const lotMap = {};
  lotList.forEach(lot => {
    const code = String(lot.ItemCode || "").toUpperCase().trim();
    if (!code) return;
    if (!lotMap[code]) lotMap[code] = [];
    lotMap[code].push(lot);
  });

  function enrichTransaction(t) {
    const code = String(t.ItemCode || "").toUpperCase().trim();
    const master = masterMap[code];
    if (master && (!t.ItemName || t.ItemName === "-" || t.ItemName === code)) {
      t.ItemName = master.ItemName || t.ItemName;
    }

    const itemLots = lotMap[code] || [];
    let lotNum = String(t.LotNumber || t.LotNo || "").trim();
    let matchingLot = null;

    if (lotNum && lotNum !== "-" && lotNum.toLowerCase() !== "null" && lotNum.toLowerCase() !== "undefined") {
      matchingLot = itemLots.find(l => String(l.LotNumber || "").trim().toUpperCase() === lotNum.toUpperCase());
    } else {
      if (itemLots.length > 0) {
        matchingLot = itemLots[0];
        lotNum = matchingLot.LotNumber || "-";
      }
    }
    t.LotNumber = lotNum || "-";

    let cost = Number(t.CostPrice) || 0;
    if (cost <= 0) {
      if (matchingLot && Number(matchingLot.CostPrice) > 0) cost = Number(matchingLot.CostPrice);
      else if (itemLots.length > 0 && Number(itemLots[0].CostPrice) > 0) cost = Number(itemLots[0].CostPrice);
      else if (master && Number(master.StandardCost) > 0) cost = Number(master.StandardCost);
    }
    t.CostPrice = cost;

    let selling = Number(t.SellingPrice) || 0;
    if (selling <= 0) {
      const noteUpper = String(t.Note || "").toUpperCase();
      const pkgMatch = pkgList.find(p => 
        (p.LinkedItemCode && String(p.LinkedItemCode).toUpperCase().trim() === code) ||
        (p.PackageCode && noteUpper.includes(String(p.PackageCode).toUpperCase().trim())) ||
        (p.PackageName && noteUpper.includes(String(p.PackageName).toUpperCase().trim()))
      );

      if (pkgMatch) {
        const totalDoses = Number(pkgMatch.TotalDoses) || 1;
        const pkgPrice = Number(pkgMatch.PackagePrice) || 0;
        selling = totalDoses > 0 ? (pkgPrice / totalDoses) : (Number(pkgMatch.SinglePrice) || 0);
      }

      if (selling <= 0) {
        if (matchingLot && Number(matchingLot.UnitPrice) > 0) selling = Number(matchingLot.UnitPrice);
        else if (itemLots.length > 0 && Number(itemLots[0].UnitPrice) > 0) selling = Number(itemLots[0].UnitPrice);
        else if (master && Number(master.SellingPrice) > 0) selling = Number(master.SellingPrice);
      }
    }
    t.SellingPrice = selling;

    let total = Number(t.TotalPrice) || 0;
    if (total <= 0) {
      const qty = Math.abs(Number(t.QtyChange) || 1);
      const act = String(t.ActionType || "");
      if (act.includes("Inbound")) total = qty * (t.CostPrice || 0);
      else total = qty * (t.SellingPrice || t.CostPrice || 0);
    }
    t.TotalPrice = total;
  }

  const enrichedTransactions = txList.map(t => {
    const copy = { ...t };
    enrichTransaction(copy);
    return copy;
  });

  const actionFilter = String(payload.actionType || "ALL").trim();
  const exactItemCode = String(payload.itemCode || "").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || "").trim().toUpperCase();

  let inboundCount = 0;
  let outboundCount = 0;
  let adjustCount = 0;
  let totalQtySum = 0;

  const rows = enrichedTransactions.filter(t => {
    if (startD || endD) {
      const isDateValid = isDateWithinRange(t.ReceiveDate, startD, endD) || 
                          isDateWithinRange(t.Timestamp, startD, endD) ||
                          isDateWithinRange(t.Date, startD, endD);
      if (!isDateValid) return false;
    }

    const act = String(t.ActionType || "");
    if (actionFilter === "Inbound" && !act.includes("Inbound")) return false;
    if (actionFilter === "Outbound" && !act.includes("Outbound")) return false;
    if (actionFilter === "Adjust" && !act.toLowerCase().includes("adjust")) return false;
    if (actionFilter === "Sample" && !act.includes("Sample") && !act.includes("ยา sample")) return false;

    const code = String(t.ItemCode || "").toUpperCase().trim();
    if (exactItemCode && exactItemCode !== "ALL") {
      if (code !== exactItemCode) return false;
    }

    if (searchKeyword) {
      const name = String(t.ItemName || "").toUpperCase();
      const lot = String(t.LotNo || t.LotNumber || "").toUpperCase();
      const hn = String(t.HN_VN || "").toUpperCase();
      const note = String(t.Note || "").toUpperCase();
      const by = String(t.By || "").toUpperCase();

      const directMatch = code.includes(searchKeyword) || 
                          name.includes(searchKeyword) || 
                          lot.includes(searchKeyword) || 
                          hn.includes(searchKeyword) || 
                          note.includes(searchKeyword) || 
                          by.includes(searchKeyword);
      if (!directMatch) return false;
    }

    if (act.includes("Inbound")) inboundCount++;
    if (act.includes("Outbound")) outboundCount++;
    if (act.toLowerCase().includes("adjust")) adjustCount++;
    totalQtySum += Number(t.QtyChange) || 0;

    return true;
  });

  return {
    success: true,
    reportType: "MOVEMENT",
    reportTitle: "รายงานความเคลื่อนไหวของคลังยา (Stock Movement / Audit Trail)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rows.length,
      inboundCount,
      outboundCount,
      adjustCount,
      netQtyChange: totalQtySum
    },
    data: rows
  };
}

// 2. Near Expiry & Expired Report
function generateD1ExpiryReport(lotList, payload = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thresholdFilter = String(payload.thresholdDays || "90").toUpperCase();
  let expiredLots = 0;
  let expiringSoonLots = 0;
  let totalQty = 0;
  let totalValue = 0;
  const validLots = [];

  lotList.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty <= 0) return;

    const expDate = parseFlexibleDate(lot.ExpiryDate);
    if (!expDate) return;
    expDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    let expStatus = "Normal";

    if (diffDays <= 0) {
      expStatus = "Expired";
      expiredLots++;
    } else if (diffDays <= 90) {
      expStatus = "ExpiringSoon";
      expiringSoonLots++;
    }

    if (thresholdFilter === "EXPIRED" && diffDays > 0) return;
    if (thresholdFilter === "90" && diffDays > 90) return;
    if (thresholdFilter === "180" && diffDays > 180) return;

    const costPrice = Number(lot.CostPrice) || 0;
    const lotValue = qty * costPrice;

    totalQty += qty;
    totalValue += lotValue;

    validLots.push({
      ItemCode: lot.ItemCode,
      ItemName: lot.ItemName,
      LotNumber: lot.LotNumber,
      ExpiryDate: formatDateTime(expDate, "yyyy-MM-dd"),
      DaysRemaining: diffDays,
      ExpiryStatus: expStatus,
      Qty: qty,
      CostPrice: costPrice,
      TotalValue: lotValue,
      IsSample: lot.IsSample
    });
  });

  validLots.sort((a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate));

  return {
    success: true,
    reportType: "EXPIRY",
    reportTitle: "รายงานยาใกล้หมดอายุและยาหมดอายุ (Near-Expiry & Expired Report)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: validLots.length,
      expiredCount: expiredLots,
      expiringSoonCount: expiringSoonLots,
      totalQty,
      totalValue
    },
    data: validLots
  };
}

// 3. Smart PR Report
function generateD1SmartPRReport(masterList, lotList, payload = {}) {
  const stockMap = {};
  lotList.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode).trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  const filterMode = payload.filterMode || "REORDER_ONLY";
  const prList = [];
  let totalOrderUnits = 0;
  let totalEstimatedCost = 0;

  masterList.forEach(m => {
    const code = String(m.ItemCode).trim().toUpperCase();
    const currentStock = stockMap[code] || 0;
    const minThreshold = Number(m.Min) || 0;
    const packSize = Math.max(1, Number(m.PackSize) || 1);
    const standardCost = Number(m.StandardCost) || 0;

    const isLowStock = currentStock <= minThreshold;
    if (filterMode === "REORDER_ONLY" && !isLowStock) return;

    const rawDeficit = Math.max(0, (minThreshold * 2) - currentStock);
    const suggestedOrderPacks = Math.max(1, Math.ceil(rawDeficit / packSize));
    const suggestedOrderQty = suggestedOrderPacks * packSize;
    const estimatedCost = suggestedOrderQty * standardCost;

    let urgency = "ปกติ";
    if (currentStock === 0) urgency = "วิกฤต (สต็อกหมด)";
    else if (currentStock <= minThreshold / 2) urgency = "ด่วนมาก (ต่ำกว่า 50% ของ Min)";
    else if (isLowStock) urgency = "ด่วน (ถึงจุดสั่งซื้อ)";

    totalOrderUnits += suggestedOrderQty;
    totalEstimatedCost += estimatedCost;

    prList.push({
      ItemCode: m.ItemCode,
      ItemName: m.ItemName,
      Category: m.Category || "ยา",
      CurrentStock: currentStock,
      MinThreshold: minThreshold,
      SuggestedOrderQty: suggestedOrderQty,
      SuggestedOrderPacks: suggestedOrderPacks,
      BaseUnit: m.BaseUnit || "หน่วย",
      OrderUnit: m.OrderUnit || "กล่อง",
      PackSize: packSize,
      VendorName: m.VendorName || "ไม่ระบุ",
      StandardCost: standardCost,
      EstimatedCost: estimatedCost,
      Urgency: urgency,
      IsLowStock: isLowStock
    });
  });

  prList.sort((a, b) => a.CurrentStock - b.CurrentStock);

  return {
    success: true,
    reportType: "SMART_PR",
    reportTitle: "รายงานยาถึงจุดสั่งซื้อและจัดทำใบสั่งซื้ออัจฉริยะ (Low Stock & Smart PR)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: prList.length,
      totalOrderUnits,
      totalEstimatedCost
    },
    data: prList
  };
}

// 4. Dead Stock Report
function generateD1DeadStockReport(masterList, lotList, txList, payload = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inactiveDaysThreshold = Number(payload.thresholdDays) || 90;

  const stockMap = {};
  lotList.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode).trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  const lastOutboundMap = {};
  txList.forEach(t => {
    if (String(t.ActionType).includes("Outbound")) {
      const code = String(t.ItemCode).trim().toUpperCase();
      const tDate = parseFlexibleDate(t.Timestamp);
      if (tDate && (!lastOutboundMap[code] || tDate > lastOutboundMap[code])) {
        lastOutboundMap[code] = tDate;
      }
    }
  });

  const deadList = [];
  let totalDeadUnits = 0;
  let totalHoldingValue = 0;

  masterList.forEach(m => {
    const code = String(m.ItemCode).trim().toUpperCase();
    const currentStock = stockMap[code] || 0;
    if (currentStock <= 0) return;

    const lastDate = lastOutboundMap[code];
    let inactiveDays = 9999;
    let lastDateFormatted = "ไม่เคยมีการเบิกจ่าย";

    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      inactiveDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      lastDateFormatted = formatDateTime(lastDate, "yyyy-MM-dd");
    }

    if (inactiveDays < inactiveDaysThreshold) return;

    const standardCost = Number(m.StandardCost) || 0;
    const holdingValue = currentStock * standardCost;

    totalDeadUnits += currentStock;
    totalHoldingValue += holdingValue;

    deadList.push({
      ItemCode: m.ItemCode,
      ItemName: m.ItemName,
      Category: m.Category || "ยา",
      CurrentStock: currentStock,
      BaseUnit: m.BaseUnit || "หน่วย",
      StandardCost: standardCost,
      HoldingValue: holdingValue,
      LastDispensDate: lastDateFormatted,
      InactiveDays: inactiveDays >= 9999 ? "ไม่มีประวัติ" : inactiveDays
    });
  });

  deadList.sort((a, b) => b.HoldingValue - a.HoldingValue);

  return {
    success: true,
    reportType: "DEAD_STOCK",
    reportTitle: `รายงานยาไม่เคลื่อนไหว / Dead Stock (ไม่มีการเบิกจ่าย ≥ ${inactiveDaysThreshold} วัน)`,
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: deadList.length,
      totalDeadUnits,
      totalHoldingValue,
      thresholdDays: inactiveDaysThreshold
    },
    data: deadList
  };
}

// 5. Adjustment Audit Report
function generateD1AdjustmentReport(txList, payload = {}) {
  const startDate = parseFlexibleDate(payload.startDate);
  if (startDate) startDate.setHours(0, 0, 0, 0);
  const endDate = parseFlexibleDate(payload.endDate);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const itemCodeFilter = String(payload.itemCode || "").trim().toUpperCase();

  let netQty = 0;
  let totalVal = 0;

  const adjList = txList.filter(t => {
    const act = String(t.ActionType || "").toLowerCase();
    if (!act.includes("adjust")) return false;

    if (startDate || endDate) {
      const tDate = parseFlexibleDate(t.Timestamp);
      if (tDate) {
        if (startDate && tDate < startDate) return false;
        if (endDate && tDate > endDate) return false;
      }
    }

    if (itemCodeFilter && String(t.ItemCode).toUpperCase() !== itemCodeFilter) return false;

    const qty = Number(t.QtyChange) || 0;
    const val = Number(t.TotalPrice) || 0;
    netQty += qty;
    totalVal += val;

    return true;
  });

  return {
    success: true,
    reportType: "ADJUSTMENT",
    reportTitle: "รายงานการปรับแก้สต๊อกฉุกเฉิน (Inventory Adjustment Audit Report)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: adjList.length,
      netQtyAdjusted: netQty,
      totalAdjustedValue: totalVal
    },
    data: adjList
  };
}

// 6. Top Dispensed Report
function generateD1TopDispensedReport(masterList, txList, payload = {}) {
  const startDate = parseFlexibleDate(payload.startDate);
  if (startDate) startDate.setHours(0, 0, 0, 0);
  const endDate = parseFlexibleDate(payload.endDate);
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const masterMap = {};
  masterList.forEach(m => {
    masterMap[String(m.ItemCode).trim().toUpperCase()] = m;
  });

  const dispMap = {};
  let grandTotalQty = 0;
  let grandTotalRevenue = 0;

  txList.forEach(t => {
    if (!String(t.ActionType).includes("Outbound")) return;

    if (startDate || endDate) {
      const tDate = parseFlexibleDate(t.Timestamp);
      if (tDate) {
        if (startDate && tDate < startDate) return false;
        if (endDate && tDate > endDate) return false;
      }
    }

    const code = String(t.ItemCode).trim().toUpperCase();
    const qty = Math.abs(Number(t.QtyChange) || 0);
    const unitPrice = Number(t.SellingPrice) || 0;
    const totalPrice = Number(t.TotalPrice) || (qty * unitPrice);

    grandTotalQty += qty;
    grandTotalRevenue += totalPrice;

    if (!dispMap[code]) {
      dispMap[code] = {
        ItemCode: t.ItemCode,
        ItemName: t.ItemName,
        TotalDispensedQty: 0,
        TotalDispensedValue: 0,
        SellingPrice: unitPrice
      };
    }

    dispMap[code].TotalDispensedQty += qty;
    dispMap[code].TotalDispensedValue += totalPrice;
  });

  let rankedList = Object.values(dispMap).map(item => {
    const m = masterMap[String(item.ItemCode).trim().toUpperCase()] || {};
    item.BaseUnit = m.BaseUnit || "หน่วย";
    item.Category = m.Category || "ยา";
    item.PercentageOfTotal = grandTotalRevenue > 0 
      ? Number(((item.TotalDispensedValue / grandTotalRevenue) * 100).toFixed(2)) 
      : 0;
    return item;
  });

  rankedList.sort((a, b) => b.TotalDispensedQty - a.TotalDispensedQty);

  const limit = Number(payload.limit) || 0;
  if (limit > 0) {
    rankedList = rankedList.slice(0, limit);
  }

  rankedList.forEach((item, index) => {
    item.Rank = index + 1;
  });

  return {
    success: true,
    reportType: "TOP_DISPENSED",
    reportTitle: "รายงานสรุปการใช้ยาสูงสุด (Top Dispensed / ABC Analysis)",
    generatedAt: formatDateTime(new Date(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rankedList.length,
      grandTotalUnits: grandTotalQty,
      grandTotalRevenue: grandTotalRevenue
    },
    data: rankedList
  };
}

// Helpers
function parseFlexibleDate(dateVal) {
  if (!dateVal) return null;
  if (dateVal instanceof Date) {
    if (isNaN(dateVal.getTime())) return null;
    let y = dateVal.getFullYear();
    if (y > 2400) {
      dateVal = new Date(dateVal.getTime());
      dateVal.setFullYear(y - 543);
    }
    return dateVal;
  }

  let str = String(dateVal).trim().split(" ")[0].split("T")[0];
  if (!str || str === "-") return null;

  if (str.includes("-") || str.includes("/")) {
    const parts = str.split(/[-/]/);
    if (parts.length === 3) {
      let p0 = parseInt(parts[0], 10);
      let p1 = parseInt(parts[1], 10);
      let p2 = parseInt(parts[2], 10);

      if (p0 > 1000) {
        if (p0 > 2400) p0 -= 543;
        return new Date(p0, p1 - 1, p2);
      }
      if (p2 > 1000) {
        if (p2 > 2400) p2 -= 543;
        return new Date(p2, p1 - 1, p0);
      }
    }
  }

  const parsed = new Date(dateVal);
  return isNaN(parsed.getTime()) ? null : parsed;
}

function formatThaiDateFull(d) {
  if (!d || !(d instanceof Date) || isNaN(d.getTime())) return "";
  const THAI_FULL_MONTHS = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const day = d.getDate();
  const month = THAI_FULL_MONTHS[d.getMonth()];
  let year = d.getFullYear();
  if (year < 2400) year += 543;
  return day + " " + month + " " + year;
}

function formatDateTime(d, pattern = "yyyy-MM-dd") {
  if (!d) return "";
  const dateObj = d instanceof Date ? d : parseFlexibleDate(d) || new Date(d);
  if (isNaN(dateObj.getTime())) return String(d);
  const yyyy = dateObj.getFullYear();
  const MM = String(dateObj.getMonth() + 1).padStart(2, "0");
  const dd = String(dateObj.getDate()).padStart(2, "0");
  const HH = String(dateObj.getHours()).padStart(2, "0");
  const mm = String(dateObj.getMinutes()).padStart(2, "0");
  const ss = String(dateObj.getSeconds()).padStart(2, "0");

  if (pattern === "yyyy-MM-dd") return `${yyyy}-${MM}-${dd}`;
  if (pattern === "yyyy-MM") return `${yyyy}-${MM}`;
  if (pattern === "yyyy/MM/dd") return `${yyyy}/${MM}/${dd}`;
  if (pattern === "d/M/yyyy") return `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${yyyy}`;
  if (pattern === "yyyy-MM-dd HH:mm:ss") return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  return `${yyyy}-${MM}-${dd}`;
}

function isDateWithinRange(dateVal, startD, endD) {
  if (!startD && !endD) return true;
  if (!dateVal) return false;
  const d = parseFlexibleDate(dateVal);
  if (!d) return false;
  if (startD && d < startD) return false;
  if (endD && d > endD) return false;
  return true;
}


// ==============================================================================
// REAL-TIME LOW STOCK ALERT VIA LINE (MESSAGING API, MULTICAST, NOTIFY & WEBHOOK)
// ==============================================================================
async function sendLowStockLineAlert(env = {}, warning = {}, db = null) {
  const result = { messagingApi: false, notify: false, webhook: false, recipientsCount: 0 };
  try {
    if (!warning || !warning.is_low) return result;

    const token = (env && (env.LINE_CHANNEL_ACCESS_TOKEN || env.LINE_ACCESS_TOKEN)) || 
                  (typeof LINE_CONFIG !== "undefined" ? LINE_CONFIG.ACCESS_TOKEN : "");
    const webhookUrl = env && (env.LINE_WEBHOOK_URL || env.LINE_NOTIFY_WEBHOOK);
    const notifyToken = env && (env.LINE_NOTIFY_TOKEN || env.LINE_NOTIFY_ACCESS_TOKEN);

    const nowStr = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
    const textMessage = 
`⚠️ แจ้งเตือนสต็อกยาต่ำกว่าเกณฑ์!
🏥 ศูนย์การแพทย์รามาธิบดีศรีอยุธยา
-------------------------------
💊 รายการ: ${warning.item_name}
🆔 รหัสยา: ${warning.item_code}
📦 คงเหลือ: ${warning.current_qty} หน่วย
🎯 เกณฑ์ขั้นต่ำ (Min): ${warning.min_qty} หน่วย
📉 ขาดสต็อก: ${warning.shortage} หน่วย
⏰ เวลา: ${nowStr}
-------------------------------
⚡ โปรดพิจารณาจัดทำใบสั่งซื้อ (Smart PR)`;

    // 1. External Webhook (if URL configured)
    if (webhookUrl) {
      try {
        const wRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "LOW_STOCK_ALERT",
            timestamp: new Date().toISOString(),
            data: warning,
            message: textMessage
          })
        });
        result.webhook = wRes.ok;
      } catch (wErr) {
        console.warn("Error sending alert to LINE Webhook URL:", wErr);
      }
    }

    // 2. LINE Notify API (if token configured)
    if (notifyToken) {
      try {
        const formBody = new URLSearchParams();
        formBody.append("message", "\n" + textMessage);
        const nRes = await fetch("https://notify-api.line.me/api/notify", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${notifyToken}`,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: formBody.toString()
        });
        result.notify = nRes.ok;
      } catch (nErr) {
        console.warn("LINE Notify error:", nErr);
      }
    }

    // 3. LINE Official Account Messaging API (Push / Multicast / Broadcast)
    if (token) {
      const flexMessage = {
        type: "flex",
        altText: `⚠️ แจ้งเตือนสต็อกยาต่ำกว่าเกณฑ์: ${warning.item_name}`,
        contents: {
          type: "bubble",
          size: "mega",
          header: {
            type: "box",
            layout: "vertical",
            backgroundColor: "#DC2626",
            paddingAll: "lg",
            contents: [
              {
                type: "text",
                text: "⚠️ แจ้งเตือนสต็อกยาต่ำกว่าเกณฑ์",
                weight: "bold",
                color: "#FFFFFF",
                size: "md"
              },
              {
                type: "text",
                text: "ศูนย์การแพทย์รามาธิบดีศรีอยุธยา",
                color: "#FEE2E2",
                size: "xs",
                margin: "xs"
              }
            ]
          },
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "text",
                text: warning.item_name,
                weight: "bold",
                size: "lg",
                wrap: true,
                color: "#111827"
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "รหัสยา", size: "sm", color: "#6B7280", flex: 2 },
                  { type: "text", text: warning.item_code, size: "sm", color: "#374151", weight: "bold", flex: 3 }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "คงเหลือปัจจุบัน", size: "sm", color: "#6B7280", flex: 2 },
                  { type: "text", text: `${warning.current_qty} หน่วย`, size: "md", color: "#DC2626", weight: "bold", flex: 3 }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "เกณฑ์ขั้นต่ำ (Min)", size: "sm", color: "#6B7280", flex: 2 },
                  { type: "text", text: `${warning.min_qty} หน่วย`, size: "sm", color: "#374151", weight: "bold", flex: 3 }
                ]
              },
              {
                type: "box",
                layout: "baseline",
                contents: [
                  { type: "text", text: "ขาดสต็อกอีก", size: "sm", color: "#6B7280", flex: 2 },
                  { type: "text", text: `${warning.shortage} หน่วย`, size: "sm", color: "#EA580C", weight: "bold", flex: 3 }
                ]
              },
              {
                type: "separator",
                margin: "md"
              },
              {
                type: "text",
                text: `⏰ ตัดจ่ายเมื่อ: ${nowStr}`,
                size: "xxs",
                color: "#9CA3AF"
              }
            ]
          }
        }
      };

      // Query active staff LINE User IDs from D1 database
      let userIds = [];
      if (db) {
        try {
          const userRows = await db.prepare(
            "SELECT DISTINCT line_user_id FROM users WHERE line_user_id IS NOT NULL AND TRIM(line_user_id) != '' AND status = 'Active'"
          ).all();
          userIds = (userRows.results || []).map(u => String(u.line_user_id).trim()).filter(Boolean);
        } catch (uErr) {
          console.warn("Could not query line_user_id from users table:", uErr);
        }
      }

      // Add default admin if defined and not already in list
      if (typeof LINE_CONFIG !== "undefined" && LINE_CONFIG.ADMIN_USER_ID) {
        if (!userIds.includes(LINE_CONFIG.ADMIN_USER_ID)) {
          userIds.push(LINE_CONFIG.ADMIN_USER_ID);
        }
      }

      result.recipientsCount = userIds.length;

      let lineEndpoint = "";
      let bodyPayload = {};

      if (userIds.length === 1) {
        // Single user push
        lineEndpoint = "https://api.line.me/v2/bot/message/push";
        bodyPayload = { to: userIds[0], messages: [flexMessage] };
      } else if (userIds.length > 1) {
        // Multicast to all registered staff (up to 500)
        lineEndpoint = "https://api.line.me/v2/bot/message/multicast";
        bodyPayload = { to: userIds.slice(0, 500), messages: [flexMessage] };
      } else {
        // Broadcast if no user IDs bound yet
        lineEndpoint = "https://api.line.me/v2/bot/message/broadcast";
        bodyPayload = { messages: [flexMessage] };
      }

      let lRes = await fetch(lineEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bodyPayload)
      });

      if (!lRes.ok) {
        // Fallback to text message if flex fails
        let fallbackPayload = {};
        if (userIds.length === 1) {
          fallbackPayload = { to: userIds[0], messages: [{ type: "text", text: textMessage }] };
        } else if (userIds.length > 1) {
          fallbackPayload = { to: userIds.slice(0, 500), messages: [{ type: "text", text: textMessage }] };
        } else {
          fallbackPayload = { messages: [{ type: "text", text: textMessage }] };
        }

        lRes = await fetch(lineEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify(fallbackPayload)
        });
      }

      result.messagingApi = lRes.ok;
    }
  } catch (err) {
    console.error("sendLowStockLineAlert error:", err);
  }
  return result;
}

// ==============================================================================
// LINE OFFICIAL ACCOUNT (LINE OA) INTEGRATION - 100% D1 POWERED
// ==============================================================================

const LINE_CONFIG = {
  ACCESS_TOKEN: 'iJ0UeypYIWXGQcUPvKjmvOjubqhdTJuiV5SyBR1V4R9wk6Ew2aYWvQmR1+SJrjWEHieORK6vKsiPjZrsGfCYKaCuamgRZirYgoZa1fTsUfM/w61xaNj1IARvwWgoXjvAzasuBotkz9mJ4EEsCWqsSgdB04t89/1O/w1cDnyilFU=',
  ADMIN_USER_ID: 'U08f0b47d541c2e5a73a59d22dadd4d34',
  DEFAULT_LOGO_URL: 'https://lh3.googleusercontent.com/d/1wHSSUymB-0hRVZqqrKG35yWz8gDPFSOR',
  DEFAULT_VACCINE_IMG: 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&w=600&q=80',
  DEFAULT_MEDICINE_IMG: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
};

async function handleLineWebhookD1(db, requestBody) {
  try {
    if (!requestBody || !requestBody.events || !Array.isArray(requestBody.events) || requestBody.events.length === 0) {
      return new Response(JSON.stringify({ status: "ok" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    const event = requestBody.events[0];
    if (!event || event.type !== "message" || event.message.type !== "text") {
      return new Response(JSON.stringify({ status: "ignored" }), {
        status: 200,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
      });
    }

    const lineUserId = event.source ? event.source.userId : null;
    const rawMessage = String(event.message.text || "").trim();
    const userMessage = rawMessage.toLowerCase();
    const replyToken = event.replyToken;

    if (!lineUserId) {
      return new Response(JSON.stringify({ status: "ignored" }), { status: 200, headers: CORS_HEADERS });
    }

    // --------------------------------------------------------------------------
    // A. 1-TIME ACCOUNT BINDING / REGISTRATION HANDLER
    // Pattern: ลงทะเบียน username password OR ผูกบัญชี username password OR register username password
    // --------------------------------------------------------------------------
    const regMatch = rawMessage.match(/^(?:ลงทะเบียน|ผูกบัญชี|register|login)\s+([^\s]+)\s+([^\s]+)$/i);
    if (regMatch) {
      const inputUser = regMatch[1];
      const inputPass = regMatch[2];
      const hashed = await hashSHA256(inputPass);

      const targetUser = await db.prepare(
        "SELECT username, role, full_name, position, status FROM users WHERE LOWER(username) = LOWER(?) AND password_hash = ?"
      ).bind(inputUser, hashed).first();

      if (!targetUser) {
        await sendLineTextMessageD1(replyToken, "❌ เข้าสู่ระบบไม่สำเร็จ!\n\nชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้งครับ\n\n(รูปแบบที่ถูกต้อง: ลงทะเบียน [username] [password])");
        return new Response(JSON.stringify({ status: "auth_failed" }), { status: 200, headers: CORS_HEADERS });
      }

      if (targetUser.status !== "Active") {
        await sendLineTextMessageD1(replyToken, `⛔ ไม่สามารถลงทะเบียนได้!\n\nบัญชีผู้ใช้ (${targetUser.username}) มีสถานะถูกระงับสิทธิ์ (${targetUser.status})\nกรุณาติดต่อผู้ดูแลระบบหรือหัวหน้าฝ่ายเภสัชกรรมครับ`);
        return new Response(JSON.stringify({ status: "user_inactive" }), { status: 200, headers: CORS_HEADERS });
      }

      // Check if this LINE ID is already bound to another user
      await db.prepare("UPDATE users SET line_user_id = NULL WHERE line_user_id = ?").bind(lineUserId).run();

      // Bind line_user_id to target user
      await db.prepare("UPDATE users SET line_user_id = ? WHERE LOWER(username) = LOWER(?)").bind(lineUserId, inputUser).run();

      await sendLineTextMessageD1(replyToken, `✅ ยืนยันตัวตนและผูกบัญชีสำเร็จ!\n\n👤 ผู้ใช้งาน: ${targetUser.full_name}\n🏥 ตำแหน่ง: ${targetUser.position || targetUser.role}\n🛡️ ระดับสิทธิ์: ${targetUser.role}\n\nระบบปลดล็อกการเข้าถึงข้อมูลคลังยาเรียบร้อยแล้วครับ 🎉\n\n💡 คำสั่งแนะนำ:\n• พิมพ์ 'stock' หรือ 'ทั้งหมด' เพื่อดูสินค้าทั้งหมด\n• พิมพ์ 'ยา' เพื่อดูเฉพาะยา\n• พิมพ์ 'วัคซีน' เพื่อดูเฉพาะวัคซีน\n• พิมพ์ 'ใกล้หมดอายุ' เพื่อดูสินค้าใกล้หมดอายุ\n• พิมพ์ชื่อยา, รหัสสินค้า, หรือเลข Lot เพื่อค้นหา\n• พิมพ์ 'ข้อมูลผู้ใช้' เพื่อดูสถานะของคุณ`);
      return new Response(JSON.stringify({ status: "registered_success" }), { status: 200, headers: CORS_HEADERS });
    }

    // --------------------------------------------------------------------------
    // B. AUTHENTICATION & WHITELIST CHECK
    // --------------------------------------------------------------------------
    const authUser = await db.prepare(
      "SELECT username, role, full_name, position, status FROM users WHERE line_user_id = ?"
    ).bind(lineUserId).first();

    // --------------------------------------------------------------------------
    // C. UNLINK / LOGOUT COMMAND
    // --------------------------------------------------------------------------
    const isUnlinkCmd = ["ยกเลิกการผูก", "ยกเลิกผูกบัญชี", "unlink", "logout"].includes(userMessage);
    if (isUnlinkCmd) {
      if (authUser) {
        await db.prepare("UPDATE users SET line_user_id = NULL WHERE line_user_id = ?").bind(lineUserId).run();
        await sendLineTextMessageD1(replyToken, "🔓 ยกเลิกการผูกบัญชี LINE กับระบบคลังยาเรียบร้อยแล้วครับ\n(หากต้องการเริ่มใช้งานใหม่ ให้พิมพ์: ลงทะเบียน [username] [password])");
      } else {
        await sendLineTextMessageD1(replyToken, "บัญชี LINE ของท่านยังไม่ได้ผูกกับระบบคลังยาครับ");
      }
      return new Response(JSON.stringify({ status: "unlinked" }), { status: 200, headers: CORS_HEADERS });
    }

    // --------------------------------------------------------------------------
    // D. PROFILE / WHOAMI COMMAND
    // --------------------------------------------------------------------------
    const isProfileCmd = ["ข้อมูลผู้ใช้", "โปรไฟล์", "profile", "whoami"].includes(userMessage);
    if (isProfileCmd) {
      if (authUser && authUser.status === "Active") {
        await sendLineTextMessageD1(replyToken, `👤 ข้อมูลผู้ใช้งานที่ผูกกับ LINE:\n\n• ชื่อ-นามสกุล: ${authUser.full_name}\n• ชื่อผู้ใช้: ${authUser.username}\n• ตำแหน่ง: ${authUser.position || authUser.role}\n• ระดับสิทธิ์: ${authUser.role}\n• สถานะการใช้งาน: ปกติ (Active)\n\n(หากต้องการยกเลิกการผูก พิมพ์: ยกเลิกการผูก)`);
        return new Response(JSON.stringify({ status: "profile_shown" }), { status: 200, headers: CORS_HEADERS });
      }
    }

    // --------------------------------------------------------------------------
    // E. SECURITY GATE: IF NOT BOUND OR INACTIVE, BLOCK IMMEDIATELY!
    // --------------------------------------------------------------------------
    if (!authUser) {
      await sendLineTextMessageD1(replyToken, "🔒 ระบบคลังยา ศูนย์การแพทย์รามาธิบดีศรีอยุธยา\n\nขออภัยครับ ระบบจำกัดสิทธิ์การใช้งานเฉพาะเจ้าหน้าที่คลังยา, เภสัชกร, และผู้จัดการที่ได้รับอนุญาตเท่านั้น\n\nกรุณายืนยันตัวตนเพื่อเริ่มใช้งานโดยพิมพ์:\n👉 ลงทะเบียน [ชื่อผู้ใช้] [รหัสผ่าน]\n\nตัวอย่าง:\nลงทะเบียน admin admin123\n\n(หากยังไม่มีบัญชีผู้ใช้ กรุณาติดต่อผู้ดูแลระบบคลังยา)");
      return new Response(JSON.stringify({ status: "auth_required" }), { status: 200, headers: CORS_HEADERS });
    }

    if (authUser.status !== "Active") {
      await sendLineTextMessageD1(replyToken, `⛔ บัญชีของท่าน (${authUser.full_name}) ถูกระงับสิทธิ์การใช้งาน หรือพ้นสภาพการปฏิบัติงาน (${authUser.status})\n\nระบบไม่สามารถให้เข้าถึงข้อมูลคลังยาได้ กรุณาติดต่อหัวหน้าฝ่ายเภสัชกรรมครับ`);
      return new Response(JSON.stringify({ status: "user_blocked" }), { status: 200, headers: CORS_HEADERS });
    }

    // --------------------------------------------------------------------------
    // F. AUTHORIZED USER: QUERY D1 & PROCESS INVENTORY REQUEST
    // --------------------------------------------------------------------------
    const [mRes, lRes] = await Promise.all([
      db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
      db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all()
    ]);
    const masterList = (mRes.results || []).map(formatMasterRow);
    const lotList = (lRes.results || []).map(formatLotRow);

    const lotMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    lotList.forEach(lot => {
      const code = String(lot.ItemCode || "").trim().toUpperCase();
      if (!code) return;
      if (!lotMap[code]) lotMap[code] = [];

      const expDate = parseFlexibleDate(lot.ExpiryDate);
      let daysRemaining = 9999;
      let isExpiring6M = false;
      let isExpiring1Y = false;
      let isExpired = false;

      if (expDate) {
        daysRemaining = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) isExpired = true;
        else if (daysRemaining <= 180) isExpiring6M = true;
        else if (daysRemaining <= 365) isExpiring1Y = true;
      }

      lotMap[code].push({
        lot: lot.LotNumber || "-",
        expDate: lot.ExpiryDate || "-",
        qty: Number(lot.Qty) || 0,
        remainingDays: daysRemaining < 9999 ? daysRemaining : "-",
        isExpiring6M,
        isExpiring1Y,
        isExpired
      });
    });

    const combinedInventory = masterList.map(m => {
      const code = String(m.ItemCode || "").trim().toUpperCase();
      const isVaccine = (m.Category || "").includes("วัคซีน") || (m.Category || "").toUpperCase().includes("VACCINE");
      const category = isVaccine ? "VACCINE" : "MEDICINE";
      const activeLots = lotMap[code] || [];
      const totalQty = activeLots.reduce((sum, l) => sum + l.qty, 0);
      const minLevel = Number(m.Min) || 0;

      let status = "OK";
      if (totalQty === 0) status = "OUT";
      else if (minLevel > 0 && totalQty <= minLevel) status = "LOW";

      const firstLot = activeLots[0] || null;
      const isExpiring6M = activeLots.some(l => l.isExpiring6M);
      const isExpiring1Y = activeLots.some(l => l.isExpiring1Y);
      const isExpired = activeLots.some(l => l.isExpired);

      let defaultImg = isVaccine ? LINE_CONFIG.DEFAULT_VACCINE_IMG : LINE_CONFIG.DEFAULT_MEDICINE_IMG;
      let imgUrl = (m.ImageLink && m.ImageLink.startsWith("http")) ? m.ImageLink : defaultImg;

      return {
        category,
        itemCode: m.ItemCode || "",
        itemNameTH: m.ItemName || "",
        itemNameEN: m.GenericName || "",
        unit: m.BaseUnit || (isVaccine ? "Dose" : "หน่วย"),
        remaining: totalQty,
        min: minLevel,
        status,
        lot: firstLot ? firstLot.lot : "-",
        expDate: firstLot ? firstLot.expDate : "-",
        lots: activeLots.map(l => l.lot),
        expDates: activeLots.map(l => l.expDate),
        lotDetails: activeLots,
        isExpiring6M,
        isExpiring1Y,
        isExpired,
        isExpiring: isExpiring6M || isExpiring1Y,
        imageUrl: imgUrl
      };
    });

    // Match user intent
    const isAllCommand = ["stock", "สต็อก", "ทั้งหมด", "สินค้าทั้งหมด", "all"].includes(userMessage);
    const isVacCommand = ["วัคซีน", "vaccine", "vaccines", "วัคซีนทั้งหมด"].includes(userMessage);
    const isMedCommand = ["ยา", "medicine", "medicines", "ยาทั้งหมด"].includes(userMessage);
    const isOkCommand = ["ok", "สต็อกปกติ", "ปกติ", "stock ok"].includes(userMessage);
    const isLowCommand = ["low", "ใกล้หมด", "ของใกล้หมด", "สต็อกใกล้หมด", "stock low"].includes(userMessage);
    const isOutCommand = ["out", "ของหมด", "หมด", "สต็อกหมด", "stock out"].includes(userMessage);
    const isExpCommand = ["ใกล้หมดอายุ", "หมดอายุ", "exp", "expiring", "สินค้าใกล้หมดอายุ", "ยาใกล้หมดอายุ", "วัคซีนใกล้หมดอายุ"].includes(userMessage);

    let stockReport = [];
    for (let i = 0; i < combinedInventory.length; i++) {
      const item = combinedInventory[i];
      let isMatch = false;

      if (isAllCommand) {
        isMatch = true;
      } else if (isVacCommand) {
        if (item.category === "VACCINE") isMatch = true;
      } else if (isMedCommand) {
        if (item.category === "MEDICINE") isMatch = true;
      } else if (isOkCommand) {
        if (item.status === "OK") isMatch = true;
      } else if (isLowCommand) {
        if (item.status === "LOW") isMatch = true;
      } else if (isOutCommand) {
        if (item.status === "OUT" || item.remaining <= 0) isMatch = true;
      } else if (isExpCommand) {
        let isExpVac = (item.category === "VACCINE") && (item.isExpiring6M || item.isExpired || (item.lotDetails && item.lotDetails.some(l => l.isExpiring6M || l.isExpired)));
        let isExpMed = (item.category === "MEDICINE") && (item.isExpiring1Y || item.isExpired || (item.lotDetails && item.lotDetails.some(l => l.isExpiring1Y || l.isExpired)));
        if (userMessage === "วัคซีนใกล้หมดอายุ") {
          if (isExpVac) isMatch = true;
        } else if (userMessage === "ยาใกล้หมดอายุ") {
          if (isExpMed) isMatch = true;
        } else {
          if (isExpVac || isExpMed || item.isExpiring || item.isExpired) isMatch = true;
        }
      } else {
        let nameThStr = (item.itemNameTH || "").toLowerCase();
        let nameEnStr = (item.itemNameEN || "").toLowerCase();
        let codeStr = (item.itemCode || "").toLowerCase();
        let lotStr = (item.lot || "").toLowerCase();
        let allLotsStr = (item.lots || []).join(" ").toLowerCase();
        let fullSearchText = `${nameThStr} ${nameEnStr} ${codeStr} ${lotStr} ${allLotsStr}`;

        if (fullSearchText.includes(userMessage) || 
            nameThStr.includes(userMessage) || 
            nameEnStr.includes(userMessage) || 
            codeStr.includes(userMessage) ||
            lotStr.includes(userMessage) ||
            allLotsStr.includes(userMessage)) {
          isMatch = true;
        }
      }

      if (isMatch) stockReport.push(item);
    }

    if (stockReport.length > 0) {
      const totalCount = stockReport.length;
      let displayedItems = stockReport;
      let hasMoreCard = false;

      if (totalCount > 10) {
        displayedItems = stockReport.slice(0, 9);
        hasMoreCard = true;
      }

      let categoryHint = isMedCommand ? "MEDICINE" : (isVacCommand ? "VACCINE" : "");
      await sendLineFlexMessageD1(replyToken, displayedItems, totalCount, categoryHint, hasMoreCard);
    } else {
      await sendLineTextMessageD1(replyToken, "🔍 ไม่พบข้อมูลยาหรือวัคซีนที่ตรงกับคำค้นหาของคุณครับ\n\n💡 คำสั่งแนะนำ:\n• พิมพ์ 'stock' หรือ 'ทั้งหมด' เพื่อดูสินค้าทั้งหมด\n• พิมพ์ 'วัคซีน' เพื่อดูเฉพาะวัคซีน\n• พิมพ์ 'ยา' เพื่อดูเฉพาะยา\n• พิมพ์ 'ok' เพื่อดูสต็อกปกติ\n• พิมพ์ 'low' เพื่อดูสต็อกใกล้หมด\n• พิมพ์ 'out' เพื่อดูของหมด\n• พิมพ์ 'ใกล้หมดอายุ' เพื่อดูสินค้าใกล้หมดอายุ\n• พิมพ์ชื่อยา, รหัสสินค้า, หรือเลข Lot เพื่อค้นหา");
    }

    return new Response(JSON.stringify({ status: "success" }), {
      status: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in handleLineWebhookD1:", error);
    return new Response(JSON.stringify({ status: "error", message: error.toString() }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" }
    });
  }
}

async function sendLineFlexMessageD1(replyToken, stockData, totalCount = 0, categoryHint = "", hasMoreCard = false) {
  const flexContents = stockData.map(item => {
    let statusColor = "#10B981";
    if (item.status === "LOW") statusColor = "#F59E0B";
    else if (item.status === "OUT") statusColor = "#EF4444";

    let isExp = (item.category === "VACCINE") ? item.isExpiring6M : item.isExpiring1Y;
    let expWarningText = item.isExpired ? " ⛔ (หมดอายุแล้ว)" : (isExp ? " ⚠️ (ใกล้หมดอายุ)" : "");
    let expColor = (isExp || item.isExpired) ? "#DC2626" : "#111827";

    let defaultImg = (item.category === "MEDICINE") ? LINE_CONFIG.DEFAULT_MEDICINE_IMG : LINE_CONFIG.DEFAULT_VACCINE_IMG;
    let imgUrl = item.imageUrl || defaultImg;

    let catBadgeText = (item.category === "MEDICINE") ? "💊 ยา (MEDICINE)" : "💉 วัคซีน (VACCINE)";
    let catBadgeColor = (item.category === "MEDICINE") ? "#2563EB" : "#059669";
    let unitText = item.unit || ((item.category === "MEDICINE") ? "หน่วยนับ" : "Dose");

    let lotBoxContents = [
      { "type": "text", "text": "🏷️ Lot: " + (item.lot || "-"), "size": "xs", "color": "#6B7280", "weight": "regular", "wrap": true },
      { "type": "text", "text": "📅 Exp: " + (item.expDate || "-") + expWarningText, "size": "xs", "color": expColor, "weight": "bold", "wrap": true, "margin": "xs" }
    ];

    if (item.lotDetails && item.lotDetails[0]) {
      let rDays = item.lotDetails[0].remainingDays;
      let rDaysText = (typeof rDays === 'number' && !isNaN(rDays) && rDays < 9999) ? `${rDays} วัน` : (rDays || "-");
      lotBoxContents.push({
        "type": "text", 
        "text": `⏳ เหลืออีก: ${rDaysText}`, 
        "size": "xs", 
        "color": (isExp || item.isExpired) ? "#DC2626" : "#4B5563", 
        "weight": "bold", 
        "wrap": true, 
        "margin": "xs"
      });
    }

    return {
      "type": "bubble",
      "size": "mega",
      "hero": { 
        "type": "image", 
        "url": imgUrl, 
        "size": "full", 
        "aspectRatio": "20:13", 
        "aspectMode": "cover" 
      },
      "body": {
        "type": "box", "layout": "vertical", "paddingAll": "16px",
        "contents": [
          {
            "type": "box", "layout": "baseline", "margin": "none",
            "contents": [
              { "type": "text", "text": catBadgeText, "size": "xxs", "color": catBadgeColor, "weight": "bold" }
            ]
          },
          { "type": "text", "text": item.itemNameTH || "-", "weight": "bold", "size": "lg", "wrap": true, "color": "#064E3B", "margin": "xs" },
          { "type": "text", "text": `${item.itemNameEN || "-"} ${item.itemCode ? `(${item.itemCode})` : ""}`, "weight": "regular", "size": "xs", "color": "#6B7280", "wrap": true, "margin": "xs" },
          {
            "type": "box", "layout": "vertical", "margin": "md", "paddingAll": "10px", "backgroundColor": (isExp || item.isExpired) ? "#FEF2F2" : "#F3F4F6", "cornerRadius": "8px",
            "contents": lotBoxContents
          },
          { "type": "box", "layout": "baseline", "margin": "md", "contents": [ { "type": "text", "text": `📦 คงเหลือรวม: ${item.remaining} ${unitText}`, "size": "md", "color": "#111827", "weight": "bold", "wrap": true } ] },
          { "type": "box", "layout": "baseline", "margin": "xs", "contents": [ { "type": "text", "text": `🏷️ สต็อกขั้นต่ำ (Min): ${item.min} ${unitText}`, "size": "xs", "color": "#6B7280", "wrap": true } ] },
          { 
            "type": "box", "layout": "vertical", "margin": "md", "backgroundColor": item.status === "LOW" ? "#FFFBEB" : (item.status === "OUT" ? "#FEF2F2" : "#ECFDF5"), "paddingAll": "6px", "cornerRadius": "6px", "alignItems": "center",
            "contents": [
              { "type": "text", "text": "สถานะสต็อก: " + item.status, "size": "xs", "weight": "bold", "color": statusColor }
            ]
          }
        ]
      }
    };
  });

  if (hasMoreCard) {
    let dashboardUrl = "https://inventory-pharmacy-ramathibodi.puk5741.workers.dev/dashboard";
    if (categoryHint === "MEDICINE") dashboardUrl += "?tab=medicine";
    else if (categoryHint === "VACCINE") dashboardUrl += "?tab=vaccine";

    const remainingCount = totalCount - stockData.length;
    const catLabel = categoryHint === "MEDICINE" ? "ยา" : (categoryHint === "VACCINE" ? "วัคซีน" : "สินค้า");

    flexContents.push({
      "type": "bubble",
      "size": "mega",
      "header": {
        "type": "box",
        "layout": "vertical",
        "backgroundColor": "#007A78",
        "paddingAll": "18px",
        "contents": [
          { "type": "text", "text": "📊 สรุปผลการค้นหา", "color": "#FFFFFF", "size": "xs", "weight": "bold" },
          { "type": "text", "text": `พบทั้งหมด ${totalCount} รายการ`, "color": "#FFFFFF", "size": "xl", "weight": "bold", "margin": "xs" },
          { "type": "text", "text": `(แสดงในแชท 9 รายการแรก)`, "color": "#E6F4F3", "size": "xs", "margin": "xs" }
        ]
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "18px",
        "contents": [
          {
            "type": "text",
            "text": `📦 ยังมีอีก ${remainingCount} รายการในระบบ`,
            "weight": "bold",
            "size": "md",
            "color": "#111827",
            "wrap": true
          },
          {
            "type": "text",
            "text": `ท่านสามารถเปิดดูรายการ ${catLabel} ทั้งหมด ${totalCount} รายการ พร้อมตรวจสอบสต็อกคงเหลือ และวันหมดอายุทุกล็อต (FEFO) แบบ Real-time ผ่าน Mobile Dashboard ได้ทันที`,
            "size": "xs",
            "color": "#4B5563",
            "wrap": true,
            "margin": "md"
          },
          { "type": "separator", "margin": "lg", "color": "#E5E7EB" },
          {
            "type": "box",
            "layout": "vertical",
            "margin": "md",
            "contents": [
              { "type": "text", "text": "✨ สิ่งที่คุณดูได้ใน Dashboard:", "size": "xs", "color": "#007A78", "weight": "bold" },
              { "type": "text", "text": "• ค้นหาด้วยชื่อยา / ชื่อสามัญ / รหัสสินค้า", "size": "xxs", "color": "#6B7280", "margin": "xs" },
              { "type": "text", "text": "• ฟิลเตอร์แยก สต็อกปกติ / ต่ำกว่า Min / ใกล้หมดอายุ", "size": "xxs", "color": "#6B7280", "margin": "xs" },
              { "type": "text", "text": "• ตรวจสอบวันหมดอายุ และนับถอยหลังจำนวนวันคงเหลือ", "size": "xxs", "color": "#6B7280", "margin": "xs" }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "16px",
        "paddingTop": "0px",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "color": "#007A78",
            "height": "sm",
            "action": {
              "type": "uri",
              "label": `📱 ดูทั้งหมด ${totalCount} รายการ`,
              "uri": dashboardUrl
            }
          }
        ]
      }
    });
  }

  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST", 
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN },
    body: JSON.stringify({ 
      replyToken: replyToken, 
      messages: [ { 
        type: "flex", 
        altText: `📊 รายงานสต็อก Real-time (${stockData.length}${hasMoreCard ? ` จาก ${totalCount}` : ""} รายการ) | ศูนย์การแพทย์รามาธิบดีศรีอยุธยา`, 
        contents: { type: "carousel", contents: flexContents } 
      } ] 
    })
  });
}

async function sendLineTextMessageD1(replyToken, message) {
  await fetch("https://api.line.me/v2/bot/message/reply", {
    method: "POST", 
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN },
    body: JSON.stringify({ replyToken: replyToken, messages: [ { type: "text", text: message } ] })
  });
}


// ==============================================================================
// DASHBOARD & VACCINE MATRIX IN-MEMORY CALCULATORS
// ==============================================================================

function calculateExpiryStatus(expiryDateStr) {
  if (!expiryDateStr || expiryDateStr === "-") return { status: "Normal", daysLeft: 999 };
  const expDate = parseFlexibleDate(expiryDateStr);
  if (!expDate) return { status: "Normal", daysLeft: 999 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  let status = "Normal";

  if (diffDays <= 0) {
    status = "Expired";
  } else if (diffDays <= 90) {
    status = "ExpiringSoon";
  } else if (diffDays <= 180) {
    status = "Expiring6M";
  } else if (diffDays <= 365) {
    status = "Expiring1Y";
  }

  return { status, daysLeft: diffDays };
}

function calculateDashboardInMemory(masterList, lotList, txList) {
  const stockSummary = {};
  let totalSKU = (masterList || []).length;
  let lowStockCount = 0;
  let expiredCount = 0;
  let expiringSoon90Count = 0;
  let expiringSoon180Count = 0;
  let expiringSoon1YearCount = 0;
  let totalActiveUnits = 0;

  const movingItemMap = {};
  const outboundItemMap = {};
  let inboundMovements = 0;
  let outboundMovements = 0;

  (txList || []).forEach(t => {
    const code = String(t.ItemCode || "").trim().toUpperCase();
    if (code) {
      movingItemMap[code] = (movingItemMap[code] || 0) + 1;
    }
    const action = String(t.ActionType || "");
    if (action.includes("Inbound") || action === "LOAN_IN" || action === "RETURN_IN") inboundMovements++;
    if (action.includes("Outbound") || action.includes("Dispense") || action.includes("Package") || action === "LOAN_OUT" || action === "RETURN_OUT") {
      outboundMovements++;
      if (code) {
        outboundItemMap[code] = (outboundItemMap[code] || 0) + 1;
      }
    }
  });

  const movingSkuCount = Object.keys(movingItemMap).length;

  (masterList || []).forEach(m => {
    if (!m.ItemCode) return;
    const code = String(m.ItemCode).trim().toUpperCase();
    stockSummary[code] = {
      ItemCode: m.ItemCode,
      ItemName: m.ItemName || "N/A",
      GenericName: m.GenericName || "",
      Category: m.Category || "ยา",
      BaseUnit: m.BaseUnit || "หน่วย",
      Min: Number(m.Min) || 0,
      StandardCost: Number(m.StandardCost) || 0,
      SellingPrice: Number(m.SellingPrice) || 0,
      ImageUrl: m.ImageLink || m["ลิงค์รูปภาพ"] || "",
      TotalQty: 0,
      ActiveLots: [],
      IsLowStock: false,
      HasMovement: !!movingItemMap[code],
      MovementCount: movingItemMap[code] || 0,
      HasOutbound: !!outboundItemMap[code],
      OutboundCount: outboundItemMap[code] || 0
    };
  });

  (lotList || []).forEach(lot => {
    if (!lot.ItemCode) return;
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const expInfo = calculateExpiryStatus(lot.ExpiryDate);
      
      if (expInfo.status === "Expired" || expInfo.daysLeft <= 0) {
        expiredCount++;
      } else if (expInfo.daysLeft <= 365) {
        expiringSoon1YearCount++;
        if (expInfo.daysLeft <= 180) expiringSoon180Count++;
        if (expInfo.daysLeft <= 90) expiringSoon90Count++;
      }

      const isSample = String(lot.IsSample).toLowerCase() === "true" || lot.IsSample === true || String(lot.IsSample).toLowerCase() === "yes" || lot.IsSample === 1;
      totalActiveUnits += qty;
      const code = String(lot.ItemCode).trim().toUpperCase();

      if (!stockSummary[code]) {
        stockSummary[code] = {
          ItemCode: lot.ItemCode,
          ItemName: lot.ItemName || "N/A",
          GenericName: "",
          Category: "ยา",
          BaseUnit: "หน่วย",
          Min: 0,
          StandardCost: Number(lot.CostPrice) || 0,
          SellingPrice: Number(lot.UnitPrice) || 0,
          ImageUrl: "",
          TotalQty: 0,
          ActiveLots: [],
          IsLowStock: false,
          HasMovement: !!movingItemMap[code],
          MovementCount: movingItemMap[code] || 0,
          HasOutbound: !!outboundItemMap[code],
          OutboundCount: outboundItemMap[code] || 0
        };
      }

      stockSummary[code].TotalQty += qty;
      stockSummary[code].ActiveLots.push({
        id: lot.id,
        LotNumber: lot.LotNumber,
        ExpiryDate: lot.ExpiryDate,
        Qty: qty,
        IsSample: isSample,
        CostPrice: Number(lot.CostPrice) || 0,
        UnitPrice: Number(lot.UnitPrice) || 0,
        ExpiryStatus: expInfo.status,
        DaysLeft: expInfo.daysLeft
      });
    }
  });

  let deadStockCount = 0;
  let deadStockUnits = 0;

  const summaryArray = Object.values(stockSummary).map(item => {
    item.IsLowStock = item.TotalQty < item.Min;
    if (item.IsLowStock) lowStockCount++;

    item.IsDeadStock = (item.TotalQty > 0) && (!item.HasOutbound || item.OutboundCount === 0);
    if (item.IsDeadStock) {
      deadStockCount++;
      deadStockUnits += item.TotalQty;
    }

    item.ActiveLots.sort((a, b) => {
      const dateA = parseFlexibleDate(a.ExpiryDate);
      const dateB = parseFlexibleDate(b.ExpiryDate);
      const timeA = dateA ? dateA.getTime() : 9999999999999;
      const timeB = dateB ? dateB.getTime() : 9999999999999;
      return timeA - timeB;
    });

    return item;
  });

  return {
    kpi: {
      totalSKU,
      totalActiveUnits,
      movingSkuCount,
      deadStockCount,
      deadStockUnits,
      totalMovements: (txList || []).length,
      inboundMovements,
      outboundMovements,
      lowStockCount,
      expiredCount,
      expiringSoonCount: expiringSoon1YearCount,
      expiring90Count: expiringSoon90Count,
      expiring180Count: expiringSoon180Count,
      expiring1YearCount: expiringSoon1YearCount
    },
    items: summaryArray,
    masterList
  };
}

function calculateVaccineMatrixInMemory(masterList, lotList, patientPackages) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stockMap = {};
  (lotList || []).forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode || "").trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  const masterMap = {};
  (masterList || []).forEach(m => {
    if (m.ItemCode) {
      masterMap[String(m.ItemCode).trim().toUpperCase()] = m;
    }
  });

  const inProgressList = (patientPackages || []).filter(p => 
    String(p.Status || "").toLowerCase() !== "completed" && (Number(p.RemainingDoses) || 0) > 0
  );

  const matrixMap = {};
  let totalOutstandingPatients = inProgressList.length;
  let totalPendingDoses = 0;

  inProgressList.forEach(p => {
    const code = String(p.LinkedItemCode || "").trim().toUpperCase();
    const remaining = Number(p.RemainingDoses) || 0;
    const completed = Number(p.CompletedDoses) || 0;
    const pendingDoseNumber = completed + 1;

    totalPendingDoses += remaining;

    if (!matrixMap[code]) {
      const masterInfo = masterMap[code] || {};
      matrixMap[code] = {
        ItemCode: code || "UNKNOWN",
        ItemName: masterInfo.ItemName || p.PackageName || "วัคซีน",
        CurrentStock: stockMap[code] || 0,
        TotalOutstandingPatients: 0,
        TotalPendingDoses: 0,
        Dose2Count: 0,
        Dose3Count: 0,
        Dose4PlusCount: 0,
        Patients: []
      };
    }

    matrixMap[code].TotalOutstandingPatients += 1;
    matrixMap[code].TotalPendingDoses += remaining;

    if (pendingDoseNumber === 2) matrixMap[code].Dose2Count += 1;
    else if (pendingDoseNumber === 3) matrixMap[code].Dose3Count += 1;
    else if (pendingDoseNumber >= 4) matrixMap[code].Dose4PlusCount += 1;

    let isOverdue = false;
    let daysDiff = 0;
    if (p.NextDueDate) {
      const dueDate = parseFlexibleDate(p.NextDueDate);
      if (dueDate) {
        dueDate.setHours(0, 0, 0, 0);
        daysDiff = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff > 0) isOverdue = true;
      }
    }

    matrixMap[code].Patients.push({
      PatientPackageId: p.PatientPackageId,
      HN: p.HN,
      PatientName: p.PatientName,
      PackageCode: p.PackageCode,
      PackageName: p.PackageName,
      LinkedItemCode: code,
      TotalDoses: Number(p.TotalDoses) || 1,
      CompletedDoses: completed,
      RemainingDoses: remaining,
      PendingDoseNumber: pendingDoseNumber,
      LastDoseDate: p.LastDoseDate || "-",
      NextDueDate: p.NextDueDate || "ไม่ได้ระบุ",
      IsOverdue: isOverdue,
      OverdueDays: daysDiff > 0 ? daysDiff : 0,
      CreatedBy: p.CreatedBy
    });
  });

  const matrixList = Object.values(matrixMap);
  matrixList.sort((a, b) => b.TotalOutstandingPatients - a.TotalOutstandingPatients);

  return {
    success: true,
    summary: {
      totalOutstandingPatients,
      totalPendingDoses,
      totalVaccineTypes: matrixList.length
    },
    matrix: matrixList,
    allOutstandingPatients: inProgressList.map(p => ({
      PatientPackageId: p.PatientPackageId,
      HN: p.HN,
      PatientName: p.PatientName,
      PackageName: p.PackageName,
      LinkedItemCode: p.LinkedItemCode,
      CompletedDoses: p.CompletedDoses,
      TotalDoses: p.TotalDoses,
      RemainingDoses: p.RemainingDoses,
      PendingDoseNumber: (Number(p.CompletedDoses) || 0) + 1,
      LastDoseDate: p.LastDoseDate || "-",
      NextDueDate: p.NextDueDate || "-",
      Status: p.Status
    }))
  };
}


// ==============================================================================
// CLOUDFLARE CRON TRIGGER: DAILY LINE BROADCAST ENGINE
// ==============================================================================

async function handleScheduledDailyBroadcast(db, targetUserId = null) {
  try {
    if (!LINE_CONFIG.ACCESS_TOKEN) {
      return { success: false, message: "No LINE ACCESS_TOKEN configured" };
    }

    const [mRes, lRes] = await Promise.all([
      db.prepare("SELECT * FROM masterdata ORDER BY item_name ASC").all(),
      db.prepare("SELECT * FROM inventory_lots WHERE qty > 0 ORDER BY expiry_date ASC").all()
    ]);
    const masterList = (mRes.results || []).map(formatMasterRow);
    const lotList = (lRes.results || []).map(formatLotRow);

    const lotMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    lotList.forEach(lot => {
      const code = String(lot.ItemCode || "").trim().toUpperCase();
      if (!code) return;
      if (!lotMap[code]) lotMap[code] = [];

      const expDate = parseFlexibleDate(lot.ExpiryDate);
      let daysRemaining = 9999;
      let isExpiring6M = false;
      let isExpiring1Y = false;
      let isExpired = false;

      if (expDate) {
        daysRemaining = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 0) isExpired = true;
        else if (daysRemaining <= 180) isExpiring6M = true;
        else if (daysRemaining <= 365) isExpiring1Y = true;
      }

      lotMap[code].push({
        lot: lot.LotNumber || "-",
        expDate: lot.ExpiryDate || "-",
        qty: Number(lot.Qty) || 0,
        remainingDays: daysRemaining < 9999 ? daysRemaining : "-",
        isExpiring6M,
        isExpiring1Y,
        isExpired
      });
    });

    const expiringMeds = [];
    const expiringVacs = [];

    masterList.forEach(m => {
      const code = String(m.ItemCode || "").trim().toUpperCase();
      const isVaccine = (m.Category || "").includes("วัคซีน") || (m.Category || "").toUpperCase().includes("VACCINE");
      const activeLots = lotMap[code] || [];
      const expLots = activeLots.filter(l => l.isExpiring1Y || l.isExpiring6M || l.isExpired);

      if (expLots.length > 0) {
        expLots.sort((a, b) => {
          let da = (typeof a.remainingDays === 'number' && !isNaN(a.remainingDays)) ? a.remainingDays : 99999;
          let db = (typeof b.remainingDays === 'number' && !isNaN(b.remainingDays)) ? b.remainingDays : 99999;
          return da - db;
        });
        const totalExpQty = expLots.reduce((sum, l) => sum + l.qty, 0);
        const itemObj = {
          itemCode: m.ItemCode,
          itemNameTH: m.ItemName,
          itemNameEN: m.GenericName,
          unit: m.BaseUnit || (isVaccine ? "Dose" : "หน่วย"),
          remaining: totalExpQty,
          totalExpiringQty: totalExpQty,
          expiringLots: expLots
        };
        if (isVaccine) expiringVacs.push(itemObj);
        else expiringMeds.push(itemObj);
      }
    });

    const flexBubble = buildDailySummaryFlexBubble(expiringMeds, expiringVacs);
    const todayStr = formatThaiDateFull(today);
    const altText = `📊 สรุปรายงานประจำวันที่ ${todayStr}`;

    let lineApiUrl = "https://api.line.me/v2/bot/message/multicast";
    let payload = {
      messages: [{ type: "flex", altText, contents: flexBubble }]
    };

    if (targetUserId) {
      lineApiUrl = "https://api.line.me/v2/bot/message/push";
      payload.to = targetUserId;
    } else {
      // Whitelist query: only active registered staff with bound LINE ID!
      const userRows = await db.prepare(
        "SELECT line_user_id FROM users WHERE line_user_id IS NOT NULL AND TRIM(line_user_id) != '' AND status = 'Active'"
      ).all();
      const authorizedLineIds = (userRows.results || []).map(r => r.line_user_id).filter(Boolean);

      if (authorizedLineIds.length === 0) {
        console.log("No active authorized LINE users registered. Broadcast skipped.");
        return { success: true, message: "No active authorized LINE users registered", recipientsCount: 0 };
      }

      payload.to = authorizedLineIds;
    }

    const lineRes = await fetch(lineApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN
      },
      body: JSON.stringify(payload)
    });

    const resText = await lineRes.text();
    console.log("LINE Broadcast result (HTTP " + lineRes.status + "):", resText);
    return {
      success: lineRes.status === 200,
      status: lineRes.status,
      response: resText,
      medicinesCount: expiringMeds.length,
      vaccinesCount: expiringVacs.length
    };
  } catch (err) {
    console.error("Error in handleScheduledDailyBroadcast:", err);
    return { success: false, error: err.message };
  }
}

function buildDailySummaryFlexBubble(medicines, vaccines) {
  const todayStr = formatThaiDateFull(new Date());
  let bodyContents = [];

  // 1. หมวดยา
  bodyContents.push({
    "type": "text",
    "text": "💊 รายการยาใกล้หมดอายุภายใน 1 ปี :",
    "weight": "bold",
    "size": "md",
    "color": "#DC2626",
    "margin": "none"
  });

  if (!medicines || medicines.length === 0) {
    bodyContents.push({
      "type": "text",
      "text": "✅ ไม่มียาใกล้หมดอายุภายใน 1 ปี",
      "size": "sm",
      "color": "#059669",
      "margin": "sm"
    });
  } else {
    medicines.slice(0, 10).forEach((med, idx) => {
      let medBlock = [];
      let unitText = med.unit || "หน่วย";
      let nameText = `${idx + 1}. ${med.itemNameTH || med.itemNameEN || "-"}`;

      medBlock.push({
        "type": "text",
        "text": nameText,
        "weight": "bold",
        "size": "md",
        "color": "#111827",
        "wrap": true,
        "margin": idx === 0 ? "sm" : "md"
      });

      let totalQty = med.totalExpiringQty !== undefined ? med.totalExpiringQty : med.remaining;
      medBlock.push({
        "type": "text",
        "text": `📦 รวมคงเหลือ: ${totalQty} ${unitText}`,
        "weight": "bold",
        "size": "sm",
        "color": "#00897B",
        "margin": "xs"
      });

      if (med.expiringLots) {
        med.expiringLots.forEach(lot => {
          let rDays = lot.remainingDays;
          let rDaysText = (typeof rDays === 'number' && !isNaN(rDays)) ? `${rDays} วัน` : (rDays || "-");
          medBlock.push({
            "type": "text",
            "text": `▪ Lot: ${lot.lot || "-"} | Exp: ${lot.expDate || "-"}`,
            "size": "sm",
            "color": "#4B5563",
            "wrap": true,
            "margin": "xs"
          });
          medBlock.push({
            "type": "text",
            "text": `เหลือ: ${rDaysText} | จำนวน: ${lot.qty} ${unitText}`,
            "weight": "bold",
            "size": "sm",
            "color": "#D97706",
            "wrap": true,
            "margin": "none"
          });
        });
      }

      if (idx < Math.min(medicines.length, 10) - 1) {
        medBlock.push({
          "type": "separator",
          "margin": "md",
          "color": "#E5E7EB"
        });
      }

      bodyContents.push({
        "type": "box",
        "layout": "vertical",
        "contents": medBlock,
        "margin": "none"
      });
    });
  }

  // เส้นคั่นแบ่งหมวด
  bodyContents.push({
    "type": "separator",
    "margin": "lg",
    "color": "#D1D5DB"
  });

  // 2. หมวดวัคซีน
  bodyContents.push({
    "type": "text",
    "text": "💉 รายการวัคซีนใกล้หมดอายุภายใน 1 ปี :",
    "weight": "bold",
    "size": "md",
    "color": "#2563EB",
    "margin": "lg"
  });

  if (!vaccines || vaccines.length === 0) {
    bodyContents.push({
      "type": "text",
      "text": "✅ ไม่มีวัคซีนใกล้หมดอายุภายใน 1 ปี",
      "size": "sm",
      "color": "#059669",
      "margin": "sm"
    });
  } else {
    vaccines.slice(0, 10).forEach((vac, idx) => {
      let vacBlock = [];
      let nameThText = `${idx + 1}. ${vac.itemNameTH || vac.itemNameEN || "-"}`;
      let nameEnText = (vac.itemNameEN && vac.itemNameEN !== "-" && vac.itemNameEN !== vac.itemNameTH) ? `(${vac.itemNameEN})` : "";

      vacBlock.push({
        "type": "text",
        "text": nameThText,
        "weight": "bold",
        "size": "md",
        "color": "#111827",
        "wrap": true,
        "margin": idx === 0 ? "sm" : "md"
      });

      if (nameEnText) {
        vacBlock.push({
          "type": "text",
          "text": nameEnText,
          "weight": "bold",
          "size": "sm",
          "color": "#2563EB",
          "wrap": true,
          "margin": "none"
        });
      }

      let totalQty = vac.totalExpiringQty !== undefined ? vac.totalExpiringQty : vac.remaining;
      vacBlock.push({
        "type": "text",
        "text": `📦 รวมคงเหลือ: ${totalQty} Dose`,
        "weight": "bold",
        "size": "sm",
        "color": "#00897B",
        "margin": "xs"
      });

      if (vac.expiringLots) {
        vac.expiringLots.forEach(lot => {
          let rDays = lot.remainingDays;
          let rDaysText = (typeof rDays === 'number' && !isNaN(rDays)) ? `${rDays} วัน` : (rDays || "-");
          vacBlock.push({
            "type": "text",
            "text": `▪ Lot: ${lot.lot || "-"} | Exp: ${lot.expDate || "-"}`,
            "size": "sm",
            "color": "#4B5563",
            "wrap": true,
            "margin": "xs"
          });
          vacBlock.push({
            "type": "text",
            "text": `เหลือ: ${rDaysText} | จำนวน: ${lot.qty} Dose`,
            "weight": "bold",
            "size": "sm",
            "color": "#D97706",
            "wrap": true,
            "margin": "none"
          });
        });
      }

      if (idx < Math.min(vaccines.length, 10) - 1) {
        vacBlock.push({
          "type": "separator",
          "margin": "md",
          "color": "#E5E7EB"
        });
      }

      bodyContents.push({
        "type": "box",
        "layout": "vertical",
        "contents": vacBlock,
        "margin": "none"
      });
    });
  }

  return {
    "type": "bubble",
    "size": "giga",
    "header": {
      "type": "box",
      "layout": "vertical",
      "backgroundColor": "#00897B",
      "paddingAll": "16px",
      "contents": [
        {
          "type": "text",
          "text": "✅ สรุปรายงานประจำวันที่",
          "weight": "bold",
          "color": "#FFFFFF",
          "size": "md"
        },
        {
          "type": "text",
          "text": todayStr,
          "weight": "bold",
          "color": "#FFFFFF",
          "size": "xl",
          "margin": "xs"
        }
      ]
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "contents": bodyContents,
      "paddingAll": "16px"
    }
  };
}

/**
 * ==============================================================================
 * INFLUENZA VACCINE PROMOTION ANALYTICS (สถิติวัคซีนไข้หวัดใหญ่แยกตามโปรโมชั่น)
 * - แถมพ่วงกับโปรแกรมตรวจสุขภาพ
 * - โปรโมชั่น 590 บาท
 * - โปรโมชั่นซื้อคู่ 1,100 บาท (2 ท่าน)
 * - โปรโมชั่น 790 บาท
 * ==============================================================================
 */
async function handleGetFluPromoAnalytics(db, payload = {}) {
  const startDate = String(payload.startDate || "").trim();
  const endDate = String(payload.endDate || "").trim();
  const promoFilter = String(payload.promoCategory || "ALL").trim();

  // Query all vaccine/flu outbound transactions
  const txRes = await db.prepare(`
    SELECT t.*, m.item_name as master_name, m.standard_cost, m.selling_price as master_selling_price
    FROM stock_transactions t
    LEFT JOIN masterdata m ON UPPER(t.item_code) = UPPER(m.item_code)
    WHERE (t.action_type LIKE '%Outbound%' OR t.action_type LIKE '%Vaccine%' OR t.action_type LIKE '%DISPENSE%')
      AND (
        t.item_code LIKE '1204VAXI%' OR
        t.item_code LIKE '1204EFLU%' OR
        UPPER(t.item_name) LIKE '%VAXIGRIP%' OR
        t.item_name LIKE '%ไข้หวัดใหญ่%' OR
        t.note LIKE '%ไข้หวัดใหญ่%'
      )
    ORDER BY COALESCE(NULLIF(t.receive_date, ''), SUBSTR(t.timestamp, 1, 10)) ASC, t.id ASC
  `).all();

  // Query patient packages for patient name and package details
  const patPkgRes = await db.prepare("SELECT * FROM patient_packages ORDER BY id DESC").all();
  const patientPackages = (patPkgRes.results || []).map(formatPatientPackageRow);

  // Build patient HN -> Name map
  const patientNameMap = new Map();
  patientPackages.forEach(p => {
    if (p.HN && p.PatientName) {
      patientNameMap.set(String(p.HN).trim(), String(p.PatientName).trim());
    }
  });

  const rawTransactions = (txRes.results || []).map(formatTransactionRow);

  // Promotion Definitions
  const PROMO_DEFS = {
    PROMO_CHECKUP: {
      key: "PROMO_CHECKUP",
      name: "แถมพ่วงกับโปรแกรมตรวจสุขภาพ",
      shortName: "แถมตรวจสุขภาพ",
      badgeColor: "#0284c7",
      badgeBg: "rgba(2, 132, 199, 0.12)",
      defaultPrice: 0,
      description: "แถมฟรีสำหรับผู้รับบริการโปรแกรมตรวจสุขภาพ"
    },
    PROMO_590: {
      key: "PROMO_590",
      name: "โปรโมชั่น 590 บาท",
      shortName: "โปร 590.-",
      badgeColor: "#d97706",
      badgeBg: "rgba(217, 119, 6, 0.12)",
      defaultPrice: 590,
      description: "ราคาโปรโมชั่น 590 บาท/ท่าน"
    },
    PROMO_PAIR_1100: {
      key: "PROMO_PAIR_1100",
      name: "โปรโมชั่นซื้อคู่ 1,100 บาท (2 ท่าน)",
      shortName: "ซื้อคู่ 1,100.-",
      badgeColor: "#4f46e5",
      badgeBg: "rgba(79, 70, 229, 0.12)",
      defaultPrice: 550,
      description: "โปรโมชั่นแพ็คคู่ 1,100 บาท สำหรับ 2 ท่าน (เฉลี่ย 550 บาท/เข็ม)"
    },
    PROMO_790: {
      key: "PROMO_790",
      name: "โปรโมชั่น 790 บาท",
      shortName: "โปร 790.-",
      badgeColor: "#059669",
      badgeBg: "rgba(5, 150, 105, 0.12)",
      defaultPrice: 790,
      description: "ราคาโปรโมชั่นมาตรฐาน 790 บาท/ท่าน"
    },
    PROMO_OTHER: {
      key: "PROMO_OTHER",
      name: "โปรโมชั่นอื่นๆ / ราคาปกติ",
      shortName: "อื่นๆ",
      badgeColor: "#64748b",
      badgeBg: "rgba(100, 116, 139, 0.12)",
      defaultPrice: 0,
      description: "รายการอื่นๆ หรือรับสิทธิ์โครงการ"
    }
  };

  const processedList = [];
  const monthlyMap = new Map();
  const promoStats = {
    PROMO_CHECKUP: { ...PROMO_DEFS.PROMO_CHECKUP, doses: 0, revenue: 0, cost: 0, profit: 0 },
    PROMO_590: { ...PROMO_DEFS.PROMO_590, doses: 0, revenue: 0, cost: 0, profit: 0 },
    PROMO_PAIR_1100: { ...PROMO_DEFS.PROMO_PAIR_1100, doses: 0, revenue: 0, cost: 0, profit: 0 },
    PROMO_790: { ...PROMO_DEFS.PROMO_790, doses: 0, revenue: 0, cost: 0, profit: 0 },
    PROMO_OTHER: { ...PROMO_DEFS.PROMO_OTHER, doses: 0, revenue: 0, cost: 0, profit: 0 }
  };

  let totalDoses = 0;
  let totalRevenue = 0;
  let totalCost = 0;
  const uniqueHNSet = new Set();

  rawTransactions.forEach(t => {
    // Only count outbound doses
    const qtyChange = Number(t.QtyChange) || 0;
    if (qtyChange >= 0) return;
    const doses = Math.abs(qtyChange) || 1;

    const txDate = String(t.ReceiveDate || (t.Timestamp ? String(t.Timestamp).split(" ")[0] : "")).trim();
    if (!txDate) return;

    // Filter by date range if provided
    if (startDate && txDate < startDate) return;
    if (endDate && txDate > endDate) return;

    const note = String(t.Note || "");
    const noteLower = note.toLowerCase();
    const sellingPrice = Number(t.SellingPrice) || 0;
    const costPrice = Number(t.CostPrice) || 165.85;

    // Categorization
    let promoKey = "PROMO_OTHER";
    if (noteLower.includes("ตรวจสุขภาพ") || noteLower.includes("แถม") || noteLower.includes("checkup") || noteLower.includes("free")) {
      promoKey = "PROMO_CHECKUP";
    } else if (noteLower.includes("590") || sellingPrice === 590) {
      promoKey = "PROMO_590";
    } else if (noteLower.includes("1100") || noteLower.includes("ซื้อคู่") || noteLower.includes("2 pers") || noteLower.includes("/2") || sellingPrice === 550) {
      promoKey = "PROMO_PAIR_1100";
    } else if (noteLower.includes("790") || sellingPrice === 790 || noteLower.includes("3 สายพันธุ์") || noteLower.includes("1 เข็ม") || noteLower.includes("vaxigrip")) {
      promoKey = "PROMO_790";
    }

    // Filter by promo category if specified
    if (promoFilter !== "ALL" && promoKey !== promoFilter) return;

    // Effective revenue & cost
    let effectiveUnitPrice = sellingPrice;
    if (promoKey === "PROMO_CHECKUP") {
      effectiveUnitPrice = 0;
    } else if (promoKey === "PROMO_590" && effectiveUnitPrice <= 0) {
      effectiveUnitPrice = 590;
    } else if (promoKey === "PROMO_PAIR_1100" && effectiveUnitPrice <= 0) {
      effectiveUnitPrice = 550;
    } else if (promoKey === "PROMO_790" && effectiveUnitPrice <= 0) {
      effectiveUnitPrice = 790;
    }

    const rowRevenue = doses * effectiveUnitPrice;
    const rowCost = doses * costPrice;
    const rowProfit = rowRevenue - rowCost;

    totalDoses += doses;
    totalRevenue += rowRevenue;
    totalCost += rowCost;

    const rawHN = String(t.HN_VN || "").replace(/[^0-9]/g, "").trim() || String(t.HN_VN || "").trim();
    if (rawHN) uniqueHNSet.add(rawHN);

    // Patient Name resolution
    let patientName = "-";
    if (rawHN && patientNameMap.has(rawHN)) {
      patientName = patientNameMap.get(rawHN);
    } else if (t.HN_VN && t.HN_VN.includes("(")) {
      const match = t.HN_VN.match(/\(([^)]+)\)/);
      if (match) patientName = match[1].trim();
    }

    // Update promo stats
    promoStats[promoKey].doses += doses;
    promoStats[promoKey].revenue += rowRevenue;
    promoStats[promoKey].cost += rowCost;
    promoStats[promoKey].profit += rowProfit;

    // Update monthly map
    const monthKey = txDate.substring(0, 7); // YYYY-MM
    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, {
        monthKey: monthKey,
        yearMonth: monthKey,
        checkupDoses: 0,
        promo590Doses: 0,
        pair1100Doses: 0,
        promo790Doses: 0,
        otherDoses: 0,
        totalDoses: 0,
        totalRevenue: 0,
        totalCost: 0,
        grossProfit: 0
      });
    }

    const mRecord = monthlyMap.get(monthKey);
    if (promoKey === "PROMO_CHECKUP") mRecord.checkupDoses += doses;
    else if (promoKey === "PROMO_590") mRecord.promo590Doses += doses;
    else if (promoKey === "PROMO_PAIR_1100") mRecord.pair1100Doses += doses;
    else if (promoKey === "PROMO_790") mRecord.promo790Doses += doses;
    else mRecord.otherDoses += doses;

    mRecord.totalDoses += doses;
    mRecord.totalRevenue += rowRevenue;
    mRecord.totalCost += rowCost;
    mRecord.grossProfit += rowProfit;

    processedList.push({
      id: t.id,
      Date: txDate,
      HN: rawHN || t.HN_VN || "-",
      PatientName: patientName,
      ItemCode: t.ItemCode,
      ItemName: t.ItemName,
      LotNumber: t.LotNumber || "-",
      Doses: doses,
      UnitPrice: effectiveUnitPrice,
      CostPrice: costPrice,
      Revenue: rowRevenue,
      Cost: rowCost,
      Profit: rowProfit,
      PromoKey: promoKey,
      PromoName: PROMO_DEFS[promoKey].name,
      PromoShortName: PROMO_DEFS[promoKey].shortName,
      PromoBadgeColor: PROMO_DEFS[promoKey].badgeColor,
      PromoBadgeBg: PROMO_DEFS[promoKey].badgeBg,
      Note: note,
      ByUser: t.By || "Staff"
    });
  });

  // Calculate percentage shares
  Object.keys(promoStats).forEach(key => {
    promoStats[key].sharePercent = totalDoses > 0 ? Number(((promoStats[key].doses / totalDoses) * 100).toFixed(1)) : 0;
  });

  // Sort months chronologically
  const sortedMonths = Array.from(monthlyMap.values()).sort((a, b) => a.monthKey.localeCompare(b.monthKey));

  // Determine top promotion
  let topPromoKey = "PROMO_PAIR_1100";
  let maxDoses = -1;
  Object.keys(promoStats).forEach(key => {
    if (key !== "PROMO_OTHER" && promoStats[key].doses > maxDoses) {
      maxDoses = promoStats[key].doses;
      topPromoKey = key;
    }
  });

  const grossProfit = totalRevenue - totalCost;
  const marginPercent = totalRevenue > 0 ? Number(((grossProfit / totalRevenue) * 100).toFixed(1)) : 0;

  return {
    success: true,
    summary: {
      totalDoses,
      totalRevenue,
      totalCost,
      grossProfit,
      marginPercent,
      uniquePatients: uniqueHNSet.size,
      topPromo: promoStats[topPromoKey],
      averagePricePerDose: totalDoses > 0 ? Number((totalRevenue / totalDoses).toFixed(2)) : 0
    },
    promos: Object.values(promoStats).filter(p => p.key !== "PROMO_OTHER" || p.doses > 0),
    promoStats: promoStats,
    monthlyBreakdown: sortedMonths,
    transactions: processedList.reverse()
  };
}
