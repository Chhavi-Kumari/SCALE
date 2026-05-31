import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { EquipmentCarousel } from "@/components/EquipmentCarousel";
import { SectionContainer } from "@/components/SectionContainer";
import {
  measurementKitsEquipment,
  roboticsEquipment,
  sensorKitsEquipment
} from "@/components/equipmentShowcaseData";

export default function EquipmentExplorePage() {
  return (
    <main className="min-h-screen bg-white text-ink">
      <PageHero
        eyebrow="Equipment Explore"
        title="Explore the STEM equipment catalog"
        description="Browse the inventory used to support classrooms, clubs, and partner programs. This page keeps the same USC Viterbi visual language while focusing on equipment discovery and lending support."
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
        id="sensor-kits"
        eyebrow="Sensor Kits"
        heading="Sensor kits for data collection"
        description="Portable sensing tools for hands-on investigations and data capture."
      >
        <EquipmentCarousel items={sensorKitsEquipment} />
      </SectionContainer>

      <SectionContainer
        id="measurement-kits"
        eyebrow="Measurement Kits"
        heading="Measurement kits for lab precision"
        description="Reliable measurement tools for repeatable classroom lab work."
      >
        <EquipmentCarousel items={measurementKitsEquipment} />
      </SectionContainer>

      <Footer />
    </main>
  );
}
