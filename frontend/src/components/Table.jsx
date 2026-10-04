import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export default function Table({
  columns = [],
  data = [],
  sortBy,
  sortOrder,
  onSort,
  loading = false,
  emptyMessage = 'No records found.'
}) {
  const renderSortIcon = (columnKey) => {
    if (!onSort) return null;
    if (sortBy === columnKey) {
      return sortOrder === 'ASC' ? (
        <ArrowUp className="w-3.5 h-3.5 text-brand-600 inline ml-1.5" />
      ) : (
        <ArrowDown className="w-3.5 h-3.5 text-brand-600 inline ml-1.5" />
      );
    }
    return <ArrowUpDown className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 inline ml-1.5" />;
  };

  return (
    <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50/80">
            <tr>
              {columns.map((col) => {
                const isSortable = col.sortable !== false && onSort;
                return (
                  <th
                    key={col.key || col.header}
                    scope="col"
                    className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500 ${
                      isSortable ? 'cursor-pointer select-none group hover:text-slate-800' : ''
                    } ${col.className || ''}`}
                    onClick={() => isSortable && onSort(col.key)}
                  >
                    <div className="flex items-center">
                      <span>{col.header}</span>
                      {isSortable && renderSortIcon(col.key)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              // Loading Skeleton Rows
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {columns.map((c, cIdx) => (
                    <td key={cIdx} className="px-5 py-4">
                      <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-5 py-12 text-center text-slate-400"
                >
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key || col.header}
                      className={`px-5 py-4 text-slate-700 ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(row, idx) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
