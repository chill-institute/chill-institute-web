import { ArrowDown, ArrowUp } from "lucide-react";

import { AddTransferButton } from "@/components/add-transfer-button";
import { CopyButton } from "@/components/copy-button";
import { formatAge, formatBytes } from "@/lib/format";
import type { SearchResult, UserSettings } from "@/lib/types";
import { SearchResultTitleBehavior, SortBy, SortDirection } from "@/lib/types";

type Props = {
  results: SearchResult[];
  sortBy: UserSettings["sortBy"];
  sortDirection: UserSettings["sortDirection"];
  titleBehavior: UserSettings["searchResultTitleBehavior"];
  onSort: (sortBy: UserSettings["sortBy"]) => void;
};

const columns = [
  { key: SortBy.TITLE, label: "Very well. Here are the results", align: "left" as const },
  { key: SortBy.SOURCE, label: "source", align: "center" as const },
  { key: SortBy.SIZE, label: "size", align: "center" as const },
  { key: SortBy.SEEDERS, label: "seeders", align: "center" as const },
  { key: SortBy.UPLOADED_AT, label: "age", align: "center" as const },
];

function TitleCell({
  result,
  titleBehavior,
}: {
  result: SearchResult;
  titleBehavior: Props["titleBehavior"];
}) {
  if (titleBehavior === SearchResultTitleBehavior.LINK) {
    return (
      <a href={result.link} title="Open URL" className="hover:underline hover:underline-offset-2">
        {result.title}
      </a>
    );
  }
  return <>{result.title}</>;
}

export function SearchResults({ results, sortBy, sortDirection, titleBehavior, onSort }: Props) {
  return (
    <>
      <div className="hidden lg:block w-full max-w-5xl mx-auto">
        <table className="w-full min-w-full">
          <thead className="border-b border-solid border-stone-950 dark:border-stone-700">
            <tr>
              {columns.map((column) => {
                const active = sortBy === column.key;
                const isTitle = column.key === SortBy.TITLE;
                return (
                  <th
                    key={column.key}
                    className={isTitle ? "pr-2 text-left" : "text-center px-2 font-normal"}
                  >
                    <button
                      type="button"
                      className={`w-full cursor-pointer ${isTitle ? "text-left" : "text-center"}`}
                      onClick={() => onSort(column.key)}
                    >
                      <div
                        className={`flex flex-row items-center ${
                          isTitle ? "space-x-0.5" : "justify-center space-x-0.5"
                        }`}
                      >
                        <span>{column.label}</span>
                        {active ? (
                          <span className="text-sm -mb-0.5">
                            {sortDirection === SortDirection.ASC ? <ArrowUp /> : <ArrowDown />}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </th>
                );
              })}

              <th className="px-2 font-normal">url</th>
              <th className="font-normal text-center">🤠</th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => (
              <tr key={result.id}>
                <td className="pr-2 pt-3 text-left break-all">
                  <TitleCell result={result} titleBehavior={titleBehavior} />
                </td>
                <td className="px-2 pt-3 text-center whitespace-nowrap">{result.source}</td>
                <td className="px-2 pt-3 text-center whitespace-nowrap">
                  {formatBytes(result.size)}
                </td>
                <td className="px-2 pt-3 text-center whitespace-nowrap">{result.seeders}</td>
                <td className="px-2 pt-3 text-center whitespace-nowrap">
                  {formatAge(result.uploadedAt)}
                </td>
                <td className="px-2 pt-3 text-center whitespace-nowrap">
                  <CopyButton value={result.link} />
                </td>
                <td className="w-25 pl-1 pt-3 whitespace-nowrap">
                  <AddTransferButton className="w-full" url={result.link}>
                    send to put.io
                  </AddTransferButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {results.map((result) => (
          <div key={result.id} className="my-4">
            <div className="relative rounded overflow-hidden border border-solid border-stone-950 dark:border-stone-700 bg-stone-100 dark:bg-stone-900">
              <div className="py-5 px-6">
                <h5 className="leading-5 break-words">
                  <TitleCell result={result} titleBehavior={titleBehavior} />
                </h5>

                <div className="flex flex-row items-center justify-between my-3 py-1 border-t border-b border-solid border-stone-950 dark:border-stone-700">
                  <div>{result.source}</div>
                  <div>{formatBytes(result.size)}</div>
                  <div>{result.seeders} seeders</div>
                  <div>{formatAge(result.uploadedAt)}</div>
                </div>

                <div className="flex items-center justify-between">
                  <CopyButton value={result.link} />
                  <AddTransferButton url={result.link}>send to put.io</AddTransferButton>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
