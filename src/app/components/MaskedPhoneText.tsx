import { Tooltip, Typography } from 'antd';

type MaskedPhoneTextProps = {
  value?: string | number | null;
  emptyText?: string;
};

function normalizePhoneValue(value?: string | number | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  return String(value).trim();
}

export function maskPhoneNumber(value?: string | number | null): string {
  const raw = normalizePhoneValue(value);

  if (!raw) {
    return '';
  }

  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.length === 11) {
    return `${digitsOnly.slice(0, 3)}****${digitsOnly.slice(-4)}`;
  }

  if (raw.length >= 7) {
    return `${raw.slice(0, 3)}****${raw.slice(-4)}`;
  }

  return raw;
}

export function MaskedPhoneText({ value, emptyText = '无' }: MaskedPhoneTextProps) {
  const raw = normalizePhoneValue(value);

  if (!raw) {
    return <Typography.Text type="secondary">{emptyText}</Typography.Text>;
  }

  const masked = maskPhoneNumber(raw);

  if (masked === raw) {
    return raw;
  }

  return (
    <Tooltip title={raw}>
      <span>{masked}</span>
    </Tooltip>
  );
}
