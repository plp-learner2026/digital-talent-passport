import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { getImpact } from "@/lib/data.functions";
import { pageHead } from "@/lib/talent";
import {
  Users,
  ClipboardCheck,
  FileCheck2,
  GraduationCap,
  BookUser,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
const opts = queryOptions({ queryKey: ["impact"], queryFn: () => getImpact(), staleTime: 0 });
export const Route = createFileRoute("/impact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(opts),
  head: () =>
    pageHead(
      "Our impact",
      "Live registration, assessment and credential statistics supporting SDG 4 and SDG 8.",
    ),
  component: Impact,
});
function Impact() {
  const { data, refetch, isFetching } = useSuspenseQuery(opts);
  const stats = data && typeof data === "object" && !Array.isArray(data) ? data : {};
  const tiles = [
    ["talents", "Registered talents", Users],
    ["assessments", "Assessments completed", ClipboardCheck],
    ["verified", "Credentials verified", FileCheck2],
    ["bridging", "Bridging recommended", GraduationCap],
    ["passports", "Passports issued", BookUser],
  ] as const;
  return (
    <main className="workspace">
      <div className="page-width">
        <div className="flex justify-between gap-4 mb-8">
          <div>
            <span className="eyebrow text-primary">OPPORTUNITY IN NUMBERS</span>
            <h1 className="page-title mt-3">Every talent counts.</h1>
            <p className="text-sm text-muted-foreground">
              Live outcomes from real candidate activity. Demonstration profiles are not counted.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            title="Refresh statistics"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw />
          </Button>
        </div>
        <div className="stat-grid">
          {tiles.map(([key, label, Icon]) => (
            <article className="panel" key={key}>
              <Icon className="text-primary size-6 mb-5" />
              <p className="stat-value">{Number(stats[key] || 0).toLocaleString()}</p>
              <p className="stat-label">{label}</p>
            </article>
          ))}
        </div>
        <div className="notice mt-8">
          Bridging recommended means the candidate has completed assessments but has not yet passed
          one. This is a learning recommendation, not a formal course placement.
        </div>
        <section className="section">
          <h2 className="text-2xl font-bold mb-6">Aligned with a better future</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <article className="panel">
              <span className="eyebrow text-primary">SDG 4 · QUALITY EDUCATION</span>
              <h3 className="text-xl font-bold mt-4 mb-3">Make learning count.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Credential review and assessment help identify learning achievements and areas where
                further training can open new doors.
              </p>
            </article>
            <article className="panel">
              <span className="eyebrow text-primary">SDG 8 · DECENT WORK & ECONOMIC GROWTH</span>
              <h3 className="text-xl font-bold mt-4 mb-3">Turn skills into opportunity.</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Consent-based professional records give employers a clearer view of displaced
                talent, supporting pathways towards meaningful work.
              </p>
            </article>
          </div>
        </section>
      </div>
    </main>
  );
}
