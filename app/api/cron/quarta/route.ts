import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarEmail } from "@/libs/services/email.service";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Busca o Template 2 (Quarta-feira)
    const { data: template } = await supabase.from("template_emails").select("*").eq("id", 2).single();
    if (!template) throw new Error("Template de Quarta-feira não encontrado.");

    // Busca agendamentos ativos que ainda não receberam o email de quarta
    const { data: pacientes } = await supabase
      .from("agendamentos")
      .select("protocolo, email_notificacao")
      .eq("status", "AGENDADO")
      .eq("enviou_email_quarta", false);

    if (!pacientes || pacientes.length === 0) {
      return NextResponse.json({ message: "Nenhum paciente pendente para Quarta-feira." });
    }

    const promessas = pacientes.map(async (paciente) => {
      const emailStatus = await enviarEmail({
        para: paciente.email_notificacao,
        assunto: template.assunto,
        corpoHtml: template.corpo,
      });

      if (emailStatus.sucesso) {
        await supabase
          .from("agendamentos")
          .update({ enviou_email_quarta: true })
          .eq("protocolo", paciente.protocolo);
      }
    });

    await Promise.all(promessas);

    return NextResponse.json({ message: `Rotina de Quarta-feira executada para ${pacientes.length} pacientes.` });
  } catch (error) {
    console.error("[CRON Quarta]", error);
    return NextResponse.json({ error: "Erro interno no Cron de Quarta." }, { status: 500 });
  }
}