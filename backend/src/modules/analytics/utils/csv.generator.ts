/**
 * Utility functions for generating safely formatted CSV string exports.
 */

export function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  // Replace double quotes with escaped double quotes
  const escaped = str.replace(/"/g, '""');
  // Wrap in double quotes
  return `"${escaped}"`;
}

export function generateCsv<T extends Record<string, any>>(
  columns: { key: keyof T | string; header: string; getValue?: (row: T) => any }[],
  data: T[]
): string {
  const headerRow = columns.map((col) => escapeCsvCell(col.header)).join(',');
  const dataRows = data.map((row) =>
    columns
      .map((col) => {
        const rawValue = col.getValue ? col.getValue(row) : row[col.key];
        return escapeCsvCell(rawValue);
      })
      .join(',')
  );

  return [headerRow, ...dataRows].join('\r\n');
}
