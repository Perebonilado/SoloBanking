import type { ApiErrorBody } from "@/types/banking";

export class ApiError extends Error {
  constructor(
    readonly status: number | string,
    readonly code: string,
    message: string,
  ) {
    super(`${code}: ${message}`);
    this.name = "ApiError";
  }

  get isSessionExpired() {
    return this.status === 401 && this.code === "TOKEN_INVALID";
  }
}

interface PendingRequest<T> {
  unwrap(): Promise<T>;
  unsubscribe?(): void;
  reset?(): void;
}

function toApiError(error: unknown): ApiError {
  if (typeof error === "object" && error !== null && "status" in error) {
    const { status, data } = error as { status: number | string; data?: unknown };
    const body = data as Partial<ApiErrorBody> | undefined;
    return new ApiError(
      status,
      body?.error?.code ?? String(status),
      body?.error?.message ?? "The request failed",
    );
  }
  return new ApiError(
    "UNKNOWN",
    "UNKNOWN",
    error instanceof Error ? error.message : "The request failed",
  );
}

export async function settle<T>(pending: PendingRequest<T>): Promise<T> {
  try {
    return await pending.unwrap();
  } catch (error) {
    throw toApiError(error);
  } finally {
    pending.unsubscribe?.();
    pending.reset?.();
  }
}
