/**
 * 从 antd Upload 的文件对象里取出原始文件名。
 *
 * 原来有 12 处各自实现（两种签名：`unknown` 与 `UploadRequestFile`，
 * 逻辑相同），这里统一收口。
 */
export function getUploadFileName(file: unknown): string {
  if (typeof file === 'object' && file !== null && 'name' in file) {
    const name = (file as { name?: unknown }).name;
    if (typeof name === 'string' && name) {
      return name;
    }
  }

  return '文件';
}
