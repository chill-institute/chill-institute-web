import type { SearchResult } from "./types";
import { CodecFilter, OtherFilter, ResolutionFilter, SortBy, SortDirection } from "./types";

const IMDB_URL_PATTERN = /imdb\.com\/title\/(tt\d+)/i;

/**
 * Normalizes a search query by extracting identifiers from known URL patterns.
 * For example, an IMDb URL like "https://www.imdb.com/title/tt36363971/?ref_=ext_shr_lnk"
 * is normalized to "tt36363971".
 */
export function normalizeQuery(query: string): string {
  const trimmed = query.trim();
  const match = trimmed.match(IMDB_URL_PATTERN);
  if (match) {
    return match[1];
  }
  return trimmed;
}

function applyResolution(title: string, filter: ResolutionFilter) {
  switch (filter) {
    case ResolutionFilter.RESOLUTION_FILTER_720P:
      return /\b720p\b/.test(title);
    case ResolutionFilter.RESOLUTION_FILTER_1080P:
      return /\b1080p\b/.test(title);
    case ResolutionFilter.RESOLUTION_FILTER_2160P:
      return /\b(2160p|4k)\b/.test(title);
    default:
      return false;
  }
}

function applyCodec(title: string, filter: CodecFilter) {
  switch (filter) {
    case CodecFilter.X264:
      return /(x264|h264|x\.264|h\.264|avc)/.test(title);
    case CodecFilter.X265:
      return /(x265|h265|x\.265|h\.265|hevc)/.test(title);
    default:
      return false;
  }
}

function applyOther(title: string, filter: OtherFilter) {
  switch (filter) {
    case OtherFilter.HDR:
      return /\bhdr\b/.test(title);
    default:
      return false;
  }
}

function compareValues(a: SearchResult, b: SearchResult, sortBy: SortBy) {
  switch (sortBy) {
    case SortBy.TITLE:
      return a.title.localeCompare(b.title);
    case SortBy.SOURCE:
      return a.source.localeCompare(b.source);
    case SortBy.UPLOADED_AT:
      return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    case SortBy.SIZE:
      if (a.size === b.size) {
        return 0;
      }
      return a.size > b.size ? 1 : -1;
    case SortBy.SEEDERS:
      if (a.seeders === b.seeders) {
        return 0;
      }
      return a.seeders > b.seeders ? 1 : -1;
    default:
      return 0;
  }
}

export function formatSearchResults(
  results: SearchResult[],
  resolutionFilters: ResolutionFilter[],
  codecFilters: CodecFilter[],
  otherFilters: OtherFilter[],
  sortBy: SortBy,
  sortDirection: SortDirection,
) {
  const filtered = results
    .filter((result) => {
      const title = result.title.toLowerCase();
      if (resolutionFilters.length > 0) {
        const valid = resolutionFilters.some((filter) => applyResolution(title, filter));
        if (!valid) {
          return false;
        }
      }
      if (codecFilters.length > 0) {
        const valid = codecFilters.some((filter) => applyCodec(title, filter));
        if (!valid) {
          return false;
        }
      }
      if (otherFilters.length > 0) {
        const valid = otherFilters.some((filter) => applyOther(title, filter));
        if (!valid) {
          return false;
        }
      }
      return true;
    })
    .sort((a, b) => {
      const result = compareValues(a, b, sortBy);
      return sortDirection === SortDirection.ASC ? result : -result;
    });

  return filtered;
}
