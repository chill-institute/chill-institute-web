import { create } from "@bufbuild/protobuf";
import { SearchResultSchema } from "@chill-institute/contracts/chill/v4/api_pb";
import { describe, expect, it } from "vite-plus/test";

import { formatSearchResults, normalizeQuery } from "./search";
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

describe("normalizeQuery", () => {
  it("extracts IMDb ID from a full IMDb URL", () => {
    expect(normalizeQuery("https://www.imdb.com/title/tt36363971/?ref_=ext_shr_lnk")).toBe(
      "tt36363971",
    );
  });

  it("extracts IMDb ID from an IMDb URL without query params", () => {
    expect(normalizeQuery("https://www.imdb.com/title/tt1375666/")).toBe("tt1375666");
  });

  it("extracts IMDb ID from an IMDb URL with trailing whitespace", () => {
    expect(normalizeQuery("  https://www.imdb.com/title/tt1375666/  ")).toBe("tt1375666");
  });

  it("extracts IMDb ID from a mobile IMDb URL", () => {
    expect(normalizeQuery("https://m.imdb.com/title/tt1375666/")).toBe("tt1375666");
  });

  it("returns the original query trimmed when not an IMDb URL", () => {
    expect(normalizeQuery("  The Matrix  ")).toBe("The Matrix");
  });

  it("returns the original query when it is already an IMDb ID", () => {
    expect(normalizeQuery("tt1375666")).toBe("tt1375666");
  });

  it("returns empty string for empty input", () => {
    expect(normalizeQuery("")).toBe("");
    expect(normalizeQuery("   ")).toBe("");
  });
});
