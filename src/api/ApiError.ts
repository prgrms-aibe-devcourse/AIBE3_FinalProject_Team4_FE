export class ApiError extends Error {
  status: number;
  resultCode?: string;

  constructor(message: string, status: number, resultCode?: string) {
    super(message);
    this.status = status;
    this.resultCode = resultCode;
  }
}

export function isUnauthorizedError(e: unknown): e is ApiError {
  return e instanceof ApiError && e.status === 401;
}
