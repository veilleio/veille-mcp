# Veille MCP Server

Official [Model Context Protocol](https://modelcontextprotocol.io) server for the [Veille](https://www.veille.io) fraud prevention API.

Validate emails, domains, IPs, VAT numbers and IBANs in milliseconds to block fake sign-ups, bots and fraud.

It lets Claude, Cursor, VS Code, Windsurf and any MCP client call the API as tools. Runs over **stdio** (local) or **Streamable HTTP** (self-hosted).

## Requirements

- Node.js 20 or newer
- a Veille API key — [sign up](https://app.veille.io/register), then copy it from the [dashboard](https://app.veille.io)

## Hosted server (recommended)

Veille runs this server for you at **`https://mcp.veille.io/`** (Streamable HTTP). Send your API key in the `x-api-key` header; nothing to install.

```sh
claude mcp add --transport http veille https://mcp.veille.io/ --header "x-api-key: YOUR_API_KEY"
```

```json
{
  "mcpServers": {
    "veille": {
      "url": "https://mcp.veille.io/",
      "headers": {
        "x-api-key": "YOUR_API_KEY"
      }
    }
  }
}
```

The hosted server and this package expose the same API; run the package locally when you want stdio, your own network egress, or to self-host it.

## Run it locally

### Claude Code

```sh
claude mcp add veille --env VEILLE_API_KEY=YOUR_API_KEY -- npx -y @veilleio/mcp
```

### Claude Desktop, Cursor, Windsurf and other clients

Add the server to the client's MCP configuration (`claude_desktop_config.json`, `.cursor/mcp.json`…):

```json
{
  "mcpServers": {
    "veille": {
      "command": "npx",
      "args": ["-y", "@veilleio/mcp"],
      "env": {
        "VEILLE_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### VS Code

```json
{
  "servers": {
    "veille": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@veilleio/mcp"],
      "env": {
        "VEILLE_API_KEY": "${input:veille-api-key}"
      }
    }
  },
  "inputs": [
    {
      "type": "promptString",
      "id": "veille-api-key",
      "description": "Veille API key",
      "password": true
    }
  ]
}
```

### Claude Desktop extension

Download the `.mcpb` bundle from the releases page and open it; Claude Desktop asks for your API key.

### Docker

```sh
docker build -t veille-mcp .
docker run -i --rm -e VEILLE_API_KEY=YOUR_API_KEY veille-mcp
```

## Tools

| Tool                  | Description                                                                                                                                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `intelligence_domain` | Check any domain instantly. Detects disposable email providers, public webmail, relay services, and education domains. Returns DNS health with MX provider detection, domain history, and optional SSL/… |
| `intelligence_email`  | Validate any email address in a single call. Detects disposable and temporary inboxes, identifies role accounts, public webmail, relay services, and returns a 0-100 risk score. For deep deliverabilit… |
| `intelligence_emailq` | Deep email deliverability verification. Performs full Email Validation plus SMTP inbox check, catch-all detection, and returns a qualification verdict (valid, invalid, risky, disposable, unknown).     |
| `intelligence_ip`     | Assess the reputation of any IP address. Detects VPNs, proxies, Tor exit nodes, datacenter hosting, abusive traffic, and bots. Returns geolocation, network owner, and a 0-100 threat score.             |
| `intelligence_phone`  | Validate any phone number in E.164 format. Detects disposable and virtual numbers, identifies carrier and line type (mobile/fixed/VoIP), returns country and timezone, and computes a 0-100 risk score.  |
| `stats`               | Infrastructure health for an engine or endpoint over the last hour. Not scoped to your account or tenant. Enabled per account: HTTP 403 means contact support to activate it.                            |
| `usage`               | Retrieve real-time usage statistics and credit balance for your Veille account.                                                                                                                          |
| `vat`                 | Validate a European VAT number against the VIES database. Returns company name, registered address, and validity status for any EU member state.                                                         |
| `vat_iban`            | Validate any IBAN and retrieve associated bank details. Returns the BIC/SWIFT code, bank name, country, BBAN structural breakdown, and SEPA zone membership.                                             |
| `vat_rates`           | Get current ECB exchange rates for any supported base currency. Optionally filter to specific target currencies. Updated daily from the European Central Bank.                                           |

Every tool that calls the API consumes credits. JSON results are returned as text; images are returned inline and other files (PDF…) as embedded resources, up to 4 MB.

## Streamable HTTP

```sh
npx @veilleio/mcp --http --port 3000
```

The endpoint is `POST /mcp` (stateless, JSON responses). Each client sends its own key in the `x-api-key` header (or `Authorization: Bearer <key>`); the server never uses a key of its own. It binds to `127.0.0.1` by default and rejects browser origins unless you allow them — put it behind TLS before exposing it.

`createHttpHandler()` is exported for Fetch-compatible runtimes (Cloudflare Workers, Deno, Bun):

```ts
import { createHttpHandler } from "@veilleio/mcp";

export default { fetch: createHttpHandler({ allowedOrigins: [] }) };
```

## Security

- The API key is read from `VEILLE_API_KEY` (stdio) or the request headers (HTTP) and removed from error messages.
- Content fetched from websites is untrusted: the server instructions tell the model to treat it as data, not instructions.
- See [SECURITY.md](SECURITY.md) to report a vulnerability.

## Development

```sh
npm install
npm test
npm run build
npx @modelcontextprotocol/inspector node dist/stdio.js
```

## Built on the SDK

The server uses the official [Node.js SDK](https://github.com/veilleio/veille-node) (`@veilleio/sdk`).

## All Veille SDKs

| SDK        | Package                                                         | Install                                |
| ---------- | --------------------------------------------------------------- | -------------------------------------- |
| Node.js    | [`@veilleio/sdk`](https://www.npmjs.com/package/@veilleio/sdk)  | `npm install @veilleio/sdk`            |
| Python     | [`veille`](https://pypi.org/project/veille/)                    | `pip install veille`                   |
| Go         | [`veille-go`](https://pkg.go.dev/github.com/veilleio/veille-go) | `go get github.com/veilleio/veille-go` |
| .NET       | [`Veille`](https://www.nuget.org/packages/Veille)               | `dotnet add package Veille`            |
| Ruby       | [`veille`](https://rubygems.org/gems/veille)                    | `gem install veille`                   |
| PHP        | [`veille/sdk`](https://packagist.org/packages/veille/sdk)       | `composer require veille/sdk`          |
| Java       | [`veille-java`](https://github.com/veilleio/veille-java)        | build from source, see its README      |
| CLI        | [`@veilleio/cli`](https://www.npmjs.com/package/@veilleio/cli)  | `npm install -g @veilleio/cli`         |
| MCP server | [`@veilleio/mcp`](https://www.npmjs.com/package/@veilleio/mcp)  | `npx -y @veilleio/mcp`                 |

## License

MIT — see [LICENSE](LICENSE).
