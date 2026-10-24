import type { QueryParam } from "../types";

type ParamFieldProps = {
  param: QueryParam;
  value: string;
  onChange: (value: string) => void;
};

export function ParamField({ param, value, onChange }: ParamFieldProps) {
  const id = `param-${param.name}`;
  const label = (
    <label htmlFor={id}>
      {param.name}
      {param.required ? <span className="required">required</span> : null}
    </label>
  );

  switch (param.type) {
    case "boolean":
      return (
        <div className="field field-check">
          {label}
          <input
            id={id}
            type="checkbox"
            checked={value === "true"}
            onChange={(event) => onChange(event.target.checked ? "true" : "")}
            title={param.help}
          />
        </div>
      );
    case "enum":
      return (
        <div className="field">
          {label}
          <select id={id} value={value} onChange={(event) => onChange(event.target.value)} title={param.help}>
            <option value="">—</option>
            {(param.options ?? []).map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      );
    case "number":
      return (
        <div className="field">
          {label}
          <input
            id={id}
            type="number"
            value={value}
            placeholder={param.placeholder}
            onChange={(event) => onChange(event.target.value)}
            title={param.help}
          />
        </div>
      );
    case "string":
      return (
        <div className="field">
          {label}
          <input
            id={id}
            type="text"
            value={value}
            placeholder={param.placeholder}
            onChange={(event) => onChange(event.target.value)}
            title={param.help}
          />
        </div>
      );
    default: {
      const exhaustive: never = param.type;
      throw new Error(`Unhandled param type: ${exhaustive}`);
    }
  }
}
