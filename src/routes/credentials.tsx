import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCandidate } from "@/hooks/use-candidate";
import { Workspace, SignInPrompt, Status } from "@/components/site";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { pageHead } from "@/lib/talent";
import { Upload, LockKeyhole, FileText } from "lucide-react";
import { toast } from "sonner";
export const Route = createFileRoute("/credentials")({
  head: () =>
    pageHead(
      "Credential submission",
      "Submit certificates and alternative evidence securely for human review.",
    ),
  component: Credentials,
});
const kinds = [
  "Academic certificate",
  "Transcript",
  "Professional certificate",
  "Employment reference",
  "Alternative evidence",
];
function Credentials() {
  const { data, isPending } = useCandidate();
  const [kind, setKind] = useState(kinds[0]);
  const [busy, setBusy] = useState(false);
  const qc = useQueryClient();
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;
    const form = e.currentTarget;
    const f = new FormData(form);
    const file = f.get("document");
    const evidence = String(f.get("evidence") || "").trim();
    if (!kind || !kinds.includes(kind)) {
      toast.error("Choose a valid document type");
      return;
    }
    if (kind === "Alternative evidence" && (!evidence || evidence.length > 3000)) {
      toast.error("Describe your alternative evidence");
      return;
    }
    if (kind !== "Alternative evidence" && (!(file instanceof File) || !file.size)) {
      toast.error("Choose a document to upload");
      return;
    }
    if (
      file instanceof File &&
      file.size &&
      (file.size > 10 * 1024 * 1024 ||
        !["application/pdf", "image/jpeg", "image/png"].includes(file.type))
    ) {
      toast.error("Use a PDF, JPG or PNG file up to 10 MB");
      return;
    }
    setBusy(true);
    try {
      let path: null | string = null;
      let filename = "Alternative evidence";
      if (file instanceof File && file.size) {
        filename = file.name.slice(0, 255);
        path = `${data.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(-100)}`;
        const upload = await supabase.storage.from("credentials").upload(path, file);
        if (upload.error) throw upload.error;
      }
      const result = await supabase
        .from("credentials")
        .insert({
          candidate_id: data.user.id,
          kind,
          filename,
          storage_path: path,
          alternative_evidence: evidence,
        });
      if (result.error) throw result.error;
      toast.success("Evidence submitted. Your review is pending.");
      form.reset();
      await qc.invalidateQueries({ queryKey: ["candidate"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace
      title="Your credentials"
      subtitle="Your qualifications matter. Submit documents or tell us what alternative evidence is available."
    >
      {isPending ? (
        <p>Loading…</p>
      ) : !data ? (
        <SignInPrompt />
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-6">
          <form onSubmit={submit} className="panel h-fit">
            <h2 className="text-lg font-bold mb-6">Submit evidence</h2>
            <div className="flex flex-col gap-5">
              <label className="field">
                Evidence type
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  {kinds.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              {kind === "Alternative evidence" ? (
                <label className="field">
                  Alternative evidence
                  <textarea
                    name="evidence"
                    required
                    maxLength={3000}
                    placeholder="Describe work samples, professional references or other evidence that can support your qualifications."
                  />
                </label>
              ) : null}
              <label className="field">
                {kind === "Alternative evidence" ? "Supporting file (optional)" : "Document *"}
                <input
                  name="document"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  required={kind !== "Alternative evidence"}
                />
                <span className="text-xs font-normal text-muted-foreground">
                  PDF, JPG or PNG · Maximum 10 MB
                </span>
              </label>
              <Button disabled={busy}>
                <Upload />
                {busy ? "Submitting…" : "Submit for review"}
              </Button>
              <p className="text-xs text-muted-foreground flex gap-2 leading-relaxed">
                <LockKeyhole size={16} className="shrink-0" />
                Only you and authorised reviewers can access your documents.
              </p>
            </div>
          </form>
          <section>
            <h2 className="font-bold text-lg mb-4">
              Submitted evidence{" "}
              <span className="text-muted-foreground">({data.credentials?.length || 0})</span>
            </h2>
            {data.credentials?.length ? (
              data.credentials.map((c) => (
                <article className="panel mb-4" key={c.id}>
                  <div className="flex justify-between gap-3 items-start">
                    <div className="flex gap-3">
                      <FileText className="text-primary size-5 shrink-0" />
                      <div>
                        <h3 className="font-semibold text-sm">{c.kind}</h3>
                        <p className="text-xs text-muted-foreground mt-1 break-all">{c.filename}</p>
                      </div>
                    </div>
                    <Status status={c.status} />
                  </div>
                  {c.alternative_evidence && (
                    <p className="text-sm mt-4">{c.alternative_evidence}</p>
                  )}
                  {c.review_note && <p className="notice">Reviewer note: {c.review_note}</p>}
                  <p className="text-xs text-muted-foreground mt-4">
                    Submitted {new Date(c.created_at).toLocaleDateString()}
                    {c.reviewed_at && ` · Reviewed ${new Date(c.reviewed_at).toLocaleDateString()}`}
                  </p>
                </article>
              ))
            ) : (
              <div className="panel text-center py-12">
                <FileText className="mx-auto text-muted-foreground mb-4" />
                <p className="font-semibold text-sm">No evidence submitted yet</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Your submissions and review updates will appear here.
                </p>
              </div>
            )}
            <p className="notice">
              Qualifications are reviewed by a person, never automatically approved. A skills
              assessment does not verify academic credentials.
            </p>
          </section>
        </div>
      )}
    </Workspace>
  );
}
