import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function SearchInTheInstituteButton({
  title,
  year,
}: {
  title: string;
  year?: number | string;
}) {
  const q = `${title}${year ? ` ${year}` : ""}`;
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Link
            to="/search"
            search={{ q }}
            className="btn btn-secondary"
            aria-label={`Search ${q} in the institute`}
          >
            <Search />
          </Link>
        }
      />
      <TooltipContent>search in the institute</TooltipContent>
    </Tooltip>
  );
}
