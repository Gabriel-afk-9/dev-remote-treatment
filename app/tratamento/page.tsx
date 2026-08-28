import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { TratamentoLoginCard } from "@/components/TratamentoLoginCard";

export default function TratamentoPage() {
  return (
    <main className="flex flex-col justify-between bg-background min-h-screen text-foreground">
      <Header />
      <TratamentoLoginCard />
      <Footer />
    </main>
  );
}