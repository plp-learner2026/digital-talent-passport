import { useEffect, useState } from "react";
import { ShieldCheck, Download, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { Status } from "@/components/site";
import { toast } from "sonner";
export type PassportData = {
  full_name: string;
  passport_id: string;
  category: string;
  education: string;
  experience: number;
  credentials: { kind: string; status: string }[];
  assessments: { category: string; score: number; passed: boolean; created_at: string }[];
};
export function PassportCard({
  data,
  demo = false,
  download = false,
}: {
  data: PassportData;
  demo?: boolean;
  download?: boolean;
}) {
  const [qr, setQr] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!demo)
      QRCode.toDataURL(
        `${window.location.origin}/verify?id=${encodeURIComponent(data.passport_id)}`,
        { width: 150, margin: 1 },
      )
        .then(setQr)
        .catch(() => toast.error("Unable to generate QR code"));
  }, [data.passport_id, demo]);
  const passed = data.assessments.filter((a) => a.passed);
  async function pdf() {
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(24);
      doc.text("TALENT PASSPORT", 20, 25);
      doc.setFontSize(11);
      doc.text("Unlocking Displaced Talent | Kenya", 20, 35);
      doc.setFontSize(20);
      doc.text(data.full_name, 20, 55);
      doc.setFontSize(11);
      doc.text(
        [
          `Passport ID: ${data.passport_id}`,
          `Professional category: ${data.category}`,
          `Education: ${data.education}`,
          `Experience: ${data.experience} years`,
        ],
        20,
        68,
      );
      let y = 100;
      doc.text("ASSESSED SKILLS", 20, y);
      passed.forEach((a) => {
        y += 10;
        doc.text(
          `${a.category}: ${a.score}/5 | ${new Date(a.created_at).toLocaleDateString()}`,
          20,
          y,
        );
      });
      y += 20;
      doc.text("REVIEWED CREDENTIALS", 20, y);
      if (!data.credentials.length) {
        y += 10;
        doc.text("No credentials reviewed", 20, y);
      }
      data.credentials.forEach((c) => {
        y += 10;
        doc.text(`${c.kind}: ${c.status}`, 20, y);
      });
      if (qr) doc.addImage(qr, "PNG", 150, 45, 40, 40);
      y += 25;
      doc.setFontSize(9);
      doc.text(
        doc.splitTextToSize(
          "Prototype record. Skills assessment is not academic credential verification, government recognition, professional licensing, or permission to practise. Public verification is available only with candidate consent.",
          170,
        ),
        20,
        y,
      );
      doc.save(`${data.passport_id}.pdf`);
      toast.success("Passport downloaded");
    } catch {
      toast.error("Could not download passport");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <article className="passport">
        <header className="passport-head">
          <div>
            <div className="flex gap-2 items-center font-bold text-lg">
              <ShieldCheck />
              Talent Passport
            </div>
            <p className="text-xs mt-2 opacity-75">DIGITAL PROFESSIONAL RECORD</p>
          </div>
          <span className="text-xs">{demo ? "DEMONSTRATION" : "KENYA · TRACK 1"}</span>
        </header>
        <div className="passport-body">
          <div className="flex justify-between gap-5">
            <div>
              <h2 className="passport-name">{data.full_name}</h2>
              <p className="text-muted-foreground text-sm">{data.category}</p>
              <p className="font-mono text-xs mt-4">{data.passport_id}</p>
            </div>
            {qr ? (
              <img src={qr} alt="Scan to verify this passport" className="w-24 h-24" />
            ) : (
              <QrCode className="size-16 text-muted-foreground" />
            )}
          </div>
          <div className="passport-details">
            <div>
              <small>Education</small>
              <strong className="text-sm">{data.education || "Not provided"}</strong>
            </div>
            <div>
              <small>Professional experience</small>
              <strong className="text-sm">{data.experience} years</strong>
            </div>
          </div>
          <h3 className="font-bold text-sm mb-3">Assessed skills</h3>
          {passed.map((a, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border py-3 gap-3"
            >
              <div className="text-sm">
                {a.category}
                <p className="text-xs text-muted-foreground mt-1">
                  {a.score}/5 · {new Date(a.created_at).toLocaleDateString()}
                </p>
              </div>
              <Status status="Skills assessed" />
            </div>
          ))}
          <h3 className="font-bold text-sm mt-7 mb-3">Credential review</h3>
          {data.credentials.length ? (
            data.credentials.map((c, i) => (
              <div key={i} className="flex justify-between py-2 items-center gap-3">
                <span className="text-sm">{c.kind}</span>
                <Status status={c.status} />
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No credentials submitted for review.</p>
          )}
          <p className="text-xs text-muted-foreground leading-relaxed mt-7 border-t border-border pt-5">
            Skills assessment is separate from academic credential review. This prototype does not
            constitute official recognition or professional licensing.
          </p>
        </div>
      </article>
      {download && (
        <div className="flex justify-center mt-6">
          <Button disabled={busy || demo} onClick={pdf}>
            <Download />
            {busy ? "Preparing PDF…" : "Download PDF"}
          </Button>
        </div>
      )}
    </>
  );
}
