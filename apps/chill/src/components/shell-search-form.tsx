import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@chill-institute/ui/components/ui/tooltip";
import { normalizeQuery } from "@/lib/search";

export function ShellSearchForm({
  initialQuery = "",
  label,
}: {
  initialQuery?: string;
  label?: string;
}) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState<{ base: string; value: string } | null>(null);
  const value = draft?.base === initialQuery ? draft.value : initialQuery;
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "/" && !focused) {
        event.preventDefault();
        inputRef.current?.focus();
      }
      if (event.key === "Escape" && focused) {
        inputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [focused]);

  const isTouchDevice = useMemo(
    () =>
      typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0),
    [],
  );

  const icon = useMemo(() => {
    if (value) {
      return (
        <button
          type="button"
          className="cursor-pointer"
          aria-label="Clear search query"
          onClick={() => {
            setDraft({ base: initialQuery, value: "" });
            inputRef.current?.focus();
          }}
        >
          <X />
        </button>
      );
    }
    if (focused || isTouchDevice) {
      return null;
    }
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <kbd className="min-h-[18px] inline-flex justify-center items-center px-1 bg-stone-200 border border-transparent font-mono text-xs text-stone-800 rounded dark:bg-stone-800 dark:text-stone-200 cursor-default">
              /
            </kbd>
          }
        />
        <TooltipContent>
          <p>Press / to focus, esc to cancel</p>
        </TooltipContent>
      </Tooltip>
    );
  }, [focused, isTouchDevice, value, initialQuery]);

  return (
    <form
      className="w-full"
      action="/search"
      method="get"
      onSubmit={(event) => {
        event.preventDefault();
        const query = normalizeQuery(value);
        if (query.length === 0) {
          return;
        }
        void navigate({
          to: "/search",
          search: { q: query },
        });
      }}
    >
      <fieldset>
        {label ? (
          <label className="mb-1 block text-sm" htmlFor="search-global">
            {label}
          </label>
        ) : null}
        <div className="flex flex-row gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              id="search-global"
              className="input h-7.5 w-full pr-8 pl-2.5 text-base"
              required
              type="text"
              name="q"
              value={value}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onChange={(event) => setDraft({ base: initialQuery, value: event.target.value })}
            />
            <div className="absolute top-1/2 right-1.5 flex -translate-y-1/2 items-center">
              {icon}
            </div>
          </div>
          <button type="submit" className="btn">
            and chill
          </button>
        </div>
      </fieldset>
    </form>
  );
}
