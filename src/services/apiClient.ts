export interface ApiErrorPayload {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
  details?: any;
}

export class ApiError extends Error {
  public status: number;
  public code: string;
  public fieldErrors?: Record<string, string>;
  public details?: any;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = 'ApiError';
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
    this.details = payload.details;
  }
}

export const isApiError = (err: unknown): err is ApiError => {
  return err instanceof ApiError;
};

export const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new ApiError({
      status: 0,
      code: 'REQUEST_ABORTED',
      message: 'Request was cancelled.',
    });
  }

  if (error instanceof TypeError && error.message.toLowerCase().includes('fetch')) {
    return new ApiError({
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Network connection error. Please verify your internet or backend server connection.',
    });
  }

  const msg = error instanceof Error ? error.message : 'An unexpected error occurred.';
  return new ApiError({
    status: 500,
    code: 'UNKNOWN_ERROR',
    message: msg,
  });
};

