import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { File } from "@babel/types";
import type { NormalizedRequest, RequestParser } from "../core/types";

export const fetchParser: RequestParser = {
  name: "fetch",
  canParse(input: string): boolean {
    const trimmed = input.trim();
    return trimmed.startsWith("fetch(") || trimmed.startsWith("await fetch(");
  },
  async parse(input: string): Promise<NormalizedRequest> {
    const ast: File = parse(input, { sourceType: "module", plugins: ["typescript"] });
    let url = "";
    let method = "GET";
    const headers: Record<string, string> = {};
    let bodyRaw: string | undefined;
    const warnings: string[] = [];

    traverse(ast, {
      CallExpression(path) {
        if (path.node.callee.type !== "Identifier" || path.node.callee.name !== "fetch") return;
        const [urlArg, optionsArg] = path.node.arguments;
        if (urlArg?.type === "StringLiteral") url = urlArg.value;

        if (optionsArg?.type === "ObjectExpression") {
          optionsArg.properties.forEach((prop: any) => {
            const key = prop.key.type === "Identifier" ? prop.key.name : 
                        (prop.key.type === "StringLiteral" ? prop.key.value : "");
            if (key === "method" && prop.value.type === "StringLiteral") method = prop.value.value.toUpperCase();
            if (key === "body" && prop.value.type === "StringLiteral") bodyRaw = prop.value.value;
            if (key === "headers" && prop.value.type === "ObjectExpression") {
              prop.value.properties.forEach((h: any) => {
                if (h.type !== "ObjectProperty") return;
                const hKey = h.key.type === "Identifier" ? h.key.name : 
                             (h.key.type === "StringLiteral" ? h.key.value : "");
                if (h.value.type === "StringLiteral") headers[hKey.toLowerCase()] = h.value.value;
              });
            }
          });
        }
      }
    });

    return {
      url, method, headers,
      body: bodyRaw ? { raw: bodyRaw, type: "json" } : undefined,
      meta: { source: "fetch", warnings }
    };
  }
};
