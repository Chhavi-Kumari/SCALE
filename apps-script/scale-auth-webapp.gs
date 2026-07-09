const AUTHORIZED_USERS_SHEET_TITLE = "Authorized Users";
const REQUEST_SHEET_TITLE = "Access Requests";
const AUTHORIZED_HEADERS = [
  "Email",
  "Name",
  "Password",
  "Organization",
  "Active",
  "Created On"
];
const AUTH_SHEET_ID_FALLBACK = "1UtmF31qTDOh_gzVLrFmRe4NMqHX_-mrCo6l7xr8Sijc";
const REQUEST_HEADERS = [
  "Timestamp",
  "First Name",
  "Last Name",
  "Email",
  "Organization",
  "Reason",
  "Status"
];
const PASSWORD_PLACEHOLDER = "CHANGE_ME";

function normalizeText_(value) {
  return String(value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/[\u2013\u2014]/g, "-")
    .trim();
}

function normalizeLookupText_(value) {
  return normalizeText_(value).toLowerCase();
}

function headerKey_(value) {
  return normalizeLookupText_(value).replace(/[^a-z0-9]/g, "");
}

function getSpreadsheet_() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (activeSpreadsheet) {
    return activeSpreadsheet;
  }

  const scriptSpreadsheetId = PropertiesService.getScriptProperties().getProperty("AUTH_SHEET_ID");
  if (scriptSpreadsheetId) {
    return SpreadsheetApp.openById(scriptSpreadsheetId);
  }

  if (AUTH_SHEET_ID_FALLBACK) {
    return SpreadsheetApp.openById(AUTH_SHEET_ID_FALLBACK);
  }

  throw new Error(
    "No active spreadsheet found. Bind this script to the credential sheet or set AUTH_SHEET_ID in script properties."
  );
}

function getSheetByName_(name) {
  return getSpreadsheet_().getSheetByName(name);
}

function parseRows_(values) {
  const filtered = values.filter((row) => row.some((cell) => normalizeText_(cell)));
  const [headerRow = [], ...dataRows] = filtered;
  const headers = headerRow.map((header) => headerKey_(header));

  return dataRows.map((row) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = row[index] ?? "";
    });
    return record;
  });
}

function getSheetRows_(sheet) {
  if (!sheet) {
    return [];
  }

  return parseRows_(sheet.getDataRange().getValues());
}

function getAllSheetRows_() {
  const spreadsheet = getSpreadsheet_();
  return spreadsheet.getSheets().map((sheet) => ({
    title: sheet.getName(),
    rows: parseRows_(sheet.getDataRange().getValues())
  }));
}

function getCell_(row, keys) {
  for (const key of keys) {
    const value = row[key];
    if (value !== undefined && value !== null && normalizeText_(value)) {
      return normalizeText_(value);
    }
  }

  return "";
}

function isTruthy_(value) {
  return ["true", "checked", "yes", "1", "active", "approved", "y"].includes(
    normalizeLookupText_(value)
  );
}

function isFalsey_(value) {
  return ["false", "unchecked", "no", "0", "inactive", "rejected", "n"].includes(
    normalizeLookupText_(value)
  );
}

function splitName_(value) {
  const parts = normalizeText_(value)
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ")
  };
}

function rowLooksLikeAuthorizedUser_(row) {
  return Boolean(getCell_(row, ["email"]) && getCell_(row, ["password"]));
}

function rowLooksLikeRequest_(row) {
  return Boolean(
    getCell_(row, ["email"]) &&
      (getCell_(row, ["reason"]) || getCell_(row, ["status"]) || getCell_(row, ["timestamp"]))
  );
}

function isAuthorizedRowActive_(row) {
  const active = getCell_(row, ["active", "status"]);
  return !active ? true : isTruthy_(active);
}

function getAuthorizedUserFromRow_(row) {
  if (!rowLooksLikeAuthorizedUser_(row)) return null;

  const name = getCell_(row, ["name"]);
  const splitName = splitName_(name);

  return {
    email: getCell_(row, ["email"]),
    firstName: getCell_(row, ["first name", "firstname"]) || splitName.firstName,
    lastName: getCell_(row, ["last name", "lastname"]) || splitName.lastName,
    organization: getCell_(row, ["organization"]),
    active: isAuthorizedRowActive_(row)
  };
}

function findLoginCandidateByEmail_(email) {
  const expectedEmail = normalizeLookupText_(email);
  const sheet = getSheetByName_(AUTHORIZED_USERS_SHEET_TITLE);

  for (const row of getSheetRows_(sheet)) {
    const user = getAuthorizedUserFromRow_(row);
    if (!user) continue;

    const rowEmail = normalizeLookupText_(user.email);
    if (rowEmail !== expectedEmail) {
      continue;
    }

    return {
      user,
      rowPassword: String(getCell_(row, ["password"]) ?? ""),
      active: user.active
    };
  }

  return null;
}

function getAuthorizedUserStatusByEmail_(email) {
  const normalizedEmail = normalizeLookupText_(email);
  const sheet = getSheetByName_(AUTHORIZED_USERS_SHEET_TITLE);

  for (const row of getSheetRows_(sheet)) {
    const user = getAuthorizedUserFromRow_(row);
    if (!user || !user.active) continue;

    if (normalizeLookupText_(user.email) === normalizedEmail) {
      return "authorized";
    }
  }

  return "available";
}

function getRequestSheetStatusByEmail_(email) {
  const normalizedEmail = normalizeLookupText_(email);
  const sheet = getSheetByName_(REQUEST_SHEET_TITLE);
  const rows = getSheetRows_(sheet);

  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    const rowEmail = getCell_(row, ["email"]);

    if (!rowEmail || normalizeLookupText_(rowEmail) !== normalizedEmail) {
      continue;
    }

    const status = normalizeLookupText_(getCell_(row, ["status"]));
    if (["approved", "pending", "denied"].includes(status)) {
      return status;
    }

    if (!status) {
      return "pending";
    }

    if (isFalsey_(status)) {
      return "denied";
    }

    return "pending";
  }

  return "available";
}

function getEmailStatus_(email) {
  const authorizedStatus = getAuthorizedUserStatusByEmail_(email);
  if (authorizedStatus !== "available") {
    return authorizedStatus;
  }

  return getRequestSheetStatusByEmail_(email);
}

function ensureSheetHeaders_(sheet, headers) {
  const currentHeader = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
  const headerMatches = headers.every(
    (header, index) => normalizeText_(currentHeader[index]) === normalizeText_(header)
  );

  if (!headerMatches) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function ensureRequestSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(REQUEST_SHEET_TITLE);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(REQUEST_SHEET_TITLE);
  }

  return ensureSheetHeaders_(sheet, REQUEST_HEADERS);
}

function ensureAuthorizedUsersSheet_() {
  const spreadsheet = getSpreadsheet_();
  let sheet = spreadsheet.getSheetByName(AUTHORIZED_USERS_SHEET_TITLE);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(AUTHORIZED_USERS_SHEET_TITLE);
  }

  return ensureSheetHeaders_(sheet, AUTHORIZED_HEADERS);
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function handleLogin_(payload) {
  const email = normalizeText_(payload.email);
  const password = String(payload.password ?? "");

  if (!email || !password) {
    return jsonResponse_({
      ok: false,
      error: "Email and password are required."
    });
  }

  const lookup = findLoginCandidateByEmail_(email);

  if (!lookup) {
    return jsonResponse_({
      ok: false,
      code: "email_not_found",
      error: "Email not found."
    });
  }

  if (!lookup.active) {
    return jsonResponse_({
      ok: false,
      code: "account_inactive",
      error: "Account inactive."
    });
  }

  if (String(lookup.rowPassword ?? "") !== password) {
    return jsonResponse_({
      ok: false,
      code: "incorrect_password",
      error: "Incorrect password."
    });
  }

  return jsonResponse_({
    ok: true,
    user: lookup.user
      ? {
          email: lookup.user.email,
          firstName: lookup.user.firstName,
          lastName: lookup.user.lastName,
          organization: lookup.user.organization,
          active: lookup.user.active
        }
      : null
  });
}

function handleEmailStatus_(payload) {
  const email = normalizeText_(payload.email);

  if (!email) {
    return jsonResponse_({
      ok: false,
      error: "Email is required."
    });
  }

  return jsonResponse_({
    ok: true,
    status: getEmailStatus_(email)
  });
}

function handleSubmitAccessRequest_(payload) {
  const firstName = normalizeText_(payload.firstName);
  const lastName = normalizeText_(payload.lastName);
  const email = normalizeText_(payload.email);
  const organization = normalizeText_(payload.organization);
  const reason = normalizeText_(payload.reason);

  if (!firstName || !lastName || !email || !organization || !reason) {
    return jsonResponse_({
      ok: false,
      error: "All fields are required."
    });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse_({
      ok: false,
      error: "Please enter a valid email address."
    });
  }

  const duplicateStatus = getEmailStatus_(email);

  if (duplicateStatus !== "available") {
    return jsonResponse_({
      ok: false,
      code: `request_${duplicateStatus}`,
      status: duplicateStatus,
      ...getDuplicateEmailResponse_(duplicateStatus)
    });
  }

  const sheet = ensureRequestSheet_();
  const statusColumnIndex = REQUEST_HEADERS.indexOf("Status") + 1;
  const previousStatusCell =
    sheet.getLastRow() >= 2 ? sheet.getRange(sheet.getLastRow(), statusColumnIndex) : null;

  sheet.appendRow([
    new Date().toISOString(),
    firstName,
    lastName,
    email,
    organization,
    reason,
    "Pending"
  ]);

  const newRow = sheet.getLastRow();
  const statusCell = sheet.getRange(newRow, statusColumnIndex);

  if (previousStatusCell && previousStatusCell.getDataValidation()) {
    previousStatusCell.copyTo(statusCell, SpreadsheetApp.CopyPasteType.PASTE_NORMAL, false);
    statusCell.setValue("Pending");
  } else {
    const rule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["Pending", "Approved", "Denied"], true)
      .setAllowInvalid(false)
      .build();

    statusCell.setDataValidation(rule).setValue("Pending");
  }

  return jsonResponse_({
    ok: true,
    submitted: true,
    message: "Thank you. We will get back to you with access credentials."
  });
}

function getDuplicateEmailResponse_(status) {
  switch (status) {
    case "authorized":
      return {
        title: "Account Already Exists",
        message:
          "An account already exists with the email address you entered. Please try logging in using your existing credentials. If you're unable to access your account, please contact us for assistance.",
        actions: [
          { label: "Login", href: "/login" },
          { label: "Contact Us", href: "https://viterbik12.usc.edu/contact/", external: true }
        ]
      };
    case "pending":
      return {
        title: "Access Request Received",
        message:
          "Your access request is currently under review. We'll contact you once it has been processed.",
        actions: [
          { label: "Login", href: "/login" },
          { label: "Contact Us", href: "https://viterbik12.usc.edu/contact/", external: true }
        ]
      };
    case "approved":
      return {
        title: "Access Already Approved",
        message:
          "Your access request has already been approved. Please try logging in using the credentials that were provided. If you're unable to access your account, please contact us.",
        actions: [
          { label: "Login", href: "/login" },
          { label: "Contact Us", href: "https://viterbik12.usc.edu/contact/", external: true }
        ]
      };
    case "denied":
      return {
        title: "Access Request Denied",
        message:
          "A previous access request for this email was not approved. If you believe this is an error or would like to discuss your request, please contact us.",
        actions: [
          { label: "Contact Us", href: "https://viterbik12.usc.edu/contact/", external: true }
        ]
      };
    default:
      return null;
  }
}

function syncApprovedRequestsToAuthorizedUsers_() {
  const requestSheet = getSheetByName_(REQUEST_SHEET_TITLE);
  const authorizedSheet = ensureAuthorizedUsersSheet_();
  const requestRows = getSheetRows_(requestSheet);
  const authorizedRows = getSheetRows_(authorizedSheet);
  const existingEmails = new Set(
    authorizedRows
      .map((row) => normalizeLookupText_(getCell_(row, ["email"])))
      .filter(Boolean)
  );

  for (const row of requestRows) {
    const status = normalizeLookupText_(getCell_(row, ["status"]));
    const email = getCell_(row, ["email"]);
    const normalizedEmail = normalizeLookupText_(email);

    if (!normalizedEmail || !["approved", "active", "true", "checked", "yes", "1"].includes(status)) {
      continue;
    }

    if (existingEmails.has(normalizedEmail)) {
      continue;
    }

    const firstName = getCell_(row, ["first name", "firstname"]);
    const lastName = getCell_(row, ["last name", "lastname"]);
    const name = [firstName, lastName].filter(Boolean).join(" ").trim();
    const organization = getCell_(row, ["organization"]);

    authorizedSheet.appendRow([
      email,
      name,
      PASSWORD_PLACEHOLDER,
      organization,
      true,
      new Date().toISOString()
    ]);

    existingEmails.add(normalizedEmail);
  }
}

function doGet() {
  return jsonResponse_({
    ok: true,
    message: "SCALE auth Apps Script is running."
  });
}

function doPost(e) {
  try {
    const payload = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = normalizeLookupText_(payload.action);

    if (action === "login") {
      return handleLogin_(payload);
    }

    if (action === "checkemailstatus") {
      return handleEmailStatus_(payload);
    }

    if (action === "submitaccessrequest") {
      return handleSubmitAccessRequest_(payload);
    }

    return jsonResponse_({
      ok: false,
      error: "Unknown action."
    });
  } catch (error) {
    return jsonResponse_({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected Apps Script error."
    });
  }
}
