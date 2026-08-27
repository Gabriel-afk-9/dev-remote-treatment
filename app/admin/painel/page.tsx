// app/admin/painel/page.tsx
import { HeaderAdmin } from "@/src/features/appointments/presentation/components/admin/HeaderAdmin";
import { Footer } from "@/src/shared/presentation/components/Footer";
import { buscarAgendamentos } from "@/src/features/appointments/presentation/actions/agendamentos.actions";
import { DashboardTabs } from "@/src/features/appointments/presentation/components/admin/DashboardTabs"; // Vamos criar este abaixo

export default async function AdminDashboardPage() {
  // A busca assíncrona acontece aqui (Server Side)
  const agendamentos = await buscarAgendamentos();
  
  return (
    <div className="flex flex-col bg-background min-h-screen text-foreground">
      <HeaderAdmin />
      <main className="mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full max-w-7xl grow">
        <div className="mb-8">
          <h2 className="font-bold text-foreground text-3xl">Painel de Controle</h2>
          <p className="mt-2 font-extralight text-neutral">Gerencie tratamentos, comunicações e alertas do sistema.</p>
        </div>
        
        {/* Passamos os dados via props para o componente cliente */}
        <DashboardTabs agendamentos={agendamentos} />
      </main>
      <Footer />
    </div>
  );
}