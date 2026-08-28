import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarEmail } from "@/libs/services/email.service";

export async function GET(request: Request) {
  // 1. Proteção: Garante que apenas o Vercel possa chamar essa rota
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // 2. Cliente com privilégios de Admin (Bypassa RLS)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Busca o Template 1 (Terça-feira)
    const { data: template } = await supabase.from("template_emails").select("*").eq("id", 1).single();
    if (!template) throw new Error("Template de Terça-feira não encontrado.");

    // Busca agendamentos ativos que ainda não receberam o email de terça
    const { data: pacientes } = await supabase
      .from("agendamentos")
      .select("protocolo, email_notificacao")
      .eq("status", "AGENDADO")
      .eq("enviou_email_terca", false);

    if (!pacientes || pacientes.length === 0) {
      return NextResponse.json({ message: "Nenhum paciente pendente para Terça-feira." });
    }

    // Dispara emails em paralelo e atualiza a flag
    const promessas = pacientes.map(async (paciente) => {
      const emailStatus = await enviarEmail({
        para: paciente.email_notificacao,
        assunto: template.assunto,
        corpoHtml: template.corpo,
      });

      if (emailStatus.sucesso) {
        await supabase
          .from("agendamentos")
          .update({ enviou_email_terca: true })
          .eq("protocolo", paciente.protocolo);
      }
    });

    await Promise.all(promessas);

    return NextResponse.json({ message: `Rotina de Terça-feira executada para ${pacientes.length} pacientes.` });
  } catch (error) {
    console.error("[CRON Terça]", error);
    return NextResponse.json({ error: "Erro interno no Cron de Terça." }, { status: 500 });
  }
}