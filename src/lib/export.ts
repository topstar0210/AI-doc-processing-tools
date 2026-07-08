export function structuredDataToCsv(data: Record<string, unknown>): string {
  const rows: string[][] = [["field", "value"]];

  function flatten(prefix: string, value: unknown) {
    if (value === null || value === undefined) {
      rows.push([prefix, ""]);
      return;
    }
    if (Array.isArray(value)) {
      rows.push([prefix, value.map(String).join("; ")]);
      return;
    }
    if (typeof value === "object") {
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        flatten(prefix ? `${prefix}.${key}` : key, nested);
      }
      return;
    }
    rows.push([prefix, String(value)]);
  }

  for (const [key, value] of Object.entries(data)) {
    flatten(key, value);
  }

  return rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}
