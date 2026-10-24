import { useMemo, useState } from "react";
import { ENDPOINTS, FAMILIES } from "../catalog";
import type { Endpoint } from "../types";

type SidebarProps = {
  selectedId: string;
  onSelect: (endpoint: Endpoint) => void;
};

export function Sidebar({ selectedId, onSelect }: SidebarProps) {
  const [query, setQuery] = useState("");

  const grouped = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const matches = ENDPOINTS.filter((endpoint) => {
      if (!needle) {
        return true;
      }
      return (
        endpoint.path.toLowerCase().includes(needle) ||
        endpoint.summary.toLowerCase().includes(needle) ||
        endpoint.family.toLowerCase().includes(needle) ||
        endpoint.id.toLowerCase().includes(needle)
      );
    });

    return FAMILIES.map((family) => ({
      family,
      endpoints: matches.filter((endpoint) => endpoint.family === family),
    })).filter((group) => group.endpoints.length > 0);
  }, [query]);

  return (
    <aside className="sidebar">
      <div className="brand">
        <h1>CFBD Explorer</h1>
        <p>Local proxy. Key stays on the server.</p>
      </div>
      <input
        className="search"
        type="search"
        placeholder="Filter endpoints"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <nav>
        {grouped.map((group) => (
          <section key={group.family}>
            <h2>{group.family}</h2>
            {group.endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                type="button"
                className={endpoint.id === selectedId ? "active" : undefined}
                onClick={() => onSelect(endpoint)}
              >
                <span className="method">GET</span>
                <span className="path">{endpoint.path}</span>
              </button>
            ))}
          </section>
        ))}
      </nav>
    </aside>
  );
}
