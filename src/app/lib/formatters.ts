export function formatCurrencyCent(
  value: string | number | null | undefined,
  emptyText = '无',
): string {
  if (value === undefined || value === null || value === '') {
    return emptyText;
  }

  return `${(Number(value) / 100).toFixed(2)} 元`;
}
