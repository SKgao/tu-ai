import { CopyOutlined } from '@ant-design/icons';
import { App, Button, Tooltip } from 'antd';
import type { ReactNode } from 'react';

type CopyableIdTextProps = {
  value: string | number | null | undefined;
  placeholder?: ReactNode;
  successMessage?: string;
};

function hasCopyableValue(value: string | number | null | undefined): value is string | number {
  if (value === null || value === undefined) {
    return false;
  }

  return String(value).trim() !== '';
}

async function copyText(text: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable');
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', 'true');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!copied) {
    throw new Error('Copy failed');
  }
}

export function CopyableIdText({
  value,
  placeholder = '-',
  successMessage = '复制成功',
}: CopyableIdTextProps) {
  const { message } = App.useApp();

  if (!hasCopyableValue(value)) {
    return placeholder;
  }

  const text = String(value);

  async function handleCopy(): Promise<void> {
    try {
      await copyText(text);
      message.success(successMessage);
    } catch {
      message.error('复制失败');
    }
  }

  return (
    <span className="copyable-id-text">
      <span>{text}</span>
      <Tooltip title="复制">
        <Button
          type="text"
          size="small"
          className="copyable-id-text__button"
          icon={<CopyOutlined />}
          onClick={() => void handleCopy()}
          aria-label={`复制 ${text}`}
        />
      </Tooltip>
    </span>
  );
}

type RenderCopyableIdValueOptions = Omit<CopyableIdTextProps, 'value'>;

export function renderCopyableIdValue(
  value: string | number | null | undefined,
  options?: RenderCopyableIdValueOptions,
) {
  return <CopyableIdText value={value} {...options} />;
}
