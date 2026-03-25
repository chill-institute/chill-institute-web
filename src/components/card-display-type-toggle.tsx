import { LayoutGrid, LayoutList } from "lucide-react";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CardDisplayType, type UserSettings } from "@/lib/types";

const displayTypeOptions = [
  {
    icon: <LayoutGrid />,
    label: "Expanded",
    value: CardDisplayType.EXPANDED,
  },
  {
    icon: <LayoutList />,
    label: "Compact",
    value: CardDisplayType.COMPACT,
  },
] as const;

export function CardDisplayTypeToggle({
  value,
  onChange,
}: {
  value: UserSettings["cardDisplayType"];
  onChange: (value: UserSettings["cardDisplayType"]) => void;
}) {
  return (
    <ToggleGroup
      onValueChange={(v) => {
        if (v.length === 0) return;
        onChange(Number(v[0]) as UserSettings["cardDisplayType"]);
      }}
      value={[String(value)]}
    >
      {displayTypeOptions.map(({ icon, label, value: v }) => (
        <ToggleGroupItem key={v} value={String(v)}>
          <Tooltip>
            <TooltipTrigger render={<div>{icon}</div>} />
            <TooltipContent>
              <p>{label} view</p>
            </TooltipContent>
          </Tooltip>
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
