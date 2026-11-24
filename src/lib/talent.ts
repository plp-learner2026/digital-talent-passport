import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Credential = Database["public"]["Tables"]["credentials"]["Row"];
export type Assessment = Database["public"]["Tables"]["assessments"]["Row"];
export const categories = [
  "Software development",
  "Teaching",
  "Nursing",
  "Electrical work",
  "Plumbing",
  "Tailoring",
  "Hospitality",
  "Other professional skills",
] as const;
export const profileSchema = z.object({
  full_name: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  category: z.enum(categories),
  education: z.string().trim().min(2).max(200),
  experience: z.coerce.number().int().min(0).max(70),
  biography: z.string().trim().max(2000),
  portfolio: z.union([
    z.literal(""),
    z
      .url()
      .max(500)
      .refine(
        (v) => v.startsWith("https://") || v.startsWith("http://"),
        "Use an HTTP or HTTPS URL",
      ),
  ]),
});
export const answersKey = [1, 0, 2, 1, 0];
export function assessmentResult(answers: number[]) {
  const score = answers.reduce((sum, a, i) => sum + (a === answersKey[i] ? 1 : 0), 0);
  return { score, passed: score >= 4 };
}
export function canPublish(consent: boolean, assessments: Pick<Assessment, "passed">[]) {
  return consent && assessments.some((a) => a.passed);
}
export type Question = { question: string; options: string[] };
const q = (question: string, ...options: string[]): Question => ({ question, options });
export const questionBanks: Record<string, Question[]> = {
  "Software development": [
    q(
      "What is the primary purpose of version control?",
      "Design web layouts",
      "Track and manage code changes",
      "Host a database",
    ),
    q("Which HTTP status indicates a successful request?", "200", "404", "500"),
    q(
      "How should passwords be stored?",
      "Plain text",
      "Reversible encoding",
      "Salted one-way hashes",
    ),
    q(
      "What does a unit test check?",
      "The entire company network",
      "An isolated piece of code",
      "Only the visual design",
    ),
    q(
      "Which technique prevents SQL injection?",
      "Parameterized queries",
      "Longer passwords",
      "Minified scripts",
    ),
  ],
  Teaching: [
    q(
      "What best supports inclusive learning?",
      "Use one pace for everyone",
      "Adapt lessons to different needs",
      "Exclude struggling learners",
    ),
    q(
      "What is formative assessment for?",
      "Guide learning during instruction",
      "Rank schools",
      "Replace teaching",
    ),
    q(
      "A learner struggles with a concept. What is best?",
      "Punish the learner",
      "Ignore the difficulty",
      "Explain using another approach",
    ),
    q(
      "What promotes active learning?",
      "Only silent copying",
      "Discussion and guided practice",
      "Avoiding questions",
    ),
    q(
      "What should lesson objectives describe?",
      "Observable learning outcomes",
      "Teacher preferences",
      "Classroom furniture",
    ),
  ],
  Nursing: [
    q(
      "What should happen before patient contact?",
      "Prepare billing",
      "Perform hand hygiene",
      "Skip introductions",
    ),
    q(
      "How should patient records be handled?",
      "Keep them confidential",
      "Share them publicly",
      "Leave them unattended",
    ),
    q(
      "A medication order is unclear. What should you do?",
      "Guess the dose",
      "Give any available medicine",
      "Clarify with the prescriber",
    ),
    q(
      "Which is an important patient identification check?",
      "Bed number only",
      "Two approved identifiers",
      "Room colour",
    ),
    q(
      "What is the first response to an unsafe practice?",
      "Protect the patient and report appropriately",
      "Ignore it",
      "Post the details online",
    ),
  ],
  "Electrical work": [
    q(
      "Before working on a circuit, what must you do?",
      "Increase the voltage",
      "Isolate and verify no voltage",
      "Touch the wires",
    ),
    q(
      "What protects against overcurrent?",
      "A correctly rated circuit breaker",
      "Paint",
      "An extension cable",
    ),
    q(
      "What is protective earthing for?",
      "Improve decoration",
      "Increase power use",
      "Provide a safe fault-current path",
    ),
    q("What tool measures voltage?", "A hammer", "A suitable voltmeter", "A ruler"),
    q(
      "A cable has damaged insulation. What should you do?",
      "Isolate and replace it safely",
      "Keep using it",
      "Cover it with paper",
    ),
  ],
  Plumbing: [
    q(
      "Before repairing a supply pipe, what should you do?",
      "Open all fixtures",
      "Isolate the water supply",
      "Increase pressure",
    ),
    q(
      "What does a trap prevent?",
      "Sewer gases entering a building",
      "Water heating",
      "Pipe corrosion",
    ),
    q(
      "How do you check a repaired joint?",
      "Paint over it",
      "Ignore it",
      "Pressure and leak testing",
    ),
    q(
      "Which helps prevent backflow?",
      "A larger sink",
      "An appropriate backflow device",
      "An extra tap",
    ),
    q(
      "What is important for drainage pipes?",
      "Correct slope and support",
      "Random slopes",
      "No ventilation",
    ),
  ],
  Tailoring: [
    q(
      "What comes before cutting garment fabric?",
      "Remove all markings",
      "Confirm measurements and pattern",
      "Sew buttons",
    ),
    q(
      "What is seam allowance?",
      "Extra fabric beyond the stitch line",
      "Finished garment length",
      "Thread weight",
    ),
    q(
      "Why check grain direction?",
      "Only to choose colour",
      "To reduce light",
      "To support correct drape and stability",
    ),
    q(
      "What is a fitting used for?",
      "Choosing a shop name",
      "Checking and adjusting garment fit",
      "Replacing measurements",
    ),
    q(
      "What should happen before using a new sewing machine?",
      "Check setup and safe operation",
      "Remove the guards",
      "Run at full speed",
    ),
  ],
  Hospitality: [
    q(
      "A guest raises a complaint. What is best?",
      "Dismiss it",
      "Listen and resolve respectfully",
      "Blame the guest",
    ),
    q(
      "How is food contamination reduced?",
      "Separate raw and cooked foods",
      "Use the same tools unwashed",
      "Leave food uncovered",
    ),
    q(
      "A guest has a food allergy. What should you do?",
      "Guess ingredients",
      "Ignore the request",
      "Confirm ingredients and prevent cross-contact",
    ),
    q(
      "What supports good service?",
      "Avoiding communication",
      "Clear and respectful communication",
      "Sharing private guest details",
    ),
    q(
      "What should be checked when receiving perishable food?",
      "Temperature and condition",
      "Only the packaging colour",
      "Only delivery speed",
    ),
  ],
  "Other professional skills": [
    q(
      "What demonstrates professional competence?",
      "An unsupported claim",
      "Relevant work evidence",
      "A social follower count",
    ),
    q(
      "What is an appropriate response to a safety hazard?",
      "Report and control it",
      "Ignore it",
      "Hide it",
    ),
    q(
      "How should confidential client information be managed?",
      "Share it freely",
      "Post it online",
      "Restrict access to authorised people",
    ),
    q(
      "What supports effective teamwork?",
      "Avoid feedback",
      "Clear communication and shared goals",
      "Ignore responsibilities",
    ),
    q(
      "What should you do when a task exceeds your expertise?",
      "Seek qualified guidance",
      "Guess without checking",
      "Hide the limitation",
    ),
  ],
};
export function pageHead(title: string, description: string) {
  return {
    meta: [
      { title: `${title} | Talent Passport` },
      { name: "description", content: description },
      { property: "og:title", content: `${title} | Talent Passport` },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  };
}
