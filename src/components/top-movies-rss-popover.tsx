import { Rss, X } from "lucide-react";

import { CopyButton } from "@/components/copy-button";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { publicLinks } from "@/lib/public-links";
import { getTopMoviesSourceLabel, type TopMoviesSource } from "@/lib/types";

export function TopMoviesRSSPopover({
  source,
  feedUrl,
}: {
  source: TopMoviesSource;
  feedUrl: string;
}) {
  const sourceName = getTopMoviesSourceLabel(source);

  return (
    <Popover>
      <PopoverTrigger
        render={
          <button type="button" className="cursor-pointer" aria-label="Open RSS feed link">
            <Rss className="w-4 h-4 dark:hover:text-stone-400 hover:text-stone-500" />
          </button>
        }
      />

      <PopoverContent sideOffset={6}>
        <div className="flex flex-col space-y-2">
          <div className="space-y-2">
            <h4 className="font-medium leading-none text-base">RSS feed</h4>

            <p className="leading-tight text-sm text-stone-600 dark:text-stone-400">
              Here&apos;s a link for <b>{sourceName}</b>, generated for you. Please don&apos;t share
              it publicly.
            </p>
          </div>

          <div className="flex flex-row space-x-2 items-stretch">
            <input className="input flex-1" readOnly tabIndex={-1} value={feedUrl} />
            <CopyButton value={feedUrl} />
          </div>

          <div className="text-sm text-stone-600 dark:text-stone-400">
            You can add it to put.io by following{" "}
            <a
              className="dark:hover:text-stone-100 hover:text-stone-950 underline"
              href={publicLinks.guides}
              target="_blank"
              rel="noreferrer"
            >
              this guide.
            </a>
          </div>
        </div>

        <PopoverClose
          aria-label="Close"
          className="absolute top-2 right-2 cursor-pointer dark:text-stone-500 dark:hover:text-stone-100 text-stone-600 hover:text-stone-950 text-sm"
        >
          <X />
        </PopoverClose>

        <PopoverArrow />
      </PopoverContent>
    </Popover>
  );
}
