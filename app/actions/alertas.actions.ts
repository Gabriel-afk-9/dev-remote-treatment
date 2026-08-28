"use server";

import { createClient } from "@/libs/supabase/server";
import { enviarEmail } from "@/libs/services/email.service";

export async function enviarAlertaGeral(protocolos: string[], assunto: string, mensagem: string) {
  const supabase = await createClient();
  
  // 1. Buscar os e-mails dos pacientes com base nos protocolos selecionados
  const { data, error } = await supabase
    .from("agendamentos")
    .select("email_notificacao")
    .in("protocolo", protocolos);
    
  if (error) {
    throw new Error("Erro ao buscar contatos dos pacientes.");
  }

  const emails = data.map(a => a.email_notificacao);

  // 2. Disparar e-mail se houver destinatários
  if (emails.length > 0) {
    await enviarEmail({
      para: emails,
      assunto: assunto,
      corpoHtml: mensagem
    });
  }
  
  // 3. Salvar o registro histórico do disparo como TipoEmail 'PONTUAL'
  await supabase.from("template_emails").insert({
    assunto: assunto,
    corpo: mensagem,
    tipo: 'PONTUAL'
  });
}