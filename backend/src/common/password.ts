import { compare, genSalt, hash } from 'bcryptjs';

const PASSWORD_SALT_ROUNDS = 10;

export function isPasswordHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

export async function hashPassword(password: string) {
  const salt = await genSalt(PASSWORD_SALT_ROUNDS);
  return hash(password, salt);
}

export async function verifyPassword(password: string, passwordHash: string) {
  if (!passwordHash) {
    return false;
  }

  if (!isPasswordHash(passwordHash)) {
    return passwordHash === password;
  }

  return compare(password, passwordHash);
}
