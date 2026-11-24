import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { getDemo } from "@/lib/data.functions";

export function DemoBanner({ note }: { note: string }) {
  return (
    <div className="panel mb-6 flex flex-wrap items-center justify-between gap-3 border-primary">
      <div className="flex items-start gap-3 text-sm">
        <Eye className="text-primary size-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold tracking-wide text-primary">DEMONSTRATION</p>
          <p className="text-muted-foreground mt-1">{note}</p>
        </div>
      </div>
      <Link to="/auth" className="text-sm font-semibold text-primary underline">
        Sign in to save
      </Link>
    </div>
  );
}

/** Sample talents only — never real candidate data. */
export function useDemoTalent() {
  return useQuery({
    queryKey: ["demo-talents"],
    queryFn: () => getDemo(),
    select: (rows) => rows?.[0] ?? null,
    staleTime: Infinity,
  });
}
