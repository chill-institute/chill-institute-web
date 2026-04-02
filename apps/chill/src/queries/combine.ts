import type { UseQueryResult } from "@tanstack/react-query";

type CombinedResult<T extends readonly UseQueryResult[]> =
  | { status: "pending" }
  | { status: "error"; error: Error }
  | { status: "success"; data: { [K in keyof T]: NonNullable<T[K]["data"]> } };

export function combineQueries<T extends readonly UseQueryResult[]>(
  ...queries: T
): CombinedResult<T> {
  const errored = queries.find((q) => q.status === "error");
  if (errored) {
    return { status: "error", error: errored.error ?? new Error("Unknown query error") };
  }

  if (queries.some((q) => q.status === "pending")) {
    return { status: "pending" };
  }

  return {
    status: "success",
    data: queries.map((q) => q.data!) as never,
  };
}
