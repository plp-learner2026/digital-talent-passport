import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useCandidate } from "@/hooks/use-candidate";
import { DemoBanner, useDemoTalent } from "@/components/demo";
import { Workspace, SignInPrompt } from "@/components/site";
import { Button } from "@/components/ui/button";
import { categories, profileSchema, pageHead } from "@/lib/talent";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowRight, Save } from "lucide-react";
export const Route = createFileRoute("/register")({
  head: () =>
    pageHead(
      "Talent registration",
      "Build your professional profile with your education, experience and skills.",
    ),
  component: Register,
});
function Register() {
  const { data, isPending, error } = useCandidate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const demoQ = useDemoTalent();
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!data) return;
    const f = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(f));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Check your profile");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("profiles").update(parsed.data).eq("id", data.user.id);
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile saved successfully");
      await qc.invalidateQueries({ queryKey: ["candidate"] });
    }
  }
  const demo = !isPending && !error && !data;
  const t = demoQ.data;
  const p =
    demo && t
      ? {
          id: t.id,
          full_name: t.full_name,
          country: "Sample country",
          city: t.city,
          category: t.category,
          education: t.education,
          experience: t.experience,
          portfolio: "",
          biography: "Sample talent profile shown for demonstration purposes.",
        }
      : data?.profile;
  return (
    <Workspace
      title="Your talent profile"
      subtitle="Bring your qualifications, experience and professional story together."
    >
      {isPending ? (
        <p>Loading your profile…</p>
      ) : error ? (
        <p className="notice">Unable to load your profile. Please try signing in again.</p>
      ) : demo && !t ? (
        <SignInPrompt />
      ) : (
        <>
          {demo && (
            <DemoBanner note="You are viewing a sample talent profile. Editing and saving are turned off." />
          )}
          <form className="panel max-w-4xl" onSubmit={save} key={p?.id}>
            <fieldset disabled={demo} className="contents">
              <div className="flex justify-between items-center mb-7">
                <h2 className="font-bold text-lg">Professional information</h2>
                <span className="text-xs text-muted-foreground">Fields marked * are required</span>
              </div>
              <div className="form-grid">
                <label className="field">
                  Full name *
                  <input
                    name="full_name"
                    defaultValue={p?.full_name}
                    required
                    minLength={2}
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  Email address
                  <input
                    type="email"
                    value={data?.user.email || (demo ? "demo@example.org" : "")}
                    readOnly
                  />
                </label>
                <label className="field">
                  Country of origin *
                  <input
                    name="country"
                    defaultValue={p?.country}
                    placeholder="e.g. Somalia"
                    required
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  Current city in Kenya *
                  <input
                    name="city"
                    defaultValue={p?.city}
                    placeholder="e.g. Nairobi"
                    required
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  Professional skill category *
                  <select name="category" defaultValue={p?.category}>
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  Highest education level *
                  <input
                    name="education"
                    defaultValue={p?.education}
                    placeholder="e.g. BSc Computer Science"
                    required
                    maxLength={200}
                  />
                </label>
                <label className="field">
                  Years of professional experience *
                  <input
                    type="number"
                    name="experience"
                    defaultValue={p?.experience}
                    min={0}
                    max={70}
                    required
                  />
                </label>
                <label className="field">
                  Portfolio or LinkedIn URL
                  <input
                    type="url"
                    name="portfolio"
                    defaultValue={p?.portfolio}
                    placeholder="https://"
                    maxLength={500}
                  />
                </label>
                <label className="field span-full">
                  Professional biography
                  <textarea
                    name="biography"
                    defaultValue={p?.biography}
                    maxLength={2000}
                    placeholder="Tell us about your experience, strengths and aspirations."
                  />
                </label>
              </div>
              <div className="flex justify-between gap-3 mt-8 flex-wrap">
                <Button disabled={busy || demo}>
                  <Save />
                  {busy ? "Saving…" : "Save profile"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/credentials">
                    Submit credentials
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </fieldset>
          </form>
        </>
      )}
    </Workspace>
  );
}
