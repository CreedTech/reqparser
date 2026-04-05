#!/usr/bin/env node
import { readInput, writeOutput } from "./io";
import { detectInputType } from "../core/detect";
import { generateFromParsed, parseRequest } from "../core/engine";
import type { OutputFormat } from "../core/types";
import { redactHeaders } from "../utils/redact";

type BaseOptions = {
  file?: string;
  stdin?: boolean;
};

type ParseOptions = BaseOptions & {
  to?: OutputFormat;
  out?: string;
  redact?: boolean;
};

async function main(): Promise<void> {
  const { cac } = await import("cac");

  const cli = cac("reqparser");

  cli
    .command("detect", "Detect input type")
    .option("--file <path>", "Read input from file")
    .option("--stdin", "Read input from stdin")
    .action(async (options: BaseOptions) => {
      try {
        const input = await readInput(options);
        console.log(detectInputType(input));
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(message);
        process.exit(1);
      }
    });

  cli
    .command("parse", "Parse and generate output")
    .option("--file <path>", "Read input from file")
    .option("--stdin", "Read input from stdin")
    .option("--to <format>", "Output format: fetch|axios|curl|json", {
      default: "json",
    })
    .option("--out <path>", "Write output to file")
    .option("--redact", "Redact sensitive headers")
    .action(async (options: ParseOptions) => {
      try {
        const input = await readInput(options);
        const parsed = await parseRequest(input);

        if (options.redact) {
          parsed.headers = redactHeaders(parsed.headers);
        }

        const format = (options.to ?? "json") as OutputFormat;
        const output = await generateFromParsed(parsed, format);
        writeOutput(output, options.out);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(message);
        process.exit(1);
      }
    });

  cli
    .command("validate", "Validate parsed request")
    .option("--file <path>", "Read input from file")
    .option("--stdin", "Read input from stdin")
    .action(async (options: BaseOptions) => {
      try {
        const input = await readInput(options);
        const parsed = await parseRequest(input);

        if (!parsed.url) {
          console.error("error: missing URL");
          process.exit(1);
        }

        if (parsed.meta.warnings.length > 0) {
          for (const warning of parsed.meta.warnings) {
            console.warn(`warning: ${warning}`);
          }
        } else {
          console.log("ok");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error(message);
        process.exit(1);
      }
    });

  cli.help();
  cli.parse();
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error(message);
  process.exit(1);
});
