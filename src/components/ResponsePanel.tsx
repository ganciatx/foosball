import { useState } from "react";
import { JsonTree } from "./JsonTree";
import { countRecords } from "../lib/request";
import type { RequestResult } from "../types";

type ResponsePanelProps = {
  result: RequestResult | null;
  error: string | null;
  loading: boolean;
};

export function ResponsePanel({ result, error, loading }: ResponsePanelProps) {
  const [expandAll, setExpandAll] = useState(false);
  const [mode, setMode] = useState<"tree" | "raw">("tree");
  const records = result ? countRecords(result.body) : null;

  async function copy() {
    if (!result) {
      return;
    }
    await navigator.clipboard.writeText(
      typeof result.body === "string" ? result.body : JSON.stringify(result.body, null, 2),
    );
  }

  return (
    <section className="response">
      <header>
        <h2>Response</h2>
        <div className="meta">
          {loading ? <span className="pill">loading</span> : null}
          {result ? (
            <>
              <span className={result.status < 400 ? "pill ok" : "pill bad"}>{result.status}</span>
              <span className="pill">{result.durationMs} ms</span>
              <span className="pill">{formatBytes(result.byteLength)}</span>
              {records !== null ? <span className="pill">{records} records</span> : null}
            </>
          ) : null}
        </div>
        <div className="actions">
          <button type="button" onClick={() => setMode(mode === "tree" ? "raw" : "tree")} disabled={!result}>
            {mode === "tree" ? "Raw JSON" : "Tree"}
          </button>
          <button type="button" onClick={() => setExpandAll((current) => !current)} disabled={!result || mode !== "tree"}>
            {expandAll ? "Collapse" : "Expand all"}
          </button>
          <button type="button" onClick={() => void copy()} disabled={!result}>
            Copy
          </button>
        </div>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {!result && !loading && !error ? <p className="hint">Send a request to inspect the payload.</p> : null}
      {result && mode === "tree" ? <JsonTree value={result.body} expandAll={expandAll} /> : null}
      {result && mode === "raw" ? <pre className="raw">{formatRaw(result.body, result.rawText)}</pre> : null}
    </section>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatRaw(body: unknown, rawText: string): string {
  if (typeof body === "string") {
    return rawText;
  }
  return JSON.stringify(body, null, 2);
}
