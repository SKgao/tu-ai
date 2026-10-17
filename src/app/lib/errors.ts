/**
 * 从 `unknown` 异常里取出可直接展示给用户的文案。
 *
 * 每个页面原本都各自复制了一份同样的实现（共 24 处），这里统一收口，
 * 避免同一个概念出现多种写法。
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
