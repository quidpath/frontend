/**
 * Trigger a browser file download from an axios blob response.
 */
export function downloadBlob(data: Blob, filename: string) {
  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function getExportFilename(entity: string, format: 'excel' | 'csv', dateStr?: string) {
  const ext = format === 'excel' ? 'xlsx' : 'csv';
  const date = dateStr || new Date().toISOString().split('T')[0];
  return `${entity}_${date}.${ext}`;
}
