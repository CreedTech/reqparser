import fs from "node:fs";

export async function readInput(options: { file?: string; stdin?: boolean }): Promise<string> {
  if (options.file) {
    return fs.readFileSync(options.file, "utf8");
  }

  if (options.stdin) {
    return await new Promise<string>((resolve) => {
      let data = "";
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", (chunk) => (data += chunk));
      process.stdin.on("end", () => resolve(data));
    });
  }

  throw new Error("Input source missing. Use --file <path> or --stdin.");
}

export function writeOutput(output: string, out?: string): void {
  if (!out) {
    console.log(output);
    return;
  }
  fs.writeFileSync(out, output, "utf8");
}
