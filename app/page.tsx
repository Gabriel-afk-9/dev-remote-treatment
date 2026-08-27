import { Header } from "@/src/shared/presentation/components/Header";
import { HeroSection } from "@/src/features/appointments/presentation/components/HeroSection";
import { RegistrationSection } from "@/src/features/appointments/presentation/components/RegistrationSection";
import { FaqSection } from "@/src/features/appointments/presentation/components/FaqSection";
import { Footer } from "@/src/shared/presentation/components/Footer";
import ScrollToTopButton from "@/src/shared/presentation/components/ScrollToTopButton";

export default function Home() {
  return (
    <main className="bg-background min-h-screen text-foreground">
      <Header />
      <HeroSection />
      <RegistrationSection />
      <FaqSection />
      <Footer />

      <ScrollToTopButton />
    </main>
  );
}