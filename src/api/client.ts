import axios, { AxiosError, AxiosInstance } from "axios";
import { fromAxiosError } from "../utils/errors.js";

const BASE_URL = "https://api.timeweb.cloud";

export type DnsType = "A" | "AAAA" | "MX" | "CNAME" | "TXT" | "SRV";

export interface DnsRecordBody {
  type: DnsType;
  value: string;
  subdomain?: string;
  priority?: number;
  ttl?: number;
}

export interface NameServerInput {
  host: string;
  ips?: string[];
}

export interface ListDomainsParams {
  limit?: number;
  offset?: number;
  idn_name?: string;
  linked_ip?: string;
  order?: string;
  sort?: string;
}

export class TimewebCloudClient {
  private readonly http: AxiosInstance;

  constructor(token: string) {
    this.http = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    this.http.interceptors.response.use(
      (r) => r,
      (err: AxiosError) => {
        throw fromAxiosError(err);
      }
    );
  }

  private async req<T>(
    method: "get" | "post" | "put" | "patch" | "delete",
    url: string,
    opts: { data?: unknown; params?: Record<string, unknown> } = {}
  ): Promise<T> {
    const params = opts.params
      ? Object.fromEntries(
          Object.entries(opts.params).filter(([, v]) => v !== undefined)
        )
      : undefined;
    const res = await this.http.request<T>({
      method,
      url,
      data: opts.data,
      params,
    });
    return res.data;
  }

  // --- Domains ---

  listDomains(params: ListDomainsParams = {}): Promise<unknown> {
    return this.req("get", "/api/v1/domains", { params: { ...params } });
  }

  getDomain(fqdn: string): Promise<unknown> {
    return this.req("get", `/api/v1/domains/${encodeURIComponent(fqdn)}`);
  }

  addDomain(fqdn: string): Promise<unknown> {
    return this.req("post", `/api/v1/add-domain/${encodeURIComponent(fqdn)}`);
  }

  deleteDomain(fqdn: string): Promise<unknown> {
    return this.req("delete", `/api/v1/domains/${encodeURIComponent(fqdn)}`);
  }

  checkDomain(fqdn: string): Promise<unknown> {
    return this.req("get", `/api/v1/check-domain/${encodeURIComponent(fqdn)}`);
  }

  setAutoProlongation(fqdn: string, isAutoprolongEnabled: boolean): Promise<unknown> {
    return this.req("patch", `/api/v1/domains/${encodeURIComponent(fqdn)}`, {
      data: { is_autoprolong_enabled: isAutoprolongEnabled },
    });
  }

  // --- Subdomains ---

  addSubdomain(fqdn: string, subdomainFqdn: string): Promise<unknown> {
    return this.req(
      "post",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/subdomains/${encodeURIComponent(subdomainFqdn)}`
    );
  }

  deleteSubdomain(fqdn: string, subdomainFqdn: string): Promise<unknown> {
    return this.req(
      "delete",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/subdomains/${encodeURIComponent(subdomainFqdn)}`
    );
  }

  // --- DNS records ---

  getDnsRecords(fqdn: string, limit?: number, offset?: number): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records`,
      { params: { limit, offset } }
    );
  }

  getDefaultDnsRecords(fqdn: string): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/default-dns-records`
    );
  }

  createDnsRecord(fqdn: string, body: DnsRecordBody): Promise<unknown> {
    return this.req(
      "post",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records`,
      { data: body }
    );
  }

  updateDnsRecord(
    fqdn: string,
    recordId: number,
    body: DnsRecordBody
  ): Promise<unknown> {
    return this.req(
      "patch",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records/${recordId}`,
      { data: body }
    );
  }

  deleteDnsRecord(fqdn: string, recordId: number): Promise<unknown> {
    return this.req(
      "delete",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/dns-records/${recordId}`
    );
  }

  // --- Name servers ---

  getNameServers(fqdn: string): Promise<unknown> {
    return this.req(
      "get",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/name-servers`
    );
  }

  updateNameServers(fqdn: string, nameServers: NameServerInput[]): Promise<unknown> {
    return this.req(
      "put",
      `/api/v1/domains/${encodeURIComponent(fqdn)}/name-servers`,
      { data: { name_servers: nameServers } }
    );
  }
}
