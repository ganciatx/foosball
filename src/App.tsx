import { useCallback, useEffect, useMemo, useState } from "react";
import { ENDPOINTS } from "./catalog";
import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { Sidebar } from "./components/Sidebar";
import { fetchCfbd, getStoredKey, storeKey } from "./lib/request";
import type { Endpoint, RequestResult } from "./types";

const DEFAULT_ENDPOINT = ENDPOINTS[0];
if (!DEFAULT_ENDPOINT) {
  throw new Error("Endpoint catalog is empty");
}

export function App() {
  const [endpoint, setEndpoint] = useState<Endpoint>(DEFAULT_ENDPOINT);
  const [values, setValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<RequestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(getStoredKey);

  const requiredMissing = useMemo(
    () => endpoint.params.filter((param) => param.required && !(values[param.name] ?? "").trim()),
    [endpoint, values],
  );

  const selectEndpoint = useCallback((next: Endpoint) => {
    setEndpoint(next);
    setValues(next.sample ?? {});
    setResult(null);
    setError(null);
  }, []);

  const send = useCallback(async () => {
    if (requiredMissing.length > 0) {
      setError(`Missing required: ${requiredMissing.map((param) => param.name).join(", ")}`);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const next = await fetchCfbd(endpoint.path, values);
      setResult(next);
      if (next.status >= 400) {
        setError(`CFBD returned HTTP ${next.status}`);
      }
    } catch (caught) {
      setResult(null);
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setLoading(false);
    }
  }, [endpoint.path, requiredMissing, values]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
        event.preventDefault();
        void send();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [send]);

  return (
    <div className="shell">
      <Sidebar selectedId={endpoint.id} onSelect={selectEndpoint} />
      <main>
        {import.meta.env.PROD && (
          <label className="key-bar">
            CFBD API key (stored only in this browser)
            <input
              type="password"
              value={apiKey}
              placeholder="Paste your key"
              onChange={(event) => {
                setApiKey(event.target.value);
                storeKey(event.target.value);
              }}
            />
          </label>
        )}
        <RequestPanel
          endpoint={endpoint}
          values={values}
          loading={loading}
          onChange={(name, value) => setValues((current) => ({ ...current, [name]: value }))}
          onLoadSample={() => setValues(endpoint.sample ?? {})}
          onClear={() => setValues({})}
          onSubmit={() => void send()}
        />
        <ResponsePanel result={result} error={error} loading={loading} />
      </main>
    </div>
  );
}
