import type { PropsWithChildren } from "react";

export function ResponsiveBox({ children }: PropsWithChildren) {
  return <div className="px-4 max-w-sm xl:px-0 lg:w-full lg:max-w-5xl mx-auto">{children}</div>;
}

export function MobileBox({ children }: PropsWithChildren) {
  return <div className="w-full px-4 lg:px-0 max-w-lg mx-auto">{children}</div>;
}
