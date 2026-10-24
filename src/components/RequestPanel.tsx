import { ParamField } from "./ParamField";
import type { Endpoint } from "../types";

type RequestPanelProps = {
  endpoint: Endpoint;
  values: Record<string, string>;
  loading: boolean;
  onChange: (name: string, value: string) => void;
  onLoadSample: () => void;
  onClear: () => void;
  onSubmit: () => void;
};

export function RequestPanel({
  endpoint,
  values,
  loading,
  onChange,
  onLoadSample,
  onClear,
  onSubmit,
}: RequestPanelProps) {
  return (
    <section className="request">
      <header>
        <div>
          <p className="eyebrow">
            <span className="method">GET</span>
            {endpoint.path}
          </p>
          <h2>{endpoint.family}</h2>
        </div>
        <div className="actions">
          <button type="button" onClick={onLoadSample} disabled={!endpoint.sample}>
            Load sample
          </button>
          <button type="button" onClick={onClear}>
            Clear
          </button>
          <button type="submit" className="primary" disabled={loading} onClick={onSubmit}>
            {loading ? "Calling…" : "Send"}
          </button>
        </div>
      </header>
      <p className="summary">{endpoint.summary}</p>
      {endpoint.params.length === 0 ? (
        <p className="hint">No query parameters. Send to retrieve the full payload.</p>
      ) : (
        <div className="fields">
          {endpoint.params.map((param) => (
            <ParamField
              key={param.name}
              param={param}
              value={values[param.name] ?? ""}
              onChange={(value) => onChange(param.name, value)}
            />
          ))}
        </div>
      )}
      {endpoint.params.some((param) => param.help) ? (
        <ul className="help">
          {endpoint.params
            .filter((param) => param.help)
            .map((param) => (
              <li key={param.name}>
                <code>{param.name}</code> {param.help}
              </li>
            ))}
        </ul>
      ) : null}
    </section>
  );
}
