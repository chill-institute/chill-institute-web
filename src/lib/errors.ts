import { ConnectError, Code } from "@connectrpc/connect";

export function isIgnorableAbortError(error: unknown) {
  if (error instanceof ConnectError) {
    return error.code === Code.Canceled;
  }
  if (error instanceof DOMException) {
    return error.name === "AbortError";
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("aborted") || message.includes("canceled") || message.includes("cancelled")
    );
  }
  return false;
}

export function toErrorMessage(error: unknown) {
  if (error instanceof ConnectError) {
    if (error.code === Code.Unauthenticated || error.code === Code.PermissionDenied) {
      return "Session expired. Please sign in again.";
    }
    if (error.code === Code.Unavailable) {
      return "Service temporarily unavailable. Please try again shortly.";
    }
    if (error.code === Code.DeadlineExceeded) {
      return "Request timed out. Please try again.";
    }
    if (error.rawMessage) {
      return error.rawMessage;
    }
  }
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (
      message.includes("provider unavailable") ||
      message.includes("lookup redis") ||
      message.includes("dial tcp") ||
      message.includes("connection refused")
    ) {
      return "Service temporarily unavailable. Please try again shortly.";
    }
    return error.message;
  }
  return "Unexpected error";
}
