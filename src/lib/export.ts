type Row = Record<string, unknown>;

function isPlainObject(value: unknown): value is Row {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Body as a list of records: arrays as-is, a single object as one row, anything else as a single `value` row. */
function toRecords(body: unknown): unknown[] {
  if (Array.isArray(body)) {
    return body;
  }
  return [body];
}

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  const text = typeof value === "string" ? value : typeof value === "object" ? JSON.stringify(value) : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function toCsv(columns: string[], rows: Row[]): string {
  const lines = [columns.map(escapeCell).join(",")];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column])).join(","));
  }
  return lines.join("\r\n");
}

function collectColumns(rows: Row[]): string[] {
  const columns: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      if (!seen.has(key)) {
        seen.add(key);
        columns.push(key);
      }
    }
  }
  return columns;
}

/** Raw CSV: one row per record, top-level keys as columns; nested values stay as JSON text in their cell. */
export function rawCsv(body: unknown): string {
  const rows = toRecords(body).map((item): Row => (isPlainObject(item) ? item : { value: item }));
  return toCsv(collectColumns(rows), rows);
}

function flatten(value: unknown, prefix: string, out: Row): void {
  if (isPlainObject(value)) {
    const keys = Object.keys(value);
    if (keys.length === 0 && prefix) {
      out[prefix] = "";
    }
    for (const key of keys) {
      flatten(value[key], prefix ? `${prefix}.${key}` : key, out);
    }
  } else if (Array.isArray(value)) {
    if (value.every((item) => item === null || typeof item !== "object")) {
      out[prefix || "value"] = value.join("; ");
    } else {
      value.forEach((item, index) => flatten(item, prefix ? `${prefix}.${index}` : String(index), out));
    }
  } else {
    out[prefix || "value"] = value;
  }
}

/** Formatted CSV: nested objects flattened to dotted columns (e.g. `home.team`), arrays of objects indexed (`lines.0.score`). */
export function formattedCsv(body: unknown): string {
  const rows = toRecords(body).map((item) => {
    const flat: Row = {};
    flatten(item, "", flat);
    return flat;
  });
  return toCsv(collectColumns(rows), rows);
}

export function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: `${mime};charset=utf-8` }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
