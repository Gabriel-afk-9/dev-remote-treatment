import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { enviarEmail } from "@/libs/services/email.service";
import { differenceInDays, startOfDay } from "date-fns";

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
    // Busca apenas pacientes com cirurgia agendada
    const { data: pacientes } = await supabase
      .from("agendamentos")
      .select("protocolo, email_notificacao, data_cirurgia")
      .eq("status", "AGENDADO")
      .eq("tipo", "TRATAMENTO_COM_CIRURGIA")
      .not("data_cirurgia", "is", null);

    if (!pacientes) return NextResponse.json({ message: "Sem pacientes cirúrgicos ativos." });

    const hoje = startOfDay(new Date());
    let alertasEnviados = 0;

    const promessas = pacientes.map(async (paciente) => {
      const dataCirurgia = startOfDay(new Date(paciente.data_cirurgia));
      const diasRestantes = differenceInDays(dataCirurgia, hoje);

      // Dispara o alerta somente nos marcos exatos
      if ([15, 7, 3, 0].includes(diasRestantes)) {
        
        // Personaliza a mensagem baseado na distância
        let assunto = `Atualização do seu Tratamento: Falta(m) ${diasRestantes} dia(s)`;
        if (diasRestantes === 0) assunto = "É Hoje! Orientações finais para sua Cirurgia Espiritual";

        const corpoHtml = `<p>Olá!</p>
                           <p>Lembramos que sua cirurgia espiritual está programada para ocorrer em <strong>${diasRestantes === 0 ? "HOJE" : diasRestantes + " dias"}</strong>.</p>
                           <p>Protocolo de acompanhamento: <strong>${paciente.protocolo}</strong></p>
                           <p>Siga todas as orientações recomendadas.</p>`;

        const emailStatus = await enviarEmail({
          para: paciente.email_notificacao,
          assunto: assunto,
          corpoHtml: corpoHtml,
        });

        if (emailStatus.sucesso) alertasEnviados++;
      }
    });

    await Promise.all(promessas);

    return NextResponse.json({ message: `Rotina diária finalizada. ${alertasEnviados} alertas de cirurgia enviados.` });
  } catch (error) {
    console.error("[CRON Alertas]", error);
    return NextResponse.json({ error: "Erro interno no Cron de Alertas." }, { status: 500 });
  }
}