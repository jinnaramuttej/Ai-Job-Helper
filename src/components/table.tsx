import type { ReactNode } from "react";

/**
 * Plain table shell. Scrolls horizontally on narrow screens instead of
 * squashing columns.
 */
export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-surface">
      <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
        {children}
      </table>
    </div>
  );
}

export const thClasses =
  "border-b border-line px-4 py-2.5 text-sm font-medium text-muted";

export const trClasses = "border-b border-line last:border-b-0";

export const tdClasses = "px-4 py-2.5 align-top text-ink";
