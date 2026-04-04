import { parse } from "@babel/parser";
import traverse from "@babel/traverse";
import type { File, Expression, ObjectExpression } from "@babel/types";
import type { NormalizedRequest, RequestParser } from "../core/types";

function expressionToJsonValue(node: Expression): unknown {
    switch (node.type) {
        case "StringLiteral":
            return node.value;
        case "NumericLiteral":
            return node.value;
        case "BooleanLiteral":
            return node.value;
        case "NullLiteral":
            return null;
        case "ObjectExpression":
            return objectExpressionToJson(node);
        case "ArrayExpression":
            return node.elements.map((element) => {
                if (!element) return null;
                if (element.type === "SpreadElement") {
                    throw new Error("Spread elements are not supported in JSON.stringify body parsing");
                }
                return expressionToJsonValue(element);
            });
        default:
            throw new Error(`Unsupported expression type in JSON body: ${node.type}`);
    }
}

function objectExpressionToJson(node: ObjectExpression): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    for (const prop of node.properties) {
        if (prop.type !== "ObjectProperty") {
            throw new Error("Only plain object properties are supported in JSON.stringify body parsing");
        }

        let key: string;
        if (prop.key.type === "Identifier") {
            key = prop.key.name;
        } else if (prop.key.type === "StringLiteral") {
            key = prop.key.value;
        } else {
            throw new Error("Unsupported object key type in JSON.stringify body parsing");
        }

        if (prop.value.type === "TSAsExpression") {
            throw new Error("Type assertions are not supported in JSON.stringify body parsing");
        }

        result[key] = expressionToJsonValue(prop.value as Expression);
    }

    return result;
}

function extractBody(
    node: Expression
): { raw?: string; json?: unknown; type: NormalizedRequest["body"]["type"]; warnings: string[] } {
    const warnings: string[] = [];

    if (node.type === "StringLiteral") {
        try {
            const parsed = JSON.parse(node.value);
            return {
                raw: node.value,
                json: parsed,
                type: "json",
                warnings,
            };
        } catch {
            return {
                raw: node.value,
                type: "text",
                warnings,
            };
        }
    }

    if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
        const raw = node.quasis.map((q) => q.value.cooked ?? "").join("");
        try {
            const parsed = JSON.parse(raw);
            return {
                raw,
                json: parsed,
                type: "json",
                warnings,
            };
        } catch {
            return {
                raw,
                type: "text",
                warnings,
            };
        }
    }

    if (
        node.type === "CallExpression" &&
        node.callee.type === "MemberExpression" &&
        node.callee.object.type === "Identifier" &&
        node.callee.object.name === "JSON" &&
        node.callee.property.type === "Identifier" &&
        node.callee.property.name === "stringify"
    ) {
        const arg = node.arguments[0];

        if (!arg) {
            warnings.push("JSON.stringify body had no argument");
            return { type: "unknown", warnings };
        }

        if (arg.type === "SpreadElement") {
            warnings.push("Spread arguments in JSON.stringify are not supported");
            return { type: "unknown", warnings };
        }

        try {
            const jsonValue = expressionToJsonValue(arg as Expression);
            return {
                raw: JSON.stringify(jsonValue),
                json: jsonValue,
                type: "json",
                warnings,
            };
        } catch (error) {
            warnings.push(
                error instanceof Error
                    ? error.message
                    : "Unsupported JSON.stringify body expression"
            );
            return { type: "unknown", warnings };
        }
    }

    warnings.push(`Unsupported body expression type: ${node.type}`);
    return { type: "unknown", warnings };
}

export const fetchParser: RequestParser = {
    name: "fetch",

    canParse(input: string): boolean {
        const trimmed = input.trim();
        return trimmed.startsWith("fetch(") || trimmed.startsWith("await fetch(");
    },

    async parse(input: string): Promise<NormalizedRequest> {
        const ast: File = parse(input, {
            sourceType: "module",
            plugins: ["typescript"],
        });

        let url = "";
        let method = "GET";
        const headers: Record<string, string> = {};
        let body: NormalizedRequest["body"] | undefined;
        const warnings: string[] = [];

        traverse(ast, {
            CallExpression(path) {
                if (path.node.callee.type !== "Identifier" || path.node.callee.name !== "fetch") {
                    return;
                }

                const [urlArg, optionsArg] = path.node.arguments;

                if (!urlArg) {
                    warnings.push("fetch call missing URL argument");
                    return;
                }

                if (urlArg.type === "StringLiteral") {
                    url = urlArg.value;
                } else if (urlArg.type === "TemplateLiteral" && urlArg.expressions.length === 0) {
                    url = urlArg.quasis.map((q) => q.value.cooked ?? "").join("");
                } else {
                    warnings.push("Only string literal or static template literal URLs are supported in v1");
                }

                if (optionsArg?.type === "ObjectExpression") {
                    for (const prop of optionsArg.properties) {
                        if (prop.type !== "ObjectProperty") {
                            warnings.push("Spread properties in fetch options are not supported in v1");
                            continue;
                        }

                        if (prop.key.type !== "Identifier" && prop.key.type !== "StringLiteral") {
                            warnings.push("Unsupported fetch option key type");
                            continue;
                        }

                        const key =
                            prop.key.type === "Identifier" ? prop.key.name : prop.key.value;

                        if (key === "method" && prop.value.type === "StringLiteral") {
                            method = prop.value.value.toUpperCase();
                            continue;
                        }

                        if (key === "headers" && prop.value.type === "ObjectExpression") {
                            for (const h of prop.value.properties) {
                                if (h.type !== "ObjectProperty") {
                                    warnings.push("Spread properties in headers are not supported in v1");
                                    continue;
                                }

                                if (
                                    (h.key.type === "Identifier" || h.key.type === "StringLiteral") &&
                                    h.value.type === "StringLiteral"
                                ) {
                                    const headerKey =
                                        h.key.type === "Identifier" ? h.key.name : h.key.value;
                                    headers[headerKey.toLowerCase()] = h.value.value;
                                } else {
                                    warnings.push("Only string literal header values are supported in v1");
                                }
                            }
                            continue;
                        }

                        if (key === "body") {
                            const extracted = extractBody(prop.value as Expression);
                            body = extracted.raw || extracted.json || extracted.type !== "unknown"
                                ? {
                                    raw: extracted.raw,
                                    json: extracted.json,
                                    type: extracted.type,
                                }
                                : undefined;
                            warnings.push(...extracted.warnings);
                            continue;
                        }
                    }
                }
            },
        });

        return {
            url,
            method,
            headers,
            body,
            meta: {
                source: "fetch",
                warnings,
            },
        };
    },
};