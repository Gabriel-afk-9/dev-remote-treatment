import { Footer } from "@/src/shared/presentation/components/Footer";
import { Header } from "@/src/shared/presentation/components/Header";
import { TratamentoLoginCard } from "@/src/features/appointments/presentation/components/TratamentoLoginCard";

export default function TratamentoPage() {
  return (
    <main className="flex flex-col justify-between bg-background min-h-screen text-foreground">
      <Header />
      <TratamentoLoginCard />
      <Footer />
    </main>
  );
}