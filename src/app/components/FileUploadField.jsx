import React from 'react';

function getFieldClassName(fullWidth) {
  return fullWidth ? 'form-field form-field--full' : 'form-field';
}

export function FileUploadField({
  label,
  value,
  onValueChange,
  onUpload,
  uploadState,
  accept = '*/*',
  placeholder = '可直接粘贴文件 URL',
  uploadHint = '支持上传文件',
  previewAlt = '',
  fullWidth = false,
}) {
  const statusMessage = uploadState?.message || uploadHint;
  const progress = Number(uploadState?.progress || 0);
  const showProgress = uploadState?.uploading || (progress > 0 && uploadState?.status === 'success');

  return (
    <div className={getFieldClassName(fullWidth)}>
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder={placeholder}
      />
      <div className="upload-row">
        <input
          type="file"
          accept={accept}
          disabled={uploadState?.uploading}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              onUpload(file);
            }
            event.target.value = '';
          }}
        />
        <div className="upload-state">{statusMessage}</div>
      </div>
      {showProgress ? (
        <div className="upload-progress" aria-hidden="true">
          <div
            className="upload-progress__bar"
            style={{ width: `${Math.max(6, progress)}%` }}
          />
        </div>
      ) : null}
      {value ? (
        <div className="avatar-preview">
          <img src={value} alt={previewAlt || label} className="avatar-preview__image" />
        </div>
      ) : null}
    </div>
  );
}
