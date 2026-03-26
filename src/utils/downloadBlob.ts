/**
 * Trigger a browser file download from an axios blob response.
 * Optionally reads the filename from the Content-Disposition header.
 */
export function downloadBlob(data: Blob, filename: string, headers?: Record<string, string>) {
  // Try to extract filename from Content-Disposition header
  let resolvedFilename = filename;
  if (headers) {
    const cd = headers['content-disposition'] ?? headers['Content-Disposition'] ?? '';
    const match = cd.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/i);
    if (match?.[2]) {
      resolvedFilename = match[2].trim();
    }
  }

  const url = URL.createObjectURL(data);
  const a = document.createElement('a');
  a.href = url;
  a.download = resolvedFilename;
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
