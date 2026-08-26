"use server";

import { createClient } from "@/libs/supabase/server";
import { revalidatePath } from "next/cache";

export async function salvarTemplatesRotina(formData: FormData) {
  const supabase = await createClient();

  const tercaAssunto = formData.get("tercaAssunto") as string;
  const tercaCorpo = formData.get("tercaCorpo") as string;
  const quartaAssunto = formData.get("quartaAssunto") as string;
  const quartaCorpo = formData.get("quartaCorpo") as string;

  // O upsert é a forma correta e mais performática de "criar ou atualizar"
  // Ele usa a Primary Key (id) para decidir o que fazer.
  const { error: errorTemplates } = await supabase
    .from("template_emails")
    .upsert([
      { id: 1, assunto: tercaAssunto, corpo: tercaCorpo, tipo: 'PROGRAMADO' },
      { id: 2, assunto: quartaAssunto, corpo: quartaCorpo, tipo: 'PROGRAMADO' }
    ]);

  if (errorTemplates) {
    console.error("Erro ao salvar templates:", errorTemplates);
    throw new Error("Não foi possível salvar os templates no banco de dados.");
  }

  const { error: errorAgendamentos } = await supabase
    .from("agendamentos")
    .update({ enviou_email_terca: false, enviou_email_quarta: false })
    .eq("status", "AGENDADO");

  if (errorAgendamentos) throw errorAgendamentos;

  revalidatePath("/admin/painel");
}