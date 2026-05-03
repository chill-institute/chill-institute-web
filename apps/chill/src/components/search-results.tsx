import { useMemo } from "react";
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

// Parse common release-name signals out of the raw title so we can render a
// compact mono meta line under the result. We only show signals we actually
// found — anything ambiguous or absent is silently dropped.
const QUALITY_PATTERN = /\b(2160p|1080p|720p|480p)\b/i;
const CODEC_PATTERN = /\b(x265|h\.?265|hevc|x264|h\.?264|avc)\b/i;
const HDR_PATTERN = /\b(DV|HDR10[+P]?|HDR)\b/;
const AUDIO_PATTERN = /\b(Atmos|TrueHD|DDP\s?5\.1|DTS-HD\s?MA|DTS|AC3|AAC)\b/i;
const GROUP_PATTERN = /-(\w[\w.]{2,})$/;

type Parsed = {
  quality?: string;
  codec?: string;
  hdr?: string;
  audio?: string;
  group?: string;
};

function parseMeta(title: string): Parsed {
  const out: Parsed = {};
  const quality = title.match(QUALITY_PATTERN)?.[1];
  if (quality) out.quality = quality.toLowerCase();
  const codec = title.match(CODEC_PATTERN)?.[1];
  if (codec) {
    const lower = codec.toLowerCase().replace(".", "");
    if (lower === "h265" || lower === "hevc") out.codec = "x265";
    else if (lower === "h264" || lower === "avc") out.codec = "x264";
    else out.codec = lower;
  }
  const hdr = title.match(HDR_PATTERN)?.[1];
  if (hdr) out.hdr = hdr;
  const audio = title.match(AUDIO_PATTERN)?.[1];
  if (audio) out.audio = audio;
  const group = title.match(GROUP_PATTERN)?.[1];
  if (group) out.group = group;
  return out;
}

function MetaLine({ meta }: { meta: Parsed }) {
  const parts: { text: string; hl?: boolean }[] = [];
  if (meta.quality) parts.push({ text: meta.quality, hl: true });
  if (meta.codec) parts.push({ text: meta.codec });
  if (meta.hdr) parts.push({ text: meta.hdr });
  if (meta.audio) parts.push({ text: meta.audio });
  if (meta.group) parts.push({ text: meta.group });
  if (parts.length === 0) return null;
  return (
    <div className="mt-1 font-mono text-[0.6875rem] leading-snug text-stone-600 dark:text-stone-300">
      {parts.map((p, i) => (
        <span key={`${p.text}-${i}`}>
          {i > 0 ? <span className="mx-1 text-stone-400 dark:text-stone-500">·</span> : null}
          <span className={p.hl ? "text-stone-950 dark:text-stone-100" : ""}>{p.text}</span>
        </span>
      ))}
    </div>
  );
}

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
  // Parse once per result; the table can re-render on sort/filter changes
  // without re-running the regex match against every title.
  const parsed = useMemo(() => {
    const map = new Map<string, Parsed>();
    for (const result of results) {
      map.set(result.id, parseMeta(result.title));
    }
    return map;
  }, [results]);

  return (
    <>
      <div className="mx-auto hidden w-full max-w-5xl lg:block">
        <table className="w-full min-w-full border-collapse">
          <thead className="border-b border-stone-950 dark:border-stone-700">
            <tr>
              {columns.map((column) => {
                const active = sortBy === column.key;
                const isTitle = column.key === SortBy.TITLE;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    className={
                      isTitle
                        ? "pr-2 pb-1.5 text-left font-serif text-base leading-tight font-normal tracking-tight whitespace-nowrap"
                        : "px-2 pb-1 text-center text-sm font-normal whitespace-nowrap"
                    }
                  >
                    <button
                      type="button"
                      className={`w-full cursor-pointer ${isTitle ? "text-left" : "text-center"}`}
                      onClick={() => onSort(column.key)}
                    >
                      <span
                        className={`inline-flex items-center gap-0.5 ${isTitle ? "" : "justify-center"}`}
                      >
                        <span>{column.label}</span>
                        {active ? (
                          <span className="inline-flex size-3">
                            {sortDirection === SortDirection.ASC ? <ArrowUp /> : <ArrowDown />}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  </th>
                );
              })}

              <th
                scope="col"
                className="px-2 pb-1 text-center text-sm font-normal whitespace-nowrap"
              >
                url
              </th>
              <th scope="col" className="pb-1 text-center text-sm font-normal whitespace-nowrap">
                <span aria-label="send to put.io">🤠</span>
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((result) => {
              const meta = parsed.get(result.id) ?? {};
              return (
                <tr
                  key={result.id}
                  className="border-b border-stone-950/10 last:border-b-0 dark:border-stone-700/30"
                >
                  <td className="py-3.5 pr-2 align-top text-sm leading-snug break-all">
                    <div>
                      <TitleCell result={result} titleBehavior={titleBehavior} />
                    </div>
                    <MetaLine meta={meta} />
                  </td>
                  <td className="px-2 py-3.5 text-center align-middle text-sm whitespace-nowrap tabular-nums">
                    {result.source}
                  </td>
                  <td className="px-2 py-3.5 text-center align-middle text-sm whitespace-nowrap tabular-nums">
                    {formatBytes(result.size)}
                  </td>
                  <td className="px-2 py-3.5 text-center align-middle text-sm whitespace-nowrap tabular-nums">
                    {result.seeders}
                  </td>
                  <td className="px-2 py-3.5 text-center align-middle text-sm whitespace-nowrap tabular-nums">
                    {formatAge(result.uploadedAt)}
                  </td>
                  <td className="px-2 py-3.5 text-center align-middle whitespace-nowrap">
                    <CopyButton value={result.link} />
                  </td>
                  <td className="w-32 py-3.5 pl-1 align-middle whitespace-nowrap">
                    <AddTransferButton className="w-full" url={result.link}>
                      send to put.io
                    </AddTransferButton>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="lg:hidden">
        {results.map((result) => {
          const meta = parsed.get(result.id) ?? {};
          return (
            <div
              key={result.id}
              className="my-4 overflow-hidden rounded-md border border-stone-950 bg-stone-100 dark:border-stone-700 dark:bg-stone-900"
            >
              <div className="px-6 py-5">
                <h5 className="m-0 text-sm leading-snug font-normal break-words">
                  <TitleCell result={result} titleBehavior={titleBehavior} />
                </h5>
                <MetaLine meta={meta} />

                <div className="my-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-y border-stone-950 py-2.5 font-mono text-xs text-stone-700 dark:border-stone-700 dark:text-stone-200">
                  <span className="text-stone-950 dark:text-stone-100">{result.source}</span>
                  <span className="text-stone-400 dark:text-stone-500">·</span>
                  <span className="tabular-nums">{formatBytes(result.size)}</span>
                  <span className="text-stone-400 dark:text-stone-500">·</span>
                  <span className="tabular-nums">{result.seeders} seeders</span>
                  <span className="text-stone-400 dark:text-stone-500">·</span>
                  <span className="tabular-nums">{formatAge(result.uploadedAt)}</span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CopyButton value={result.link} />
                  <AddTransferButton url={result.link}>send to put.io</AddTransferButton>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
