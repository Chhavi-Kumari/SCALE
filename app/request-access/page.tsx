import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { RequestAccessForm } from "@/components/RequestAccessForm";

export default function RequestAccessPage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Request Access"
        title="Request SCALE credentials"
        description="Submit your details and we&apos;ll review the request."
      />

      <RequestAccessForm />

      <Footer />
    </main>
  );
}
