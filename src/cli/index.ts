#!/usr/bin/env node
import { cac } from "cac";
import { readInput, writeOutput } from "./io";
import { detectInputType } from "../core/detect";
import { generateFromParsed, parseRequest } from "../core/engine";
import type { OutputFormat } from "../core/types";
import { redactHeaders } from "../utils/redact";

const cli = cac("reqparser");

cli
  .command("detect", "Detect input type")
  .option("--file <path>", "Read input from file")
  .option("--stdin", "Read input from stdin")
  .action(async (options) => {
    try {
      const input = await readInput(options);
      console.log(detectInputType(input));
    } catch (err: any) {
      console.error(err.message);
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
  .action(async (options) => {
    try {
      const input = await readInput(options);
      const parsed = await parseRequest(input);

      if (options.redact) {
        parsed.headers = redactHeaders(parsed.headers);
      }

      const output = await generateFromParsed(parsed, options.to as OutputFormat);
      writeOutput(output, options.out);
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });

cli
  .command("validate", "Validate parsed request")
  .option("--file <path>", "Read input from file")
  .option("--stdin", "Read input from stdin")
  .action(async (options) => {
    try {
      const input = await readInput(options);
      const parsed = await parseRequest(input);

      if (!parsed.url) {
        console.error("error: missing URL");
        process.exit(1);
      }

      if (parsed.meta.warnings.length) {
        for (const warning of parsed.meta.warnings) {
          console.warn(`warning: ${warning}`);
        }
      } else {
        console.log("ok");
      }
    } catch (err: any) {
      console.error(err.message);
      process.exit(1);
    }
  });

cli.help();
cli.parse();