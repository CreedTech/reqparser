import type { NormalizedRequest, OutputFormat, RequestGenerator, RequestParser } from "./types";
import { detectInputType } from "./detect";
import { fetchParser } from "../parsers/fetch";
import { curlParser } from "../parsers/curl";
import { axiosGenerator } from "../generators/axios";
import { jsonGenerator } from "../generators/json";
import { fetchGenerator } from "../generators/fetch";
import { curlGenerator } from "../generators/curl";

const parsers: RequestParser[] = [fetchParser, curlParser];
const generators: RequestGenerator[] = [
  axiosGenerator,
  jsonGenerator,
  fetchGenerator,
  curlGenerator
];

export async function parseRequest(input: string): Promise<NormalizedRequest> {
  const detected = detectInputType(input);
  const parser = parsers.find((p) => p.name === detected);
  if (!parser) throw new Error(`Unsupported input type: ${detected}`);

  return parser.parse(input);
}

export async function generateRequest(input: string, format: OutputFormat): Promise<string> {
  const parsed = await parseRequest(input);
  const generator = generators.find((g) => g.name === format);
  if (!generator) throw new Error(`Unsupported output format: ${format}`);
  return generator.generate(parsed);
}