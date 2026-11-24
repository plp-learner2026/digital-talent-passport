import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useCandidate } from "@/hooks/use-candidate";
import { Workspace, SignInPrompt, Status } from "@/components/site";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead, type Credential } from "@/lib/talent";
import { toast } from "sonner";
import { ShieldCheck, ExternalLink } from "lucide-react";
export const Route = createFileRoute("/admin")({
  head: () =>
    pageHead(
      "Administrator review",
      "Authorised review of candidate evidence and assessment outcomes.",
    ),
  component: Admin,
});
function Review({ credential }: { credential: Credential }) {
  const [status, setStatus] = useState(credential.status);
  const [note, setNote] = useState(credential.review_note);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  async function save() {
    if (note.length > 2000) return;
    setBusy(true);
    const { error } = await supabase
      .from("credentials")
      .update({ status, review_note: note })
      .eq("id", credential.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Decision and review date recorded");
      await qc.invalidateQueries({ queryKey: ["admin-data"] });
      await qc.invalidateQueries({ queryKey: ["candidate"] });
      await qc.invalidateQueries({ queryKey: ["impact"] });
    }
  }
  async function open() {
    if (!credential.storage_path) return;
    const { data, error } = await supabase.storage
      .from("credentials")
      .createSignedUrl(credential.storage_path, 60);
    if (error) {
      toast.error(error.message);
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }
  return (
    <div className="panel mb-4">
      <div className="flex justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{credential.kind}</h3>
          <p className="text-xs text-muted-foreground mt-1">{credential.filename}</p>
        </div>
        <Status status={credential.status} />
      </div>
      {credential.storage_path && (
        <Button variant="outline" size="sm" onClick={open}>
          <ExternalLink />
          Open private document
        </Button>
      )}
      {credential.alternative_evidence && (
        <p className="notice">{credential.alternative_evidence}</p>
      )}
      <div className="form-grid mt-5">
        <label className="field">
          Review decision
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {[
              "Pending review",
              "Under review",
              "Verified",
              "Additional evidence required",
              "Not verified",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="field">
          Review note
          <textarea maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
        </label>
      </div>
      <div className="flex justify-between mt-4 items-center gap-4">
        <Button disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Record decision"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {credential.reviewed_at
            ? `Reviewed ${new Date(credential.reviewed_at).toLocaleString()}`
            : "Awaiting review"}
        </span>
      </div>
    </div>
  );
}
function Admin() {
  const { data: candidate, isPending } = useCandidate();
  const [selected, setSelected] = useState("");
  const {
    data,
    error,
    isPending: loading,
  } = useQuery({
    queryKey: ["admin-data"],
    enabled: Boolean(candidate?.isAdmin),
    queryFn: async () => {
      const [p, c, a] = await Promise.all([
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(1000),
        supabase
          .from("credentials")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("assessments")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);
      if (p.error || c.error || a.error) throw p.error || c.error || a.error;
      return { profiles: p.data || [], credentials: c.data || [], assessments: a.data || [] };
    },
    retry: false,
  });
  return (
    <Workspace
      title="Credential review"
      subtitle="Human decisions. Clear evidence. Trusted professional records."
    >
      {isPending ? (
        <p>Checking access…</p>
      ) : !candidate ? (
        <SignInPrompt />
      ) : !candidate.isAdmin ? (
        <div className="panel max-w-xl">
          <ShieldCheck className="text-primary size-8 mb-4" />
          <h2 className="font-bold text-xl mb-3">Authorised reviewers only</h2>
          <p className="text-sm text-muted-foreground">
            Your account does not have administrator access. Candidate accounts cannot approve
            qualifications or access other candidates’ documents.
          </p>
        </div>
      ) : loading ? (
        <p>Loading candidate records…</p>
      ) : error ? (
        <p className="notice">Unable to load review records.</p>
      ) : (
        <>
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              ["Candidates", data?.profiles.length],
              [
                "Awaiting review",
                data?.credentials.filter((c) => c.status === "Pending review").length,
              ],
              [
                "Verified credentials",
                data?.credentials.filter((c) => c.status === "Verified").length,
              ],
            ].map(([label, value]) => (
              <article className="panel" key={String(label)}>
                <p className="stat-value">{value}</p>
                <p className="stat-label">{label}</p>
              </article>
            ))}
          </div>
          <div className="panel table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Profession</th>
                  <th>Credentials</th>
                  <th>Assessment scores</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {data?.profiles.map((p) => (
                  <tr key={p.id}>
                    <td className="font-semibold">
                      {p.full_name || "Profile incomplete"}
                      <p className="text-xs text-muted-foreground mt-1">{p.city}</p>
                    </td>
                    <td>{p.category}</td>
                    <td>{data.credentials.filter((c) => c.candidate_id === p.id).length}</td>
                    <td>
                      {data.assessments
                        .filter((a) => a.candidate_id === p.id)
                        .map((a) => `${a.score}/5`)
                        .join(", ") || "Not assessed"}
                    </td>
                    <td>
                      <Button variant="outline" size="sm" onClick={() => setSelected(p.id)}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data?.profiles.length && (
              <p className="text-sm text-muted-foreground py-6">No candidates registered yet.</p>
            )}
          </div>
          {selected && (
            <section className="mt-8">
              <h2 className="text-xl font-bold mb-5">
                Evidence · {data?.profiles.find((p) => p.id === selected)?.full_name}
              </h2>
              {data?.credentials
                .filter((c) => c.candidate_id === selected)
                .map((c) => (
                  <Review key={c.id} credential={c} />
                ))}
              {!data?.credentials.some((c) => c.candidate_id === selected) && (
                <p className="notice">This candidate has not submitted evidence.</p>
              )}
            </section>
          )}
          <p className="text-xs text-muted-foreground mt-5">
            Showing up to 1,000 latest records. Demo profiles are excluded.
          </p>
        </>
      )}
    </Workspace>
  );
}
