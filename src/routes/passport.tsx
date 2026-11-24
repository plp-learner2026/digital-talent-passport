import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useCandidate } from "@/hooks/use-candidate";
import { Workspace, SignInPrompt } from "@/components/site";
import { PassportCard } from "@/components/passport-card";
import { DemoBanner, useDemoTalent } from "@/components/demo";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/talent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
export const Route = createFileRoute("/passport")({
  head: () =>
    pageHead(
      "Digital talent passport",
      "Your professional passport distinguishes assessed skills from reviewed credentials.",
    ),
  component: Passport,
});
function Passport() {
  const { data, isPending } = useCandidate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const demoQ = useDemoTalent();
  const [sharing, setSharing] = useState(false);
  useEffect(() => {
    setSharing(Boolean(data?.profile.public_consent));
  }, [data?.profile.public_consent]);
  async function consent(value: boolean) {
    if (!data) return;
    setSharing(value);
    setBusy(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ public_consent: value })
        .eq("id", data.user.id);
      if (error) throw error;
      await qc.invalidateQueries({ queryKey: ["candidate"] });
      await qc.invalidateQueries({ queryKey: ["verification"] });
      toast.success(value ? "Public verification enabled" : "Your passport is now private");
    } catch (e) {
      setSharing(data.profile.public_consent);
      toast.error(e instanceof Error ? e.message : "Unable to save sharing preference");
    } finally {
      setBusy(false);
    }
  }
  return (
    <Workspace
      title="Your digital talent passport"
      subtitle="A professional record of what you know, what you have achieved, and what has been reviewed."
    >
      {isPending ? (
        <p>Loading…</p>
      ) : !data ? (
        demoQ.data ? (
          <>
            <DemoBanner note="This is a sample passport. PDF download and public sharing are turned off." />
            <PassportCard
              demo
              download
              data={{
                full_name: demoQ.data.full_name,
                passport_id: "DEMO-0001",
                category: demoQ.data.category,
                education: demoQ.data.education,
                experience: demoQ.data.experience,
                credentials: [{ kind: "Academic certificate", status: demoQ.data.status }],
                assessments: [
                  {
                    category: demoQ.data.category,
                    score: demoQ.data.score,
                    passed: true,
                    created_at: new Date().toISOString(),
                  },
                ],
              }}
            />
          </>
        ) : demoQ.isPending ? (
          <p>Loading…</p>
        ) : (
          <SignInPrompt />
        )
      ) : !data.assessments?.some((a) => a.passed) ? (
        <div className="panel max-w-xl">
          <h2 className="font-bold text-xl mb-3">Your passport is waiting for you</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Complete a skills assessment with at least 4/5 to receive your digital passport.
          </p>
          <Button asChild>
            <Link to="/assessment">Take a skills assessment</Link>
          </Button>
        </div>
      ) : (
        <>
          <PassportCard
            data={{
              ...data.profile,
              credentials: data.credentials || [],
              assessments: data.assessments || [],
            }}
            download
          />
          <div className="panel max-w-[760px] mx-auto mt-6">
            <label className="flex gap-3 items-start text-sm font-semibold">
              <input
                type="checkbox"
                disabled={busy}
                checked={sharing}
                onChange={(e) => consent(e.target.checked)}
                className="mt-1 accent-primary"
              />
              I agree to make my professional passport available for public verification.
            </label>
            <p className="text-xs text-muted-foreground leading-relaxed ml-6 mt-2">
              This shares your name, professional category, education, experience, assessed skills
              and credential statuses. Your email, country of origin, city, biography and uploaded
              files remain private. You can withdraw consent at any time.
            </p>
            {data.profile.public_consent && (
              <Button variant="link" asChild className="mt-3">
                <Link to="/verify" search={{ id: data.profile.passport_id }}>
                  Open public verification page
                </Link>
              </Button>
            )}
          </div>
        </>
      )}
    </Workspace>
  );
}
