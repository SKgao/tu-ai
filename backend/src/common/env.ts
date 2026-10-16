const JWT_SECRET_KEY = 'JWT_SECRET';

/**
 * 已知的示例/弱密钥，生产环境禁止使用。
 * 与 backend/.env.example 中保持一致。
 */
const INSECURE_JWT_SECRETS = new Set([
  'tutu-admin-local-secret',
  'secret',
  'changeme',
  'password',
]);

const MIN_RECOMMENDED_SECRET_LENGTH = 32;

let hasWarnedAboutWeakSecret = false;

/**
 * 读取 JWT 密钥。
 *
 * 这里刻意不提供兜底默认值：缺失密钥时必须直接失败，
 * 否则任何拿到公开默认值的人都能伪造管理员 token。
 */
export function getJwtSecret(): string {
  const secret = (process.env[JWT_SECRET_KEY] || '').trim();

  if (!secret) {
    throw new Error(
      `缺少环境变量 ${JWT_SECRET_KEY}，服务拒绝启动。请在 backend/.env 中配置一个足够随机的密钥（参考 backend/.env.example）。`,
    );
  }

  if (
    !hasWarnedAboutWeakSecret &&
    (INSECURE_JWT_SECRETS.has(secret) || secret.length < MIN_RECOMMENDED_SECRET_LENGTH)
  ) {
    hasWarnedAboutWeakSecret = true;
    console.warn(
      `[security] ${JWT_SECRET_KEY} 使用了示例默认值或长度不足 ${MIN_RECOMMENDED_SECRET_LENGTH} 位，本地开发可用，生产环境请务必更换。`,
    );
  }

  return secret;
}

/**
 * 启动阶段的配置校验，用于让服务在配置错误时快速失败。
 */
export function assertRequiredEnv(): void {
  getJwtSecret();
}

const SEND2LINE_BASE_URL_KEY = 'SEND2LINE_BASE_URL';
const SOURCE_AUDIO_DOWNLOAD_BASE_URL_KEY = 'SOURCE_AUDIO_DOWNLOAD_BASE_URL';
const SUBJECT_SOURCE_IMPORT_BASE_URL_KEY = 'SUBJECT_SOURCE_IMPORT_BASE_URL';

/**
 * 读取「可选集成」的环境变量。
 *
 * 与 getJwtSecret 刻意不同：这类仓库外依赖属于可选能力，缺失时**不在启动期失败**，
 * 而是由调用方在真正使用该能力时抛出明确错误。
 * 这里只负责读配置，不做任何协议猜测。
 */
export function getOptionalEnv(name: string): string | null {
  const value = (process.env[name] || '').trim();
  return value || null;
}

/** 素材批量同步到外部 line 系统的服务地址（同族接口：test/send2line/*）。 */
export function getSend2LineBaseUrl(): string | null {
  return getOptionalEnv(SEND2LINE_BASE_URL_KEY);
}

/** 素材批量下载音频的外部服务地址。 */
export function getSourceAudioDownloadBaseUrl(): string | null {
  return getOptionalEnv(SOURCE_AUDIO_DOWNLOAD_BASE_URL_KEY);
}

/** 题目-素材导入的外部服务地址。 */
export function getSubjectSourceImportBaseUrl(): string | null {
  return getOptionalEnv(SUBJECT_SOURCE_IMPORT_BASE_URL_KEY);
}
