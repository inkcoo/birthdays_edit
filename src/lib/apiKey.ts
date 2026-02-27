/**
 * 生成随机 API 密钥（16 位字符）
 */
export function generateApiKey(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 验证 API 密钥格式
 */
export function isValidApiKey(key: string): boolean {
  return /^[a-zA-Z0-9]{16}$/.test(key);
}
