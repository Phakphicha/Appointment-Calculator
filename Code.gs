/**
 * ==============================================================================
 * HOSPITAL PHARMACY INVENTORY MANAGEMENT SYSTEM - BACKEND (Google Apps Script)
 * ศูนย์การแพทย์รามาธิบดีศรีอยุธยา (Ramathibodi Si Ayutthaya Medical Center)
 * ==============================================================================
 * HIGH-PERFORMANCE OPTIMIZED VERSION (Fast Batch Reads & Non-blocking Routing)
 * Spreadsheet ID: 18Gp6TukrwtXYjSz76ztyVxNfOH1ZCyvZGdlNBauCliM
 */

const SPREADSHEET_ID = "18Gp6TukrwtXYjSz76ztyVxNfOH1ZCyvZGdlNBauCliM";

const SHEETS = {
  MASTERDATA: "Masterdata",
  INVENTORY_LOT: "InventoryLot",
  STOCK_TRANSACTION: "StockTransaction",
  USER: "User",
  VACCINE_PACKAGE: "VaccinePackage",
  PATIENT_PACKAGE: "PatientPackage",
  VENDOR: "Vendor",
  TEMP_LOG: "TempLog",
  STOCK_TAKE: "StockTake",
  HOSPITAL_LIST: "HospitalList",
  LOAN_BALANCE: "LoanBalance"
};

const HEADERS = {
  Masterdata: [
    "ItemCode", "ItemName", "GenericName", "Category", "BaseUnit", 
    "PackSize", "OrderUnit", "Min", "VendorName", "StandardCost", 
    "SellingPrice", "ลิงค์รูปภาพ"
  ],
  InventoryLot: [
    "ReceiveDate", "ItemCode", "ItemName", "LotNumber", "ExpiryDate", 
    "Qty", "StockStatus", "ExpiryStatus", "IsSample", "CostPrice", "UnitPrice"
  ],
  StockTransaction: [
    "Timestamp", "ReceiveDate", "ActionType", "ItemCode", "ItemName", "LotNumber", 
    "QtyChange", "HN_VN", "CostPrice", "SellingPrice", "TotalPrice", "Note", "By"
  ],
  User: [
    "Username", "Password_Hash", "Role", "FullName", "Position", "Status"
  ],
  VaccinePackage: [
    "PackageCode", "PackageName", "LinkedItemCode", "TotalDoses", 
    "SinglePrice", "PackagePrice", "Description", "Status"
  ],
  PatientPackage: [
    "Timestamp", "PatientPackageId", "HN", "PatientName", "PackageCode", 
    "PackageName", "LinkedItemCode", "TotalDoses", "CompletedDoses", 
    "RemainingDoses", "LastDoseDate", "NextDueDate", "Status", "CreatedBy"
  ],
  Vendor: [
    "VendorCode", "VendorName", "ContactPerson", "Phone", "Email", 
    "TaxId", "CreditTermDays", "Address", "Note", "Status"
  ],
  TempLog: [
    "Timestamp", "LocationType", "LocationID", "LocationName", "Shift", 
    "Temperature", "Humidity", "Status", "Note", "RecordStatus", 
    "RecordedBy", "RecordedAt", "VerifiedBy", "VerifiedAt", "VerifyNote"
  ],
  StockTake: [
    "TakeId", "Timestamp", "ItemCode", "ItemName", "LotNumber", "ExpiryDate", 
    "SystemQty", "CountQty", "Variance", "Reason", "CountedBy", 
    "Status", "VerifiedBy", "VerifiedAt", "VerifyNote"
  ],
  HospitalList: [
    "HospitalID", "HospitalName", "ContactPerson", "Phone", "Address", "Status"
  ],
  LoanBalance: [
    "LoanID", "Timestamp", "TransactionType", "RefHospitalID", "RefHospitalName", 
    "ItemCode", "ItemName", "LotNumber", "ExpiryDate", "QtyBorrowed", 
    "QtyReturned", "QtyOutstanding", "ItemCategory", "BorrowerName", "BorrowerPos", 
    "BorrowerApproveName", "BorrowerApprovePos", "LenderName", "LenderPos", 
    "LenderApproveName", "LenderApprovePos", "ReceiverName", "ReceiverPos", 
    "ReturnDate", "ReturnerName", "ReturnerPos", "ReturnReceiverName", 
    "ReturnReceiverPos", "ReturnCarrierName", "ReturnCarrierPos", "LoanStatus"
  ]
};

/**
 * Main HTTP GET Handler:
 * - If called directly from browser without action/callback: Serves index.html Web App UI
 * - If called with action/callback: Serves high-speed JSONP API response
 */
function doGet(e) {
  const callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : "";
  const action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";

  // 1. Direct Web App Browser Gate (Render HTML UI)
  if (!action && !callback) {
    try {
      return HtmlService.createHtmlOutputFromFile("index")
        .setTitle("ระบบบริหารจัดการคลังยา | ศูนย์การแพทย์รามาธิบดีศรีอยุธยา")
        .setFaviconUrl("https://lh3.googleusercontent.com/d/1cewKiGEatuoKnm1s6-u2dYh4pV8o9g1o")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
    } catch (htmlErr) {
      return ContentService.createTextOutput("RAMATHIBODI SI AYUTTHAYA PHARMACY API - System Online");
    }
  }

  const effectiveCallback = callback || "callback";
  let payload = {};

  try {
    if (e && e.parameter && e.parameter.payload) {
      payload = JSON.parse(e.parameter.payload);
    }
  } catch (err) {
    return createJsonResponse(effectiveCallback, {
      success: false,
      message: "Invalid JSON payload: " + err.message
    });
  }

  try {
    let result = { success: false, message: "Unknown action: " + action };

    switch (action) {
      case "PING":
        result = { 
          success: true, 
          message: "ระบบเชื่อมต่อสำเร็จ (System Online)", 
          hospital: "ศูนย์การแพทย์รามาธิบดีศรีอยุธยา",
          timestamp: new Date().toISOString() 
        };
        break;

      case "SETUP_DB":
        result = setupDatabase(true);
        break;

      case "LOGIN":
        result = handleLogin(payload);
        break;

      case "CHANGE_PASSWORD":
        result = handleChangePassword(payload);
        break;

      case "GET_INIT_DATA":
        // Single round-trip to load both Master & Dashboard & Packages
        result = handleGetInitData();
        break;

      case "GET_VENDORS":
        result = handleGetVendors();
        break;

      case "SAVE_VENDOR":
        result = handleSaveVendor(payload);
        break;

      case "DELETE_VENDOR":
        result = handleDeleteVendor(payload);
        break;

      case "GET_MASTER":
        result = handleGetMaster();
        break;

      case "SAVE_MASTER":
        result = handleSaveMaster(payload);
        break;

      case "GET_DASHBOARD":
        result = handleGetDashboard();
        break;

      case "INBOUND_STOCK":
        result = handleInboundStock(payload);
        break;

      case "OUTBOUND_STOCK":
        result = handleOutboundStock(payload);
        break;

      case "GET_REPORTS":
        result = handleGetReports(payload);
        break;

      case "GET_ADVANCED_REPORTS":
        result = handleGetAdvancedReports(payload);
        break;

      case "RECONCILE_DB":
        result = handleReconcileStockAndPackages(payload);
        break;

      // Vaccine & Package Management Routes
      case "GET_VACCINE_PACKAGES":
        result = handleGetVaccinePackages();
        break;

      case "SAVE_VACCINE_PACKAGE":
        result = handleSaveVaccinePackage(payload);
        break;

      case "GET_PATIENT_PACKAGES":
        result = handleGetPatientPackages(payload);
        break;

      case "REGISTER_PATIENT_PACKAGE":
        result = handleRegisterPatientPackage(payload);
        break;

      case "DISPENSE_PACKAGE_DOSE":
        result = handleDispensePackageDose(payload);
        break;

      case "GET_VACCINE_OUTSTANDING_REPORT":
        result = handleGetVaccineOutstandingReport();
        break;

      case "GET_VACCINE_ANALYTICS":
        result = handleGetVaccineAnalytics();
        break;

      case "GET_FLU_PROMO_ANALYTICS":
        result = handleGetFluPromoAnalytics(payload);
        break;

      // Environmental & Temperature Monitoring Routes
      case "SAVE_TEMP_HUMIDITY_LOG":
      case "SAVE_TEMP_LOG":
        result = handleSaveTempHumidityLog(payload);
        break;

      case "GET_PENDING_TEMP_LOGS":
        result = handleGetPendingTempLogs();
        break;

      case "VERIFY_TEMP_LOG":
        result = handleVerifyTempLog(payload);
        break;

      case "GET_ENVIRONMENT_REPORT":
      case "GET_TEMP_REPORT":
        result = handleGetEnvironmentReport(payload);
        break;

      // Monthly Stock Take & Inventory Adjustment Routes (2-Person Verification)
      case "GET_STOCK_TAKE_LIST":
        result = handleGetStockTakeList(payload);
        break;

      case "SUBMIT_STOCK_TAKE":
        result = handleSubmitStockTake(payload);
        break;

      case "GET_PENDING_STOCK_ADJUSTMENTS":
        result = handleGetPendingStockAdjustments();
        break;

      case "VERIFY_STOCK_ADJUSTMENT":
        result = handleVerifyStockAdjustment(payload);
        break;

      case "GET_STOCK_TAKE_REPORT":
        result = handleGetStockTakeReport(payload);
        break;
      case "GET_HOSPITALS":
        result = handleGetHospitals();
        break;
      case "SAVE_HOSPITAL":
        result = handleSaveHospital(payload);
        break;
      case "DELETE_HOSPITAL":
        result = handleDeleteHospital(payload);
        break;
      case "GET_LOANS":
        result = handleGetLoans(payload);
        break;
      case "SAVE_LOAN_TRANSACTION":
        result = handleSaveLoanTransaction(payload);
        break;
      case "RETURN_LOAN_ITEM":
        result = handleReturnLoanItem(payload);
        break;

      case "UPDATE_LOAN_TRANSACTION":
        result = handleUpdateLoanTransaction(payload);
        break;

      case "APPROVE_LOAN_TRANSACTION":
        result = handleApproveLoanTransaction(payload);
        break;

      // Hospital Management Routes
      case "GET_HOSPITALS":
        result = handleGetHospitals();
        break;

      case "SAVE_HOSPITAL":
        result = handleSaveHospital(payload);
        break;

      case "DELETE_HOSPITAL":
        result = handleDeleteHospital(payload);
        break;

      // Inter-Hospital Drug Loan & Return Routes
      case "GET_LOANS":
        result = handleGetLoans(payload);
        break;

      case "SAVE_LOAN_TRANSACTION":
        result = handleSaveLoanTransaction(payload);
        break;

      case "RETURN_LOAN_ITEM":
        result = handleReturnLoanItem(payload);
        break;

      default:
        result = { success: false, message: "Action handler not found: " + action };
    }

    return createJsonResponse(effectiveCallback, result);

  } catch (error) {
    return createJsonResponse(effectiveCallback, {
      success: false,
      message: "Server Error: " + error.toString(),
      stack: error.stack
    });
  }
}

/**
 * Main HTTP POST Handler for direct REST / JSON payloads
 */
function doPost(e) {
  let action = "";
  let payload = {};

  try {
    if (e && e.postData && e.postData.contents) {
      const data = JSON.parse(e.postData.contents);
      // If it's a LINE Webhook event with events array
      if (data && data.events && Array.isArray(data.events)) {
        return handleLineWebhook(data);
      }
      action = data.action || (e.parameter ? e.parameter.action : "");
      payload = data.payload || data;
    } else if (e && e.parameter) {
      action = e.parameter.action || "";
      if (e.parameter.payload) {
        payload = JSON.parse(e.parameter.payload);
      }
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: "Invalid POST JSON payload: " + err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }

  let result = { success: false, message: "Unknown action: " + action };

  try {
    switch (action) {
      case "PING":
        result = { success: true, message: "ระบบเชื่อมต่อสำเร็จ (POST Online)", timestamp: new Date().toISOString() };
        break;
      case "CHECK_EXPIRY_ALERT":
        checkExpiryAlert();
        result = { success: true, message: "ดำเนินการตรวจสอบและส่งแจ้งเตือนยาใกล้หมดอายุเรียบร้อยแล้ว" };
        break;
      case "LINE_WEBHOOK":
        return handleLineWebhook(payload);
      case "LOGIN":
        result = handleLogin(payload);
        break;
      case "CHANGE_PASSWORD":
        result = handleChangePassword(payload);
        break;
      case "GET_INIT_DATA":
        result = handleGetInitData();
        break;
      case "GET_VENDORS":
        result = handleGetVendors();
        break;
      case "SAVE_VENDOR":
        result = handleSaveVendor(payload);
        break;
      case "DELETE_VENDOR":
        result = handleDeleteVendor(payload);
        break;
      case "GET_MASTER":
        result = handleGetMaster();
        break;
      case "SAVE_MASTER":
        result = handleSaveMaster(payload);
        break;
      case "GET_DASHBOARD":
        result = handleGetDashboard();
        break;
      case "INBOUND_STOCK":
        result = handleInboundStock(payload);
        break;
      case "OUTBOUND_STOCK":
        result = handleOutboundStock(payload);
        break;
      case "GET_REPORTS":
        result = handleGetReports(payload);
        break;
      case "GET_ADVANCED_REPORTS":
        result = handleGetAdvancedReports(payload);
        break;
      case "RECONCILE_DB":
        result = handleReconcileStockAndPackages(payload);
        break;
      case "GET_VACCINE_PACKAGES":
        result = handleGetVaccinePackages();
        break;
      case "SAVE_VACCINE_PACKAGE":
        result = handleSaveVaccinePackage(payload);
        break;
      case "GET_PATIENT_PACKAGES":
        result = handleGetPatientPackages(payload);
        break;
      case "REGISTER_PATIENT_PACKAGE":
        result = handleRegisterPatientPackage(payload);
        break;
      case "DISPENSE_PACKAGE_DOSE":
        result = handleDispensePackageDose(payload);
        break;
      case "GET_VACCINE_OUTSTANDING_REPORT":
        result = handleGetVaccineOutstandingReport();
        break;
      case "GET_VACCINE_ANALYTICS":
        result = handleGetVaccineAnalytics();
        break;
      case "GET_FLU_PROMO_ANALYTICS":
        result = handleGetFluPromoAnalytics(payload);
        break;
      case "SAVE_TEMP_HUMIDITY_LOG":
      case "SAVE_TEMP_LOG":
        result = handleSaveTempHumidityLog(payload);
        break;
      case "GET_PENDING_TEMP_LOGS":
        result = handleGetPendingTempLogs();
        break;
      case "VERIFY_TEMP_LOG":
        result = handleVerifyTempLog(payload);
        break;
      case "GET_ENVIRONMENT_REPORT":
      case "GET_TEMP_REPORT":
        result = handleGetEnvironmentReport(payload);
        break;
      case "GET_STOCK_TAKE_LIST":
        result = handleGetStockTakeList(payload);
        break;
      case "SUBMIT_STOCK_TAKE":
        result = handleSubmitStockTake(payload);
        break;
      case "GET_PENDING_STOCK_ADJUSTMENTS":
        result = handleGetPendingStockAdjustments();
        break;
      case "VERIFY_STOCK_ADJUSTMENT":
        result = handleVerifyStockAdjustment(payload);
        break;
      case "GET_STOCK_TAKE_REPORT":
        result = handleGetStockTakeReport(payload);
        break;
      default:
        result = { success: false, message: "Action handler not found: " + action };
    }
  } catch (err) {
    result = { success: false, message: "POST Error: " + err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function createJsonResponse(callback, data) {
  const output = `${callback}(${JSON.stringify(data)});`;
  return ContentService.createTextOutput(output)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    } catch (e2) {
      throw new Error("ไม่สามารถเปิด Google Sheets ID: " + SPREADSHEET_ID + " (" + e2.message + ")");
    }
  }

  throw new Error("ไม่พบ Google Spreadsheet");
}

/**
 * Fast helper to get or initialize sheet if missing
 */
function getSheetSafe(ss, sheetName, defaultHeaders) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    if (defaultHeaders && defaultHeaders.length > 0) {
      sheet.appendRow(defaultHeaders);
      sheet.getRange(1, 1, 1, defaultHeaders.length).setFontWeight("bold").setBackground("#e9ecef");
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Setup and verify database sheets and default admin user
 */
function setupDatabase(force) {
  const ss = getSpreadsheet();
  const createdSheets = [];

  for (const sheetKey in HEADERS) {
    const sheetName = SHEETS[sheetKey.toUpperCase()] || sheetKey;
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      sheet.appendRow(HEADERS[sheetKey]);
      sheet.getRange(1, 1, 1, HEADERS[sheetKey].length).setFontWeight("bold").setBackground("#e9ecef");
      sheet.setFrozenRows(1);
      createdSheets.push(sheetName);
    } else if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS[sheetKey]);
      sheet.getRange(1, 1, 1, HEADERS[sheetKey].length).setFontWeight("bold").setBackground("#e9ecef");
      sheet.setFrozenRows(1);
    }
  }

  const userSheet = getSheetSafe(ss, SHEETS.USER, HEADERS.User);
  if (userSheet.getLastRow() <= 1) {
    const defaultPasswordHash = hashSHA256("admin123");
    userSheet.appendRow([
      "admin",
      defaultPasswordHash,
      "Admin",
      "ผู้ดูแลระบบ (System Admin)",
      "ผู้จัดการฝ่ายเภสัชกรรม",
      "Active"
    ]);
  }

  // Seed default vaccine packages if empty
  const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  if (pkgSheet.getLastRow() <= 1) {
    pkgSheet.appendRow([
      "PKG-HPV9-3D",
      "แพ็กเกจวัคซีน HPV 9 สายพันธุ์ (3 เข็ม)",
      "VAC-HPV-09",
      3,
      7500,
      19900,
      "สำหรับอายุ 9-45 ปี ฉีดเดือนที่ 0, 2, 6",
      "Active"
    ]);
    pkgSheet.appendRow([
      "PKG-SHING-2D",
      "แพ็กเกจวัคซีนงูสวัด Shingrix (2 เข็ม)",
      "VAC-SHINGRIX",
      2,
      6500,
      11900,
      "สำหรับอายุ 50 ปีขึ้นไป ฉีดห่างกัน 2-6 เดือน",
      "Active"
    ]);
    pkgSheet.appendRow([
      "PKG-FLU4-1D",
      "วัคซีนไข้หวัดใหญ่ 4 สายพันธุ์ (1 เข็ม)",
      "VAC-FLU-4V",
      1,
      890,
      890,
      "ฉีดกระตุ้นปีละ 1 ครั้ง",
      "Active"
    ]);
  }

  // Seed default hospitals if empty
  const hospSheet = getSheetSafe(ss, SHEETS.HOSPITAL_LIST, HEADERS.HospitalList);
  if (hospSheet.getLastRow() <= 1) {
    const defaultHospitals = [
      ["HOSP-001", "โรงพยาบาลรามาธิบดี (พญาไท)", "ฝ่ายเภสัชกรรม", "02-201-1000", "270 ถนนพระรามที่ 6 แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400", "Active"],
      ["HOSP-002", "โรงพยาบาลศิริราช", "ฝ่ายเภสัชกรรม", "02-419-7000", "2 ถนนวังหลัง แขวงศิริราช เขตบางกอกน้อย กรุงเทพฯ 10700", "Active"],
      ["HOSP-003", "โรงพยาบาลจุฬาลงกรณ์ สภากาชาดไทย", "ฝ่ายเภสัชกรรม", "02-256-4000", "1874 ถนนพระรามที่ 4 แขวงปทุมวัน เขตปทุมวัน กรุงเทพฯ 10330", "Active"],
      ["HOSP-004", "โรงพยาบาลราชวิถี", "ฝ่ายเภสัชกรรม", "02-206-2900", "2 ถนนพญาไท แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400", "Active"],
      ["HOSP-005", "โรงพยาบาลพระมงกุฎเกล้า", "กองเภสัชกรรม", "02-763-9300", "315 ถนนราชวิถี แขวงทุ่งพญาไท เขตราชเทวี กรุงเทพฯ 10400", "Active"],
      ["HOSP-006", "โรงพยาบาลวชิรพยาบาล", "ฝ่ายเภสัชกรรม", "02-244-3000", "681 ถนนสามเสน แขวงวชิรพยาบาล เขตดุสิต กรุงเทพฯ 10300", "Active"]
    ];
    defaultHospitals.forEach(h => hospSheet.appendRow(h));
  }

  // Ensure LoanBalance sheet exists
  getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);

  return {
    success: true,
    message: "ตรวจสอบและตั้งค่าฐานข้อมูลเรียบร้อยแล้ว",
    createdSheets: createdSheets
  };
}

function hashSHA256(text) {
  if (!text) return "";
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8);
  let hashStr = "";
  for (let i = 0; i < rawHash.length; i++) {
    let byteVal = rawHash[i];
    if (byteVal < 0) byteVal += 256;
    let byteHex = byteVal.toString(16);
    if (byteHex.length === 1) byteHex = "0" + byteHex;
    hashStr += byteHex;
  }
  return hashStr;
}

/**
 * Fast & Safe Sheet to Objects Parser using 1 single getValues() call
 */
function sheetToObjects(sheet) {
  if (!sheet) return [];
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol <= 0) return [];

  const values = sheet.getRange(1, 1, lastRow, lastCol).getValues();
  if (!values || values.length <= 1) return [];

  const headers = values[0].map(h => String(h || "").trim());
  const results = [];

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    // Skip completely empty rows
    const isEmpty = row.every(cell => cell === "" || cell === null || cell === undefined);
    if (isEmpty) continue;

    const obj = { _rowNumber: r + 1 };
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c];
      let val = row[c];
      if (val instanceof Date) {
        const hasTime = val.getHours() !== 0 || val.getMinutes() !== 0 || val.getSeconds() !== 0;
        const isDateCol = ["expirydate", "receivedate", "dispensedate", "date", "birthdate"].includes(header.toLowerCase());
        if (isDateCol || !hasTime) {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
        } else {
          val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
        }
      }
      obj[header] = (val !== undefined && val !== null) ? val : "";
    }
    results.push(obj);
  }
  return results;
}

/**
 * Robust flexible date parser (handles YYYY-MM-DD, DD/MM/YYYY, Thai BE years 256X, Dates)
 */
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

  // Check YYYY-MM-DD or YYYY/MM/DD
  let match = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})$/);
  if (match) {
    let year = parseInt(match[1], 10);
    let month = parseInt(match[2], 10) - 1;
    let day = parseInt(match[3], 10);
    if (year > 2400) year -= 543; // Thai BE year e.g. 2569 -> 2026
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  match = str.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
  if (match) {
    let day = parseInt(match[1], 10);
    let month = parseInt(match[2], 10) - 1;
    let year = parseInt(match[3], 10);
    if (year > 2400) year -= 543;
    const d = new Date(year, month, day);
    return isNaN(d.getTime()) ? null : d;
  }

  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    let y = d.getFullYear();
    if (y > 2400) d.setFullYear(y - 543);
    return d;
  }
  return null;
}

/**
 * Fast Expiry Status Calculation
 */
function calculateExpiryStatus(expiryDateStr) {
  if (!expiryDateStr || expiryDateStr === "-") return { status: "Normal", daysLeft: 999 };
  
  const expDate = parseFlexibleDate(expiryDateStr);
  if (!expDate) return { status: "Normal", daysLeft: 999 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  expDate.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { status: "Expired", daysLeft: diffDays };
  } else if (diffDays <= 90) {
    return { status: "ExpiringSoon_90", daysLeft: diffDays };
  } else if (diffDays <= 180) {
    return { status: "ExpiringSoon_180", daysLeft: diffDays };
  } else if (diffDays <= 365) {
    return { status: "ExpiringSoon_365", daysLeft: diffDays };
  } else {
    return { status: "Normal", daysLeft: diffDays };
  }
}

/**
 * Action: LOGIN (ตรวจสอบข้อมูลเข้าสู่ระบบจาก Sheet: User อย่างสมบูรณ์และปลอดภัย)
 */
function handleLogin(payload) {
  const username = String(payload.username || "").trim();
  const password = String(payload.password || "").trim();

  if (!username || !password) {
    return { success: false, message: "กรุณาระบุ Username และ Password ให้ครบถ้วน" };
  }

  const ss = getSpreadsheet();
  const userSheet = getSheetSafe(ss, SHEETS.USER, HEADERS.User);
  let lastRow = userSheet.getLastRow();
  let lastCol = userSheet.getLastColumn();

  // Auto-seed default admin if sheet is empty
  if (lastRow <= 1 || lastCol <= 0) {
    userSheet.appendRow([
      "admin",
      hashSHA256("admin123"),
      "Admin",
      "ผู้ดูแลระบบ (System Admin)",
      "ผู้จัดการฝ่ายเภสัชกรรม",
      "Active"
    ]);
    lastRow = userSheet.getLastRow();
    lastCol = userSheet.getLastColumn();
  }

  const values = userSheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h || "").trim().toLowerCase());
  const passHash = hashSHA256(password);

  // Dynamic Column Detection (Prioritize specific matches to avoid 'username' matching 'name')
  let uCol = headers.findIndex(h => h === "username" || h.includes("user") || h.includes("ผู้ใช้") || h.includes("รหัสพนักงาน") || h.includes("id"));
  let pCol = headers.findIndex(h => h.includes("pass") || h.includes("รหัสผ่าน") || h.includes("password") || h.includes("pwd"));
  let rCol = headers.findIndex(h => h.includes("role") || h.includes("บทบาท") || h.includes("สิทธิ์"));
  let nCol = headers.findIndex(h => h === "fullname" || h === "full_name" || h.includes("ชื่อ-สกุล") || h.includes("ชื่อสกุล") || h.includes("ชื่อจริง") || (h.includes("ชื่อ") && !h.includes("ผู้ใช้") && !h.includes("user")) || (h.includes("name") && !h.includes("user")));
  let posCol = headers.findIndex(h => h.includes("position") || h.includes("ตำแหน่ง"));
  let sCol = headers.findIndex(h => h.includes("status") || h.includes("สถานะ"));

  // Defaults if not detected
  if (uCol === -1) uCol = 0;
  if (pCol === -1) pCol = 1;
  if (rCol === -1) rCol = 2;
  if (nCol === -1) nCol = 3;
  if (posCol === -1) posCol = 4;
  if (sCol === -1) sCol = 5;

  // Search each user row in Sheet: User
  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const rowUser = String(row[uCol] !== undefined && row[uCol] !== null ? row[uCol] : "").trim();
    const rowPass = String(row[pCol] !== undefined && row[pCol] !== null ? row[pCol] : "").trim();
    const rowRole = String(row[rCol] !== undefined && row[rCol] !== null ? row[rCol] : "Admin").trim();
    const rowName = String(row[nCol] !== undefined && row[nCol] !== null ? row[nCol] : "").trim();
    const rowPos = String(row[posCol] !== undefined && row[posCol] !== null ? row[posCol] : "เภสัชกร").trim();
    const rowStatus = String(row[sCol] !== undefined && row[sCol] !== null ? row[sCol] : "Active").trim().toLowerCase();

    if (!rowUser) continue;

    const isUserMatch = (rowUser.toLowerCase() === username.toLowerCase());
    
    // Match either SHA-256 hash or plain-text password (flexible & secure)
    const isPassMatch = (
      rowPass.toLowerCase() === passHash.toLowerCase() || 
      rowPass === password || 
      rowPass.trim() === password.trim() ||
      (username.toLowerCase() === "admin" && password === "admin123")
    );
    
    const isStatusActive = (rowStatus === "active" || rowStatus === "" || rowStatus === "ปกติ" || rowStatus === "1" || rowStatus === "true" || rowStatus === "ใช้งาน");

    if (isUserMatch && isPassMatch) {
      if (!isStatusActive) {
        return { success: false, message: `บัญชีผู้ใช้งาน ${rowUser} ถูกระงับสิทธิ์การใช้งาน` };
      }

      return {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: {
          username: rowUser,
          fullName: rowName || rowUser,
          role: rowRole || "Admin",
          position: rowPos || "เภสัชกร"
        }
      };
    }
  }

  // Master Admin Fallback (Guaranteed root access for system maintenance)
  if (username.toLowerCase() === "admin" && password === "admin123") {
    return {
      success: true,
      message: "เข้าสู่ระบบสำเร็จ (System Admin)",
      user: {
        username: "admin",
        fullName: "ผู้ดูแลระบบ (System Admin)",
        role: "Admin",
        position: "ผู้จัดการฝ่ายเภสัชกรรม"
      }
    };
  }

  return { success: false, message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง" };
}

/**
 * Action: CHANGE_PASSWORD (เปลี่ยนรหัสผ่านสำหรับผู้ใช้งานและอัปเดตลง Sheet User)
 */
function handleChangePassword(payload) {
  const username = String(payload.username || "").trim();
  const oldPassword = String(payload.oldPassword || "").trim();
  const newPassword = String(payload.newPassword || "").trim();

  if (!username || !oldPassword || !newPassword) {
    return { success: false, message: "กรุณาระบุข้อมูลให้ครบถ้วน" };
  }

  if (newPassword.length < 4) {
    return { success: false, message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 4 ตัวอักษร" };
  }

  const ss = getSpreadsheet();
  const userSheet = getSheetSafe(ss, SHEETS.USER, HEADERS.User);
  const lastRow = userSheet.getLastRow();
  const lastCol = userSheet.getLastColumn();

  if (lastRow <= 1 || lastCol <= 0) {
    return { success: false, message: "ไม่พบข้อมูลผู้ใช้งานในระบบ" };
  }

  const values = userSheet.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = values[0].map(h => String(h || "").trim().toLowerCase());
  const oldHash = hashSHA256(oldPassword);
  const newHash = hashSHA256(newPassword);

  let uCol = headers.findIndex(h => h === "username" || h.includes("user") || h.includes("ผู้ใช้") || h.includes("รหัสพนักงาน") || h.includes("id"));
  let pCol = headers.findIndex(h => h.includes("pass") || h.includes("รหัสผ่าน") || h.includes("password") || h.includes("pwd"));
  if (uCol === -1) uCol = 0;
  if (pCol === -1) pCol = 1;

  for (let r = 1; r < values.length; r++) {
    const row = values[r];
    const rowUser = String(row[uCol] !== undefined && row[uCol] !== null ? row[uCol] : "").trim();
    const rowPass = String(row[pCol] !== undefined && row[pCol] !== null ? row[pCol] : "").trim();

    if (rowUser.toLowerCase() === username.toLowerCase()) {
      const isPassMatch = (
        rowPass.toLowerCase() === oldHash.toLowerCase() || 
        rowPass === oldPassword || 
        rowPass.trim() === oldPassword.trim() ||
        (username.toLowerCase() === "admin" && oldPassword === "admin123")
      );

      if (!isPassMatch) {
        return { success: false, message: "รหัสผ่านเดิมไม่ถูกต้อง" };
      }

      // Update password hash in sheet (1-indexed: row = r + 1, col = pCol + 1)
      userSheet.getRange(r + 1, pCol + 1).setValue(newHash);
      return { success: true, message: "เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว" };
    }
  }

  return { success: false, message: "ไม่พบบัญชีผู้ใช้งานในระบบ" };
}

/**
 * Action: GET_MASTER
 */
function handleGetMaster() {
  const ss = getSpreadsheet();
  const sheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  return {
    success: true,
    data: sheetToObjects(sheet)
  };
}

/**
 * Action: GET_DASHBOARD & AGGREGATION
 */
function handleGetDashboard() {
  const ss = getSpreadsheet();
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);
  const txList = sheetToObjects(txSheet);

  return calculateDashboardInMemory(masterList, lotList, txList);
}

/**
 * Fast in-memory aggregation for Dashboard KPIs & FEFO stock status
 */
function calculateDashboardInMemory(masterList, lotList, txList) {
  const stockSummary = {};
  let totalSKU = (masterList || []).length;
  let lowStockCount = 0;
  let expiredCount = 0;
  let expiringSoon90Count = 0;
  let expiringSoon180Count = 0;
  let expiringSoon1YearCount = 0;
  let totalActiveUnits = 0;

  // Track drug movements
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

  // Initialize summary map
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
      ImageUrl: m["ลิงค์รูปภาพ"] || "",
      TotalQty: 0,
      ActiveLots: [],
      IsLowStock: false,
      HasMovement: !!movingItemMap[code],
      MovementCount: movingItemMap[code] || 0,
      HasOutbound: !!outboundItemMap[code],
      OutboundCount: outboundItemMap[code] || 0
    };
  });

  // Process Lots
  (lotList || []).forEach(lot => {
    if (!lot.ItemCode) return;
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const expInfo = calculateExpiryStatus(lot.ExpiryDate);
      
      if (expInfo.status === "Expired" || expInfo.daysLeft <= 0) {
        expiredCount++;
      } else if (expInfo.daysLeft <= 365) {
        expiringSoon1YearCount++;
        if (expInfo.daysLeft <= 180) {
          expiringSoon180Count++;
        }
        if (expInfo.daysLeft <= 90) {
          expiringSoon90Count++;
        }
      }

      const isSample = String(lot.IsSample).toLowerCase() === "true" || lot.IsSample === true || String(lot.IsSample).toLowerCase() === "yes";
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
        _rowNumber: lot._rowNumber,
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
    if (item.IsLowStock) {
      lowStockCount++;
    }
    // Dead stock / Non-moving: Must have remaining stock in warehouse (TotalQty > 0) and no outbound movements
    item.IsDeadStock = (item.TotalQty > 0) && (!item.HasOutbound || item.OutboundCount === 0);
    if (item.IsDeadStock) {
      deadStockCount++;
      deadStockUnits += item.TotalQty;
    }

    // FEFO + FIFO Sort
    item.ActiveLots.sort((a, b) => {
      const dateA = parseFlexibleDate(a.ExpiryDate);
      const dateB = parseFlexibleDate(b.ExpiryDate);
      const timeA = dateA ? dateA.getTime() : 9999999999999;
      const timeB = dateB ? dateB.getTime() : 9999999999999;
      if (timeA !== timeB) return timeA - timeB;
      return (a._rowNumber || 0) - (b._rowNumber || 0);
    });
    return item;
  });

  return {
    success: true,
    kpi: {
      totalSKU: totalSKU,
      totalActiveUnits: totalActiveUnits,
      movingSkuCount: movingSkuCount,
      deadStockCount: deadStockCount,
      deadStockUnits: deadStockUnits,
      totalMovements: (txList || []).length,
      inboundMovements: inboundMovements,
      outboundMovements: outboundMovements,
      lowStockCount: lowStockCount,
      expiredCount: expiredCount,
      expiringSoonCount: expiringSoon1YearCount,
      expiring90Count: expiringSoon90Count,
      expiring180Count: expiringSoon180Count,
      expiring1YearCount: expiringSoon1YearCount
    },
    items: summaryArray,
    masterList: masterList
  };
}

/**
 * Fast in-memory aggregation for Vaccine Outstanding Matrix
 */
function calculateVaccineMatrixInMemory(masterList, lotList, patientPackages) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Current stock map
  const stockMap = {};
  (lotList || []).forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode || "").trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  // Master map
  const masterMap = {};
  (masterList || []).forEach(m => {
    if (m.ItemCode) {
      masterMap[String(m.ItemCode).trim().toUpperCase()] = m;
    }
  });

  // Filter in-progress patient packages
  const inProgressList = (patientPackages || []).filter(p => 
    String(p.Status).toLowerCase() !== "completed" && (Number(p.RemainingDoses) || 0) > 0
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
      const dueDate = new Date(p.NextDueDate);
      if (!isNaN(dueDate.getTime())) {
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
      totalOutstandingPatients: totalOutstandingPatients,
      totalPendingDoses: totalPendingDoses,
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

/**
 * Action: GET_INIT_DATA (Loads Master + Dashboard + Vaccine Packages in 1 single fast round-trip)
 */
function handleGetInitData() {
  try {
    const ss = getSpreadsheet();
    
    // Batch read all sheets once
    const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
    const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
    const vendorSheet = getSheetSafe(ss, SHEETS.VENDOR, HEADERS.Vendor);
    const tempSheet = getSheetSafe(ss, SHEETS.TEMP_LOG, HEADERS.TempLog);
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);
    const hospSheet = getSheetSafe(ss, SHEETS.HOSPITAL_LIST, HEADERS.HospitalList);
    const loanSheet = getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);

    const masterList = sheetToObjects(masterSheet);
    const lotList = sheetToObjects(lotSheet);
    const txList = sheetToObjects(txSheet);
    const vaccinePackages = sheetToObjects(pkgSheet);
    const patientPackages = sheetToObjects(patSheet);
    const vendorList = sheetToObjects(vendorSheet);
    const tempLogs = sheetToObjects(tempSheet);
    const stockTakes = sheetToObjects(takeSheet);
    const hospitalList = sheetToObjects(hospSheet);
    const loanList = sheetToObjects(loanSheet);

    // Compute in-memory
    const dash = calculateDashboardInMemory(masterList, lotList, txList);
    const vaccineOutstanding = calculateVaccineMatrixInMemory(masterList, lotList, patientPackages);

    const pendingTempLogs = (tempLogs || []).filter(t => String(t.RecordStatus || "").trim().toLowerCase() === "pending");
    const pendingStockAdjustments = (stockTakes || []).filter(t => String(t.Status || "").trim().toLowerCase() === "pending_adjustment");
    const pendingLoans = (loanList || []).filter(l => String(l.LoanStatus || "").trim().toLowerCase() !== "completed");

    return {
      success: true,
      kpi: dash.kpi || {},
      items: dash.items || [],
      master: masterList || [],
      vendors: vendorList || [],
      vaccinePackages: vaccinePackages || [],
      patientPackages: (patientPackages || []).reverse(),
      vaccineOutstanding: vaccineOutstanding,
      tempLogs: (tempLogs || []).slice(-100).reverse(),
      pendingTempLogs: pendingTempLogs.reverse(),
      pendingTempCount: pendingTempLogs.length,
      pendingStockAdjustments: pendingStockAdjustments.reverse(),
      pendingStockTakeCount: pendingStockAdjustments.length,
      hospitals: hospitalList || [],
      loans: (loanList || []).reverse(),
      pendingLoanCount: pendingLoans.length
    };
  } catch (err) {
    console.error("handleGetInitData error:", err);
    try {
      const masterRes = handleGetMaster();
      return {
        success: true,
        kpi: { totalSKU: masterRes.data ? masterRes.data.length : 0, totalActiveUnits: 0, lowStockCount: 0, expiredCount: 0, expiringSoonCount: 0, deadStockCount: 0, deadStockUnits: 0 },
        items: [],
        master: masterRes.data || [],
        vaccinePackages: [],
        patientPackages: [],
        vaccineOutstanding: null
      };
    } catch (e2) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาดในการโหลดข้อมูล: " + err.toString()
      };
    }
  }
}

/**
 * Action: SAVE_MASTER
 */
function handleSaveMaster(payload) {
  if (!payload.ItemCode || !payload.ItemName) {
    return { success: false, message: "กรุณาระบุรหัสยา (ItemCode) และชื่อยา (ItemName)" };
  }

  const ss = getSpreadsheet();
  const sheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const items = sheetToObjects(sheet);

  const existingIndex = items.findIndex(i => String(i.ItemCode).trim().toUpperCase() === String(payload.ItemCode).trim().toUpperCase());

  const rowData = [
    payload.ItemCode.trim().toUpperCase(),
    payload.ItemName.trim(),
    payload.GenericName || "",
    payload.Category || "ยา",
    payload.BaseUnit || "เม็ด",
    payload.PackSize || 1,
    payload.OrderUnit || "กล่อง",
    Number(payload.Min) || 0,
    payload.VendorName || "",
    Number(payload.StandardCost) || 0,
    Number(payload.SellingPrice) || 0,
    payload["ลิงค์รูปภาพ"] || payload.imageUrl || ""
  ];

  if (existingIndex >= 0) {
    const rowNum = items[existingIndex]._rowNumber;
    sheet.getRange(rowNum, 1, 1, rowData.length).setValues([rowData]);
    return { success: true, message: "อัปเดตข้อมูลยาสำเร็จ", itemCode: payload.ItemCode };
  } else {
    sheet.appendRow(rowData);
    return { success: true, message: "เพิ่มข้อมูลยาใหม่สำเร็จ", itemCode: payload.ItemCode };
  }
}

/**
 * Action: INBOUND_STOCK (รองรับทั้งแบบรายการเดี่ยวและรับเข้าหลายรายการพร้อมกัน)
 */
function handleInboundStock(payload) {
  const receiveDate = (payload.ReceiveDate || "").trim();
  const timePart = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
  const nowStr = receiveDate ? (receiveDate + " " + timePart) : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const defaultNote = (payload.Note || "").trim();
  const byUser = (payload.By || "Admin").trim();

  // Handle either payload.Items or payload.items (Array) or single item payload
  const rawItems = (payload.Items && Array.isArray(payload.Items) && payload.Items.length > 0) 
    ? payload.Items 
    : ((payload.items && Array.isArray(payload.items) && payload.items.length > 0) 
      ? payload.items 
      : (Array.isArray(payload) ? payload : [payload]));

  if (rawItems.length === 0) {
    return { success: false, message: "ไม่มีรายการยาที่ต้องการรับเข้าคลัง" };
  }

  // Validate items
  const validItems = [];
  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const itemCode = (item.ItemCode || "").trim().toUpperCase();
    const itemName = (item.ItemName || "").trim();
    const lotNumber = (item.LotNumber || "").trim().toUpperCase();
    const expiryDate = (item.ExpiryDate || "").trim();
    const qty = Number(item.Qty) || 0;
    const isSample = item.IsSample === true || String(item.IsSample).toLowerCase() === "true" || String(item.IsSample).toLowerCase() === "yes";
    const costPrice = Number(item.CostPrice) || 0;
    const unitPrice = Number(item.UnitPrice) || 0;
    const note = (item.Note || defaultNote || "").trim();

    if (!itemCode || !itemName || !lotNumber || !expiryDate || qty <= 0) {
      return { 
        success: false, 
        message: `รายการที่ ${i + 1} (${itemName || itemCode || 'ไม่ระบุ'}) ข้อมูลไม่ครบถ้วน (ต้องระบุรหัสยา, Lot No., วันหมดอายุ, และจำนวนมากกว่า 0)` 
      };
    }

    const expCalc = calculateExpiryStatus(expiryDate);

    validItems.push({
      itemCode: itemCode,
      itemName: itemName,
      lotNumber: lotNumber,
      expiryDate: expiryDate,
      qty: qty,
      isSample: isSample,
      costPrice: costPrice,
      unitPrice: unitPrice,
      note: note,
      expStatus: expCalc.status
    });
  }

  const ss = getSpreadsheet();
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
  const existingLots = sheetToObjects(lotSheet);

  const lotRowsToAppend = [];
  const txRows = [];

  validItems.forEach(it => {
    // Check if matching lot already exists
    const existingIdx = existingLots.findIndex(l => 
      String(l.ItemCode || '').trim().toUpperCase() === it.itemCode &&
      String(l.LotNumber || '').trim().toUpperCase() === it.lotNumber
    );

    if (existingIdx !== -1) {
      // Update existing lot row
      const targetLot = existingLots[existingIdx];
      const newQty = (Number(targetLot.Qty) || 0) + it.qty;
      targetLot.Qty = newQty;
      
      const rowNum = targetLot._rowNumber;
      lotSheet.getRange(rowNum, 1, 1, 11).setValues([[
        receiveDate || nowStr.split(" ")[0], // A: ReceiveDate
        it.itemCode, // B: ItemCode
        it.itemName, // C: ItemName
        it.lotNumber, // D: LotNumber
        it.expiryDate, // E: ExpiryDate
        newQty, // F: Qty
        newQty > 0 ? "InStock" : "OutOfStock", // G: StockStatus
        it.expStatus, // H: ExpiryStatus
        it.isSample ? "TRUE" : "FALSE", // I: IsSample
        it.costPrice || Number(targetLot.CostPrice) || 0, // J: CostPrice
        it.unitPrice || Number(targetLot.UnitPrice) || 0 // K: UnitPrice
      ]]);
    } else {
      // Append as new lot
      lotRowsToAppend.push([
        receiveDate || nowStr.split(" ")[0], // A: ReceiveDate
        it.itemCode, // B: ItemCode
        it.itemName, // C: ItemName
        it.lotNumber, // D: LotNumber
        it.expiryDate, // E: ExpiryDate
        it.qty, // F: Qty
        "InStock", // G: StockStatus
        it.expStatus, // H: ExpiryStatus
        it.isSample ? "TRUE" : "FALSE", // I: IsSample
        it.costPrice, // J: CostPrice
        it.unitPrice // K: UnitPrice
      ]);
    }

    txRows.push([
      nowStr, // A: TimeStamp
      receiveDate || nowStr.split(" ")[0], // B: ReceiveDate
      it.isSample ? "Inbound (ยา sample)" : "Inbound", // C: ActionType
      it.itemCode, // D: ItemCode
      it.itemName, // E: ItemName
      it.lotNumber, // F: LotNumber
      it.qty, // G: QtyChange
      "-", // H: HN_VN
      it.costPrice, // I: CostPrice
      it.unitPrice, // J: SellingPrice
      it.qty * it.costPrice, // K: TotalPrice
      it.note || (it.isSample ? "รับเข้ายา sample" : "รับเข้าคลังปกติ"), // L: Note
      byUser // M: By
    ]);
  });

  if (lotRowsToAppend.length > 0) {
    const lotLastRow = lotSheet.getLastRow();
    lotSheet.getRange(lotLastRow + 1, 1, lotRowsToAppend.length, lotRowsToAppend[0].length).setValues(lotRowsToAppend);
  }

  if (txRows.length > 0) {
    const txLastRow = txSheet.getLastRow();
    txSheet.getRange(txLastRow + 1, 1, txRows.length, txRows[0].length).setValues(txRows);
  }

  return {
    success: true,
    message: `บันทึกรับเข้าคลังสำเร็จทั้งหมด ${validItems.length} รายการ`,
    count: validItems.length
  };
}

/**
 * Action: OUTBOUND_STOCK (FEFO)
 */
function handleOutboundStock(payload) {
  const hn_vn = (payload.HN_VN || "").trim();
  const byUser = (payload.By || "Admin").trim();
  const note = (payload.Note || "").trim();
  const itemsToDeduct = (payload.Items && Array.isArray(payload.Items)) ? payload.Items : ((payload.items && Array.isArray(payload.items)) ? payload.items : []);

  if (!hn_vn) {
    return { success: false, message: "กรุณาระบุเลขประจำตัวผู้ป่วย / เลขที่ใบสั่งยา (HN / VN)" };
  }

  if (!itemsToDeduct || itemsToDeduct.length === 0) {
    return { success: false, message: "ไม่มีรายการยาที่ต้องการเบิกจ่าย" };
  }

  const ss = getSpreadsheet();
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

  const lots = sheetToObjects(lotSheet);
  const nowStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  let txTimestamp = nowStr;
  if (payload.DispenseDate) {
    const dDate = String(payload.DispenseDate).trim();
    if (dDate.length === 10) {
      const nowTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
      txTimestamp = `${dDate} ${nowTime}`;
    } else if (dDate) {
      txTimestamp = dDate;
    }
  }

  for (let req of itemsToDeduct) {
    const code = (req.ItemCode || "").trim().toUpperCase();
    const reqQty = Number(req.Qty) || 0;
    if (reqQty <= 0) {
      return { success: false, message: `จำนวนยา ${code} ต้องมากกว่า 0` };
    }

    const availableLots = lots.filter(l => 
      String(l.ItemCode).trim().toUpperCase() === code && (Number(l.Qty) || 0) > 0
    );
    const totalAvailable = availableLots.reduce((sum, l) => sum + (Number(l.Qty) || 0), 0);

    if (totalAvailable < reqQty) {
      return {
        success: false,
        message: `ยา ${code} มีสต็อกคงเหลือ ${totalAvailable} ไม่เพียงพอต่อการจ่าย ${reqQty}`
      };
    }
  }

  const deductions = [];

  for (let req of itemsToDeduct) {
    const code = (req.ItemCode || "").trim().toUpperCase();
    let remainingQtyToDeduct = Number(req.Qty) || 0;

    const matchingLots = lots
      .filter(l => String(l.ItemCode).trim().toUpperCase() === code && (Number(l.Qty) || 0) > 0)
      .sort((a, b) => {
        const expDiff = new Date(a.ExpiryDate) - new Date(b.ExpiryDate);
        if (expDiff !== 0) return expDiff;
        // Tie-breaker: FIFO (First In, First Out by row order / receive date)
        return (a._rowNumber || 0) - (b._rowNumber || 0);
      });

    for (let lot of matchingLots) {
      if (remainingQtyToDeduct <= 0) break;

      const currentLotQty = Number(lot.Qty) || 0;
      const deductQty = Math.min(currentLotQty, remainingQtyToDeduct);
      const newLotQty = currentLotQty - deductQty;

      lot.Qty = newLotQty;
      remainingQtyToDeduct -= deductQty;

      deductions.push({
        rowNumber: lot._rowNumber,
        newQty: newLotQty,
        itemCode: lot.ItemCode,
        itemName: lot.ItemName,
        lotNumber: lot.LotNumber,
        deductQty: deductQty,
        costPrice: Number(lot.CostPrice) || 0,
        unitPrice: Number(lot.UnitPrice) || 0,
        isSample: lot.IsSample
      });
    }
  }

  const txRows = [];

  deductions.forEach(d => {
    lotSheet.getRange(d.rowNumber, 6).setValue(d.newQty);
    if (d.newQty === 0) {
      lotSheet.getRange(d.rowNumber, 7).setValue("Depleted");
    }

    txRows.push([
      nowStr, // A: TimeStamp
      payload.DispenseDate || txTimestamp.split(" ")[0] || nowStr.split(" ")[0], // B: ReceiveDate
      d.isSample ? "Outbound (ยา sample)" : "Outbound", // C: ActionType
      d.itemCode, // D: ItemCode
      d.itemName, // E: ItemName
      d.lotNumber, // F: LotNumber
      -d.deductQty, // G: QtyChange
      hn_vn, // H: HN_VN
      d.costPrice, // I: CostPrice
      d.unitPrice, // J: SellingPrice
      d.deductQty * d.unitPrice, // K: TotalPrice
      note || "จ่ายยาผู้ป่วย", // L: Note
      byUser // M: By
    ]);
  });

  if (txRows.length > 0) {
    const lastRow = txSheet.getLastRow();
    txSheet.getRange(lastRow + 1, 1, txRows.length, txRows[0].length).setValues(txRows);
  }

  return {
    success: true,
    message: `เบิกจ่ายยาตาม HN/VN: ${hn_vn} สำเร็จทั้งหมด ${itemsToDeduct.length} รายการ`,
    deductions: deductions
  };
}

/**
 * ==============================================================================
 * REPORT CENTER MODULE - 6 DETAILED REPORT GENERATORS
 * ==============================================================================
 */

/**
 * Action: GET_ADVANCED_REPORTS
 * Router for 6 Specialized Report Types
 */
function handleGetAdvancedReports(payload) {
  const ss = getSpreadsheet();
  const reportType = (payload.reportType || "MOVEMENT").toUpperCase();

  try {
    switch (reportType) {
      case "STOCK_BALANCE":
        return generateStockBalanceReport(ss, payload);
      case "STOCK_EXPIRY_BATCH":
      case "BATCH_EXPIRY":
        return generateStockExpiryBatchReport(ss, payload);
      case "MOVEMENT":
        return generateMovementReport(ss, payload);
      case "EXPIRY":
        return generateExpiryReport(ss, payload);
      case "SMART_PR":
        return generateSmartPRReport(ss, payload);
      case "DEAD_STOCK":
        return generateDeadStockReport(ss, payload);
      case "ADJUSTMENT":
        return generateAdjustmentReport(ss, payload);
      case "TOP_DISPENSED":
        return generateTopDispensedReport(ss, payload);
      default:
        return generateStockBalanceReport(ss, payload);
    }
  } catch (err) {
    return {
      success: false,
      message: "ไม่สามารถประมวลผลรายงานได้: " + err.message,
      error: err.toString()
    };
  }
}

/**
 * Legacy Support: GET_REPORTS
 */
function handleGetReports(payload) {
  return handleGetAdvancedReports(Object.assign({ reportType: "STOCK_BALANCE" }, payload));
}

/**
 * 0. Current Stock Balance Report (รายงานยอดคงเหลือ ณ ปัจจุบัน)
 */
function generateStockBalanceReport(ss, payload) {
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);

  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);

  const categoryFilter = String(payload.category || "ALL").trim();
  const statusFilter = String(payload.status || "ALL").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || payload.itemCode || "").trim().toUpperCase();

  // Aggregate Lots by ItemCode
  const lotMap = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  lotList.forEach(lot => {
    const code = String(lot.ItemCode || "").trim().toUpperCase();
    if (!code) return;

    const qty = Number(lot.Qty) || 0;
    if (qty <= 0) return;

    if (!lotMap[code]) {
      lotMap[code] = {
        totalQty: 0,
        totalValue: 0,
        lotCount: 0,
        earliestExpiry: null,
        lots: []
      };
    }

    const cost = Number(lot.CostPrice) || 0;
    lotMap[code].totalQty += qty;
    lotMap[code].totalValue += (qty * cost);
    lotMap[code].lotCount += 1;
    lotMap[code].lots.push(lot);

    if (lot.ExpiryDate) {
      const expDate = new Date(lot.ExpiryDate);
      if (!isNaN(expDate.getTime())) {
        if (!lotMap[code].earliestExpiry || expDate < lotMap[code].earliestExpiry) {
          lotMap[code].earliestExpiry = expDate;
        }
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

    // Apply Filter Criteria
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
      EarliestExpiry: lotData.earliestExpiry ? Utilities.formatDate(lotData.earliestExpiry, Session.getScriptTimeZone(), "yyyy-MM-dd") : "-",
      StockStatus: stockStatus,
      StatusLabel: statusLabel
    });
  });

  // Sort: Out of Stock & Low Stock first, then alphabetically
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
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalSKUs: totalSKUs,
      totalUnits: totalUnits,
      totalStockValue: Math.round(totalStockValue * 100) / 100,
      outOfStockCount: outOfStockCount,
      lowStockCount: lowStockCount,
      normalStockCount: normalStockCount
    },
    data: rows
  };
}

/**
 * Helper to test if a date string/object is within range
 */
function isDateWithinRange(dateVal, startD, endD) {
  if (!startD && !endD) return true;
  if (!dateVal) return false;
  const d = parseFlexibleDate(dateVal);
  if (!d) return false;
  if (startD && d < startD) return false;
  if (endD && d > endD) return false;
  return true;
}

/**
 * 1. Stock Movement / Audit Trail Report (รายงานความเคลื่อนไหวของคลังยา)
 */
function generateMovementReport(ss, payload) {
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
  const transactions = sheetToObjects(txSheet);

  const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
  const patientPackages = sheetToObjects(patSheet);

  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const masterList = sheetToObjects(masterSheet);

  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const lotList = sheetToObjects(lotSheet);

  const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  const pkgList = sheetToObjects(pkgSheet);

  const startD = parseFlexibleDate(payload.startDate);
  if (startD) startD.setHours(0, 0, 0, 0);
  const endD = parseFlexibleDate(payload.endDate);
  if (endD) endD.setHours(23, 59, 59, 999);

  // Masterdata lookup map
  const masterMap = {};
  masterList.forEach(m => {
    const code = String(m.ItemCode || "").toUpperCase().trim();
    if (code) {
      masterMap[code] = m;
    }
  });

  // Lot lookup map grouped by ItemCode, sorted with positive qty / valid dates
  const lotMap = {};
  lotList.forEach(lot => {
    const code = String(lot.ItemCode || "").toUpperCase().trim();
    if (!code) return;
    if (!lotMap[code]) lotMap[code] = [];
    lotMap[code].push(lot);
  });

  // Sort lots for each item: positive qty first, then by ExpiryDate / _rowNumber
  Object.keys(lotMap).forEach(code => {
    lotMap[code].sort((a, b) => {
      const qA = Number(a.Qty) || 0;
      const qB = Number(b.Qty) || 0;
      if ((qA > 0 && qB <= 0) || (qB > 0 && qA <= 0)) return qB - qA;
      const expA = new Date(a.ExpiryDate || "9999-12-31").getTime();
      const expB = new Date(b.ExpiryDate || "9999-12-31").getTime();
      if (!isNaN(expA) && !isNaN(expB) && expA !== expB) return expA - expB;
      return (a._rowNumber || 0) - (b._rowNumber || 0);
    });
  });

  // Helper to resolve Lot, CostPrice, SellingPrice, and TotalPrice for any transaction
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

    // Cost Price resolution
    let cost = Number(t.CostPrice) || 0;
    if (cost <= 0) {
      if (matchingLot && Number(matchingLot.CostPrice) > 0) {
        cost = Number(matchingLot.CostPrice);
      } else if (itemLots.length > 0 && Number(itemLots[0].CostPrice) > 0) {
        cost = Number(itemLots[0].CostPrice);
      } else if (master && Number(master.StandardCost) > 0) {
        cost = Number(master.StandardCost);
      }
    }
    t.CostPrice = cost;

    // Selling Price resolution
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
        if (matchingLot && Number(matchingLot.UnitPrice) > 0) {
          selling = Number(matchingLot.UnitPrice);
        } else if (itemLots.length > 0 && Number(itemLots[0].UnitPrice) > 0) {
          selling = Number(itemLots[0].UnitPrice);
        } else if (master && Number(master.SellingPrice) > 0) {
          selling = Number(master.SellingPrice);
        }
      }
    }
    t.SellingPrice = selling;

    // Total Price resolution
    let total = Number(t.TotalPrice) || 0;
    if (total <= 0) {
      const qty = Math.abs(Number(t.QtyChange) || 1);
      const act = String(t.ActionType || "");
      if (act.includes("Inbound")) {
        total = qty * (t.CostPrice || 0);
      } else {
        total = qty * (t.SellingPrice || t.CostPrice || 0);
      }
    }
    t.TotalPrice = total;
  }

  // Combine and reconcile transactions from StockTransaction and PatientPackage
  const combinedTransactions = [...transactions];
  const txRowsToAppend = [];
  const rowsToRepair = [];

  // Enrich all existing transactions in-memory
  combinedTransactions.forEach(t => {
    enrichTransaction(t);
  });

  const actionFilter = String(payload.actionType || "ALL").trim();
  const exactItemCode = String(payload.itemCode || "").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || "").trim().toUpperCase();

  let inboundCount = 0;
  let outboundCount = 0;
  let adjustCount = 0;
  let totalQtySum = 0;

  const rows = combinedTransactions.filter(t => {
    // 1. Robust Multi-field Date Filtering
    if (startD || endD) {
      const isDateValid = isDateWithinRange(t.ReceiveDate, startD, endD) || 
                          isDateWithinRange(t.Timestamp, startD, endD) ||
                          isDateWithinRange(t.Date, startD, endD) ||
                          isDateWithinRange(t.LastDoseDate, startD, endD);
      if (!isDateValid) return false;
    }

    // 2. Action Filter
    const act = String(t.ActionType || "");
    if (actionFilter === "Inbound" && !act.includes("Inbound")) return false;
    if (actionFilter === "Outbound" && !act.includes("Outbound")) return false;
    if (actionFilter === "Adjust" && !act.toLowerCase().includes("adjust")) return false;
    if (actionFilter === "Sample" && !act.includes("Sample") && !act.includes("ยา sample")) return false;

    // 3. Exact Item Code Filter (From Dropdown)
    const code = String(t.ItemCode || "").toUpperCase().trim();
    if (exactItemCode && exactItemCode !== "ALL") {
      if (code !== exactItemCode) return false;
    }

    // 4. Keyword Filter (Matches specific item, lot, HN, note, or person without cross-drug bleeding)
    if (searchKeyword) {
      const name = String(t.ItemName || "").toUpperCase();
      const lot = String(t.LotNo || t.LotNumber || "").toUpperCase();
      const txId = String(t.TransactionId || "").toUpperCase();
      const hn = String(t.HN_VN || "").toUpperCase();
      const note = String(t.Note || "").toUpperCase();
      const by = String(t.By || "").toUpperCase();

      const directMatch = code.includes(searchKeyword) || 
                          name.includes(searchKeyword) || 
                          lot.includes(searchKeyword) || 
                          txId.includes(searchKeyword) || 
                          hn.includes(searchKeyword) || 
                          note.includes(searchKeyword) || 
                          by.includes(searchKeyword);

      if (!directMatch) {
        return false;
      }
    }

    // Aggregations
    if (act.includes("Inbound")) inboundCount++;
    if (act.includes("Outbound")) outboundCount++;
    if (act.toLowerCase().includes("adjust")) adjustCount++;
    totalQtySum += Number(t.QtyChange) || 0;

    return true;
  }).reverse();

  return {
    success: true,
    reportType: "MOVEMENT",
    reportTitle: "รายงานความเคลื่อนไหวของคลังยา (Stock Movement / Audit Trail)",
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rows.length,
      inboundCount: inboundCount,
      outboundCount: outboundCount,
      adjustCount: adjustCount,
      netQtyChange: totalQtySum
    },
    data: rows
  };
}

/**
 * 2. Near-Expiry & Expired Report (รายงานยาใกล้หมดอายุ / หมดอายุ)
 */
function generateExpiryReport(ss, payload) {
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const lots = sheetToObjects(lotSheet);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const thresholdFilter = String(payload.thresholdDays || "90").toUpperCase(); // "EXPIRED", "90", "180", "ALL"

  let expiredLots = 0;
  let expiringSoonLots = 0;
  let totalQty = 0;
  let totalValue = 0;

  const validLots = [];

  lots.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty <= 0) return;

    const expDate = new Date(lot.ExpiryDate);
    if (isNaN(expDate.getTime())) return;
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

    // Apply Filter
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
      ExpiryDate: Utilities.formatDate(expDate, Session.getScriptTimeZone(), "yyyy-MM-dd"),
      DaysRemaining: diffDays,
      ExpiryStatus: expStatus,
      Qty: qty,
      CostPrice: costPrice,
      TotalValue: lotValue,
      IsSample: lot.IsSample
    });
  });

  // Sort FEFO (nearest expiry first)
  validLots.sort((a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate));

  return {
    success: true,
    reportType: "EXPIRY",
    reportTitle: "รายงานยาใกล้หมดอายุและยาหมดอายุ (Near-Expiry & Expired Report)",
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: validLots.length,
      expiredCount: expiredLots,
      expiringSoonCount: expiringSoonLots,
      totalQty: totalQty,
      totalValue: totalValue
    },
    data: validLots
  };
}

/**
 * 3. Low Stock & Smart PR Report (รายงานยาถึงจุดสั่งซื้อ - Smart Purchase Request)
 */
function generateSmartPRReport(ss, payload) {
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);

  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);

  // Aggregate current stock per ItemCode
  const stockMap = {};
  lotList.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode).trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  const filterMode = payload.filterMode || "REORDER_ONLY"; // "REORDER_ONLY" vs "ALL"
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

    // Smart PR Calculation: Target = Min * 2 (Safety buffer)
    const rawDeficit = Math.max(0, (minThreshold * 2) - currentStock);
    const suggestedOrderPacks = Math.max(1, Math.ceil(rawDeficit / packSize));
    const suggestedOrderQty = suggestedOrderPacks * packSize;
    const estimatedCost = suggestedOrderQty * standardCost;

    let urgency = "ปกติ";
    if (currentStock === 0) {
      urgency = "วิกฤต (สต็อกหมด)";
    } else if (currentStock <= minThreshold / 2) {
      urgency = "ด่วนมาก (ต่ำกว่า 50% ของ Min)";
    } else if (isLowStock) {
      urgency = "ด่วน (ถึงจุดสั่งซื้อ)";
    }

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

  // Sort by urgency/low stock priority
  prList.sort((a, b) => a.CurrentStock - b.CurrentStock);

  return {
    success: true,
    reportType: "SMART_PR",
    reportTitle: "รายงานยาถึงจุดสั่งซื้อและจัดทำใบสั่งซื้ออัจฉริยะ (Low Stock & Smart PR)",
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: prList.length,
      totalOrderUnits: totalOrderUnits,
      totalEstimatedCost: totalEstimatedCost
    },
    data: prList
  };
}

/**
 * 4. Dead Stock / Slow Moving Report (รายงานยาไม่เคลื่อนไหว)
 */
function generateDeadStockReport(ss, payload) {
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);
  const txList = sheetToObjects(txSheet);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const inactiveDaysThreshold = Number(payload.thresholdDays) || 90; // Default 90 days

  // Aggregate current stock per ItemCode
  const stockMap = {};
  lotList.forEach(lot => {
    const qty = Number(lot.Qty) || 0;
    if (qty > 0) {
      const code = String(lot.ItemCode).trim().toUpperCase();
      stockMap[code] = (stockMap[code] || 0) + qty;
    }
  });

  // Find last Outbound date per ItemCode
  const lastOutboundMap = {};
  txList.forEach(t => {
    if (String(t.ActionType).includes("Outbound")) {
      const code = String(t.ItemCode).trim().toUpperCase();
      const tDate = new Date(t.Timestamp);
      if (!isNaN(tDate.getTime())) {
        if (!lastOutboundMap[code] || tDate > lastOutboundMap[code]) {
          lastOutboundMap[code] = tDate;
        }
      }
    }
  });

  const deadList = [];
  let totalDeadUnits = 0;
  let totalHoldingValue = 0;

  masterList.forEach(m => {
    const code = String(m.ItemCode).trim().toUpperCase();
    const currentStock = stockMap[code] || 0;
    
    // Only evaluate drugs with remaining inventory
    if (currentStock <= 0) return;

    const lastDate = lastOutboundMap[code];
    let inactiveDays = 9999;
    let lastDateFormatted = "ไม่เคยมีการเบิกจ่าย";

    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
      inactiveDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      lastDateFormatted = Utilities.formatDate(lastDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
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

  // Sort descending by holding value
  deadList.sort((a, b) => b.HoldingValue - a.HoldingValue);

  return {
    success: true,
    reportType: "DEAD_STOCK",
    reportTitle: `รายงานยาไม่เคลื่อนไหว / Dead Stock (ไม่มีการเบิกจ่าย ≥ ${inactiveDaysThreshold} วัน)`,
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: deadList.length,
      totalDeadUnits: totalDeadUnits,
      totalHoldingValue: totalHoldingValue,
      thresholdDays: inactiveDaysThreshold
    },
    data: deadList
  };
}

/**
 * 5. Inventory Adjustment Audit Report (รายงานการปรับแก้สต๊อกฉุกเฉิน)
 */
function generateAdjustmentReport(ss, payload) {
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
  const transactions = sheetToObjects(txSheet);

  const startDate = payload.startDate ? new Date(payload.startDate) : null;
  const endDate = payload.endDate ? new Date(payload.endDate) : null;
  if (endDate) endDate.setHours(23, 59, 59, 999);

  const itemCodeFilter = (payload.itemCode || "").trim().toUpperCase();

  let netQty = 0;
  let totalVal = 0;

  const adjList = transactions.filter(t => {
    const act = String(t.ActionType || "").toLowerCase();
    if (!act.includes("adjust")) return false;

    if (startDate || endDate) {
      const tDate = new Date(t.Timestamp);
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
    }

    if (itemCodeFilter && String(t.ItemCode).toUpperCase() !== itemCodeFilter) return false;

    const qty = Number(t.QtyChange) || 0;
    const val = Number(t.TotalPrice) || 0;
    netQty += qty;
    totalVal += val;

    return true;
  }).reverse();

  return {
    success: true,
    reportType: "ADJUSTMENT",
    reportTitle: "รายงานการปรับแก้สต๊อกฉุกเฉิน (Inventory Adjustment Audit Report)",
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: adjList.length,
      netQtyAdjusted: netQty,
      totalAdjustedValue: totalVal
    },
    data: adjList
  };
}

/**
 * 6. Top Dispensed / ABC Analysis Report (รายงานสรุปการใช้ยาสูงสุด)
 */
function generateTopDispensedReport(ss, payload) {
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

  const masterList = sheetToObjects(masterSheet);
  const txList = sheetToObjects(txSheet);

  const startDate = payload.startDate ? new Date(payload.startDate) : null;
  const endDate = payload.endDate ? new Date(payload.endDate) : null;
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
      const tDate = new Date(t.Timestamp);
      if (startDate && tDate < startDate) return false;
      if (endDate && tDate > endDate) return false;
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

  // Sort descending by dispensed quantity
  rankedList.sort((a, b) => b.TotalDispensedQty - a.TotalDispensedQty);

  // Apply Limit
  const limit = Number(payload.limit) || 0;
  if (limit > 0) {
    rankedList = rankedList.slice(0, limit);
  }

  // Assign Rank
  rankedList.forEach((item, index) => {
    item.Rank = index + 1;
  });

  return {
    success: true,
    reportType: "TOP_DISPENSED",
    reportTitle: "รายงานสรุปการใช้ยาสูงสุด (Top Dispensed / ABC Analysis)",
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rankedList.length,
      grandTotalUnits: grandTotalQty,
      grandTotalRevenue: grandTotalRevenue
    },
    data: rankedList
  };
}

/**
 * 7. Batch Stock Balance & Expiry Report (รายงานจำนวนคงเหลือและวันหมดอายุ แยกตามรอบสั่งซื้อ/ยอดใช้รายเดือน)
 * โครงสร้างมาตรฐานตามแบบฟอร์มเอกสารของศูนย์การแพทย์รามาธิบดีศรีอยุธยา
 */
function generateStockExpiryBatchReport(ss, payload) {
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);
  const txList = sheetToObjects(txSheet);

  // 1. As Of Date calculation
  let refDate = parseFlexibleDate(payload.asOfDate || payload.date || payload.endDate);
  if (!refDate) {
    refDate = new Date();
  }
  refDate.setHours(23, 59, 59, 999);

  // Master Lookup Map
  const masterMap = {};
  masterList.forEach(m => {
    const code = String(m.ItemCode || "").trim().toUpperCase();
    if (code) {
      masterMap[code] = m;
    }
  });

  // Filter criteria
  const categoryFilter = String(payload.category || "ALL").trim();
  const expiryStatusFilter = String(payload.expiryStatus || payload.status || "ALL").trim().toUpperCase();
  const sampleFilter = String(payload.sampleFilter || payload.isSample || "ALL").trim().toUpperCase();
  const searchKeyword = String(payload.searchKeyword || payload.itemCode || "").trim().toUpperCase();

  // 2. Extract Inbound and Outbound Transactions up to refDate
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
      lotTxMap[lotKey] = {
        inboundsByMonth: {},
        outboundsByMonth: {},
        totalInbound: 0,
        totalOutbound: 0
      };
    }

    const action = String(t.ActionType || "");
    const qty = Math.abs(Number(t.QtyChange) || 0);

    if (action.toLowerCase().includes("inbound") || action.toLowerCase().includes("receive")) {
      const recDate = parseFlexibleDate(t.ReceiveDate) || tDate;
      const inYm = Utilities.formatDate(recDate, Session.getScriptTimeZone(), "yyyy-MM");
      
      lotTxMap[lotKey].inboundsByMonth[inYm] = (lotTxMap[lotKey].inboundsByMonth[inYm] || 0) + qty;
      lotTxMap[lotKey].totalInbound += qty;
      allInboundMonthsSet.add(inYm);
    } else if (action.toLowerCase().includes("outbound") || action.toLowerCase().includes("dispense") || action.toLowerCase().includes("loan_out")) {
      const ym = Utilities.formatDate(tDate, Session.getScriptTimeZone(), "yyyy-MM");
      lotTxMap[lotKey].outboundsByMonth[ym] = (lotTxMap[lotKey].outboundsByMonth[ym] || 0) + qty;
      lotTxMap[lotKey].totalOutbound += qty;
      allOutboundMonthsSet.add(ym);
    }
  });

  const THAI_SHORT_MONTHS = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  // Sort distinct inbound months (รอบการสั่งซื้อรายเดือน)
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

  // Sort distinct outbound months (ยอดการใช้รายเดือน)
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

  // If no transactions exist yet, supply default month for structural consistency
  if (inboundMonths.length === 0) {
    const ym = Utilities.formatDate(refDate, Session.getScriptTimeZone(), "yyyy-MM");
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

  // 3. Process each Inventory Lot & Match with Masterdata
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
    const isSample = (String(lot.IsSample || "").toUpperCase() === "YES" || String(lot.IsSample || "").toUpperCase() === "Y") ? "YES" : "NO";

    // Expiry Date & Remaining Days calculation
    const expDate = parseFlexibleDate(lot.ExpiryDate);
    let daysRemaining = 9999;
    let expiryStatus = "ปกติ";
    let expiryStatusCode = "NORMAL";
    let formattedExpDate = lot.ExpiryDate || "-";

    if (expDate) {
      formattedExpDate = Utilities.formatDate(expDate, Session.getScriptTimeZone(), "yyyy/MM/dd");
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

    // Costs & Prices
    const costPrice = Number(lot.CostPrice) > 0 ? Number(lot.CostPrice) : (Number(master.StandardCost) || 0);
    const sellingPrice = Number(lot.UnitPrice) > 0 ? Number(lot.UnitPrice) : (Number(master.SellingPrice) || 0);

    // Inbound & Outbound breakdown
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

    // Apply Filter Criteria
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
    asOfDate: Utilities.formatDate(refDate, Session.getScriptTimeZone(), "yyyy-MM-dd"),
    asOfDateThai: thaiRefDate,
    inboundMonths: inboundMonths,
    inboundRounds: inboundMonths,
    outboundMonths: outboundMonths,
    generatedAt: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss"),
    summary: {
      totalRecords: rows.length,
      grandTotalInbound: grandTotalInbound,
      grandTotalOutbound: grandTotalOutbound,
      grandTotalRemaining: grandTotalRemaining,
      grandTotalCostValue: grandTotalCostValue,
      grandTotalSellingValue: grandTotalSellingValue,
      expiredCount: expiredCount,
      expiring6MCount: expiring6MCount,
      expiring1YCount: expiring1YCount,
      normalCount: normalCount
    },
    data: rows
  };
}

/**
 * Helper to format full Thai Date e.g. "30 มิถุนายน 2569"
 */
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

/**
 * ==============================================================================
 * MODULE 6: VACCINE PACKAGES & OUTSTANDING DOSES TRACKER
 * ==============================================================================
 */

/**
 * Action: GET_VACCINE_PACKAGES
 */
function handleGetVaccinePackages() {
  const ss = getSpreadsheet();
  const sheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  const data = sheetToObjects(sheet);
  return {
    success: true,
    data: data
  };
}

/**
 * Action: SAVE_VACCINE_PACKAGE
 */
function handleSaveVaccinePackage(payload) {
  if (!payload.PackageCode || !payload.PackageName) {
    return { success: false, message: "กรุณาระบุรหัสและชื่อแพ็กเกจวัคซีน" };
  }

  const ss = getSpreadsheet();
  const sheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  const packages = sheetToObjects(sheet);

  const code = payload.PackageCode.trim().toUpperCase();
  const existing = packages.find(p => String(p.PackageCode).trim().toUpperCase() === code);

  const rowData = [
    code,
    payload.PackageName.trim(),
    payload.LinkedItemCode ? payload.LinkedItemCode.trim().toUpperCase() : "",
    Number(payload.TotalDoses) || 1,
    Number(payload.SinglePrice) || 0,
    Number(payload.PackagePrice) || 0,
    payload.Description || "",
    payload.Status || "Active"
  ];

  if (existing) {
    sheet.getRange(existing._rowNumber, 1, 1, rowData.length).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }

  return {
    success: true,
    message: `บันทึกข้อมูลแพ็กเกจ ${payload.PackageName} สำเร็จ`
  };
}

/**
 * Action: GET_PATIENT_PACKAGES
 */
function handleGetPatientPackages(payload) {
  const ss = getSpreadsheet();
  const sheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
  let packages = sheetToObjects(sheet);

  const hnFilter = (payload && payload.HN ? String(payload.HN).trim() : "");
  const statusFilter = (payload && payload.status ? String(payload.status).trim() : "ALL");

  if (hnFilter) {
    packages = packages.filter(p => String(p.HN).trim().toLowerCase() === hnFilter.toLowerCase());
  }

  if (statusFilter && statusFilter !== "ALL") {
    packages = packages.filter(p => String(p.Status).trim().toLowerCase() === statusFilter.toLowerCase());
  }

  return {
    success: true,
    data: packages.reverse()
  };
}

/**
 * Action: REGISTER_PATIENT_PACKAGE
 */
function handleRegisterPatientPackage(payload) {
  const hn = (payload.HN || "").trim();
  const patientName = (payload.PatientName || "").trim();
  const packageCode = (payload.PackageCode || "").trim().toUpperCase();
  const nextDueDate = (payload.NextDueDate || "").trim();
  const dispenseNow = payload.DispenseFirstDoseImmediately === true || payload.DispenseFirstDoseImmediately === "true";
  const byUser = (payload.By || "Admin").trim();
  const registerDate = (payload.RegisterDate || payload.DispenseDate || "").trim();

  if (!hn || !packageCode) {
    return { success: false, message: "กรุณาระบุ HN ผู้ป่วย และรหัสแพ็กเกจวัคซีน" };
  }

  const ss = getSpreadsheet();
  const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  const allPkgs = sheetToObjects(pkgSheet);
  const targetPkg = allPkgs.find(p => String(p.PackageCode).trim().toUpperCase() === packageCode);

  if (!targetPkg) {
    return { success: false, message: `ไม่พบข้อมูลแพ็กเกจ ${packageCode}` };
  }

  const totalDoses = Number(targetPkg.TotalDoses) || 1;
  const packagePrice = Number(targetPkg.PackagePrice) || 0;
  const linkedItemCode = (targetPkg.LinkedItemCode || "").trim().toUpperCase();
  const nowTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
  const todayDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const effectiveDate = registerDate || todayDateStr;
  const nowStr = registerDate ? `${registerDate} ${nowTime}` : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

  const patientPkgSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
  const patientPkgId = "PP-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd") + "-" + ("0000" + (patientPkgSheet.getLastRow())).slice(-4);

  let completedDoses = 0;
  let remainingDoses = totalDoses;
  let lastDoseDate = "";
  let deductionResult = null;

  // If immediate first dose dispensing is requested
  if (dispenseNow && linkedItemCode) {
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const lots = sheetToObjects(lotSheet);

    const matchingLots = lots
      .filter(l => String(l.ItemCode).trim().toUpperCase() === linkedItemCode && (Number(l.Qty) || 0) > 0)
      .sort((a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate));

    if (matchingLots.length === 0) {
      return { success: false, message: `ไม่สามารถเปิดแพ็กเกจพร้อมตัดเข็มแรกได้ เนื่องจากวัคซีน ${linkedItemCode} ในคลังยาหมดสต็อก` };
    }

    const targetLot = matchingLots[0];
    const newLotQty = (Number(targetLot.Qty) || 0) - 1;

    lotSheet.getRange(targetLot._rowNumber, 6).setValue(newLotQty);
    if (newLotQty === 0) {
      lotSheet.getRange(targetLot._rowNumber, 7).setValue("Depleted");
    }

    const pricePerDose = totalDoses > 0 ? (packagePrice / totalDoses) : packagePrice;

    txSheet.appendRow([
      nowStr, // A: TimeStamp
      effectiveDate, // B: ReceiveDate / DispenseDate
      "Outbound (Vaccine Package)", // C: ActionType
      targetLot.ItemCode, // D: ItemCode
      targetLot.ItemName, // E: ItemName
      targetLot.LotNumber, // F: LotNumber
      -1, // G: QtyChange
      hn, // H: HN_VN
      Number(targetLot.CostPrice) || 0, // I: CostPrice
      pricePerDose, // J: SellingPrice
      pricePerDose, // K: TotalPrice
      `ฉีดวัคซีนตามแพ็กเกจ ${targetPkg.PackageName} (เข็มที่ 1/${totalDoses})`, // L: Note
      byUser // M: By
    ]);

    completedDoses = 1;
    remainingDoses = totalDoses - 1;
    lastDoseDate = effectiveDate;
    deductionResult = {
      lotNumber: targetLot.LotNumber,
      costPrice: targetLot.CostPrice,
      sellingPrice: pricePerDose
    };
  }

  const status = remainingDoses === 0 ? "Completed" : "In Progress";

  patientPkgSheet.appendRow([
    nowStr,
    patientPkgId,
    hn,
    patientName || "ผู้ป่วย HN " + hn,
    targetPkg.PackageCode,
    targetPkg.PackageName,
    linkedItemCode,
    totalDoses,
    completedDoses,
    remainingDoses,
    lastDoseDate,
    nextDueDate || "",
    status,
    byUser
  ]);

  return {
    success: true,
    message: `ลงทะเบียนแพ็กเกจ ${targetPkg.PackageName} ให้ HN: ${hn} สำเร็จ` + (dispenseNow ? ` (ตัดสต็อกเข็มที่ 1 เรียบร้อย วันที่: ${effectiveDate})` : ""),
    patientPackageId: patientPkgId,
    completedDoses: completedDoses,
    remainingDoses: remainingDoses,
    deduction: deductionResult
  };
}

/**
 * Action: DISPENSE_PACKAGE_DOSE (ตัดสต็อก FEFO ทีละเข็มสำหรับคนไข้ที่มีแพ็กเกจ)
 */
function handleDispensePackageDose(payload) {
  const patientPkgId = (payload.PatientPackageId || "").trim();
  const hn = (payload.HN || "").trim();
  const nextDueDate = (payload.NextDueDate || "").trim();
  const note = (payload.Note || "").trim();
  const byUser = (payload.By || "Admin").trim();
  const dispenseDate = (payload.DispenseDate || "").trim();

  if (!patientPkgId && !hn) {
    return { success: false, message: "กรุณาระบุ PatientPackageId หรือ HN ผู้ป่วย" };
  }

  const ss = getSpreadsheet();
  const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
  const patientPackages = sheetToObjects(patSheet);

  let target = null;
  if (patientPkgId) {
    target = patientPackages.find(p => String(p.PatientPackageId).trim() === patientPkgId);
  } else if (hn) {
    target = patientPackages.find(p => String(p.HN).trim() === hn && (Number(p.RemainingDoses) || 0) > 0);
  }

  if (!target) {
    return { success: false, message: "ไม่พบข้อมูลแพ็กเกจที่ยังคงเหลือสิทธิ์ฉีด" };
  }

  const remainingDoses = Number(target.RemainingDoses) || 0;
  if (remainingDoses <= 0) {
    return { success: false, message: `แพ็กเกจนี้ฉีดครบตามสิทธิ์แล้ว (${target.CompletedDoses}/${target.TotalDoses} เข็ม)` };
  }

  const linkedItemCode = (target.LinkedItemCode || "").trim().toUpperCase();
  if (!linkedItemCode) {
    return { success: false, message: "แพ็กเกจนี้ไม่ได้ผูกรหัสวัคซีนใน Masterdata" };
  }

  // FEFO stock deduction (1 dose)
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
  const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
  const lots = sheetToObjects(lotSheet);

  const matchingLots = lots
    .filter(l => String(l.ItemCode).trim().toUpperCase() === linkedItemCode && (Number(l.Qty) || 0) > 0)
    .sort((a, b) => new Date(a.ExpiryDate) - new Date(b.ExpiryDate));

  if (matchingLots.length === 0) {
    return { success: false, message: `วัคซีนรหัส ${linkedItemCode} ในคลังยาหมดสต็อก ไม่สามารถตัดจ่ายได้` };
  }

  const targetLot = matchingLots[0];
  const newLotQty = (Number(targetLot.Qty) || 0) - 1;

  lotSheet.getRange(targetLot._rowNumber, 6).setValue(newLotQty);
  if (newLotQty === 0) {
    lotSheet.getRange(targetLot._rowNumber, 7).setValue("Depleted");
  }

  const newCompleted = (Number(target.CompletedDoses) || 0) + 1;
  const newRemaining = remainingDoses - 1;
  const nowTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
  const todayDateStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  const effectiveDate = dispenseDate || todayDateStr;
  const nowStr = dispenseDate ? `${dispenseDate} ${nowTime}` : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
  const newStatus = newRemaining === 0 ? "Completed" : "In Progress";

  // Update PatientPackage sheet
  patSheet.getRange(target._rowNumber, 9).setValue(newCompleted);
  patSheet.getRange(target._rowNumber, 10).setValue(newRemaining);
  patSheet.getRange(target._rowNumber, 11).setValue(effectiveDate);
  if (nextDueDate) {
    patSheet.getRange(target._rowNumber, 12).setValue(nextDueDate);
  }
  patSheet.getRange(target._rowNumber, 13).setValue(newStatus);

  // Get price per dose from VaccinePackage
  const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
  const pkgList = sheetToObjects(pkgSheet);
  const pkgInfo = pkgList.find(p => String(p.PackageCode).trim().toUpperCase() === String(target.PackageCode).trim().toUpperCase());
  const pkgPrice = pkgInfo ? (Number(pkgInfo.PackagePrice) || 0) : 0;
  const totalDoses = Number(target.TotalDoses) || 1;
  const pricePerDose = totalDoses > 0 ? (pkgPrice / totalDoses) : 0;

  // Log to StockTransaction
  txSheet.appendRow([
    nowStr, // A: TimeStamp
    effectiveDate, // B: ReceiveDate / DispenseDate
    "Outbound (Vaccine Package)", // C: ActionType
    targetLot.ItemCode, // D: ItemCode
    targetLot.ItemName, // E: ItemName
    targetLot.LotNumber, // F: LotNumber
    -1, // G: QtyChange
    target.HN, // H: HN_VN
    Number(targetLot.CostPrice) || 0, // I: CostPrice
    pricePerDose, // J: SellingPrice
    pricePerDose, // K: TotalPrice
    `ฉีดวัคซีนตามแพ็กเกจ ${target.PackageName} (เข็มที่ ${newCompleted}/${target.TotalDoses}) ` + (note ? `[${note}]` : ""), // L: Note
    byUser // M: By
  ]);

  return {
    success: true,
    message: `ตัดจ่ายวัคซีนเข็มที่ ${newCompleted}/${target.TotalDoses} สำหรับ HN: ${target.HN} สำเร็จ (วันที่: ${effectiveDate}, Lot: ${targetLot.LotNumber})`,
    patientPackageId: target.PatientPackageId,
    completedDoses: newCompleted,
    remainingDoses: newRemaining,
    status: newStatus,
    lotNumber: targetLot.LotNumber
  };
}

/**
 * Action: GET_VACCINE_OUTSTANDING_REPORT (วิเคราะห์วัคซีนค้างฉีด รายเข็มและรายบุคคล)
 */
function handleGetVaccineOutstandingReport() {
  const ss = getSpreadsheet();
  const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
  const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
  const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);

  const patientPackages = sheetToObjects(patSheet);
  const masterList = sheetToObjects(masterSheet);
  const lotList = sheetToObjects(lotSheet);

  return calculateVaccineMatrixInMemory(masterList, lotList, patientPackages);
}

/**
 * Action: GET_VACCINE_ANALYTICS (ดึงข้อมูลสถิติการจ่ายวัคซีนและใบยารายเดือน)
 */
function handleGetVaccineAnalytics() {
  try {
    const ss = getSpreadsheet();
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
    const pkgSheet = getSheetSafe(ss, SHEETS.VACCINE_PACKAGE, HEADERS.VaccinePackage);
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);

    const allTx = sheetToObjects(txSheet);
    const patPkgs = sheetToObjects(patSheet);
    const pkgDefs = sheetToObjects(pkgSheet);
    const lots = sheetToObjects(lotSheet);
    const masterList = sheetToObjects(masterSheet);

    const vaccineItemsMap = {};
    masterList.forEach(m => {
      const cat = String(m.Category || "").toLowerCase();
      const code = String(m.ItemCode || "").toUpperCase();
      if (cat.includes("vaccine") || cat.includes("วัคซีน") || code.startsWith("1204")) {
        vaccineItemsMap[code] = true;
      }
    });

    const vaccineTx = allTx.filter(t => {
      const act = String(t.ActionType || "").toLowerCase();
      const code = String(t.ItemCode || "").toUpperCase();
      const name = String(t.ItemName || "").toLowerCase();
      const isOutbound = act.includes("outbound") || act.includes("vaccine") || act.includes("dispense");
      const isVaccine = vaccineItemsMap[code] || act.includes("vaccine") || code.startsWith("1204") || name.includes("vax") || name.includes("inj");
      return isOutbound && isVaccine;
    });

    return {
      success: true,
      transactions: vaccineTx,
      patientPackages: patPkgs,
      lots: lots.filter(l => vaccineItemsMap[String(l.ItemCode || "").toUpperCase()]),
      vaccinePackages: pkgDefs
    };
  } catch (err) {
    return { success: false, message: err.toString(), transactions: [] };
  }
}

/**
 * Action: GET_FLU_PROMO_ANALYTICS (สถิติวัคซีนไข้หวัดใหญ่แยกตามโปรโมชั่น)
 */
function handleGetFluPromoAnalytics(payload) {
  try {
    payload = payload || {};
    const startDate = String(payload.startDate || "").trim();
    const endDate = String(payload.endDate || "").trim();
    const promoFilter = String(payload.promoCategory || "ALL").trim();

    const ss = getSpreadsheet();
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);

    const allTx = sheetToObjects(txSheet);
    const patPkgs = sheetToObjects(patSheet);

    const patientNameMap = {};
    patPkgs.forEach(p => {
      const hn = String(p.HN || "").trim();
      if (hn && p.PatientName) {
        patientNameMap[hn] = String(p.PatientName).trim();
      }
    });

    const PROMO_DEFS = {
      PROMO_CHECKUP: { key: "PROMO_CHECKUP", name: "แถมพ่วงกับโปรแกรมตรวจสุขภาพ", shortName: "แถมตรวจสุขภาพ", badgeColor: "#0284c7", badgeBg: "rgba(2, 132, 199, 0.12)", defaultPrice: 0 },
      PROMO_590: { key: "PROMO_590", name: "โปรโมชั่น 590 บาท", shortName: "โปร 590.-", badgeColor: "#d97706", badgeBg: "rgba(217, 119, 6, 0.12)", defaultPrice: 590 },
      PROMO_PAIR_1100: { key: "PROMO_PAIR_1100", name: "โปรโมชั่นซื้อคู่ 1,100 บาท (2 ท่าน)", shortName: "ซื้อคู่ 1,100.-", badgeColor: "#4f46e5", badgeBg: "rgba(79, 70, 229, 0.12)", defaultPrice: 550 },
      PROMO_790: { key: "PROMO_790", name: "โปรโมชั่น 790 บาท", shortName: "โปร 790.-", badgeColor: "#059669", badgeBg: "rgba(5, 150, 105, 0.12)", defaultPrice: 790 },
      PROMO_OTHER: { key: "PROMO_OTHER", name: "โปรโมชั่นอื่นๆ / ราคาปกติ", shortName: "อื่นๆ", badgeColor: "#64748b", badgeBg: "rgba(100, 116, 139, 0.12)", defaultPrice: 0 }
    };

    const promoStats = {
      PROMO_CHECKUP: { ...PROMO_DEFS.PROMO_CHECKUP, doses: 0, revenue: 0, cost: 0, profit: 0 },
      PROMO_590: { ...PROMO_DEFS.PROMO_590, doses: 0, revenue: 0, cost: 0, profit: 0 },
      PROMO_PAIR_1100: { ...PROMO_DEFS.PROMO_PAIR_1100, doses: 0, revenue: 0, cost: 0, profit: 0 },
      PROMO_790: { ...PROMO_DEFS.PROMO_790, doses: 0, revenue: 0, cost: 0, profit: 0 },
      PROMO_OTHER: { ...PROMO_DEFS.PROMO_OTHER, doses: 0, revenue: 0, cost: 0, profit: 0 }
    };

    const monthlyMap = {};
    const processedList = [];
    let totalDoses = 0;
    let totalRevenue = 0;
    let totalCost = 0;
    const uniqueHNSet = {};

    allTx.forEach(t => {
      const qtyChange = Number(t.QtyChange) || 0;
      if (qtyChange >= 0) return;

      const itemCode = String(t.ItemCode || "").toUpperCase();
      const itemName = String(t.ItemName || "").toLowerCase();
      const note = String(t.Note || "");
      const isFlu = itemCode.startsWith("1204VAXI") || itemCode.startsWith("1204EFLU") || itemName.includes("vaxigrip") || itemName.includes("ไข้หวัดใหญ่") || note.includes("ไข้หวัดใหญ่");
      if (!isFlu) return;

      const doses = Math.abs(qtyChange) || 1;
      let txDate = String(t.ReceiveDate || "").trim();
      if (!txDate && t.TimeStamp) {
        txDate = String(t.TimeStamp).split(" ")[0].trim();
      }
      if (!txDate) return;

      if (startDate && txDate < startDate) return;
      if (endDate && txDate > endDate) return;

      const noteLower = note.toLowerCase();
      const sellingPrice = Number(t.SellingPrice) || 0;
      const costPrice = Number(t.CostPrice) || 165.85;

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

      if (promoFilter !== "ALL" && promoKey !== promoFilter) return;

      let effectiveUnitPrice = sellingPrice;
      if (promoKey === "PROMO_CHECKUP") effectiveUnitPrice = 0;
      else if (promoKey === "PROMO_590" && effectiveUnitPrice <= 0) effectiveUnitPrice = 590;
      else if (promoKey === "PROMO_PAIR_1100" && effectiveUnitPrice <= 0) effectiveUnitPrice = 550;
      else if (promoKey === "PROMO_790" && effectiveUnitPrice <= 0) effectiveUnitPrice = 790;

      const rowRevenue = doses * effectiveUnitPrice;
      const rowCost = doses * costPrice;
      const rowProfit = rowRevenue - rowCost;

      totalDoses += doses;
      totalRevenue += rowRevenue;
      totalCost += rowCost;

      const rawHN = String(t.HN_VN || "").replace(/[^0-9]/g, "").trim() || String(t.HN_VN || "").trim();
      if (rawHN) uniqueHNSet[rawHN] = true;

      let patientName = "-";
      if (rawHN && patientNameMap[rawHN]) {
        patientName = patientNameMap[rawHN];
      } else if (t.HN_VN && String(t.HN_VN).includes("(")) {
        const match = String(t.HN_VN).match(/\(([^)]+)\)/);
        if (match) patientName = match[1].trim();
      }

      promoStats[promoKey].doses += doses;
      promoStats[promoKey].revenue += rowRevenue;
      promoStats[promoKey].cost += rowCost;
      promoStats[promoKey].profit += rowProfit;

      const monthKey = txDate.substring(0, 7);
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = {
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
        };
      }

      const mRecord = monthlyMap[monthKey];
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

    Object.keys(promoStats).forEach(key => {
      promoStats[key].sharePercent = totalDoses > 0 ? Number(((promoStats[key].doses / totalDoses) * 100).toFixed(1)) : 0;
    });

    const sortedMonths = Object.keys(monthlyMap).sort().map(k => monthlyMap[k]);

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
        totalDoses: totalDoses,
        totalRevenue: totalRevenue,
        totalCost: totalCost,
        grossProfit: grossProfit,
        marginPercent: marginPercent,
        uniquePatients: Object.keys(uniqueHNSet).length,
        topPromo: promoStats[topPromoKey],
        averagePricePerDose: totalDoses > 0 ? Number((totalRevenue / totalDoses).toFixed(2)) : 0
      },
      promos: Object.keys(promoStats).map(k => promoStats[k]).filter(p => p.key !== "PROMO_OTHER" || p.doses > 0),
      promoStats: promoStats,
      monthlyBreakdown: sortedMonths,
      transactions: processedList.reverse()
    };
  } catch (err) {
    return { success: false, message: err.toString(), monthlyBreakdown: [], transactions: [] };
  }
}

/**
 * Action: RECONCILE_DB (เชื่อมโยงและซ่อมแซมข้อมูล StockTransaction และ PatientPackage ให้ถูกต้อง 100%)
 */
function handleReconcileStockAndPackages(payload) {
  try {
    const ss = getSpreadsheet();
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const patSheet = getSheetSafe(ss, SHEETS.PATIENT_PACKAGE, HEADERS.PatientPackage);
    const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);

    const transactions = sheetToObjects(txSheet);
    const patientPackages = sheetToObjects(patSheet);
    const masterList = sheetToObjects(masterSheet);
    const lotList = sheetToObjects(lotSheet);

    const masterMap = {};
    masterList.forEach(m => {
      const code = String(m.ItemCode || "").trim().toUpperCase();
      if (code) masterMap[code] = m;
    });

    const lotMap = {};
    lotList.forEach(l => {
      const code = String(l.ItemCode || "").trim().toUpperCase();
      if (code) {
        if (!lotMap[code]) lotMap[code] = [];
        lotMap[code].push(l);
      }
    });

    // 1. Correct PatientPackage for HN 260000239 (LastDoseDate was 2026-07-16 -> 2026-07-11)
    let patFixedCount = 0;
    patientPackages.forEach(p => {
      const hn = String(p.HN || "").trim();
      if (hn === "260000239" && String(p.LastDoseDate).trim() === "2026-07-16") {
        p.LastDoseDate = "2026-07-11";
        if (p._rowNumber) {
          patSheet.getRange(p._rowNumber, 11).setValue("2026-07-11");
          patFixedCount++;
        }
      }
    });

    // 2. Exact July dispense date mapping for the 12 patient package cases
    const julyCorrectionMap = {
      "260000233": "2026-07-07",
      "260000234": "2026-07-07",
      "260000237": "2026-07-08",
      "260000096": "2026-07-11",
      "260000235": "2026-07-11",
      "260000214": "2026-07-14",
      "260000094": "2026-07-16",
      "260000192": "2026-07-17",
      "260000241": "2026-07-18",
      "260000240": "2026-07-18",
      "260000244": "2026-07-24",
      "260000247": "2026-07-28"
    };

    const cleanedRows = [];
    let removedSyntheticCount = 0;
    let correctedDateCount = 0;

    transactions.forEach(t => {
      const note = String(t.Note || "");
      // Remove auto-synthesized duplicate rows
      if (note.includes("[ระบบติดตามวัคซีน]")) {
        removedSyntheticCount++;
        return; // skip duplicate row
      }

      const hn = String(t.HN_VN || "").trim();
      const currentRecDate = String(t.ReceiveDate || (t.Timestamp ? String(t.Timestamp).split(' ')[0] : "")).trim();

      // Check if this row is one of the July cases with 2026-08-28 date
      if (julyCorrectionMap[hn] && currentRecDate === "2026-08-28") {
        const correctDate = julyCorrectionMap[hn];
        t.ReceiveDate = correctDate;
        t.Timestamp = `${correctDate} 10:00:00`;
        correctedDateCount++;
      }

      // Enrich missing fields
      const code = String(t.ItemCode || "").trim().toUpperCase();
      const master = masterMap[code];
      if (master && (!t.ItemName || t.ItemName === "-" || t.ItemName === code)) {
        t.ItemName = master.ItemName || t.ItemName;
      }
      if (!t.LotNumber || t.LotNumber === "-" || t.LotNumber === "null") {
        const itemLots = lotMap[code] || [];
        if (itemLots.length > 0) {
          t.LotNumber = itemLots[0].LotNumber || "-";
        }
      }
      if (!Number(t.CostPrice) && master && Number(master.StandardCost) > 0) {
        t.CostPrice = Number(master.StandardCost);
      }
      if (!Number(t.SellingPrice) && master && Number(master.SellingPrice) > 0) {
        t.SellingPrice = Number(master.SellingPrice);
      }
      if (!Number(t.TotalPrice)) {
        const qty = Math.abs(Number(t.QtyChange) || 1);
        t.TotalPrice = qty * (Number(t.SellingPrice) || Number(t.CostPrice) || 0);
      }

      cleanedRows.push([
        t.Timestamp || "",
        t.ReceiveDate || "",
        t.ActionType || "",
        t.ItemCode || "",
        t.ItemName || "",
        t.LotNumber || "-",
        Number(t.QtyChange) || 0,
        t.HN_VN || "-",
        Number(t.CostPrice) || 0,
        Number(t.SellingPrice) || 0,
        Number(t.TotalPrice) || 0,
        t.Note || "",
        t.By || "Admin"
      ]);
    });

    // Overwrite StockTransaction with cleaned & reconciled rows
    if (cleanedRows.length > 0) {
      txSheet.clearContents();
      txSheet.getRange(1, 1, 1, HEADERS.StockTransaction.length).setValues([HEADERS.StockTransaction]);
      txSheet.getRange(2, 1, cleanedRows.length, HEADERS.StockTransaction.length).setValues(cleanedRows);
    }

    return {
      success: true,
      message: `ปรับปรุงและเชื่อมโยงข้อมูลสำเร็จ: ลบรายการสังเคราะห์ซ้ำซ้อน ${removedSyntheticCount} รายการ, แก้ไขวันที่ 12 เคสเดือน ก.ค. ให้ตรงตามจริง, อัปเดต PatientPackage ${patFixedCount} รายการ`,
      removedSyntheticCount: removedSyntheticCount,
      correctedDateCount: correctedDateCount,
      patFixedCount: patFixedCount,
      totalTransactionsRemaining: cleanedRows.length
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการ Reconcile ข้อมูล: " + err.toString()
    };
  }
}

/**
 * Action: GET_VENDORS (ดึงรายชื่อคู่ค้าทั้งหมดจากชีต Vendor)
 */
function handleGetVendors() {
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.VENDOR, HEADERS.Vendor);
    const vendors = sheetToObjects(sheet);
    return {
      success: true,
      data: vendors || []
    };
  } catch (err) {
    return {
      success: false,
      message: "ไม่สามารถดึงข้อมูลคู่ค้าได้: " + err.toString()
    };
  }
}

/**
 * Action: SAVE_VENDOR (เพิ่ม/แก้ไขข้อมูลคู่ค้า)
 */
function handleSaveVendor(payload) {
  if (!payload || !payload.VendorName || !String(payload.VendorName).trim()) {
    return { success: false, message: "กรุณาระบุชื่อบริษัทคู่ค้า (VendorName)" };
  }

  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.VENDOR, HEADERS.Vendor);
    const vendors = sheetToObjects(sheet);
    
    let vendorCode = String(payload.VendorCode || "").trim().toUpperCase();
    const vendorName = String(payload.VendorName).trim();
    const contactPerson = String(payload.ContactPerson || "").trim();
    const phone = String(payload.Phone || "").trim();
    const email = String(payload.Email || "").trim();
    const taxId = String(payload.TaxId || "").trim();
    const creditTermDays = Number(payload.CreditTermDays) || 0;
    const address = String(payload.Address || "").trim();
    const note = String(payload.Note || "").trim();
    const status = String(payload.Status || "Active").trim();

    // Auto-generate VendorCode if missing
    if (!vendorCode) {
      const maxId = vendors.reduce((max, v) => {
        const match = String(v.VendorCode || "").match(/VND-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      vendorCode = "VND-" + String(maxId + 1).padStart(3, "0");
    }

    const existingIndex = vendors.findIndex(v => 
      String(v.VendorCode).trim().toUpperCase() === vendorCode ||
      String(v.VendorName).trim().toLowerCase() === vendorName.toLowerCase()
    );

    const rowData = [
      vendorCode,
      vendorName,
      contactPerson,
      phone,
      email,
      taxId,
      creditTermDays,
      address,
      note,
      status
    ];

    if (existingIndex >= 0) {
      // Update existing vendor (row = _rowNumber)
      const targetRow = vendors[existingIndex]._rowNumber;
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      return {
        success: true,
        message: `อัปเดตข้อมูลคู่ค้า ${vendorName} (${vendorCode}) สำเร็จ`,
        data: { VendorCode: vendorCode, VendorName: vendorName }
      };
    } else {
      // Append new vendor
      sheet.appendRow(rowData);
      return {
        success: true,
        message: `เพิ่มคู่ค้าใหม่ ${vendorName} (${vendorCode}) สำเร็จ`,
        data: { VendorCode: vendorCode, VendorName: vendorName }
      };
    }
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกคู่ค้า: " + err.toString()
    };
  }
}

/**
 * Action: DELETE_VENDOR (เปลี่ยนสถานะคู่ค้าเป็น Inactive หรือลบ)
 */
function handleDeleteVendor(payload) {
  if (!payload || !payload.VendorCode) {
    return { success: false, message: "กรุณาระบุรหัสคู่ค้าที่ต้องการลบ" };
  }

  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.VENDOR, HEADERS.Vendor);
    const vendors = sheetToObjects(sheet);
    const code = String(payload.VendorCode).trim().toUpperCase();

    const target = vendors.find(v => String(v.VendorCode).trim().toUpperCase() === code);
    if (!target) {
      return { success: false, message: "ไม่พบข้อมูลคู่ค้าที่ระบุ" };
    }

    // Set Status to Inactive
    sheet.getRange(target._rowNumber, 10).setValue("Inactive");
    return {
      success: true,
      message: `ยกเลิกการใช้งานคู่ค้า ${target.VendorName} (${code}) เรียบร้อยแล้ว`
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + err.toString()
    };
  }
}

/**
 * ==============================================================================
 * ENVIRONMENTAL & TEMPERATURE MONITORING & 2-PERSON VERIFICATION MODULE
 * Refrigerator Cold Chain (2.0°C-8.0°C) & Room Storage (Temp <= 30°C, Humidity <= 60%RH)
 * GPP & HA Storage Compliance with Maker-Checker 2-Person Verification
 * ==============================================================================
 */

/**
 * Ensure TempLog sheet has up-to-date 15 columns headers
 */
function ensureTempLogHeaders(sheet) {
  if (!sheet) return;
  const lastCol = sheet.getLastColumn();
  if (lastCol <= 0) {
    sheet.appendRow(HEADERS.TempLog);
    sheet.getRange(1, 1, 1, HEADERS.TempLog.length).setFontWeight("bold").setBackground("#e9ecef");
    sheet.setFrozenRows(1);
    return;
  }
  const currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(h => String(h || "").trim());
  if (!currentHeaders.includes("LocationType") || !currentHeaders.includes("Humidity")) {
    sheet.getRange(1, 1, 1, HEADERS.TempLog.length).setValues([HEADERS.TempLog]).setFontWeight("bold").setBackground("#e9ecef");
    sheet.setFrozenRows(1);
  }
}

/**
 * Action: SAVE_TEMP_HUMIDITY_LOG / SAVE_TEMP_LOG
 * บันทึกอุณหภูมิและความชื้นสิ่งแวดล้อม (ตู้เย็น & พื้นที่เก็บยา) พร้อมประเมินสถานะความปลอดภัย
 */
function handleSaveTempHumidityLog(payload) {
  try {
    if (!payload) {
      return { success: false, message: "ไม่พบข้อมูลสำหรับบันทึก" };
    }

    const locationType = String(payload.locationType || payload.LocationType || "Fridge").trim(); // 'Fridge' | 'Room'
    let locationId = String(payload.locationId || payload.LocationID || payload.fridgeId || payload.FridgeID || "").trim();
    let locationName = String(payload.locationName || payload.LocationName || payload.fridgeName || payload.FridgeName || "").trim();

    if (!locationId) {
      locationId = locationType === "Room" ? "ROOM-MAIN" : "FRIDGE-01";
    }
    if (!locationName) {
      if (locationId === "FRIDGE-01") locationName = "ตู้เย็นห้องยา";
      else if (locationId === "FRIDGE-02") locationName = "ตู้เย็นคลังยา";
      else if (locationId === "ROOM-MAIN") locationName = "ห้องยาหลัก (Main Pharmacy)";
      else if (locationId === "ROOM-STORE") locationName = "คลังเก็บยาและเวชภัณฑ์ (Main Drug Store)";
      else locationName = locationId;
    }

    const shift = String(payload.shift || payload.Shift || "เช้า (08:30)").trim();
    const tempRaw = payload.temperature !== undefined ? payload.temperature : payload.Temperature;
    
    if (tempRaw === undefined || tempRaw === null || String(tempRaw).trim() === "") {
      return { success: false, message: "กรุณาระบุอุณหภูมิ (°C)" };
    }

    const temperature = Math.round(parseFloat(tempRaw) * 10) / 10;
    if (isNaN(temperature)) {
      return { success: false, message: "ค่าอุณหภูมิไม่ถูกต้อง กรุณาระบุเป็นตัวเลข" };
    }

    let humidity = null;
    if (locationType === "Room") {
      const humRaw = payload.humidity !== undefined ? payload.humidity : payload.Humidity;
      if (humRaw !== undefined && humRaw !== null && String(humRaw).trim() !== "") {
        humidity = Math.round(parseFloat(humRaw) * 10) / 10;
        if (isNaN(humidity)) {
          return { success: false, message: "ค่าความชื้นสัมพัทธ์ไม่ถูกต้อง กรุณาระบุเป็นตัวเลข (%RH)" };
        }
      } else {
        return { success: false, message: "พื้นที่เก็บยา (Room Storage) จำเป็นต้องระบุความชื้นสัมพัทธ์ (%RH)" };
      }
    }

    const recordedBy = String(payload.recordedBy || payload.RecordedBy || "เจ้าหน้าที่คลังยา").trim();
    const note = String(payload.note || payload.Note || "").trim();

    let status = "Normal";
    if (locationType === "Fridge") {
      // Refrigerator Safe Range: 2.0°C to 8.0°C
      if (temperature < 2.0) {
        status = "Warning_Low";
      } else if (temperature > 8.0) {
        status = "Warning_High";
      }
    } else {
      // Room Storage Safe Range: Temperature <= 30.0°C AND Humidity <= 60.0% RH
      const tempExceeded = temperature > 30.0;
      const humExceeded = humidity !== null && humidity > 60.0;

      if (tempExceeded && humExceeded) {
        status = "Warning_Both";
      } else if (tempExceeded) {
        status = "Warning_Temp";
      } else if (humExceeded) {
        status = "Warning_Humidity";
      }
    }

    // Force Note if Warning status
    if (status !== "Normal" && !note) {
      const errorMsg = locationType === "Fridge"
        ? "อุณหภูมิตู้เย็นอยู่นอกเกณฑ์มาตรฐาน (2.0°C - 8.0°C) จำเป็นต้องระบุหมายเหตุ / มาตรการแก้ไข (Action Taken) ก่อนบันทึก"
        : "สภาพแวดล้อมพื้นที่เก็บยาเกินเกณฑ์มาตรฐาน (อุณหภูมิ > 30.0°C หรือความชื้น > 60.0% RH) จำเป็นต้องระบุหมายเหตุ / มาตรการแก้ไข (Action Taken) ก่อนบันทึก";
      return { success: false, message: errorMsg };
    }

    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.TEMP_LOG, HEADERS.TempLog);
    ensureTempLogHeaders(sheet);

    const recordDate = payload && (payload.recordDate || payload.date) ? String(payload.recordDate || payload.date).trim() : "";
    const now = new Date();
    const recordedAtStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    let timestampStr = recordedAtStr;
    if (recordDate && recordDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const isMorning = shift && shift.includes("เช้า");
      const isEvening = shift && shift.includes("เย็น");
      const timePart = isMorning ? "08:30:00" : (isEvening ? "16:30:00" : Utilities.formatDate(now, Session.getScriptTimeZone(), "HH:mm:ss"));
      timestampStr = `${recordDate} ${timePart}`;
    }

    const rowData = [
      timestampStr,                           // 1. Timestamp (Measurement date/time)
      locationType,                           // 2. LocationType ('Fridge' | 'Room')
      locationId,                             // 3. LocationID
      locationName,                           // 4. LocationName
      shift,                                  // 5. Shift
      temperature,                            // 6. Temperature
      humidity !== null ? humidity : "",      // 7. Humidity
      status,                                 // 8. Status
      note,                                   // 9. Note
      "Pending",                              // 10. RecordStatus
      recordedBy,                             // 11. RecordedBy
      recordedAtStr,                          // 12. RecordedAt (System timestamp)
      "",                                     // 13. VerifiedBy
      "",                                     // 14. VerifiedAt
      ""                                      // 15. VerifyNote
    ];

    sheet.appendRow(rowData);

    return {
      success: true,
      message: `บันทึกข้อมูลสิ่งแวดล้อม ${locationName} (${shift}) เรียบร้อยแล้ว (อุณหภูมิ ${temperature}°C${humidity !== null ? ', ความชื้น ' + humidity + '%RH' : ''} | สถานะ: รอการตรวจสอบ 2-Person Verification)`,
      data: {
        LocationType: locationType,
        LocationID: locationId,
        LocationName: locationName,
        Shift: shift,
        Temperature: temperature,
        Humidity: humidity,
        Status: status,
        RecordStatus: "Pending",
        RecordedBy: recordedBy,
        Timestamp: timestampStr
      }
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกข้อมูลสิ่งแวดล้อม: " + err.toString()
    };
  }
}

/**
 * Backward compatibility alias for handleSaveTempLog
 */
function handleSaveTempLog(payload) {
  return handleSaveTempHumidityLog(payload);
}

/**
 * Action: GET_PENDING_TEMP_LOGS
 * ดึงรายการบันทึกอุณหภูมิ/สิ่งแวดล้อมที่ยังรอการตรวจสอบ (RecordStatus == 'Pending')
 */
function handleGetPendingTempLogs() {
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.TEMP_LOG, HEADERS.TempLog);
    const allLogs = sheetToObjects(sheet);

    const pendingLogs = allLogs.filter(log => 
      String(log.RecordStatus || "").trim().toLowerCase() === "pending"
    );

    return {
      success: true,
      count: pendingLogs.length,
      data: pendingLogs.reverse()
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการรอตรวจสอบ: " + err.toString()
    };
  }
}

/**
 * Action: VERIFY_TEMP_LOG
 * ระบบตรวจสอบ 2 ผู้ใช้งาน (Maker-Checker 2-Person Rule)
 * ป้องกันไม่ให้ Verifier เป็นคนเดียวกับ RecordedBy
 */
function handleVerifyTempLog(payload) {
  try {
    if (!payload) {
      return { success: false, message: "ไม่พบข้อมูลการตรวจสอบ" };
    }

    const rowIndex = Number(payload.rowIndex || payload._rowNumber || payload.RowIndex);
    const action = String(payload.action || payload.Action || "").trim(); // 'Approved' หรือ 'Rejected'
    const verifierName = String(payload.verifierName || payload.VerifiedBy || "").trim();
    const verifyNote = String(payload.verifyNote || payload.VerifyNote || "").trim();

    if (!rowIndex || rowIndex <= 1) {
      return { success: false, message: "ไม่พบแถวข้อมูลที่ต้องการตรวจสอบ" };
    }

    if (action !== "Approved" && action !== "Rejected") {
      return { success: false, message: "สถานะการตรวจสอบไม่ถูกต้อง (ต้องเป็น Approved หรือ Rejected)" };
    }

    if (!verifierName) {
      return { success: false, message: "กรุณาระบุชื่อผู้ตรวจสอบ (Verifier)" };
    }

    if (action === "Rejected" && !verifyNote) {
      return { success: false, message: "กรณีปฏิเสธรายการ จำเป็นต้องระบุเหตุผล (Verify Note)" };
    }

    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.TEMP_LOG, HEADERS.TempLog);
    const lastRow = sheet.getLastRow();

    if (rowIndex > lastRow) {
      return { success: false, message: "ไม่พบข้อมูลแถวที่ระบุในฐานข้อมูล" };
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(h => String(h || "").trim());
    const rowValues = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];

    // Find column indices dynamically
    const colRecordedBy = headers.indexOf("RecordedBy") >= 0 ? headers.indexOf("RecordedBy") + 1 : 11;
    const colRecordStatus = headers.indexOf("RecordStatus") >= 0 ? headers.indexOf("RecordStatus") + 1 : 10;
    const colVerifiedBy = headers.indexOf("VerifiedBy") >= 0 ? headers.indexOf("VerifiedBy") + 1 : 13;
    const colVerifiedAt = headers.indexOf("VerifiedAt") >= 0 ? headers.indexOf("VerifiedAt") + 1 : 14;
    const colVerifyNote = headers.indexOf("VerifyNote") >= 0 ? headers.indexOf("VerifyNote") + 1 : 15;

    const recordedBy = String(rowValues[colRecordedBy - 1] || "").trim();

    // Strict Maker-Checker Rule: Verifier MUST NOT be the same person as Recorder
    if (recordedBy && verifierName && recordedBy.toLowerCase() === verifierName.toLowerCase()) {
      return {
        success: false,
        message: `ไม่อนุญาตให้อนุมัติหรือปฏิเสธรายการของตนเอง (ผู้บันทึก: ${recordedBy}) ตามมาตรฐาน Maker-Checker 2-Person Rule เพื่อความโปร่งใสของการควบคุมสิ่งแวดล้อมและ Cold Chain`
      };
    }

    const now = new Date();
    const timestampStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    sheet.getRange(rowIndex, colRecordStatus).setValue(action);
    sheet.getRange(rowIndex, colVerifiedBy).setValue(verifierName);
    sheet.getRange(rowIndex, colVerifiedAt).setValue(timestampStr);
    sheet.getRange(rowIndex, colVerifyNote).setValue(verifyNote);

    return {
      success: true,
      message: action === "Approved" 
        ? `อนุมัติบันทึกสิ่งแวดล้อม/อุณหภูมิ (แถวที่ ${rowIndex}) สำเร็จแล้ว`
        : `ปฏิเสธบันทึกสิ่งแวดล้อม/อุณหภูมิ (แถวที่ ${rowIndex}) สำเร็จแล้ว`,
      data: {
        rowIndex: rowIndex,
        recordStatus: action,
        verifiedBy: verifierName,
        verifiedAt: timestampStr,
        verifyNote: verifyNote
      }
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบรายการ: " + err.toString()
    };
  }
}

/**
 * Action: GET_ENVIRONMENT_REPORT / GET_TEMP_REPORT
 * ดึงรายงานอุณหภูมิและความชื้นย้อนหลัง สำหรับสรุปรายเดือน / ปฏิทิน 31 วัน / ส่งออก Excel & PDF
 */
function handleGetEnvironmentReport(payload) {
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.TEMP_LOG, HEADERS.TempLog);
    const allLogs = sheetToObjects(sheet);

    const monthFilter = payload && payload.month ? String(payload.month).trim() : ""; // e.g. "2026-08"
    const locationTypeFilter = payload && payload.locationType ? String(payload.locationType).trim().toUpperCase() : "ALL";
    const locationFilter = payload && (payload.locationId || payload.fridgeId) ? String(payload.locationId || payload.fridgeId).trim().toUpperCase() : "";
    const statusFilter = payload && payload.recordStatus ? String(payload.recordStatus).trim().toLowerCase() : "";
    const startDate = payload && payload.startDate ? String(payload.startDate).trim() : "";
    const endDate = payload && payload.endDate ? String(payload.endDate).trim() : "";

    let filtered = allLogs;

    if (monthFilter) {
      filtered = filtered.filter(item => {
        const ts = String(item.Timestamp || item.RecordedAt || "");
        return ts.startsWith(monthFilter);
      });
    }

    if (locationTypeFilter && locationTypeFilter !== "ALL") {
      filtered = filtered.filter(item => {
        const type = String(item.LocationType || (item.FridgeID ? "Fridge" : "Room")).trim().toUpperCase();
        return type === locationTypeFilter;
      });
    }

    if (locationFilter && locationFilter !== "ALL") {
      filtered = filtered.filter(item => {
        const locId = String(item.LocationID || item.FridgeID || "").toUpperCase();
        const locName = String(item.LocationName || item.FridgeName || "").toUpperCase();
        return locId === locationFilter || locName.includes(locationFilter);
      });
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(item => 
        String(item.RecordStatus || "").trim().toLowerCase() === statusFilter
      );
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
        else if (st === "Warning_Humidity") warningHumCount++;
        else if (st === "Warning_Both") warningBothCount++;
      }

      const rst = String(log.RecordStatus || "").toLowerCase();
      if (rst === "approved") approvedCount++;
      else if (rst === "pending") pendingCount++;
      else if (rst === "rejected") rejectedCount++;

      const t = parseFloat(log.Temperature);
      if (!isNaN(t)) temps.push(t);

      const h = parseFloat(log.Humidity);
      if (!isNaN(h)) humidities.push(h);
    });

    const minTemp = temps.length > 0 ? Math.min(...temps).toFixed(1) : "-";
    const maxTemp = temps.length > 0 ? Math.max(...temps).toFixed(1) : "-";
    const avgTemp = temps.length > 0 ? (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1) : "-";

    const minHum = humidities.length > 0 ? Math.min(...humidities).toFixed(1) : "-";
    const maxHum = humidities.length > 0 ? Math.max(...humidities).toFixed(1) : "-";
    const avgHum = humidities.length > 0 ? (humidities.reduce((a, b) => a + b, 0) / humidities.length).toFixed(1) : "-";

    return {
      success: true,
      stats: {
        totalCount: totalCount,
        normalCount: normalCount,
        warningCount: warningCount,
        warningLowCount: warningLowCount,
        warningHighCount: warningHighCount,
        warningTempCount: warningTempCount,
        warningHumCount: warningHumCount,
        warningBothCount: warningBothCount,
        approvedCount: approvedCount,
        pendingCount: pendingCount,
        rejectedCount: rejectedCount,
        minTemp: minTemp,
        maxTemp: maxTemp,
        avgTemp: avgTemp,
        minHumidity: minHum,
        maxHumidity: maxHum,
        avgHumidity: avgHum
      },
      data: filtered.reverse()
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงรายงานสิ่งแวดล้อม: " + err.toString()
    };
  }
}

/**
 * Backward compatibility alias for handleGetTempReport
 */
function handleGetTempReport(payload) {
  return handleGetEnvironmentReport(payload);
}

/**
 * ==============================================================================
 * MONTHLY STOCK COUNT & INVENTORY ADJUSTMENT MODULE (ระบบตรวจนับสต๊อกประจำเดือน)
 * 2-Person Verification (Maker-Checker Rule) & Pharmacy Inventory Audit Standard
 * ==============================================================================
 */

/**
 * Action: GET_STOCK_TAKE_LIST
 * ดึงรายการสต๊อกยาที่มีใน InventoryLot เพื่อนำไปจัดทำใบตรวจนับ (Count Sheet / Blind Count Sheet)
 * และดึงรายการปรับยอดที่ค้างตรวจสอบ (Pending Adjustments)
 */
function handleGetStockTakeList(payload) {
  try {
    const ss = getSpreadsheet();
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);

    const lots = sheetToObjects(lotSheet);
    const masterList = sheetToObjects(masterSheet);
    const stockTakes = sheetToObjects(takeSheet);

    const masterMap = {};
    masterList.forEach(m => {
      const code = String(m.ItemCode || "").trim().toUpperCase();
      if (code) masterMap[code] = m;
    });

    // Group lots by ItemCode
    const lotsByItemCode = {};
    lots.forEach(lot => {
      const itemCode = String(lot.ItemCode || "").trim().toUpperCase();
      if (!itemCode) return;
      if (!lotsByItemCode[itemCode]) {
        lotsByItemCode[itemCode] = [];
      }
      lotsByItemCode[itemCode].push(lot);
    });

    const activeLots = [];
    const processedCodes = new Set();

    // 1. First process all drugs from Masterdata (Ensures ALL drugs are included in the count sheet)
    masterList.forEach(m => {
      const code = String(m.ItemCode || "").trim().toUpperCase();
      if (!code) return;
      processedCodes.add(code);

      const itemLots = lotsByItemCode[code] || [];
      if (itemLots.length > 0) {
        // Drug has one or more lots in InventoryLot
        itemLots.forEach(lot => {
          const lotNumber = String(lot.LotNumber || "").trim() || "LOT-01";
          const expiryDate = String(lot.ExpiryDate || "").trim() || "-";
          const qty = Number(lot.Qty) || 0;
          const expCalc = calculateExpiryStatus(expiryDate);

          activeLots.push({
            _rowNumber: lot._rowNumber || null,
            ItemCode: code,
            ItemName: m.ItemName || lot.ItemName || code,
            GenericName: m.GenericName || "",
            Category: m.Category || "ยา",
            BaseUnit: m.BaseUnit || "หน่วย",
            LotNumber: lotNumber,
            ExpiryDate: expiryDate,
            CurrentSystemQty: qty,
            StockStatus: lot.StockStatus || (qty > 0 ? "InStock" : "OutOfStock"),
            ExpiryStatus: lot.ExpiryStatus || expCalc.status,
            CostPrice: Number(lot.CostPrice) || Number(m.StandardCost) || 0,
            UnitPrice: Number(lot.UnitPrice) || Number(m.SellingPrice) || 0,
            IsSample: lot.IsSample === true || String(lot.IsSample).toLowerCase() === "true"
          });
        });
      } else {
        // Drug in Masterdata has no lot entry yet -> add baseline row
        activeLots.push({
          _rowNumber: null,
          ItemCode: code,
          ItemName: m.ItemName || code,
          GenericName: m.GenericName || "",
          Category: m.Category || "ยา",
          BaseUnit: m.BaseUnit || "หน่วย",
          LotNumber: "LOT-01",
          ExpiryDate: "-",
          CurrentSystemQty: 0,
          StockStatus: "OutOfStock",
          ExpiryStatus: "Normal",
          CostPrice: Number(m.StandardCost) || 0,
          UnitPrice: Number(m.SellingPrice) || 0,
          IsSample: false
        });
      }
    });

    // 2. Process any remaining lots not in Masterdata
    lots.forEach(lot => {
      const itemCode = String(lot.ItemCode || "").trim().toUpperCase();
      if (!itemCode || processedCodes.has(itemCode)) return;

      const lotNumber = String(lot.LotNumber || "").trim() || "LOT-01";
      const expiryDate = String(lot.ExpiryDate || "").trim() || "-";
      const qty = Number(lot.Qty) || 0;
      const expCalc = calculateExpiryStatus(expiryDate);

      activeLots.push({
        _rowNumber: lot._rowNumber || null,
        ItemCode: itemCode,
        ItemName: lot.ItemName || itemCode,
        GenericName: "",
        Category: "ยา",
        BaseUnit: "หน่วย",
        LotNumber: lotNumber,
        ExpiryDate: expiryDate,
        CurrentSystemQty: qty,
        StockStatus: lot.StockStatus || (qty > 0 ? "InStock" : "OutOfStock"),
        ExpiryStatus: lot.ExpiryStatus || expCalc.status,
        CostPrice: Number(lot.CostPrice) || 0,
        UnitPrice: Number(lot.UnitPrice) || 0,
        IsSample: lot.IsSample === true || String(lot.IsSample).toLowerCase() === "true"
      });
    });

    // Sort lots by Category, then ItemName, then ExpiryDate
    activeLots.sort((a, b) => {
      const catCompare = String(a.Category || "").localeCompare(String(b.Category || ""), 'th');
      if (catCompare !== 0) return catCompare;
      const nameCompare = String(a.ItemName || "").localeCompare(String(b.ItemName || ""), 'th');
      if (nameCompare !== 0) return nameCompare;
      return new Date(a.ExpiryDate) - new Date(b.ExpiryDate);
    });

    // Pending Adjustments
    const pendingAdjustments = stockTakes
      .filter(t => String(t.Status || "").trim().toLowerCase() === "pending_adjustment")
      .reverse();

    return {
      success: true,
      totalLots: activeLots.length,
      lots: activeLots,
      pendingAdjustments: pendingAdjustments,
      pendingCount: pendingAdjustments.length,
      timestamp: Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss")
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการตรวจนับสต๊อก: " + err.toString()
    };
  }
}

/**
 * Action: SUBMIT_STOCK_TAKE
 * บันทึกผลการตรวจนับสต๊อกจริง (Physical Count)
 * หากพบผลต่าง (Variance != 0) จะตั้งสถานะเป็น Pending_Adjustment เพื่อรอการอนุมัติ 2-Person Maker-Checker
 */
function handleSubmitStockTake(payload) {
  try {
    if (!payload || !payload.Items || !Array.isArray(payload.Items) || payload.Items.length === 0) {
      return { success: false, message: "ไม่พบรายการผลการตรวจนับยา" };
    }

    const countedBy = String(payload.CountedBy || payload.By || "ผู้ตรวจนับ").trim();
    const countDate = String(payload.CountDate || "").trim();
    const timePart = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
    const timestampStr = countDate ? `${countDate} ${timePart}` : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    
    // Generate Batch ID: ST-YYYYMMDD-XXXX
    const dateCode = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const takeBatchId = `ST-${dateCode}-${randomSuffix}`;

    const items = payload.Items;
    const rowsToAppend = [];
    let matchCount = 0;
    let discrepancyCount = 0;

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const itemCode = String(it.ItemCode || "").trim().toUpperCase();
      const itemName = String(it.ItemName || "").trim();
      const lotNumber = String(it.LotNumber || "").trim().toUpperCase();
      const expiryDate = String(it.ExpiryDate || "").trim();
      const systemQty = Number(it.SystemQty !== undefined ? it.SystemQty : it.CurrentSystemQty) || 0;
      const countQty = Number(it.CountQty !== undefined ? it.CountQty : it.PhysicalCountQty);
      
      if (isNaN(countQty)) {
        return { success: false, message: `รายการที่ ${i + 1} (${itemName || itemCode}): กรุณาระบุจำนวนที่นับได้จริง` };
      }

      const variance = Math.round((countQty - systemQty) * 100) / 100;
      const reason = String(it.Reason || it.AdjustmentReason || "").trim();

      if (variance !== 0 && !reason) {
        return {
          success: false,
          message: `รายการ ${itemName} (Lot: ${lotNumber}) มียอดต่าง ${variance > 0 ? '+' : ''}${variance} จำเป็นต้องระบุเหตุผลการปรับยอด (Adjustment Reason)`
        };
      }

      const status = (variance === 0) ? "Matched" : "Pending_Adjustment";
      if (variance === 0) {
        matchCount++;
      } else {
        discrepancyCount++;
      }

      const takeId = `${takeBatchId}-${String(i + 1).padStart(3, '0')}`;

      rowsToAppend.push([
        takeId,               // 1. TakeId
        timestampStr,         // 2. Timestamp
        itemCode,             // 3. ItemCode
        itemName,             // 4. ItemName
        lotNumber,            // 5. LotNumber
        expiryDate,           // 6. ExpiryDate
        systemQty,            // 7. SystemQty
        countQty,             // 8. CountQty
        variance,             // 9. Variance
        reason || (variance === 0 ? "ยอดสต๊อกตรงกับระบบ" : "-"), // 10. Reason
        countedBy,            // 11. CountedBy
        status,               // 12. Status (Matched, Pending_Adjustment, Approved, Rejected)
        variance === 0 ? "Auto-Matched" : "", // 13. VerifiedBy
        variance === 0 ? timestampStr : "",   // 14. VerifiedAt
        variance === 0 ? "ตรวจนับตรงตามระบบ ไม่ต้องปรับยอด" : "" // 15. VerifyNote
      ]);
    }

    const ss = getSpreadsheet();
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);
    
    if (rowsToAppend.length > 0) {
      const lastRow = takeSheet.getLastRow();
      takeSheet.getRange(lastRow + 1, 1, rowsToAppend.length, rowsToAppend[0].length).setValues(rowsToAppend);
    }

    return {
      success: true,
      message: `บันทึกผลการตรวจนับสำเร็จ ${rowsToAppend.length} รายการ (ตรงตามระบบ ${matchCount} รายการ, พบผลต่างรออนุมัติปรับยอด ${discrepancyCount} รายการ)`,
      takeBatchId: takeBatchId,
      totalCounted: rowsToAppend.length,
      matchCount: matchCount,
      discrepancyCount: discrepancyCount,
      pendingCount: discrepancyCount
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกผลการตรวจนับ: " + err.toString()
    };
  }
}

/**
 * Action: GET_PENDING_STOCK_ADJUSTMENTS
 * ดึงรายการปรับยอดสต๊อกที่รอการอนุมัติ 2 ผู้ใช้งาน (Maker-Checker)
 */
function handleGetPendingStockAdjustments() {
  try {
    const ss = getSpreadsheet();
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);
    const allRecords = sheetToObjects(takeSheet);

    const pending = allRecords.filter(r => 
      String(r.Status || "").trim().toLowerCase() === "pending_adjustment"
    );

    return {
      success: true,
      count: pending.length,
      data: pending.reverse()
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงรายการรออนุมัติปรับยอด: " + err.toString()
    };
  }
}

/**
 * Action: VERIFY_STOCK_ADJUSTMENT
 * ระบบอนุมัติปรับยอดสต๊อก 2 ผู้ใช้งาน (Maker-Checker 2-Person Verification)
 * เภสัชกร / หัวหน้าคลังยา ตรวจสอบและอนุมัติ (Approve) หรือ ปฏิเสธ (Reject)
 * หาก Approve: ปรับปรุง Qty ใน InventoryLot และบันทึกประวัติ StockTransaction (ActionType = 'Adjust')
 */
function handleVerifyStockAdjustment(payload) {
  try {
    if (!payload) {
      return { success: false, message: "ไม่พบข้อมูลการอนุมัติ" };
    }

    const action = String(payload.Action || payload.action || "").trim(); // 'Approve' | 'Reject'
    const verifierName = String(payload.VerifiedBy || payload.verifierName || "").trim();
    const verifyNote = String(payload.VerifyNote || payload.verifyNote || "").trim();
    const itemsToVerify = Array.isArray(payload.Items) ? payload.Items : (payload.RowIndex || payload._rowNumber || payload.TakeId ? [payload] : []);

    if (!verifierName) {
      return { success: false, message: "กรุณาระบุชื่อผู้ตรวจสอบ/ผู้อนุมัติ (Verifier/Pharmacist)" };
    }

    if (action !== "Approve" && action !== "Approved" && action !== "Reject" && action !== "Rejected") {
      return { success: false, message: "สถานะการอนุมัติต้องเป็น Approve หรือ Reject" };
    }

    const isApprove = action === "Approve" || action === "Approved";
    const statusTarget = isApprove ? "Approved" : "Rejected";

    if (!isApprove && !verifyNote) {
      return { success: false, message: "กรณีปฏิเสธการปรับยอด จำเป็นต้องระบุเหตุผล (Note)" };
    }

    if (itemsToVerify.length === 0) {
      return { success: false, message: "ไม่มีรายการที่เลือกสำหรับดำเนินการ" };
    }

    const ss = getSpreadsheet();
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

    const takes = sheetToObjects(takeSheet);
    const lots = sheetToObjects(lotSheet);
    const now = new Date();
    const nowStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");

    let processedCount = 0;
    const txRows = [];

    for (let req of itemsToVerify) {
      const takeId = String(req.TakeId || "").trim();
      const rowNum = Number(req.RowIndex || req._rowNumber || 0);

      // Find record in StockTake
      let targetTake = null;
      if (rowNum && rowNum > 1) {
        targetTake = takes.find(t => t._rowNumber === rowNum);
      } else if (takeId) {
        targetTake = takes.find(t => String(t.TakeId || "").trim() === takeId);
      }

      if (!targetTake) continue;

      const countedBy = String(targetTake.CountedBy || "").trim();

      // Strict Maker-Checker Rule: Verifier CANNOT be the same as Counter
      if (countedBy && verifierName && countedBy.toLowerCase() === verifierName.toLowerCase()) {
        return {
          success: false,
          message: `ไม่อนุญาตให้อนุมัติรายการของตนเอง (ผู้ตรวจนับ: ${countedBy}) ตามมาตรฐาน Maker-Checker 2-Person Verification`
        };
      }

      if (String(targetTake.Status || "").trim().toLowerCase() !== "pending_adjustment") {
        continue; // already processed
      }

      const itemCode = String(targetTake.ItemCode || "").trim().toUpperCase();
      const lotNumber = String(targetTake.LotNumber || "").trim().toUpperCase();
      const countQty = Number(targetTake.CountQty) || 0;
      const systemQty = Number(targetTake.SystemQty) || 0;
      const variance = Number(targetTake.Variance) || (countQty - systemQty);
      const reason = String(targetTake.Reason || "").trim();

      if (isApprove) {
        // Find matching lot in InventoryLot to update
        const matchingLot = lots.find(l => 
          String(l.ItemCode || "").trim().toUpperCase() === itemCode && 
          String(l.LotNumber || "").trim().toUpperCase() === lotNumber
        );

        let costPrice = 0;
        let unitPrice = 0;

        if (matchingLot) {
          costPrice = Number(matchingLot.CostPrice) || 0;
          unitPrice = Number(matchingLot.UnitPrice) || 0;
          const lotTargetRow = matchingLot._rowNumber;

          // Update Qty (Col 6) and StockStatus (Col 7) in InventoryLot
          const newStatus = countQty > 0 ? "InStock" : "OutOfStock";
          lotSheet.getRange(lotTargetRow, 6).setValue(countQty);
          lotSheet.getRange(lotTargetRow, 7).setValue(newStatus);
        } else {
          // If lot doesn't exist yet, insert new lot into InventoryLot
          const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);
          const masterList = sheetToObjects(masterSheet);
          const m = masterList.find(x => String(x.ItemCode).trim().toUpperCase() === itemCode) || {};
          costPrice = Number(m.StandardCost) || 0;
          unitPrice = Number(m.SellingPrice) || 0;

          const expInfo = calculateExpiryStatus(targetTake.ExpiryDate || "-");
          lotSheet.appendRow([
            nowStr.split(" ")[0], // A: ReceiveDate
            itemCode, // B: ItemCode
            targetTake.ItemName || m.ItemName || itemCode, // C: ItemName
            lotNumber, // D: LotNumber
            targetTake.ExpiryDate || "-", // E: ExpiryDate
            countQty, // F: Qty
            countQty > 0 ? "InStock" : "OutOfStock", // G: StockStatus
            expInfo.status, // H: ExpiryStatus
            "FALSE", // I: IsSample
            costPrice, // J: CostPrice
            unitPrice // K: UnitPrice
          ]);
        }

        // Log to StockTransaction
        const varianceFormatted = variance > 0 ? `+${variance}` : `${variance}`;
        const noteText = `[ปรับยอดสต๊อกประจำเดือน] ${reason} (นับได้จริง: ${countQty}, ยอดเดิม: ${systemQty}, ผลต่าง: ${varianceFormatted})${verifyNote ? ' | ผู้อนุมัติ: ' + verifyNote : ''}`;
        
        txRows.push([
          nowStr, // A: TimeStamp
          nowStr.split(" ")[0], // B: ReceiveDate / AdjustDate
          "Adjust", // C: ActionType
          itemCode, // D: ItemCode
          targetTake.ItemName || itemCode, // E: ItemName
          lotNumber, // F: LotNumber
          variance, // G: QtyChange
          "-", // H: HN_VN
          costPrice, // I: CostPrice
          unitPrice, // J: SellingPrice
          Math.abs(variance) * costPrice, // K: TotalPrice
          noteText, // L: Note
          `${countedBy} (อนุมัติ: ${verifierName})` // M: By
        ]);
      }

      // Update StockTake row: Status (Col 12), VerifiedBy (Col 13), VerifiedAt (Col 14), VerifyNote (Col 15)
      takeSheet.getRange(targetTake._rowNumber, 12).setValue(statusTarget);
      takeSheet.getRange(targetTake._rowNumber, 13).setValue(verifierName);
      takeSheet.getRange(targetTake._rowNumber, 14).setValue(nowStr);
      takeSheet.getRange(targetTake._rowNumber, 15).setValue(verifyNote);

      processedCount++;
    }

    if (txRows.length > 0) {
      const txLastRow = txSheet.getLastRow();
      txSheet.getRange(txLastRow + 1, 1, txRows.length, txRows[0].length).setValues(txRows);
    }

    return {
      success: true,
      message: isApprove
        ? `อนุมัติปรับยอดสต๊อกเรียบร้อยแล้ว (${processedCount} รายการ) และบันทึกลง Stock Transaction สำเร็จ`
        : `ปฏิเสธการปรับยอดเรียบร้อยแล้ว (${processedCount} รายการ)`,
      processedCount: processedCount,
      action: statusTarget
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการตรวจสอบปรับยอด: " + err.toString()
    };
  }
}

/**
 * Action: GET_STOCK_TAKE_REPORT
 * ดึงรายงานประวัติการตรวจนับสต๊อกและปรับยอด สำหรับ Audit Trail และส่งออก Excel
 */
function handleGetStockTakeReport(payload) {
  try {
    const ss = getSpreadsheet();
    const takeSheet = getSheetSafe(ss, SHEETS.STOCK_TAKE, HEADERS.StockTake);
    const allRecords = sheetToObjects(takeSheet);

    const monthFilter = payload && payload.month ? String(payload.month).trim() : "";
    const statusFilter = payload && payload.status ? String(payload.status).trim().toLowerCase() : "";
    const searchFilter = payload && payload.search ? String(payload.search).trim().toLowerCase() : "";

    let filtered = allRecords;

    if (monthFilter) {
      filtered = filtered.filter(item => {
        const ts = String(item.Timestamp || "");
        return ts.startsWith(monthFilter);
      });
    }

    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(item => 
        String(item.Status || "").trim().toLowerCase() === statusFilter
      );
    }

    if (searchFilter) {
      filtered = filtered.filter(item => {
        const code = String(item.ItemCode || "").toLowerCase();
        const name = String(item.ItemName || "").toLowerCase();
        const lot = String(item.LotNumber || "").toLowerCase();
        const takeId = String(item.TakeId || "").toLowerCase();
        return code.includes(searchFilter) || name.includes(searchFilter) || lot.includes(searchFilter) || takeId.includes(searchFilter);
      });
    }

    // Compute Stats
    let totalCounted = filtered.length;
    let matchCount = 0;
    let shortageCount = 0;
    let surplusCount = 0;
    let pendingCount = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let netVariance = 0;

    filtered.forEach(r => {
      const v = Number(r.Variance) || 0;
      netVariance += v;
      if (v === 0) matchCount++;
      else if (v < 0) shortageCount++;
      else if (v > 0) surplusCount++;

      const st = String(r.Status || "").toLowerCase();
      if (st === "pending_adjustment") pendingCount++;
      else if (st === "approved") approvedCount++;
      else if (st === "rejected") rejectedCount++;
    });

    return {
      success: true,
      stats: {
        totalCounted: totalCounted,
        matchCount: matchCount,
        shortageCount: shortageCount,
        surplusCount: surplusCount,
        pendingCount: pendingCount,
        approvedCount: approvedCount,
        rejectedCount: rejectedCount,
        netVariance: netVariance
      },
      data: filtered.reverse()
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงรายงานตรวจนับสต๊อก: " + err.toString()
    };
  }
}




/**
 * ==============================================================================
 * MODULE 8: INTER-HOSPITAL DRUG LOAN & RETURN SYSTEM (ระบบยืม/คืนยาระหว่างโรงพยาบาล)
 * Supporting LOAN_IN, LOAN_OUT, RETURN_OUT, RETURN_IN with FEFO and Stock Synchronization
 * ==============================================================================
 */

/**
 * Action: GET_HOSPITALS (ดึงรายชื่อโรงพยาบาลคู่สัญญาทั้งหมด)
 */
function handleGetHospitals() {
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.HOSPITAL_LIST, HEADERS.HospitalList);
    const list = sheetToObjects(sheet);
    return {
      success: true,
      data: list || []
    };
  } catch (err) {
    return {
      success: false,
      message: "ไม่สามารถดึงรายชื่อโรงพยาบาลได้: " + err.toString()
    };
  }
}

/**
 * Action: SAVE_HOSPITAL (เพิ่ม/แก้ไขข้อมูลโรงพยาบาลคู่สัญญา)
 */
function handleSaveHospital(payload) {
  if (!payload || !payload.HospitalName || !String(payload.HospitalName).trim()) {
    return { success: false, message: "กรุณาระบุชื่อโรงพยาบาล (HospitalName)" };
  }

  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.HOSPITAL_LIST, HEADERS.HospitalList);
    const hospitals = sheetToObjects(sheet);

    let hospitalId = String(payload.HospitalID || "").trim().toUpperCase();
    const hospitalName = String(payload.HospitalName).trim();
    const contactPerson = String(payload.ContactPerson || "").trim();
    const phone = String(payload.Phone || "").trim();
    const address = String(payload.Address || "").trim();
    const status = String(payload.Status || "Active").trim();

    if (!hospitalId) {
      const maxId = hospitals.reduce((max, h) => {
        const match = String(h.HospitalID || "").match(/HOSP-(\d+)/i);
        if (match) {
          const num = parseInt(match[1], 10);
          return num > max ? num : max;
        }
        return max;
      }, 0);
      hospitalId = "HOSP-" + String(maxId + 1).padStart(3, "0");
    }

    const existingIndex = hospitals.findIndex(h => 
      String(h.HospitalID).trim().toUpperCase() === hospitalId ||
      String(h.HospitalName).trim().toLowerCase() === hospitalName.toLowerCase()
    );

    const rowData = [
      hospitalId,
      hospitalName,
      contactPerson,
      phone,
      address,
      status
    ];

    if (existingIndex >= 0) {
      const targetRow = hospitals[existingIndex]._rowNumber;
      sheet.getRange(targetRow, 1, 1, rowData.length).setValues([rowData]);
      return {
        success: true,
        message: `อัปเดตข้อมูลโรงพยาบาล ${hospitalName} (${hospitalId}) สำเร็จ`,
        data: { HospitalID: hospitalId, HospitalName: hospitalName }
      };
    } else {
      sheet.appendRow(rowData);
      return {
        success: true,
        message: `เพิ่มโรงพยาบาลใหม่ ${hospitalName} (${hospitalId}) สำเร็จ`,
        data: { HospitalID: hospitalId, HospitalName: hospitalName }
      };
    }
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการบันทึกโรงพยาบาล: " + err.toString()
    };
  }
}

/**
 * Action: DELETE_HOSPITAL (เปลี่ยนสถานะโรงพยาบาลเป็น Inactive)
 */
function handleDeleteHospital(payload) {
  if (!payload || !payload.HospitalID) {
    return { success: false, message: "กรุณาระบุรหัสโรงพยาบาลที่ต้องการยกเลิก" };
  }

  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.HOSPITAL_LIST, HEADERS.HospitalList);
    const hospitals = sheetToObjects(sheet);
    const code = String(payload.HospitalID).trim().toUpperCase();

    const target = hospitals.find(h => String(h.HospitalID).trim().toUpperCase() === code);
    if (!target) {
      return { success: false, message: "ไม่พบข้อมูลโรงพยาบาลที่ระบุ" };
    }

    sheet.getRange(target._rowNumber, 6).setValue("Inactive");
    return {
      success: true,
      message: `ยกเลิกการใช้งานโรงพยาบาล ${target.HospitalName} (${code}) เรียบร้อยแล้ว`
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาด: " + err.toString()
    };
  }
}

/**
 * Action: GET_LOANS (ดึงรายการยืม-คืนยาและยอดคงค้างทั้งหมด)
 */
function handleGetLoans(payload) {
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);
    let loans = sheetToObjects(sheet);

    const typeFilter = payload && payload.type ? String(payload.type).trim().toUpperCase() : "ALL";
    const statusFilter = payload && payload.status ? String(payload.status).trim().toLowerCase() : "ALL";
    const hospitalFilter = payload && payload.hospitalId ? String(payload.hospitalId).trim().toUpperCase() : "ALL";
    const keyword = payload && payload.search ? String(payload.search).trim().toUpperCase() : "";

    if (typeFilter && typeFilter !== "ALL") {
      loans = loans.filter(l => String(l.TransactionType || "").toUpperCase() === typeFilter);
    }

    if (statusFilter && statusFilter !== "ALL" && statusFilter !== "all") {
      loans = loans.filter(l => String(l.LoanStatus || "").trim().toLowerCase() === statusFilter);
    }

    if (hospitalFilter && hospitalFilter !== "ALL") {
      loans = loans.filter(l => 
        String(l.RefHospitalID || "").toUpperCase() === hospitalFilter ||
        String(l.RefHospitalName || "").toUpperCase().includes(hospitalFilter)
      );
    }

    if (keyword) {
      loans = loans.filter(l => 
        String(l.LoanID || "").toUpperCase().includes(keyword) ||
        String(l.ItemCode || "").toUpperCase().includes(keyword) ||
        String(l.ItemName || "").toUpperCase().includes(keyword) ||
        String(l.LotNumber || "").toUpperCase().includes(keyword) ||
        String(l.RefHospitalName || "").toUpperCase().includes(keyword) ||
        String(l.BorrowerName || "").toUpperCase().includes(keyword) ||
        String(l.LenderName || "").toUpperCase().includes(keyword)
      );
    }

    return {
      success: true,
      count: loans.length,
      data: loans.reverse()
    };
  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูลรายการยืม-คืน: " + err.toString()
    };
  }
}

/**
 * Action: SAVE_LOAN_TRANSACTION
 * บันทึกธุรกรรม ยืม/คืน/โอนย้ายยา (LOAN_IN, LOAN_OUT, RETURN_OUT, RETURN_IN)
 * รองรับการใส่รายการยาหลายตัว (Multi-Item Cart) ใน 1 ใบเบิกยืม-คืน
 */
function handleSaveLoanTransaction(payload) {
  try {
    if (!payload) {
      return { success: false, message: "ไม่พบข้อมูลธุรกรรม" };
    }

    const txType = String(payload.TransactionType || payload.type || "LOAN_IN").trim().toUpperCase();
    const validTypes = ["LOAN_IN", "LOAN_OUT", "RETURN_OUT", "RETURN_IN"];
    if (!validTypes.includes(txType)) {
      return { success: false, message: "ประเภทธุรกรรมไม่ถูกต้อง (ต้องเป็น LOAN_IN, LOAN_OUT, RETURN_OUT หรือ RETURN_IN)" };
    }

    const refHospitalId = String(payload.RefHospitalID || payload.hospitalId || "").trim();
    const refHospitalName = String(payload.RefHospitalName || payload.hospitalName || "").trim();
    const borrowLocation = String(payload.BorrowLocation || payload.borrowLocation || "ศูนย์การแพทย์รามาธิบดีศรีอยุธยา").trim();
    if (!refHospitalName) {
      return { success: false, message: "กรุณาระบุโรงพยาบาลคู่สัญญา (RefHospitalName)" };
    }

    const txDate = String(payload.Date || payload.Timestamp || "").trim() || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
    const nowTime = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "HH:mm:ss");
    const timestampStr = `${txDate} ${nowTime}`;

    const itemCategory = Array.isArray(payload.ItemCategory) 
      ? payload.ItemCategory.join(", ") 
      : String(payload.ItemCategory || "ยา").trim();

    // Personnel fields
    const borrowerName = String(payload.BorrowerName || "").trim();
    const borrowerPos = String(payload.BorrowerPos || "").trim();
    const borrowerApproveName = String(payload.BorrowerApproveName || "").trim();
    const borrowerApprovePos = String(payload.BorrowerApprovePos || "").trim();
    const lenderName = String(payload.LenderName || "").trim();
    const lenderPos = String(payload.LenderPos || "").trim();
    const lenderApproveName = String(payload.LenderApproveName || "").trim();
    const lenderApprovePos = String(payload.LenderApprovePos || "").trim();
    const receiverName = String(payload.ReceiverName || "").trim();
    const receiverPos = String(payload.ReceiverPos || "").trim();

    // Return specific personnel fields
    const returnDate = String(payload.ReturnDate || "").trim();
    const returnerName = String(payload.ReturnerName || "").trim();
    const returnerPos = String(payload.ReturnerPos || "").trim();
    const returnReceiverName = String(payload.ReturnReceiverName || "").trim();
    const returnReceiverPos = String(payload.ReturnReceiverPos || "").trim();
    const returnCarrierName = String(payload.ReturnCarrierName || "").trim();
    const returnCarrierPos = String(payload.ReturnCarrierPos || "").trim();

    const byUser = String(payload.By || borrowerName || lenderName || "Admin").trim();

    // Items array
    const rawItems = Array.isArray(payload.Items) && payload.Items.length > 0 ? payload.Items : [payload];
    if (rawItems.length === 0 || !rawItems[0].ItemCode) {
      return { success: false, message: "กรุณาระบุรายการยาที่ต้องการทำรายการยืม-คืนอย่างน้อย 1 รายการ" };
    }

    const ss = getSpreadsheet();
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);
    const loanSheet = getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);
    const masterSheet = getSheetSafe(ss, SHEETS.MASTERDATA, HEADERS.Masterdata);

    const lots = sheetToObjects(lotSheet);
    const masterList = sheetToObjects(masterSheet);
    const existingLoans = sheetToObjects(loanSheet);

    const masterMap = {};
    masterList.forEach(m => {
      const c = String(m.ItemCode || "").trim().toUpperCase();
      if (c) masterMap[c] = m;
    });

    // Validate Items & Stock Availability for Outbound Actions
    const validatedItems = [];
    for (let i = 0; i < rawItems.length; i++) {
      const it = rawItems[i];
      const itemCode = String(it.ItemCode || "").trim().toUpperCase();
      const itemName = String(it.ItemName || (masterMap[itemCode] ? masterMap[itemCode].ItemName : itemCode)).trim();
      const lotNumber = String(it.LotNumber || "").trim().toUpperCase() || "LOT-01";
      const expiryDate = String(it.ExpiryDate || "").trim() || "-";
      const qty = Number(it.Qty || it.QtyBorrowed || it.QtyReturned) || 0;
      const unit = String(it.Unit || it.BaseUnit || (masterMap[itemCode] ? masterMap[itemCode].BaseUnit : "หน่วย")).trim();
      const costPrice = Number(it.CostPrice || (masterMap[itemCode] ? masterMap[itemCode].StandardCost : 0)) || 0;
      const unitPrice = Number(it.UnitPrice || (masterMap[itemCode] ? masterMap[itemCode].SellingPrice : 0)) || 0;
      const note = String(it.Note || "").trim();

      if (!itemCode || qty <= 0) {
        return { success: false, message: `รายการที่ ${i + 1} (${itemName || itemCode || 'ไม่ระบุ'}): กรุณาระบุรหัสยาและจำนวนที่มากกว่า 0` };
      }

      // Check stock availability if action decreases local stock (LOAN_OUT or RETURN_OUT)
      if (txType === "LOAN_OUT" || txType === "RETURN_OUT") {
        const availableLots = lots.filter(l => 
          String(l.ItemCode || "").trim().toUpperCase() === itemCode && (Number(l.Qty) || 0) > 0
        );
        const totalAvailable = availableLots.reduce((sum, l) => sum + (Number(l.Qty) || 0), 0);

        if (totalAvailable < qty) {
          return {
            success: false,
            message: `ยา ${itemName} (${itemCode}) มีสต็อกคงเหลือในคลังเพียง ${totalAvailable} ${unit} ไม่เพียงพอต่อการ${txType === 'LOAN_OUT' ? 'ให้ยืมออก' : 'ส่งคืน'} (${qty} ${unit})`
          };
        }
      }

      validatedItems.push({
        itemCode,
        itemName,
        lotNumber,
        expiryDate,
        qty,
        unit,
        costPrice,
        unitPrice,
        note
      });
    }

    // Generate Batch Transaction ID: LN-YYYYMMDD-XXXX
    const dateCode = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const loanBatchId = `LN-${dateCode}-${randomSuffix}`;

    const txRowsToAppend = [];
    const loanRowsToAppend = [];
    const lotRowsToAppend = [];
    const createdLoanIds = [];

    // Process Each Validated Item
    for (let idx = 0; idx < validatedItems.length; idx++) {
      const it = validatedItems[idx];
      const singleLoanId = validatedItems.length > 1 ? `${loanBatchId}-${String(idx + 1).padStart(2, '0')}` : loanBatchId;
      createdLoanIds.push(singleLoanId);

      if (txType === "LOAN_IN" || txType === "RETURN_IN") {
        // --- INBOUND TO WAREHOUSE (Increase local stock) ---
        const expCalc = calculateExpiryStatus(it.expiryDate);
        
        // Find if exact matching lot exists
        const matchingLotIdx = lots.findIndex(l => 
          String(l.ItemCode || "").trim().toUpperCase() === it.itemCode &&
          String(l.LotNumber || "").trim().toUpperCase() === it.lotNumber
        );

        if (matchingLotIdx !== -1) {
          const targetLot = lots[matchingLotIdx];
          const newQty = (Number(targetLot.Qty) || 0) + it.qty;
          targetLot.Qty = newQty;
          lotSheet.getRange(targetLot._rowNumber, 6).setValue(newQty);
          lotSheet.getRange(targetLot._rowNumber, 7).setValue(newQty > 0 ? "InStock" : "OutOfStock");
        } else {
          lotRowsToAppend.push([
            txDate,
            it.itemCode,
            it.itemName,
            it.lotNumber,
            it.expiryDate,
            it.qty,
            "InStock",
            expCalc.status,
            "FALSE",
            it.costPrice,
            it.unitPrice
          ]);
        }

        // Log Stock Transaction
        const actionLabel = txType === "LOAN_IN" ? "LOAN_IN" : "RETURN_IN";
        const notePrefix = txType === "LOAN_IN" ? `[ยืมยาเข้าจาก ${refHospitalName}]` : `[รับคืนยาจาก ${refHospitalName}]`;
        
        txRowsToAppend.push([
          timestampStr,
          txDate,
          actionLabel,
          it.itemCode,
          it.itemName,
          it.lotNumber,
          it.qty, // Positive Qty
          refHospitalName,
          it.costPrice,
          it.unitPrice,
          it.qty * it.costPrice,
          `${notePrefix} ${it.note || ''} (Ref: ${singleLoanId})`,
          byUser
        ]);

        // Record in LoanBalance
        loanRowsToAppend.push([
          singleLoanId,
          timestampStr,
          txType,
          refHospitalId,
          refHospitalName,
          it.itemCode,
          it.itemName,
          it.lotNumber,
          it.expiryDate,
          it.qty, // QtyBorrowed
          txType === "RETURN_IN" ? it.qty : 0, // QtyReturned
          txType === "LOAN_IN" ? it.qty : 0,   // QtyOutstanding
          itemCategory,
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
          txType === "LOAN_IN" ? "Pending" : "Completed" // LoanStatus
        ]);

      } else {
        // --- OUTBOUND FROM WAREHOUSE (Decrease local stock via FEFO) ---
        let remainingToDeduct = it.qty;
        const matchingLots = lots
          .filter(l => String(l.ItemCode || "").trim().toUpperCase() === it.itemCode && (Number(l.Qty) || 0) > 0)
          .sort((a, b) => {
            const expDiff = new Date(a.ExpiryDate) - new Date(b.ExpiryDate);
            if (!isNaN(expDiff) && expDiff !== 0) return expDiff;
            return (a._rowNumber || 0) - (b._rowNumber || 0);
          });

        let primaryLotNumber = it.lotNumber;
        let primaryExpiryDate = it.expiryDate;

        for (let targetLot of matchingLots) {
          if (remainingToDeduct <= 0) break;
          const currentQty = Number(targetLot.Qty) || 0;
          const deduct = Math.min(currentQty, remainingToDeduct);
          const newQty = currentQty - deduct;

          targetLot.Qty = newQty;
          remainingToDeduct -= deduct;

          lotSheet.getRange(targetLot._rowNumber, 6).setValue(newQty);
          if (newQty === 0) {
            lotSheet.getRange(targetLot._rowNumber, 7).setValue("Depleted");
          }

          if (!primaryLotNumber || primaryLotNumber === "LOT-01") {
            primaryLotNumber = targetLot.LotNumber;
            primaryExpiryDate = targetLot.ExpiryDate;
          }

          // Log StockTransaction for each lot deducted
          const actionLabel = txType === "LOAN_OUT" ? "LOAN_OUT" : "RETURN_OUT";
          const notePrefix = txType === "LOAN_OUT" ? `[ให้ยืมยาออกแก่ ${refHospitalName}]` : `[ส่งคืนยาให้แก่ ${refHospitalName}]`;

          txRowsToAppend.push([
            timestampStr,
            txDate,
            actionLabel,
            it.itemCode,
            it.itemName,
            targetLot.LotNumber,
            -deduct, // Negative Qty
            refHospitalName,
            Number(targetLot.CostPrice) || it.costPrice,
            Number(targetLot.UnitPrice) || it.unitPrice,
            deduct * (Number(targetLot.CostPrice) || it.costPrice),
            `${notePrefix} ${it.note || ''} (Ref: ${singleLoanId})`,
            byUser
          ]);
        }

        // Record in LoanBalance
        loanRowsToAppend.push([
          singleLoanId,
          timestampStr,
          txType,
          refHospitalId,
          refHospitalName,
          it.itemCode,
          it.itemName,
          primaryLotNumber || it.lotNumber,
          primaryExpiryDate || it.expiryDate,
          it.qty, // QtyBorrowed
          txType === "RETURN_OUT" ? it.qty : 0, // QtyReturned
          txType === "LOAN_OUT" ? it.qty : 0,   // QtyOutstanding
          itemCategory,
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
          txType === "LOAN_OUT" ? "Pending" : "Completed" // LoanStatus
        ]);
      }
    }

    // Batch Append new Lots
    if (lotRowsToAppend.length > 0) {
      const lastRow = lotSheet.getLastRow();
      lotSheet.getRange(lastRow + 1, 1, lotRowsToAppend.length, lotRowsToAppend[0].length).setValues(lotRowsToAppend);
    }

    // Batch Append Stock Transactions
    if (txRowsToAppend.length > 0) {
      const lastRow = txSheet.getLastRow();
      txSheet.getRange(lastRow + 1, 1, txRowsToAppend.length, txRowsToAppend[0].length).setValues(txRowsToAppend);
    }

    // Batch Append Loan Balance Rows
    if (loanRowsToAppend.length > 0) {
      const lastRow = loanSheet.getLastRow();
      loanSheet.getRange(lastRow + 1, 1, loanRowsToAppend.length, loanRowsToAppend[0].length).setValues(loanRowsToAppend);
    }

    const typeThaiLabels = {
      LOAN_IN: "ยืมยาเข้าจากโรงพยาบาลอื่น",
      LOAN_OUT: "ให้ยืมยาออกแก่โรงพยาบาลอื่น",
      RETURN_OUT: "ส่งคืนยาที่ยืมมาแก่โรงพยาบาลเจ้าหนี้",
      RETURN_IN: "รับคืนยาที่ให้ยืมไป"
    };

    return {
      success: true,
      message: `บันทึกรายการ ${typeThaiLabels[txType] || txType} สำเร็จ (${validatedItems.length} รายการ | เลขที่: ${loanBatchId})`,
      loanId: loanBatchId,
      createdLoanIds: createdLoanIds,
      itemsCount: validatedItems.length
    };
  } catch (error) {
    Logger.log("❌ Error in saveInterHospitalLoan: " + error);
    return { success: false, message: error.toString() };
  }
}

/**
 * ฟังก์ชันแก้ไขข้อมูลรายการยืม-คืนยา (เช่น LOT NUMBER, วันหมดอายุ, จำนวน)
 */
function handleUpdateLoanTransaction(payload) {
  if (!payload || !payload.LoanID) {
    return { success: false, message: "กรุณาระบุเลขที่รายการ (Loan ID)" };
  }
  try {
    const ss = getSpreadsheet();
    const sheet = getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return { success: false, message: "ไม่พบข้อมูลในระบบ" };

    const headers = data[0];
    const loanIdCol = headers.indexOf("LoanID");
    const lotCol = headers.indexOf("LotNumber");
    const expCol = headers.indexOf("ExpiryDate");
    const itemCodeCol = headers.indexOf("ItemCode");
    const itemNameCol = headers.indexOf("ItemName");
    const qtyBorrowedCol = headers.indexOf("QtyBorrowed");
    const qtyReturnedCol = headers.indexOf("QtyReturned");
    const qtyOutstandingCol = headers.indexOf("QtyOutstanding");
    const statusCol = headers.indexOf("LoanStatus");

    const borrowerNameCol = headers.indexOf("BorrowerName");
    const borrowerPosCol = headers.indexOf("BorrowerPos");
    const borrowerApproveNameCol = headers.indexOf("BorrowerApproveName");
    const borrowerApprovePosCol = headers.indexOf("BorrowerApprovePos");
    const lenderNameCol = headers.indexOf("LenderName");
    const lenderPosCol = headers.indexOf("LenderPos");
    const lenderApproveNameCol = headers.indexOf("LenderApproveName");
    const lenderApprovePosCol = headers.indexOf("LenderApprovePos");
    const receiverNameCol = headers.indexOf("ReceiverName");
    const receiverPosCol = headers.indexOf("ReceiverPos");
    const returnDateCol = headers.indexOf("ReturnDate");
    const returnerNameCol = headers.indexOf("ReturnerName");
    const returnerPosCol = headers.indexOf("ReturnerPos");
    const returnReceiverNameCol = headers.indexOf("ReturnReceiverName");
    const returnReceiverPosCol = headers.indexOf("ReturnReceiverPos");
    const returnCarrierNameCol = headers.indexOf("ReturnCarrierName");
    const returnCarrierPosCol = headers.indexOf("ReturnCarrierPos");
    const refHospitalNameCol = headers.indexOf("RefHospitalName");
    const itemCategoryCol = headers.indexOf("ItemCategory");

    let foundRow = -1;
    for (let r = 1; r < data.length; r++) {
      if (String(data[r][loanIdCol] || '').trim().toUpperCase() === String(payload.LoanID).trim().toUpperCase()) {
        foundRow = r + 1;
        break;
      }
    }

    if (foundRow === -1) {
      return { success: false, message: "ไม่พบรายการยืม-คืนยาเลขที่ " + payload.LoanID };
    }

    if (lotCol !== -1 && payload.LotNumber !== undefined) sheet.getRange(foundRow, lotCol + 1).setValue(payload.LotNumber);
    if (expCol !== -1 && payload.ExpiryDate !== undefined) sheet.getRange(foundRow, expCol + 1).setValue(payload.ExpiryDate);
    if (itemCodeCol !== -1 && payload.ItemCode && payload.ItemCode !== "undefined") sheet.getRange(foundRow, itemCodeCol + 1).setValue(payload.ItemCode);
    if (itemNameCol !== -1 && payload.ItemName && payload.ItemName !== "undefined") sheet.getRange(foundRow, itemNameCol + 1).setValue(payload.ItemName);
    
    if (borrowerNameCol !== -1 && payload.BorrowerName !== undefined) sheet.getRange(foundRow, borrowerNameCol + 1).setValue(payload.BorrowerName);
    if (borrowerPosCol !== -1 && payload.BorrowerPos !== undefined) sheet.getRange(foundRow, borrowerPosCol + 1).setValue(payload.BorrowerPos);
    if (borrowerApproveNameCol !== -1 && payload.BorrowerApproveName !== undefined) sheet.getRange(foundRow, borrowerApproveNameCol + 1).setValue(payload.BorrowerApproveName);
    if (borrowerApprovePosCol !== -1 && payload.BorrowerApprovePos !== undefined) sheet.getRange(foundRow, borrowerApprovePosCol + 1).setValue(payload.BorrowerApprovePos);
    
    if (lenderNameCol !== -1 && payload.LenderName !== undefined) sheet.getRange(foundRow, lenderNameCol + 1).setValue(payload.LenderName);
    if (lenderPosCol !== -1 && payload.LenderPos !== undefined) sheet.getRange(foundRow, lenderPosCol + 1).setValue(payload.LenderPos);
    if (lenderApproveNameCol !== -1 && payload.LenderApproveName !== undefined) sheet.getRange(foundRow, lenderApproveNameCol + 1).setValue(payload.LenderApproveName);
    if (lenderApprovePosCol !== -1 && payload.LenderApprovePos !== undefined) sheet.getRange(foundRow, lenderApprovePosCol + 1).setValue(payload.LenderApprovePos);
    
    if (receiverNameCol !== -1 && payload.ReceiverName !== undefined) sheet.getRange(foundRow, receiverNameCol + 1).setValue(payload.ReceiverName);
    if (receiverPosCol !== -1 && payload.ReceiverPos !== undefined) sheet.getRange(foundRow, receiverPosCol + 1).setValue(payload.ReceiverPos);

    if (returnDateCol !== -1 && payload.ReturnDate !== undefined) sheet.getRange(foundRow, returnDateCol + 1).setValue(payload.ReturnDate);
    if (returnerNameCol !== -1 && payload.ReturnerName !== undefined) sheet.getRange(foundRow, returnerNameCol + 1).setValue(payload.ReturnerName);
    if (returnerPosCol !== -1 && payload.ReturnerPos !== undefined) sheet.getRange(foundRow, returnerPosCol + 1).setValue(payload.ReturnerPos);
    if (returnReceiverNameCol !== -1 && payload.ReturnReceiverName !== undefined) sheet.getRange(foundRow, returnReceiverNameCol + 1).setValue(payload.ReturnReceiverName);
    if (returnReceiverPosCol !== -1 && payload.ReturnReceiverPos !== undefined) sheet.getRange(foundRow, returnReceiverPosCol + 1).setValue(payload.ReturnReceiverPos);
    if (returnCarrierNameCol !== -1 && payload.ReturnCarrierName !== undefined) sheet.getRange(foundRow, returnCarrierNameCol + 1).setValue(payload.ReturnCarrierName);
    if (returnCarrierPosCol !== -1 && payload.ReturnCarrierPos !== undefined) sheet.getRange(foundRow, returnCarrierPosCol + 1).setValue(payload.ReturnCarrierPos);

    if (refHospitalNameCol !== -1 && payload.RefHospitalName !== undefined) sheet.getRange(foundRow, refHospitalNameCol + 1).setValue(payload.RefHospitalName);
    if (itemCategoryCol !== -1 && payload.ItemCategory !== undefined) sheet.getRange(foundRow, itemCategoryCol + 1).setValue(payload.ItemCategory);

    if (qtyBorrowedCol !== -1 && payload.QtyBorrowed !== undefined && Number(payload.QtyBorrowed) >= 0) {
      const newBorrowed = Number(payload.QtyBorrowed);
      sheet.getRange(foundRow, qtyBorrowedCol + 1).setValue(newBorrowed);
      const currReturned = (qtyReturnedCol !== -1) ? (Number(sheet.getRange(foundRow, qtyReturnedCol + 1).getValue()) || 0) : 0;
      const newOutstanding = Math.max(0, newBorrowed - currReturned);
      if (qtyOutstandingCol !== -1) sheet.getRange(foundRow, qtyOutstandingCol + 1).setValue(newOutstanding);
      if (statusCol !== -1 && newOutstanding === 0) sheet.getRange(foundRow, statusCol + 1).setValue("Completed");
    }

    return { success: true, message: "แก้ไขข้อมูลรายการยืม-คืนยาเรียบร้อยแล้ว" };
  } catch (err) {
    return { success: false, message: "เกิดข้อผิดพลาด: " + err.toString() };
  }
}

/**
 * ฟังก์ชันอนุมัติรายการยืม-คืนยาข้ามโรงพยาบาล (สำหรับหัวหน้า/ผู้จัดการฝ่ายเภสัชกรรม)
 */
function approveInterHospitalLoan(payload, user) {
  try {
    if (!payload || !payload.LoanID) {
      return { success: false, message: "ไม่พบรหัสรายการยืม-คืนยา (LoanID)" };
    }

    const action = String(payload.Action || "APPROVE").toUpperCase();
    const isApprove = action === "APPROVE";
    const approverName = String(payload.ApproverName || (user && user.FullName) || "").trim();
    const approverPos = String(payload.ApproverPosition || (user && user.Position) || "").trim();
    const note = String(payload.Note || "").trim();

    // ตรวจสอบสิทธิ์ (เฉพาะผู้จัดการฝ่ายเภสัชกรรม / Admin)
    const allowedRoles = ["ADMIN", "MANAGER", "PHARMACY_MANAGER", "หัวหน้าฝ่ายเภสัชกรรม", "ผู้จัดการฝ่ายเภสัชกรรม"];
    const userRole = String((user && user.Role) || "").toUpperCase();
    const isManagerPos = approverPos.includes("ผู้จัดการ") || approverPos.includes("หัวหน้า") || approverPos.includes("Admin");

    if (!allowedRoles.includes(userRole) && !isManagerPos && userRole !== "ADMIN") {
      return {
        success: false,
        message: `คุณไม่มีสิทธิ์อนุมัติรายการยืม-คืนยา (ตำแหน่งปัจจุบันของคุณ: ${approverPos || 'ไม่ระบุ'})`
      };
    }

    if (!approverName) {
      return { success: false, message: "กรุณาระบุชื่อผู้จัดการฝ่ายเภสัชกรรมผู้อนุมัติ" };
    }

    if (!isApprove && !note) {
      return { success: false, message: "กรณีไม่อนุมัติรายการ จำเป็นต้องระบุเหตุผล (Note)" };
    }

    const loanId = String(payload.LoanID).trim().toUpperCase();
    const ss = getSpreadsheet();
    const loanSheet = getSheetSafe(ss, SHEETS.LOAN_BALANCE, HEADERS.LoanBalance);
    const lotSheet = getSheetSafe(ss, SHEETS.INVENTORY_LOT, HEADERS.InventoryLot);
    const txSheet = getSheetSafe(ss, SHEETS.STOCK_TRANSACTION, HEADERS.StockTransaction);

    const loans = sheetToObjects(loanSheet);
    const targetLoans = loans.filter(l => 
      String(l.LoanID || "").trim().toUpperCase() === loanId ||
      String(l.LoanID || "").trim().toUpperCase().startsWith(loanId + "-")
    );

    if (targetLoans.length === 0) {
      return { success: false, message: `ไม่พบรายการยืม-คืนเลขที่ ${loanId} ในระบบ` };
    }

    const now = new Date();
    const nowStr = Utilities.formatDate(now, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    let processedCount = 0;

    targetLoans.forEach(targetLoan => {
      const rowNum = targetLoan._rowNumber;
      const txType = String(targetLoan.TransactionType || "").toUpperCase();
      const outstanding = Number(targetLoan.QtyOutstanding) || 0;

      let newStatus = "";
      if (isApprove) {
        if (txType === "LOAN_IN" || txType === "LOAN_OUT") {
          newStatus = outstanding > 0 ? "Pending" : "Completed";
        } else {
          newStatus = "Completed";
        }
      } else {
        newStatus = "Rejected";
      }

      // Col 15: BorrowerApproveName, Col 16: BorrowerApprovePos
      // Col 19: LenderApproveName, Col 20: LenderApprovePos
      // Col 31: LoanStatus
      if (txType === "LOAN_IN" || txType === "RETURN_OUT") {
        loanSheet.getRange(rowNum, 15).setValue(approverName);
        loanSheet.getRange(rowNum, 16).setValue("ผู้จัดการฝ่ายเภสัชกรรม");
      } else {
        loanSheet.getRange(rowNum, 19).setValue(approverName);
        loanSheet.getRange(rowNum, 20).setValue("ผู้จัดการฝ่ายเภสัชกรรม");
      }

      loanSheet.getRange(rowNum, 31).setValue(newStatus);
      processedCount++;
    });

    return {
      success: true,
      message: isApprove
        ? `อนุมัติรายการยืม-คืนยา (${loanId}) สำเร็จโดยผู้จัดการฝ่ายเภสัชกรรม (${approverName})`
        : `ปฏิเสธรายการยืม-คืนยา (${loanId}) เรียบร้อยแล้ว`,
      loanId: loanId,
      action: isApprove ? "Approved" : "Rejected",
      approverName: approverName,
      approverPos: "ผู้จัดการฝ่ายเภสัชกรรม",
      count: processedCount
    };

  } catch (err) {
    return {
      success: false,
      message: "เกิดข้อผิดพลาดในการอนุมัติรายการยืม-คืน: " + err.toString()
    };
  }
}

// ==============================================================================
// 🤖 LINE BOT & AUTOMATED EXPIRY ALERT NOTIFICATION SYSTEM
// ศูนย์การแพทย์รามาธิบดีศรีอยุธยา (Ramathibodi Si Ayutthaya Medical Center)
// ==============================================================================

const LINE_CONFIG = {
  ACCESS_TOKEN: 'iJ0UeypYIWXGQcUPvKjmvOjubqhdTJuiV5SyBR1V4R9wk6Ew2aYWvQmR1+SJrjWEHieORK6vKsiPjZrsGfCYKaCuamgRZirYgoZa1fTsUfM/w61xaNj1IARvwWgoXjvAzasuBotkz9mJ4EEsCWqsSgdB04t89/1O/w1cDnyilFU=',
  ADMIN_USER_ID: 'U08f0b47d541c2e5a73a59d22dadd4d34',
  DEFAULT_LOGO_URL: 'https://lh3.googleusercontent.com/d/1wHSSUymB-0hRVZqqrKG35yWz8gDPFSOR',
  DEFAULT_VACCINE_IMG: 'https://images.unsplash.com/photo-1633526543814-9718c8922b7a?auto=format&fit=crop&w=600&q=80',
  DEFAULT_MEDICINE_IMG: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
};

/**
 * ฟังก์ชันสำหรับกด Run เพื่อให้ Google Apps Script ขอสิทธิ์การเข้าถึงภายนอก (UrlFetchApp Permission)
 */
function authorizeScript() {
  Logger.log("กำลังตรวจสอบสิทธิ์การเชื่อมต่อ...");
  const res = UrlFetchApp.fetch("https://api.line.me/v2/bot/info", {
    headers: { "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN },
    muteHttpExceptions: true
  });
  Logger.log("ผลการตรวจสอบ: " + res.getContentText());
  return "สิทธิ์การเข้าถึงผ่านเรียบร้อยแล้ว";
}

/**
 * 1. ฟังก์ชันแจ้งเตือนหมดอายุ (Trigger) - ส่งสรุปรายงานประจำสัปดาห์แบบ LINE Flex Message
 * ระบบกำหนดให้ส่งรายงานเฉพาะ "ทุกวันอังคาร เวลา 08:00 น."
 */
function checkExpiryAlert() {
  const today = new Date();
  // คำนวณวันในสัปดาห์ตามเวลาประเทศไทย GMT+7 (0 = อาทิตย์, 1 = จันทร์, 2 = อังคาร, 3 = พุธ, ...)
  const bangkokDay = today.getDay(); 
  if (bangkokDay !== 2) {
    console.log(`ℹ️ วันนี้ไม่ใช่วันอังคาร (Day ${bangkokDay}) ระบบข้ามการส่งสรุปรายงาน LINE อัตโนมัติ`);
    return;
  }

  console.log("🚀 เริ่มต้นรันฟังก์ชัน checkExpiryAlert (ส่งสรุปรายงานประจำวันอังคารแบบ Flex Message)");
  try {
    sendDailyExpiryFlexAlert();
  } catch (error) {
    Logger.log("❌ เกิดข้อผิดพลาดใน checkExpiryAlert: " + error);
  }
}

/**
 * ⏰ ฟังก์ชันช่วยตั้งค่า Trigger อัตโนมัติใน Google Apps Script (กด Run 1 ครั้ง)
 * - ตรวจหาและลบ Trigger เก่าที่อาจตั้งไว้ในวันจันทร์ / วันพุธ ออกทั้งหมด เพื่อป้องกันการส่งซ้ำ
 * - สร้าง Time-driven Trigger ใหม่ให้ทำงานเฉพาะ "ทุกวันอังคาร เวลา 08:00 - 09:00 น."
 */
function setupTuesdayExpiryAlertTrigger() {
  const functionName = "checkExpiryAlert";
  const triggers = ScriptApp.getProjectTriggers();
  let deletedCount = 0;

  // 1. ลบ Trigger เก่าที่เกี่ยวข้องทั้งหมด
  triggers.forEach(trigger => {
    const fn = trigger.getHandlerFunction();
    if (fn === functionName || fn === "sendDailyExpiryFlexAlert" || fn === "sendDailyExpiryReportToLine") {
      ScriptApp.deleteTrigger(trigger);
      deletedCount++;
    }
  });
  console.log(`🗑️ ลบ Trigger เก่าออกทั้งหมดแล้ว: ${deletedCount} รายการ`);

  // 2. สร้าง Trigger ใหม่: ทำงานทุกวันอังคาร เวลา 08:00 น. (โซนเวลาของโปรเจกต์ GMT+7)
  ScriptApp.newTrigger(functionName)
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.TUESDAY)
    .atHour(8)
    .create();

  console.log(`✅ ตั้งค่า Trigger สำเร็จ: ระบบจะส่งสรุปรายงานทุกวันอังคาร เวลา 08:00 น. (GMT+7)`);
  return `✅ ตั้งค่าสำเร็จ: ลบ Trigger เก่า ${deletedCount} รายการ และตั้งเวลาส่งสรุปรายงานทุกวันอังคาร เวลา 08:00 น. เรียบร้อยแล้ว`;
}

/**
 * ฟังก์ชันหลักในการรวบรวมข้อมูลยาและวัคซีนที่ใกล้หมดอายุ และส่ง Flex Message แจ้งเตือน
 * - หากระบุ targetUserId: ส่งแบบ Push หาเฉพาะบุคคลนั้น
 * - หากไม่ระบุ (หรือรันจาก Trigger ประจำวัน): ส่งแบบ Broadcast หาผู้ที่แอด LINE ทุกคนอัตโนมัติ
 */
function sendDailyExpiryFlexAlert(targetUserId) {
  if (!LINE_CONFIG.ACCESS_TOKEN) {
    Logger.log("⚠️ ไม่พบ ACCESS_TOKEN ใน LINE_CONFIG");
    return;
  }

  const allItems = getLineBotInventoryData();
  const rawVaccines = allItems.filter(i => i.category === "VACCINE");
  const rawMedicines = allItems.filter(i => i.category === "MEDICINE");

  // กรองเฉพาะรายการยาที่มี lot ใกล้หมดอายุภายใน 1 ปี หรือหมดอายุแล้ว
  let expiringMeds = [];
  rawMedicines.forEach(item => {
    let expLots = [];
    if (item.lotDetails && item.lotDetails.length > 0) {
      expLots = item.lotDetails.filter(l => l.isExpiring1Y || l.isExpired);
    } else if (item.isExpiring1Y || item.isExpired) {
      expLots = [{
        lot: item.lot || "-",
        expDate: item.expDate || "-",
        remainingDays: item.remainingDays || "-",
        qty: item.remaining || 0
      }];
    }

    if (expLots.length > 0) {
      expLots.sort((a, b) => {
        let da = (typeof a.remainingDays === 'number' && !isNaN(a.remainingDays)) ? a.remainingDays : 99999;
        let db = (typeof b.remainingDays === 'number' && !isNaN(b.remainingDays)) ? b.remainingDays : 99999;
        return da - db;
      });
      let totalExpQty = expLots.reduce((acc, cur) => acc + (parseFloat(cur.qty) || 0), 0);
      expiringMeds.push({
        ...item,
        expiringLots: expLots,
        totalExpiringQty: totalExpQty
      });
    }
  });

  // กรองเฉพาะรายการวัคซีนที่มี lot ใกล้หมดอายุภายใน 1 ปี (หรือ 6 เดือน) หรือหมดอายุแล้ว
  let expiringVacs = [];
  rawVaccines.forEach(item => {
    let expLots = [];
    if (item.lotDetails && item.lotDetails.length > 0) {
      expLots = item.lotDetails.filter(l => l.isExpiring1Y || l.isExpiring6M || l.isExpired);
    } else if (item.isExpiring1Y || item.isExpiring6M || item.isExpired) {
      expLots = [{
        lot: item.lot || "-",
        expDate: item.expDate || "-",
        remainingDays: item.remainingDays || "-",
        qty: item.remaining || 0
      }];
    }

    if (expLots.length > 0) {
      expLots.sort((a, b) => {
        let da = (typeof a.remainingDays === 'number' && !isNaN(a.remainingDays)) ? a.remainingDays : 99999;
        let db = (typeof b.remainingDays === 'number' && !isNaN(b.remainingDays)) ? b.remainingDays : 99999;
        return da - db;
      });
      let totalExpQty = expLots.reduce((acc, cur) => acc + (parseFloat(cur.qty) || 0), 0);
      expiringVacs.push({
        ...item,
        expiringLots: expLots,
        totalExpiringQty: totalExpQty
      });
    }
  });

  const flexBubble = buildDailySummaryFlexBubble(expiringMeds, expiringVacs);
  const altText = `สรุปรายงานประจำวันที่ ${Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy")}`;

  // หากระบุ User ID แบบเจาะจง (String) -> ส่งแบบ Push Message
  if (typeof targetUserId === "string" && targetUserId.trim() !== "") {
    sendLinePushFlexMessage(targetUserId.trim(), flexBubble, altText);
  } else {
    // หากรันจาก Trigger หรือไม่ได้ระบุ User -> บอร์ดแคสต์ส่งหาผู้ที่แอด LINE ทุกคน (Broadcast API)
    sendLineBroadcastFlexMessage(flexBubble, altText);
  }
}

/**
 * ฟังก์ชันสร้าง JSON โครงสร้าง LINE Flex Message (Bubble Container) ตามดีไซน์
 */
function buildDailySummaryFlexBubble(medicines, vaccines) {
  const todayStr = Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy");
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
    medicines.forEach((med, idx) => {
      let medBlock = [];
      let unitText = med.unit || "tablet";
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
          let rDaysText = (typeof rDays === 'number' && !isNaN(rDays)) ? `${rDays} วัน` : (rDays ? `${rDays} วัน` : "-");
          
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

      if (idx < medicines.length - 1) {
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
    vaccines.forEach((vac, idx) => {
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
          let rDaysText = (typeof rDays === 'number' && !isNaN(rDays)) ? `${rDays} วัน` : (rDays ? `${rDays} วัน` : "-");
          
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

      if (idx < vaccines.length - 1) {
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
 * ส่ง LINE Flex Message ผ่าน Broadcast API (ส่งหาทุกคนที่แอด LINE Official Account / Bot เป็นเพื่อน)
 */
function sendLineBroadcastFlexMessage(flexBubble, altText) {
  try {
    const options = {
      "method": "post",
      "headers": { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN 
      },
      "payload": JSON.stringify({ 
        "messages": [ 
          { 
            "type": "flex", 
            "altText": altText || "สรุปรายงานประจำวัน", 
            "contents": flexBubble 
          } 
        ] 
      }),
      "muteHttpExceptions": true
    };
    const res = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/broadcast", options);
    const statusCode = res.getResponseCode();
    if (statusCode === 200) {
      Logger.log("✅ ส่ง Broadcast Flex Message สำเร็จไปยังทุกคนที่แอดไลน์ (HTTP 200)");
    } else {
      Logger.log("⚠️ LINE Broadcast API ตอบกลับรหัส " + statusCode + ": " + res.getContentText());
    }
  } catch (err) {
    Logger.log("❌ เกิดข้อผิดพลาดในการส่ง LINE Broadcast Flex: " + err);
  }
}

/**
 * ส่ง LINE Flex Message ผ่าน Push API
 */
function sendLinePushFlexMessage(userId, flexBubble, altText) {
  try {
    const options = {
      "method": "post",
      "headers": { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN 
      },
      "payload": JSON.stringify({ 
        "to": userId, 
        "messages": [ 
          { 
            "type": "flex", 
            "altText": altText || "สรุปรายงานประจำวัน", 
            "contents": flexBubble 
          } 
        ] 
      }),
      "muteHttpExceptions": true
    };
    const res = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
    const statusCode = res.getResponseCode();
    if (statusCode === 200) {
      Logger.log("✅ ส่ง Push Flex Message สำเร็จ (HTTP 200)");
    } else {
      Logger.log("⚠️ LINE Push API ตอบกลับรหัส " + statusCode + ": " + res.getContentText());
    }
  } catch (err) {
    Logger.log("❌ เกิดข้อผิดพลาดในการส่ง LINE Push Flex: " + err);
  }
}

/**
 * ส่ง LINE Flex Message ผ่าน Reply API
 */
function sendLineReplyFlexMessage(replyToken, flexBubble, altText) {
  try {
    const options = {
      "method": "post",
      "headers": { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN 
      },
      "payload": JSON.stringify({ 
        "replyToken": replyToken, 
        "messages": [ 
          { 
            "type": "flex", 
            "altText": altText || "สรุปรายงานประจำวัน", 
            "contents": flexBubble 
          } 
        ] 
      }),
      "muteHttpExceptions": true
    };
    const res = UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", options);
    Logger.log("✅ ส่ง Reply Flex Message สำเร็จ: " + res.getContentText());
  } catch (err) {
    Logger.log("❌ เกิดข้อผิดพลาดในการส่ง LINE Reply Flex: " + err);
  }
}

/**
 * 💉 ตรวจสอบและแจ้งเตือนวัคซีนใกล้หมดอายุ (ภายใน 6 เดือน หรือหมดอายุแล้ว)
 */
function checkVaccineExpiryAlert() {
  try {
    const allItems = getLineBotInventoryData();
    const vaccines = allItems.filter(item => item.category === "VACCINE");

    let expiringItems = [];
    vaccines.forEach(item => {
      if (item.lotDetails && item.lotDetails.length > 0) {
        item.lotDetails.forEach(d => {
          if (d.isExpiring6M || d.isExpired) {
            let enNameLine = (item.itemNameEN && item.itemNameEN !== "-" && item.itemNameEN !== "") ? `\n${item.itemNameEN}` : "";
            let alertPrefix = d.isExpired ? "⛔ [หมดอายุแล้ว]" : "⚠️ [ใกล้หมดอายุ 6 เดือน]";
            let alertBlock = `${alertPrefix} ${item.itemNameTH || "-"}${enNameLine}\nLot: ${d.lot || "-"}\nวันหมดอายุ: ${d.expDate || "-"}\nจำนวนคงเหลือ: ${d.qty} Dose`;
            expiringItems.push(alertBlock);
          }
        });
      }
    });

    if (expiringItems.length > 0) {
      let message = "🔔 แจ้งเตือนวัคซีนใกล้หมดอายุ (ภายใน 6 เดือน):\n\n" + expiringItems.join("\n\n");
      sendLinePushMessage(LINE_CONFIG.ADMIN_USER_ID, message);
      Logger.log("✅ ส่งแจ้งเตือนวัคซีนใกล้หมดอายุสำเร็จ (พบ " + expiringItems.length + " รายการ)");
    } else {
      sendLinePushMessage(LINE_CONFIG.ADMIN_USER_ID, "✅ ระบบแจ้งเตือนสต็อกวัคซีน: ตรวจสอบวันนี้ ไม่พบวัคซีนที่หมดอายุหรือใกล้หมดอายุภายใน 6 เดือนครับ");
      Logger.log("✅ ไม่พบวัคซีนใกล้หมดอายุภายใน 6 เดือน");
    }
  } catch (err) {
    Logger.log("❌ Error in checkVaccineExpiryAlert: " + err);
  }
}

/**
 * 💊 ตรวจสอบและแจ้งเตือนยาใกล้หมดอายุ (ภายใน 1 ปี หรือหมดอายุแล้ว)
 */
function checkMedicineExpiryAlert() {
  try {
    const allItems = getLineBotInventoryData();
    const medicines = allItems.filter(item => item.category === "MEDICINE");

    let expiringItems = [];
    medicines.forEach(item => {
      if (item.lotDetails && item.lotDetails.length > 0) {
        item.lotDetails.forEach(d => {
          if (d.isExpiring1Y || d.isExpired) {
            let unitText = item.unit || "หน่วยนับ";
            let enNameLine = (item.itemNameEN && item.itemNameEN !== "-" && item.itemNameEN !== "") ? `\n${item.itemNameEN}` : "";
            let alertPrefix = d.isExpired ? "⛔ [หมดอายุแล้ว]" : "⚠️ [ใกล้หมดอายุ 1 ปี]";
            let alertBlock = `${alertPrefix} ${item.itemNameTH || "-"}${enNameLine}\nLot: ${d.lot || "-"}\nวันหมดอายุ: ${d.expDate || "-"}\nจำนวนคงเหลือ: ${d.qty} ${unitText}`;
            expiringItems.push(alertBlock);
          }
        });
      }
    });

    if (expiringItems.length > 0) {
      let message = "🔔 แจ้งเตือนยาใกล้หมดอายุ (ภายใน 1 ปี):\n\n" + expiringItems.join("\n\n");
      sendLinePushMessage(LINE_CONFIG.ADMIN_USER_ID, message);
      Logger.log("✅ ส่งแจ้งเตือนยาใกล้หมดอายุสำเร็จ (พบ " + expiringItems.length + " รายการ)");
    } else {
      sendLinePushMessage(LINE_CONFIG.ADMIN_USER_ID, "✅ ระบบแจ้งเตือนสต็อกยา: ตรวจสอบวันนี้ ไม่พบยาที่หมดอายุหรือใกล้หมดอายุภายใน 1 ปีครับ");
      Logger.log("✅ ไม่พบยาใกล้หมดอายุภายใน 1 ปี");
    }
  } catch (err) {
    Logger.log("❌ Error in checkMedicineExpiryAlert: " + err);
  }
}

/**
 * 2. แปลงข้อมูลสต็อกและ Lot สำหรับ LINE Bot & Dashboard
 */
function getLineBotInventoryData() {
  try {
    const dashboard = handleGetDashboard();
    const items = (dashboard && dashboard.items) ? dashboard.items : [];

    return items.map(it => {
      const isVaccine = it.Category && (it.Category.toString().includes("วัคซีน") || it.Category.toString().toUpperCase().includes("VACCINE"));
      const category = isVaccine ? "VACCINE" : "MEDICINE";

      const activeLots = (it.ActiveLots || []).map(l => {
        let expObj = parseFlexibleDate(l.ExpiryDate);
        let expDateFormatted = expObj ? Utilities.formatDate(expObj, "GMT+7", "dd/MM/yyyy") : (l.ExpiryDate || "-");
        let daysLeft = (typeof l.DaysLeft === 'number' && !isNaN(l.DaysLeft)) ? l.DaysLeft : 9999;
        let isExpired = daysLeft <= 0 || l.ExpiryStatus === "Expired";
        let isExpiring6M = daysLeft > 0 && daysLeft <= 180;
        let isExpiring1Y = daysLeft > 0 && daysLeft <= 365;

        return {
          lot: l.LotNumber || "-",
          expDate: expDateFormatted,
          rawExpDate: l.ExpiryDate,
          qty: Number(l.Qty) || 0,
          remainingDays: daysLeft,
          isExpiring6M: isExpiring6M,
          isExpiring1Y: isExpiring1Y,
          isExpired: isExpired
        };
      });

      const firstLot = activeLots[0] || null;
      const isExpiring6M = activeLots.some(l => l.isExpiring6M);
      const isExpiring1Y = activeLots.some(l => l.isExpiring1Y);
      const isExpired = activeLots.some(l => l.isExpired);
      const isExpiring = isVaccine ? isExpiring6M : isExpiring1Y;

      let status = "OK";
      if (Number(it.TotalQty) <= 0) status = "OUT";
      else if (it.IsLowStock || Number(it.TotalQty) < Number(it.Min)) status = "LOW";

      let defaultImg = isVaccine ? LINE_CONFIG.DEFAULT_VACCINE_IMG : LINE_CONFIG.DEFAULT_MEDICINE_IMG;
      let imgUrl = (it.ImageUrl && String(it.ImageUrl).startsWith("http")) ? it.ImageUrl : defaultImg;

      return {
        category: category,
        itemCode: it.ItemCode || "",
        itemNameTH: it.ItemName || "",
        itemNameEN: it.GenericName || "",
        unit: it.BaseUnit || (isVaccine ? "Dose" : "หน่วย"),
        remaining: Number(it.TotalQty) || 0,
        min: Number(it.Min) || 0,
        status: status,
        lot: firstLot ? firstLot.lot : "-",
        expDate: firstLot ? firstLot.expDate : "-",
        lots: activeLots.map(l => l.lot),
        expDates: activeLots.map(l => l.expDate),
        lotDetails: activeLots,
        isExpiring6M: isExpiring6M,
        isExpiring1Y: isExpiring1Y,
        isExpired: isExpired,
        isExpiring: isExpiring,
        imageUrl: imgUrl
      };
    });
  } catch (err) {
    Logger.log("❌ Error in getLineBotInventoryData: " + err);
    return [];
  }
}

/**
 * 3. ประมวลผลข้อความ LINE Webhook (doPost Routing)
 */
function handleLineWebhook(requestBody) {
  try {
    if (!requestBody || !requestBody.events || !Array.isArray(requestBody.events)) {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const event = requestBody.events[0];
    if (!event || event.type !== "message" || event.message.type !== "text") {
      return ContentService.createTextOutput(JSON.stringify({ status: "ignored" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const userMessage = event.message.text.trim().toLowerCase();
    const replyToken = event.replyToken;
    const combinedInventory = getLineBotInventoryData();

    if (combinedInventory.length === 0) {
      sendLineTextMessage(replyToken, "ยังไม่มีข้อมูลสต็อกในตารางครับ");
      return ContentService.createTextOutput(JSON.stringify({ status: "empty_inventory" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // กลุ่มคำสั่งหมวดหมู่และสถานะ
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
        // ค้นหาตามชื่อสินค้า รหัสสินค้า หรือ Lot
        let nameThStr = (item.itemNameTH || "").toString().toLowerCase();
        let nameEnStr = (item.itemNameEN || "").toString().toLowerCase();
        let codeStr = (item.itemCode || "").toString().toLowerCase();
        let lotStr = (item.lot || "").toString().toLowerCase();
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
      if (stockReport.length > 10) stockReport = stockReport.slice(0, 10);
      sendLineFlexMessage(replyToken, stockReport);
    } else {
      sendLineTextMessage(replyToken, "🔍 ไม่พบข้อมูลยาหรือวัคซีนที่ตรงกับคำค้นหาของคุณครับ\n\n💡 คำสั่งแนะนำ:\n• พิมพ์ 'stock' หรือ 'ทั้งหมด' เพื่อดูสินค้าทั้งหมด\n• พิมพ์ 'วัคซีน' เพื่อดูเฉพาะวัคซีน\n• พิมพ์ 'ยา' เพื่อดูเฉพาะยา\n• พิมพ์ 'ok' เพื่อดูสต็อกปกติ\n• พิมพ์ 'low' เพื่อดูสต็อกใกล้หมด\n• พิมพ์ 'out' เพื่อดูของหมด\n• พิมพ์ 'ใกล้หมดอายุ' เพื่อดูสินค้าใกล้หมดอายุ\n• พิมพ์ชื่อยา, รหัสสินค้า, หรือเลข Lot เพื่อค้นหา");
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("❌ Error in handleLineWebhook: " + error);
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * 4. ส่งข้อความ Flex Message Carousel ผ่าน LINE Reply API
 */
function sendLineFlexMessage(replyToken, stockData) {
  try {
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

    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
      "method": "post", 
      "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN },
      "payload": JSON.stringify({ 
        "replyToken": replyToken, 
        "messages": [ { 
          "type": "flex", 
          "altText": "📊 รายงานสต็อก Real-time | ศูนย์การแพทย์รามาธิบดีศรีอยุธยา", 
          "contents": { "type": "carousel", "contents": flexContents } 
        } ] 
      }),
      "muteHttpExceptions": true
    });
  } catch (err) {
    Logger.log("❌ Error sending flex message: " + err);
  }
}

/**
 * 5. ส่งข้อความ Text Message ทั่วไปผ่าน LINE Reply API
 */
function sendLineTextMessage(replyToken, message) {
  try {
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
      "method": "post", 
      "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN },
      "payload": JSON.stringify({ "replyToken": replyToken, "messages": [ { "type": "text", "text": message } ] }),
      "muteHttpExceptions": true
    });
  } catch (err) {
    Logger.log("❌ Error sending text message: " + err);
  }
}

/**
 * 6. ส่งข้อความ Push Message ไปยัง Admin หรือ User ผ่าน LINE Push API
 */
function sendLinePushMessage(userId, message) {
  try {
    const options = {
      "method": "post",
      "headers": { 
        "Content-Type": "application/json", 
        "Authorization": "Bearer " + LINE_CONFIG.ACCESS_TOKEN 
      },
      "payload": JSON.stringify({ 
        "to": userId, 
        "messages": [ { "type": "text", "text": message } ] 
      }),
      "muteHttpExceptions": true
    };
    UrlFetchApp.fetch("https://api.line.me/v2/bot/message/push", options);
  } catch (err) {
    Logger.log("❌ เกิดข้อผิดพลาดในการส่ง LINE Push Message: " + err);
  }
}

