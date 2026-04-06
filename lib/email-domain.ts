function normalizeDomain(domain: string) {
  return domain.trim().toLowerCase().replace(/^@+/, "");
}

export function getAllowedEmailDomain() {
  const domain = process.env.EMAIL_DOMAIN;

  if (!domain) {
    throw new Error("Missing required environment variable: EMAIL_DOMAIN");
  }

  return normalizeDomain(domain);
}

export function isAllowedEmailDomain(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const parts = normalizedEmail.split("@");

  if (parts.length !== 2) {
    return false;
  }

  return parts[1] === getAllowedEmailDomain();
}

export function getAllowedEmailDomainMessage() {
  return `Please use your @${getAllowedEmailDomain()} email address.`;
}
