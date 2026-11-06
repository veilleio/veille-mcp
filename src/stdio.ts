#!/usr/bin/env node
import process from "node:process";

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { VeilleClient } from "@veille/sdk";

import { redact } from "./redaction.js";
import { createVeilleMcpServer } from "./server.js";
import { startHttpServer } from "./serve.js";
import { VERSION } from "./version.js";

const API_KEY_ENVIRONMENT_VARIABLE = "VEILLE_API_KEY";

async function main(argv: readonly string[]): Promise<void> {
  if (argv.includes("--version")) {
    process.stdout.write(`${VERSION}\n`);
    return;
  }
  if (argv.includes("--help")) {
    process.stdout.write(`Veille MCP server ${VERSION}

Usage:
  veille-mcp                          stdio transport (reads VEILLE_API_KEY)
  veille-mcp --http [--port 3000] [--host 127.0.0.1]
                                     Streamable HTTP on /mcp; clients send their key in x-api-key
`);
    return;
  }
  if (argv.includes("--http")) {
    const port = Number(readFlag(argv, "--port") ?? process.env.PORT ?? 3000);
    const host = readFlag(argv, "--host") ?? "127.0.0.1";
    const server = await startHttpServer({ port, host });
    process.stderr.write(
      `[veille-mcp] Streamable HTTP listening on http://${host}:${port}/mcp\n`,
    );
    const stop = (): void => {
      server.close();
    };
    process.once("SIGINT", stop);
    process.once("SIGTERM", stop);
    return;
  }

  const apiKey = process.env[API_KEY_ENVIRONMENT_VARIABLE];
  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      `${API_KEY_ENVIRONMENT_VARIABLE} is required and must not be blank.`,
    );
  }
  const baseUrl = process.env.VEILLE_BASE_URL;
  const client = new VeilleClient({ apiKey, ...(baseUrl ? { baseUrl } : {}) });
  const server = createVeilleMcpServer({ client, sensitiveValues: [apiKey] });
  const transport = new StdioServerTransport();
  // When stdin ends, the process exits on its own once in-flight tool calls have answered.
  const shutdown = async (): Promise<void> => {
    await server.close().catch(() => undefined);
    process.exit(0);
  };
  process.once("SIGINT", () => void shutdown());
  process.once("SIGTERM", () => void shutdown());
  await server.connect(transport);
}

function readFlag(argv: readonly string[], name: string): string | undefined {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
}

main(process.argv.slice(2)).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(
    `[veille-mcp] Startup failed: ${redact(message, [process.env[API_KEY_ENVIRONMENT_VARIABLE]])}\n`,
  );
  process.exitCode = 1;
});
