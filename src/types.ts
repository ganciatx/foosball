export type ParamType = "string" | "number" | "boolean" | "enum";

export type QueryParam = {
  name: string;
  type: ParamType;
  required?: boolean;
  options?: readonly string[];
  placeholder?: string;
  help?: string;
};

export type Endpoint = {
  id: string;
  family: string;
  path: string;
  summary: string;
  params: QueryParam[];
  sample?: Record<string, string>;
};

export type RequestResult = {
  status: number;
  durationMs: number;
  byteLength: number;
  url: string;
  body: unknown;
  rawText: string;
};
