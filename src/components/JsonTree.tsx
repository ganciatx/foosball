import { useMemo, useState } from "react";

type JsonTreeProps = {
  value: unknown;
  expandAll: boolean;
};

export function JsonTree({ value, expandAll }: JsonTreeProps) {
  return (
    <div className="json-tree">
      <JsonNode name={null} value={value} depth={0} expandAll={expandAll} />
    </div>
  );
}

type JsonNodeProps = {
  name: string | null;
  value: unknown;
  depth: number;
  expandAll: boolean;
};

function JsonNode({ name, value, depth, expandAll }: JsonNodeProps) {
  const isExpandable = value !== null && typeof value === "object";
  const [open, setOpen] = useState(depth === 0);
  const expanded = isExpandable ? expandAll || open : false;

  const preview = useMemo(() => summarize(value), [value]);

  if (!isExpandable) {
    return (
      <div className="json-row" style={{ paddingLeft: depth * 14 }}>
        {name !== null ? <span className="json-key">{name}: </span> : null}
        <Leaf value={value} />
      </div>
    );
  }

  const entries = Array.isArray(value)
    ? value.map((item, index): [string, unknown] => [String(index), item])
    : Object.entries(value as Record<string, unknown>);

  return (
    <div className="json-block">
      <button
        type="button"
        className="json-toggle"
        style={{ paddingLeft: depth * 14 }}
        onClick={() => setOpen((current) => !current)}
      >
        <span className="chevron">{expanded ? "▾" : "▸"}</span>
        {name !== null ? <span className="json-key">{name}: </span> : null}
        <span className="json-preview">{preview}</span>
      </button>
      {expanded
        ? entries.map(([key, child]) => (
            <JsonNode key={`${depth}-${key}`} name={key} value={child} depth={depth + 1} expandAll={expandAll} />
          ))
        : null}
    </div>
  );
}

function Leaf({ value }: { value: unknown }) {
  if (value === null) {
    return <span className="json-null">null</span>;
  }
  switch (typeof value) {
    case "string":
      return <span className="json-string">"{value}"</span>;
    case "number":
      return <span className="json-number">{value}</span>;
    case "boolean":
      return <span className="json-boolean">{String(value)}</span>;
    default: {
      return <span className="json-unknown">{String(value)}</span>;
    }
  }
}

function summarize(value: unknown): string {
  if (Array.isArray(value)) {
    return `Array(${value.length})`;
  }
  if (value !== null && typeof value === "object") {
    const keys = Object.keys(value);
    return `{ ${keys.slice(0, 6).join(", ")}${keys.length > 6 ? ", …" : ""} }`;
  }
  return "";
}
