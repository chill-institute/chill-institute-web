import type { ReactNode } from "react";
import { MobileBox } from "./layout";

type EmptyStateProps = {
  description: ReactNode;
  icon: ReactNode;
  title: string;
};

export function EmptyState({ description, icon, title }: EmptyStateProps) {
  return (
    <div className="flex items-center">
      <MobileBox>
        <div className="flex flex-col items-center space-y-1">
          <div className="text-4xl md:text-5xl mb-2 animate-soft-pop">{icon}</div>
          <div className="text-lg font-medium">{title}</div>
          <div className="text-center">{description}</div>
        </div>
      </MobileBox>
    </div>
  );
}
