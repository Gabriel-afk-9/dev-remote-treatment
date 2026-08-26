import { Header } from "@/components/Header";
import { HeroSection } from "@/components/HeroSection";
import { RegistrationSection } from "@/components/RegistrationSection";
import { FaqSection } from "@/components/FaqSection";
import { Footer } from "@/components/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

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