import type { AxiosError } from "axios";

export class TimewebCloudApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details: unknown;
  public readonly responseId: string | undefined;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    responseId?: string
  ) {
    super(message);
    this.name = "TimewebCloudApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.responseId = responseId;
  }
}

export function fromAxiosError(err: AxiosError): TimewebCloudApiError {
  const status = err.response?.status ?? 0;
  const body = err.response?.data as Record<string, unknown> | undefined;
  const code =
    (body?.["status_code"] as string | undefined) ??
    (body?.["error_code"] as string | undefined) ??
    (body?.["code"] as string | undefined) ??
    err.code ??
    String(status || "UNKNOWN_ERROR");
  const message =
    (body?.["message"] as string | undefined) ??
    (body?.["error_message"] as string | undefined) ??
    (body?.["detail"] as string | undefined) ??
    err.message ??
    "Unknown error";
  const responseId = body?.["response_id"] as string | undefined;
  return new TimewebCloudApiError(status, String(code), message, body, responseId);
}

function formatError(err: TimewebCloudApiError): string {
  const statusPart = err.status || "?";
  const rid = err.responseId ? ` [response_id=${err.responseId}]` : "";
  return `Timeweb Cloud API ${statusPart}: ${err.code} — ${err.message}${rid}`;
}

export function handleToolError(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  if (error instanceof TimewebCloudApiError) {
    return { content: [{ type: "text", text: formatError(error) }], isError: true };
  }
  const msg = error instanceof Error ? error.message : String(error);
  return { content: [{ type: "text", text: `Unexpected error: ${msg}` }], isError: true };
}
