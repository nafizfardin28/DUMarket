// A compact stand-in for Django's password_validation stack (which the
// previous Django backend used). Not a byte-for-byte port — Django's
// CommonPasswordValidator ships a ~20,000-word blocklist we don't replicate
// in full — but it enforces the same shape of rule: minimum length, not
// purely numeric, not an extremely common password, not just your own name
// or email typed back at you.
const COMMON_PASSWORDS = new Set([
  'password',
  'password1',
  'password123',
  '12345678',
  '123456789',
  '1234567890',
  'qwerty123',
  'qwertyuiop',
  'letmein',
  'welcome',
  'welcome1',
  'admin123',
  'iloveyou',
  'abc12345',
  'football',
  'monkey123',
  'dragon123',
  'sunshine',
  'princess',
  'trustno1',
  'baseball',
  'superman',
  'starwars',
  'whatever',
  '87654321',
  'changeme',
  'passw0rd',
]);

export function validatePasswordPolicy(
  password: string,
  attrs: { email?: string; fullName?: string } = {},
): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('This password must contain at least 8 characters.');
  }

  if (/^\d+$/.test(password)) {
    errors.push('This password is entirely numeric.');
  }

  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('This password is too common.');
  }

  const lowerPassword = password.toLowerCase();
  const attrParts = [
    ...(attrs.email ? attrs.email.split('@')[0].split(/[.\-_]/) : []),
    ...(attrs.fullName ? attrs.fullName.split(/\s+/) : []),
  ]
    .map((part) => part.toLowerCase())
    .filter((part) => part.length >= 4);

  if (attrParts.some((part) => lowerPassword.includes(part))) {
    errors.push('The password is too similar to your name or email.');
  }

  return errors;
}
