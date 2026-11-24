import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ShieldCheck,
  ClipboardCheck,
  BookUser,
  UserRoundPlus,
  Globe2,
  LockKeyhole,
  BadgeCheck,
  Check,
  GraduationCap,
  MoveUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { pageHead } from "@/lib/talent";
import team from "@/assets/team.asset.json";

// The home route ships no og:image, so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  head: () =>
    pageHead(
      "Talent Passport — Unlocking displaced talent",
      "Turn your qualifications and experience into a trusted professional record. Credential recognition and skills validation for skilled refugees in Kenya.",
    ),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return (
    <main>
      <section className="landing-hero">
        <img
          src={team.url}
          className="hero-photo"
          alt="Professionals collaborating and welcoming a colleague around a shared workspace"
        />
        <div className="hero-shade" />
        <div className="page-width hero-content">
          <div className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            UNLOCKING DISPLACED TALENT · KENYA
          </div>
          <h1>
            Talent Passport.
            <br />
            Your skills.
            <br />
            <span>Your next chapter.</span>
          </h1>
          <p className="hero-description">
            Your journey may have changed. Your talent hasn’t.
            <br />
            Get your qualifications recognised, demonstrate your skills, and open the door to
            meaningful opportunities.
          </p>
          <div className="hero-actions">
            <Button asChild variant="hero">
              <Link to="/register">
                Register as talent
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="light">
              <Link to="/explore">
                Explore the platform
                <MoveUpRight />
              </Link>
            </Button>
          </div>
          <div className="hero-trust">
            <div className="mini-avatars">
              <span>AH</span>
              <span>JM</span>
              <span>GU</span>
            </div>
            <span>A new pathway for skilled refugees in Kenya</span>
          </div>
        </div>
        <div className="hero-caption">
          <p className="font-semibold">Potential has no borders.</p>
          <p className="opacity-75 mt-1">Neither should opportunity.</p>
        </div>
      </section>
      <section className="principles">
        <div className="page-width principles-inner">
          <div className="principle">
            <ShieldCheck />
            Human-reviewed credentials
          </div>
          <div className="principle">
            <ClipboardCheck />
            Skills you can demonstrate
          </div>
          <div className="principle">
            <BookUser />A passport to opportunity
          </div>
          <div className="principle">
            <LockKeyhole />
            Your data. Your control.
          </div>
        </div>
      </section>
      <section className="section page-width">
        <div className="section-heading">
          <div>
            <span className="eyebrow text-primary">A CLEAR PATH FORWARD</span>
            <h2>Three steps. A world of possibility.</h2>
            <p className="section-subtitle">
              From overlooked experience to recognised potential.
              <br />
              We help you put your talent on the map.
            </p>
          </div>
          <Button variant="link" asChild className="px-0">
            <Link to="/explore">
              See how it works
              <ArrowRight />
            </Link>
          </Button>
        </div>
        <div className="step-grid">
          <article className="step-card">
            <div className="step-icon">
              <UserRoundPlus />
            </div>
            <span className="step-number">01</span>
            <h3>Register your talent</h3>
            <p>
              Tell your story. Build a professional profile with your skills, qualifications and
              experience.
            </p>
            <Link to="/register">
              Create your profile
              <ArrowRight size={14} />
            </Link>
          </article>
          <article className="step-card">
            <div className="step-icon">
              <ClipboardCheck />
            </div>
            <span className="step-number">02</span>
            <h3>Validate your skills</h3>
            <p>
              Submit your credentials for review and demonstrate your knowledge through skills
              assessments.
            </p>
            <Link to="/assessment">
              Explore assessments
              <ArrowRight size={14} />
            </Link>
          </article>
          <article className="step-card">
            <div className="step-icon">
              <BookUser />
            </div>
            <span className="step-number">03</span>
            <h3>Receive your passport</h3>
            <p>
              Bring your assessed skills and reviewed credentials together in a shareable digital
              talent passport.
            </p>
            <Link to="/passport">
              Discover your passport
              <ArrowRight size={14} />
            </Link>
          </article>
        </div>
      </section>
      <section className="mission-band section">
        <div className="page-width mission-grid">
          <div>
            <span className="eyebrow text-primary">
              <Globe2 size={14} /> BUILT FOR A MORE INCLUSIVE FUTURE
            </span>
            <h2 className="text-3xl font-extrabold mt-4">Displaced doesn’t mean unqualified.</h2>
            <p className="section-subtitle">
              Too many skilled refugees face barriers to using the qualifications they’ve worked
              hard to earn. Talent Passport makes experience visible, helping turn overlooked talent
              into opportunity.
            </p>
            <Button variant="link" asChild className="px-0 mt-4">
              <Link to="/impact">
                See the impact we’re building
                <ArrowRight />
              </Link>
            </Button>
          </div>
          <div>
            <div className="sdg-grid">
              <div className="sdg-tile">
                <span className="sdg-number">4</span>
                <div>
                  <GraduationCap size={23} className="text-primary mb-2" />
                  <p className="text-[11px] font-bold">
                    QUALITY
                    <br />
                    EDUCATION
                  </p>
                </div>
              </div>
              <div className="sdg-tile">
                <span className="sdg-number">8</span>
                <div>
                  <BadgeCheck size={23} className="text-primary mb-2" />
                  <p className="text-[11px] font-bold">
                    DECENT WORK &<br />
                    ECONOMIC GROWTH
                  </p>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2 mt-5">
              <Check size={14} />
              Aligned with the UN Sustainable Development Goals
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
