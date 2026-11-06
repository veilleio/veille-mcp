# Installing the Veille MCP server

Instructions for AI agents installing this server for a user.

1. Check that Node.js 20 or newer is available (`node --version`).
2. Ask the user for their Veille API key. They can create one at https://app.veille.io/register and copy it from https://app.veille.io.
   Never print the key back or commit it to a file in a repository.
3. Prefer the hosted server: add it with URL `https://mcp.veille.io/` and the header `x-api-key: <key>`:

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

Or run it locally over stdio:

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

4. Restart the client and check that the `intelligence_domain` tool is listed.

The server needs no other configuration. Each tool call that reaches the API consumes Veille credits.
