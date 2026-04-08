export function formatCurrencyCent(value, emptyText = '无') {
  if (value === undefined || value === null || value === '') {
    return emptyText;
  }

  return `${(Number(value) / 100).toFixed(2)} 元`;
}
