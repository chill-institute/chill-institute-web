import { create } from "@bufbuild/protobuf";
import { SearchResultSchema } from "@chill-institute/contracts/chill/v4/api_pb";
import { describe, expect, it } from "vite-plus/test";

import { formatSearchResults } from "./search";
import { CodecFilter, OtherFilter, ResolutionFilter, SortBy, SortDirection } from "./types";

describe("formatSearchResults", () => {
  it("applies quick filters on the client before sorting", () => {
    const results = [
      create(SearchResultSchema, {
        id: "x264",
        title: "Movie.A.1080p.x264.HDR",
        indexer: "yts",
        source: "yts",
        peers: BigInt(120),
        seeders: BigInt(90),
        size: BigInt(100),
        uploadedAt: "2025-01-01T00:00:00Z",
        link: "https://example.com/x264",
      }),
      create(SearchResultSchema, {
        id: "match-high",
        title: "Movie.B.1080p.x265.HDR",
        indexer: "yts",
        source: "yts",
        peers: BigInt(60),
        seeders: BigInt(50),
        size: BigInt(200),
        uploadedAt: "2025-01-02T00:00:00Z",
        link: "https://example.com/match-high",
      }),
      create(SearchResultSchema, {
        id: "match-low",
        title: "Movie.C.1080p.x265.HDR",
        indexer: "rarbg",
        source: "rarbg",
        peers: BigInt(20),
        seeders: BigInt(10),
        size: BigInt(150),
        uploadedAt: "2025-01-03T00:00:00Z",
        link: "https://example.com/match-low",
      }),
      create(SearchResultSchema, {
        id: "wrong-resolution",
        title: "Movie.D.720p.x265.HDR",
        indexer: "yts",
        source: "yts",
        peers: BigInt(1000),
        seeders: BigInt(999),
        size: BigInt(300),
        uploadedAt: "2025-01-04T00:00:00Z",
        link: "https://example.com/wrong-resolution",
      }),
    ];

    const formatted = formatSearchResults(
      results,
      [ResolutionFilter.RESOLUTION_FILTER_1080P],
      [CodecFilter.X265],
      [OtherFilter.HDR],
      SortBy.SEEDERS,
      SortDirection.DESC,
    );

    expect(formatted.map((result) => result.id)).toEqual(["match-high", "match-low"]);
  });
});
