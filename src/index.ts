#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TimewebCloudClient } from "./api/client.js";
import { createServer } from "./server.js";

async function main(): Promise<void> {
  const token = process.env.TIMEWEBCLOUD_TOKEN;

  if (!token) {
    console.error("ERROR: TIMEWEBCLOUD_TOKEN env var is required.");
    process.exit(1);
  }

  const client = new TimewebCloudClient(token);
  const server = createServer(client);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Timeweb Cloud MCP server running via stdio");
}

main().catch((err) => {
  console.error("Server error:", err);
  process.exit(1);
});
