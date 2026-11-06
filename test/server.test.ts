import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { VeilleClient, type VeilleFetch } from "@veilleio/sdk";

import { CATALOG, MODE } from "../src/catalog.js";
import { createHttpHandler } from "../src/http.js";
import { createVeilleMcpServer } from "../src/server.js";

type Call = { url: URL; init: RequestInit };

async function connect(
  respond: () => Response = () => Response.json({ hello: "world" }),
) {
  const calls: Call[] = [];
  const fetch: VeilleFetch = async (input, init) => {
    calls.push({ url: new URL(String(input)), init });
    return respond();
  };
  const sdk = new VeilleClient({ apiKey: "secret-test-key", fetch });
  const server = createVeilleMcpServer({
    client: sdk,
    sensitiveValues: ["secret-test-key"],
  });
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test", version: "1.0.0" });
  await client.connect(clientTransport);
  return { client, calls };
}

function text(result: Awaited<ReturnType<Client["callTool"]>>): string {
  const content = result.content as { type: string; text?: string }[];
  return content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n");
}

describe("veille-mcp", () => {
  it("lists its tools", async () => {
    const { client } = await connect();
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    if (MODE === "tools") {
      assert.equal(tools.length, CATALOG.length);
      assert.ok(names.includes("intelligence_email"));
    } else {
      assert.ok(
        ["search_endpoints", "get_endpoint", "call_endpoint"].every((n) =>
          names.includes(n),
        ),
      );
    }
    for (const tool of tools)
      assert.equal(tool.annotations?.destructiveHint, false);
  });

  it("calls the featured endpoint", async () => {
    const { client, calls } = await connect();
    const result =
      MODE === "tools"
        ? await client.callTool({
            name: "intelligence_email",
            arguments: { query: "jane.doe@example.com" },
          })
        : await client.callTool({
            name: "call_endpoint",
            arguments: {
              name: "intelligence_email",
              params: { query: "jane.doe@example.com" },
            },
          });
    assert.equal(result.isError, undefined);
    assert.deepEqual(JSON.parse(text(result)), { hello: "world" });
    assert.equal(calls[0]!.url.pathname, "/v1/intelligence/email");
    assert.equal(
      new Headers(calls[0]!.init.headers).get("x-api-key"),
      "secret-test-key",
    );
  });

  it("returns images inline", async () => {
    const { client } = await connect(
      () =>
        new Response(new Uint8Array([137, 80, 78, 71]), {
          headers: { "content-type": "image/png" },
        }),
    );
    const result =
      MODE === "tools"
        ? await client.callTool({ name: "usage", arguments: {} })
        : await client.callTool({
            name: "call_endpoint",
            arguments: { name: "usage", params: {} },
          });
    const content = result.content as {
      type: string;
      mimeType?: string;
      data?: string;
    }[];
    assert.equal(content[0]!.type, "image");
    assert.equal(content[0]!.mimeType, "image/png");
    assert.equal(
      content[0]!.data,
      Buffer.from([137, 80, 78, 71]).toString("base64"),
    );
  });

  it("reports API errors without leaking the key", async () => {
    const { client } = await connect(() =>
      Response.json(
        { error: "Invalid API Key secret-test-key" },
        { status: 401 },
      ),
    );
    const result =
      MODE === "tools"
        ? await client.callTool({
            name: "intelligence_email",
            arguments: { query: "jane.doe@example.com" },
          })
        : await client.callTool({
            name: "call_endpoint",
            arguments: {
              name: "intelligence_email",
              params: { query: "jane.doe@example.com" },
            },
          });
    assert.equal(result.isError, true);
    assert.match(text(result), /401/);
    assert.doesNotMatch(text(result), /secret-test-key/);
  });

  it("validates arguments", async () => {
    const { client, calls } = await connect();
    const result =
      MODE === "tools"
        ? await client.callTool({ name: "intelligence_email", arguments: {} })
        : await client.callTool({
            name: "call_endpoint",
            arguments: {
              name: "intelligence_email",
              params: { not_a_param: 1 },
            },
          });
    assert.equal(result.isError, true);
    assert.equal(calls.length, 0);
  });

  it("serves Streamable HTTP with a per-request API key", async () => {
    const calls: Call[] = [];
    const handler = createHttpHandler({
      clientFactory: (options) =>
        new VeilleClient({
          ...options,
          fetch: async (input, init) => {
            calls.push({ url: new URL(String(input)), init });
            return Response.json({ ok: true });
          },
        }),
    });
    const post = (body: unknown, headers: Record<string, string> = {}) =>
      handler(
        new Request("http://localhost/mcp", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            accept: "application/json, text/event-stream",
            ...headers,
          },
          body: JSON.stringify(body),
        }),
      );
    const list = { jsonrpc: "2.0", id: 1, method: "tools/list", params: {} };
    assert.equal((await post(list)).status, 401);
    assert.equal(
      (await post(list, { "x-api-key": "k", origin: "https://evil.example" }))
        .status,
      403,
    );
    const response = await post(list, { "x-api-key": "header-key" });
    assert.equal(response.status, 200);
    const payload = (await response.json()) as { result: { tools: unknown[] } };
    assert.ok(payload.result.tools.length > 0);
    assert.equal(
      (await handler(new Request("http://localhost/health"))).status,
      200,
    );
  });
});
