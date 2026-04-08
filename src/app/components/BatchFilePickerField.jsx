import React from 'react';

function normalizeSelectedFiles(fileList, { suffix = '', maxCount = 500 }) {
  return Array.from(fileList || [])
    .map((file) => file.name)
    .filter((name) => !String(name).startsWith('.'))
    .filter((name) => (suffix ? String(name).toLowerCase().endsWith(suffix) : true))
    .slice(0, maxCount);
}

export function BatchFilePickerField({
  label,
  files,
  onChange,
  accept,
  suffix = '',
  emptyText,
  helperText = '',
  maxCount = 500,
  disabled = false,
}) {
  const previewNames = files.slice(0, 3);
  const extraCount = Math.max(0, files.length - previewNames.length);

  return (
    <label className="form-field form-field--full">
      <span>{label}</span>
      <input
        type="file"
        multiple
        accept={accept}
        disabled={disabled}
        onChange={(event) => {
          const nextFiles = normalizeSelectedFiles(event.target.files, {
            suffix,
            maxCount,
          });
          onChange(nextFiles);
          event.target.value = '';
        }}
      />
      <div className="upload-state">
        {files.length ? `已选择 ${files.length} 个文件` : emptyText}
      </div>
      {files.length ? (
        <div className="upload-file-summary">
          {previewNames.join('、')}
          {extraCount ? ` 等 ${files.length} 个文件` : ''}
        </div>
      ) : helperText ? (
        <div className="upload-file-summary upload-file-summary--muted">{helperText}</div>
      ) : null}
    </label>
  );
}
