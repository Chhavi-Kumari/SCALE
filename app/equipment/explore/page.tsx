import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { SectionContainer } from "@/components/SectionContainer";
import {
  roboticsEquipment,
  electronicsEquipment,
  kitsEquipment
} from "@/components/equipmentShowcaseData";

export default function EquipmentExplorePage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Equipment Explore"
        title="Explore the STEM equipment catalog"
        description="Browse the inventory used to support classrooms, clubs, and partner programs."
        primaryCta={{ label: "Request Access", href: "/login" }}
        secondaryCta={{ label: "Back to Equipment", href: "/equipment" }}
      />

      <SectionContainer
        id="robotics"
        eyebrow="Robotics"
        heading="Robotics equipment showcase"
        description="Compact robotics tools for classroom engineering and prototyping."
      >
        <EquipmentCarousel items={roboticsEquipment} />
      </SectionContainer>

      <SectionContainer
        id="electronics"
        eyebrow="Electronics"
        heading="Devices and digital fabrication tools"
        description="Access laptops, tablets, and 3D printers that support coding, design, modeling, and hands-on prototyping."
      >
        <EquipmentCarousel items={electronicsEquipment} />
      </SectionContainer>

      <SectionContainer
        id="kits"
        eyebrow="Kits"
        heading="Measurement kits for lab precision"
        description="Reliable measurement tools for repeatable classroom lab work."
      >
        <EquipmentCarousel items={kitsEquipment} />
      </SectionContainer>

      <Footer />
    </main>
  );
}
