import React from 'react';

function resolveRowKey(rowKey, row, index) {
  if (typeof rowKey === 'function') {
    return rowKey(row, index);
  }

  if (typeof rowKey === 'string') {
    return row?.[rowKey] ?? `${rowKey}-${index}`;
  }

  return row?.id ?? index;
}

function resolveCellContent(column, row, index) {
  const value = column.dataIndex ? row?.[column.dataIndex] : undefined;
  return column.render ? column.render(value, row, index) : value;
}

export function AppTable({
  columns,
  data,
  rowKey,
  loading = false,
  loadingText = '数据加载中...',
  emptyText = '暂无数据',
  minWidth,
}) {
  return (
    <div className="table-shell">
      <table className="data-table" style={minWidth ? { minWidth } : undefined}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key || column.dataIndex || column.title}>{column.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {loadingText}
              </td>
            </tr>
          ) : null}
          {!loading && !data.length ? (
            <tr>
              <td colSpan={columns.length} className="table-empty">
                {emptyText}
              </td>
            </tr>
          ) : null}
          {!loading
            ? data.map((row, index) => (
                <tr key={resolveRowKey(rowKey, row, index)}>
                  {columns.map((column) => (
                    <td
                      key={column.key || column.dataIndex || column.title}
                      className={column.className}
                    >
                      {resolveCellContent(column, row, index)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
