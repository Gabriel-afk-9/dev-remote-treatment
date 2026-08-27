import { Header } from "@/src/shared/presentation/components/Header";
import { Footer } from "@/src/shared/presentation/components/Footer";
import { ProtocolInfoCard } from "@/src/features/appointments/presentation/components/ProtocolInfoCard";
import { TreatmentInstructions } from "@/src/features/appointments/presentation/components/TreatmentInstructions";
import { notFound, redirect } from "next/navigation";
import { buscarAgendamentoPorProtocolo } from "@/src/features/appointments/presentation/actions/agendamentos.actions";
import { cookies } from "next/headers";

type PageProps = {
  params: Promise<{ protocolo: string }>;
};

export default async function ProtocolPage({ params }: PageProps) {
  const { protocolo } = await params;

  // <-- BLOQUEIO DE SEGURANÇA INICIAL -->
  const cookieStore = await cookies();
  const session = cookieStore.get("paciente_session")?.value;

  // Se não houver sessão ativa OU se ele tentar acessar um protocolo diferente do que ele logou:
  if (!session || session !== protocolo) {
    // Redireciona de volta para a página principal (onde fica o seu formulário de login)
    redirect("/tratamento"); 
  }
  
  // 1. Chama a função isolada para buscar os dados
  const agendamento = await buscarAgendamentoPorProtocolo(protocolo);

  // 2. Se a função retornar null (protocolo não existe), mostra tela 404
  if (!agendamento) {
    notFound(); 
  }

  // 3. Renderiza a interface limpa
  return (
    <main className="flex flex-col bg-background min-h-screen text-foreground">
      <Header />
      
      <div className="flex flex-col flex-1 items-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 w-full max-w-5xl">
          
          <ProtocolInfoCard agendamento={agendamento} />
          
          <div className="text-neutral/40 text-sm italic uppercase tracking-[0.2em] divider">Instruções e Procedimentos</div>
          
          <TreatmentInstructions />
          
        </div>
      </div>

      <Footer />
    </main>
  );
}