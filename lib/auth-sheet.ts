type LoginCredentials = {
  email: string;
  password: string;
};

type AccessRequestForm = {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  reason: string;
};

type AuthAppsScriptBaseResponse = {
  ok?: boolean;
  error?: string;
};

type AuthorizedUser = {
  email: string;
  firstName: string;
  lastName: string;
  organization: string;
  active: boolean;
};

type EmailStatus =
  | "available"
  | "authorized"
  | "pending"
  | "approved"
  | "denied";

type EmailStatusResponse = AuthAppsScriptBaseResponse & {
  status?: EmailStatus;
};

type LoginResponse = AuthAppsScriptBaseResponse & {
  user?: AuthorizedUser | null;
};

type RequestAccessResponse = AuthAppsScriptBaseResponse & {
  submitted?: boolean;
  title?: string;
  message?: string;
  code?: string;
  actions?: Array<{
    label: string;
    href: string;
    external?: boolean;
  }>;
};

const AUTH_APPS_SCRIPT_URL = process.env.AUTH_APPS_SCRIPT_URL?.trim();

function getAuthAppsScriptUrl() {
  if (!AUTH_APPS_SCRIPT_URL) {
    throw new Error(
      "AUTH_APPS_SCRIPT_URL is not configured. Add your Google Apps Script web app URL to .env.local."
    );
  }

  return AUTH_APPS_SCRIPT_URL;
}

async function callAuthAppsScript<T extends AuthAppsScriptBaseResponse>(payload: Record<string, unknown>) {
  const response = await fetch(getAuthAppsScriptUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    cache: "no-store",
    body: JSON.stringify(payload)
  });

  const text = await response.text();

  if (!text) {
    throw new Error("The auth Apps Script returned an empty response.");
  }

  let parsed: T;
  try {
    parsed = JSON.parse(text) as T;
  } catch {
    throw new Error("The auth Apps Script returned an invalid JSON response.");
  }

  if (!response.ok) {
    throw new Error(parsed.error || `Auth Apps Script request failed with ${response.status}.`);
  }

  return parsed;
}

export async function getApprovedUserForLogin(credentials: LoginCredentials) {
  const response = await callAuthAppsScript<LoginResponse>({
    action: "login",
    email: credentials.email.trim(),
    password: credentials.password
  });

  if (response.ok === false) {
    throw new Error(response.error || "Invalid credentials or inactive account.");
  }

  if (!response.user) {
    throw new Error("Invalid credentials or inactive account.");
  }

  return response.user;
}

export async function checkEmailStatus(email: string) {
  const response = await callAuthAppsScript<EmailStatusResponse>({
    action: "checkEmailStatus",
    email: email.trim().toLowerCase()
  });

  return response.status ?? "available";
}

export async function submitAccessRequest(form: AccessRequestForm) {
  const response = await callAuthAppsScript<RequestAccessResponse>({
    action: "submitAccessRequest",
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    email: form.email.trim(),
    organization: form.organization.trim(),
    reason: form.reason.trim()
  });

  if (response.ok === false || response.submitted !== true) {
    return {
      ok: false as const,
      code: response.code ?? "unknown_request_error",
      title: response.title,
      message: response.error || response.message || "Unable to submit your request right now.",
      actions: response.actions ?? []
    };
  }

  return {
    ok: true as const,
    message:
      response.message || "Thank you. We will get back to you with access credentials."
  };
}
