import { authService } from "@/services/authService";

const emailAuth = {
  user: "iwinxdigitaltechnologies@gmail.com",
  pass: "uoav ukqz ycjq vskn",
};

const API_URL = import.meta.env.VITE_API_URL;

export function generateHappyCode(len = 4) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < len; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateOtp(length = 6) {
  let out = "";
  for (let i = 0; i < length; i++)
    out += Math.floor(Math.random() * 10).toString();
  return out;
}

async function sendEmail({ to, subject, text }) {
  const token = authService.getToken?.() || "";
  const res = await fetch(`${API_URL}/send-otp`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, subject, text, auth: emailAuth }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`send-email failed: ${res.status} ${t}`);
  }
  return true;
}

export async function sendOtpEmail(to, otp) {
  return sendEmail({
    to,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  });
}

export async function sendHappyCodeEmail(to, happyCode) {
  return sendEmail({
    to,
    subject: "Your Happy Code",
    text: `Your Happy Code is: ${happyCode}`,
  });
}

export async function getOrganizationEmailById(orgId) {
  if (!orgId) return null;
  const token = authService.getToken?.() || "";
  const qs = new URLSearchParams([
    ["limit", "1"],
    ["fields[]", "email"],
    ["fields[]", "orgId.email"],
    ["filter[id][_eq]", String(orgId)],
  ]).toString();
  const url = `${API_URL}/items/organization?${qs}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  const data = await r.json().catch(() => null);
  if (!data) return null;
  const row = Array.isArray(data.data) ? data.data[0] : data.data;
  return row?.email || row?.orgId?.email || null;
}

export async function patchOrganizationEmail(orgId, email) {
  const token = authService.getToken?.() || "";
  if (!orgId || !email) return false;
  const res = await fetch(`${API_URL}/items/organization/${orgId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return res.ok;
}

export async function patchTaskCodes(taskId, { clientOtp, client_HappyCode }) {
  const token = authService.getToken?.() || "";
  if (!taskId) {
    return false;
  }
  const body = {};
  if (clientOtp) body.clientOtp = clientOtp;
  if (client_HappyCode) body.client_HappyCode = client_HappyCode;
  if (!Object.keys(body).length) {
    return true;
  }
  const res = await fetch(`${API_URL}/items/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "No error details");
    console.error(
      `[DEBUG] patchTaskCodes failed for task ${taskId}: Status ${res.status}, Details: ${errorText}`,
    );
    console.error("[DEBUG] Body sent:", body);
    return false;
  }
  return true;
}

export async function maybeSendCodes({
  createdTask,
  formMeta,
  selectedOrgId,
  options = {},
}) {
  const showToast = options.showToast || (() => {});
  const promptForEmail = options.promptForEmail || (async () => null);

  // Determine if completion contains OTP / Happy Code
  const fields = formMeta?.fields || [];
  const needsOtp =
    !!formMeta?.requiresOtp ||
    fields.some(
      (f) =>
        (f.field_type?.includes?.("completion") ||
          f.field_type === "completion") &&
        /otp/i.test(f?.type || f?.key || f?.label),
    );
  const needsHappy =
    !!formMeta?.requiresHappyCode ||
    fields.some(
      (f) =>
        (f.field_type?.includes?.("completion") ||
          f.field_type === "completion") &&
        /(happy[_-]?code)/i.test(f?.type || f?.key || f?.label),
    );

  if (!needsOtp && !needsHappy) {
    console.log("[DEBUG] No OTP or Happy Code needed, exiting maybeSendCodes");
    return;
  }

  // infer lengths if defined on fields
  const otpLen =
    fields.find((f) => /otp/i.test(f?.type || f?.key || f?.label))?.validations
      ?.length || 6;
  const happyLen =
    fields.find((f) => /(happy[_-]?code)/i.test(f?.type || f?.key || f?.label))
      ?.validations?.length || 4;

  let orgEmail = await getOrganizationEmailById(selectedOrgId);
  if (!orgEmail) {
    orgEmail = await promptForEmail();
    if (!orgEmail) {
      showToast(
        "Client has no email. Skipping sending OTP/Happy Code.",
        "warning",
      );
      return;
    }
    const patched = await patchOrganizationEmail(selectedOrgId, orgEmail);
    if (!patched) {
      showToast(
        "Failed to save client email. Skipping sending codes.",
        "error",
      );
      return;
    }
  }

  let clientOtp = null;
  let client_HappyCode = null;
  try {
    if (needsOtp) {
      clientOtp = generateOtp(otpLen);
      await sendOtpEmail(orgEmail, clientOtp);
    }
    if (needsHappy) {
      client_HappyCode = generateHappyCode(happyLen);
      await sendHappyCodeEmail(orgEmail, client_HappyCode);
    }
    const taskId = createdTask?.data?.id ?? createdTask?.id;

    const codesPatched = await patchTaskCodes(taskId, {
      clientOtp,
      client_HappyCode,
    });
    if (!codesPatched) {
      throw new Error("Failed to patch task OTP");
    }
    showToast("Otp Email Sended successfully.", "success");
  } catch (e) {
    showToast("Failed to send codes.", "error");
  }
}
