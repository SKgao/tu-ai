import { BadRequestException } from '@nestjs/common';

export function toOptionalString(value: unknown) {
  const text = String(value ?? '').trim();
  return text ? text : null;
}

export function requireText(value: unknown, message: string) {
  const text = toOptionalString(value);
  if (!text) {
    throw new BadRequestException(message);
  }
  return text;
}

export function toOptionalNumber(value: unknown, fallback?: number) {
  if (value === '' || value === null || value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return parsed;
}

export function requireNumber(value: unknown, message: string) {
  const parsed = toOptionalNumber(value);
  if (parsed === undefined) {
    throw new BadRequestException(message);
  }
  return parsed;
}

export function parseDate(value: unknown) {
  if (!value) {
    return null;
  }

  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
