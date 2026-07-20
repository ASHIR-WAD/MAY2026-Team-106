import React, { useId } from 'react';

export interface Column<T> {
  header: string;
  accessor: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowIdAccessor: (row: T) => string | number;
  selectable?: boolean;
  selectedRowIds?: (string | number)[];
  onSelectRows?: (ids: (string | number)[]) => void;
  renderActions?: (row: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowIdAccessor,
  selectable = false,
  selectedRowIds = [],
  onSelectRows,
  renderActions,
}: DataTableProps<T>) {
  const tableHeaderId = useId();
  const isEmpty = data.length === 0;
  const isAllSelected = data.length > 0 && selectedRowIds.length === data.length;

  const handleSelectAll = () => {
    if (!onSelectRows) return;
    if (isAllSelected) {
      onSelectRows([]);
    } else {
      onSelectRows(data.map(row => rowIdAccessor(row)));
    }
  };

  const handleSelectRow = (id: string | number) => {
    if (!onSelectRows) return;
    if (selectedRowIds.includes(id)) {
      onSelectRows(selectedRowIds.filter(item => item !== id));
    } else {
      onSelectRows([...selectedRowIds, id]);
    }
  };

  return (
    <div 
      className="w-full border rounded-2xl shadow-sm overflow-hidden transition-colors"
      style={{ 
        backgroundColor: 'rgb(var(--color-surface))',
        borderColor: 'rgb(var(--color-border))'
      }}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr 
              className="border-b transition-colors"
              style={{ 
                backgroundColor: 'rgb(var(--color-surface-alt))',
                borderColor: 'rgb(var(--color-border))'
              }}
            >
              {selectable && (
                <th className="p-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                    className="w-4 h-4 rounded cursor-pointer accent-[rgb(var(--color-accent))]"
                    style={{ borderColor: 'rgb(var(--color-border))' }}
                  />
                </th>
              )}
              {columns.map((col, idx) => (
                <th
                  key={`${tableHeaderId}-h-${idx}`}
                  className={`p-4 text-xs font-bold uppercase tracking-wider ${col.className || ''}`}
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  {col.header}
                </th>
              ))}
              {renderActions && (
                <th 
                  className="p-4 text-xs font-bold uppercase tracking-wider text-right"
                  style={{ color: 'rgb(var(--color-text-secondary))' }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {isEmpty ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (renderActions ? 1 : 0)}
                  className="p-12 text-center text-sm font-medium transition-colors"
                  style={{ 
                    color: 'rgb(var(--color-text-secondary))',
                    backgroundColor: 'rgb(var(--color-surface))'
                  }}
                >
                  No data records available to display.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const id = rowIdAccessor(row);
                const isSelected = selectedRowIds.includes(id);

                return (
                  <tr
                    key={`row-${id}`}
                    className="border-b last:border-b-0 transition-colors"
                    style={{ 
                      borderColor: 'rgb(var(--color-border))',
                      backgroundColor: isSelected ? 'rgb(var(--color-accent) / 0.08)' : 'transparent'
                    }}
                  >
                    {selectable && (
                      <td className="p-4 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(id)}
                          aria-label={`Select row ${id}`}
                          className="w-4 h-4 rounded cursor-pointer accent-[rgb(var(--color-accent))]"
                          style={{ borderColor: 'rgb(var(--color-border))' }}
                        />
                      </td>
                    )}
                    {columns.map((col, idx) => (
                      <td
                        key={`cell-${id}-${idx}`}
                        className={`p-4 text-sm font-semibold transition-colors ${col.className || ''}`}
                        style={{ color: 'rgb(var(--color-text-primary))' }}
                      >
                        {col.accessor(row)}
                      </td>
                    ))}
                    {renderActions && (
                      <td className="p-4 text-sm text-right">
                        <div className="flex justify-end gap-2">
                          {renderActions(row)}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
