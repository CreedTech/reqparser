import type { NormalizedRequest, RequestGenerator } from "../core/types";

export const jsonGenerator: RequestGenerator = {
  name: "json",
  async generate(request: NormalizedRequest): Promise<string> {
    return JSON.stringify(request, null, 2);
  },
};
