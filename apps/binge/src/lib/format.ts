export function formatBytes(bytes: number | bigint) {
  const rawBytes = typeof bytes === "bigint" ? Number(bytes) : bytes;
  if (!Number.isFinite(rawBytes) || rawBytes <= 0) {
    return "0 B";
  }
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = rawBytes;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export function formatAge(uploadedAt: string) {
  const timestamp = Date.parse(uploadedAt);
  if (!Number.isFinite(timestamp)) {
    return "unknown";
  }
  const days = Math.max(0, Math.floor((Date.now() - timestamp) / 86_400_000));
  if (days === 0) {
    return "Today";
  }
  if (days === 1) {
    return "1 day";
  }
  return `${days} days`;
}
