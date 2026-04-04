export type InputSource = "fetch" | "curl" | "unknown";
export type OutputFormat = "fetch" | "axios" | "curl" | "json";

export interface NormalizedRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  query?: Record<string, string | string[]>;
  cookies?: Record<string, string>;
  body?: {
    raw?: string;
    json?: unknown;
    type: "json" | "text" | "form-urlencoded" | "multipart" | "unknown";
  };
  meta: {
    source: InputSource;
    warnings: string[];
  };
}

export interface RequestParser {
  name: InputSource;
  canParse(input: string): boolean;
  parse(input: string): Promise<NormalizedRequest>;
}

export interface RequestGenerator {
  name: OutputFormat;
  generate(request: NormalizedRequest): Promise<string>;
}
