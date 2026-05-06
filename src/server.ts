import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TimewebCloudClient } from "./api/client.js";
import { registerListDomains } from "./tools/list-domains.js";
import { registerGetDomain } from "./tools/get-domain.js";
import { registerAddDomain } from "./tools/add-domain.js";
import { registerDeleteDomain } from "./tools/delete-domain.js";
import { registerCheckDomain } from "./tools/check-domain.js";
import { registerSetAutoProlongation } from "./tools/set-auto-prolongation.js";
import { registerAddSubdomain } from "./tools/add-subdomain.js";
import { registerDeleteSubdomain } from "./tools/delete-subdomain.js";
import { registerGetDnsRecords } from "./tools/get-dns-records.js";
import { registerGetDefaultDnsRecords } from "./tools/get-default-dns-records.js";
import { registerCreateDnsRecord } from "./tools/create-dns-record.js";
import { registerUpdateDnsRecord } from "./tools/update-dns-record.js";
import { registerDeleteDnsRecord } from "./tools/delete-dns-record.js";
import { registerGetNameServers } from "./tools/get-name-servers.js";
import { registerUpdateNameServers } from "./tools/update-name-servers.js";
import { registerSetDefaultNameServers } from "./tools/set-default-name-servers.js";

export function createServer(client: TimewebCloudClient): McpServer {
  const server = new McpServer({
    name: "timeweb-cloud-mcp-server",
    version: "0.1.0",
  });

  registerListDomains(server, client);
  registerGetDomain(server, client);
  registerAddDomain(server, client);
  registerDeleteDomain(server, client);
  registerCheckDomain(server, client);
  registerSetAutoProlongation(server, client);
  registerAddSubdomain(server, client);
  registerDeleteSubdomain(server, client);
  registerGetDnsRecords(server, client);
  registerGetDefaultDnsRecords(server, client);
  registerCreateDnsRecord(server, client);
  registerUpdateDnsRecord(server, client);
  registerDeleteDnsRecord(server, client);
  registerGetNameServers(server, client);
  registerUpdateNameServers(server, client);
  registerSetDefaultNameServers(server, client);

  return server;
}
