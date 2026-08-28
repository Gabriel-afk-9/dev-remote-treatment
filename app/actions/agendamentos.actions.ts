"use server";

import { createClient } from "@/libs/supabase/server";
import { revalidatePath } from "next/cache";
import { Agendamento } from "@/types/database";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cookies } from "next/headers";

// 1. Buscar a lista de agendamentos
export async function buscarAgendamentos(): Promise<Agendamento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agendamentos")
    .select(`
      *,
      pacientes (
        nome_completo,
        data_nascimento,
        pais,
        estado,
        cidade,
        endereco
      )
    `)
    .order("data_cadastro", { ascending: false });

  if (error) {
    console.error("Erro ao buscar agendamentos:", error);
    return [];
  }

  // O "as unknown as Agendamento[]" força o TypeScript a entender o formato
  return data.map((item: any) => ({
    ...item
  })) as unknown as Agendamento[];
}

// 2. Atualizar um agendamento existente
export async function atualizarAgendamento(protocolo: string, dados: Partial<Agendamento>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("agendamentos")
    .update(dados)
    .eq("protocolo", protocolo);

  if (error) {
    throw new Error("Erro ao atualizar agendamento.");
  }

  // Limpa o cache da página do painel para refletir a mudança instantaneamente
  revalidatePath("/admin/painel");
}

// 3. Excluir um agendamento
export async function excluirAgendamento(protocolo: string, pacienteId: string) {
  const supabase = await createClient();

  const { error: errorApagarAgendamento } = await supabase
    .from("agendamentos")
    .delete()
    .eq("protocolo", protocolo);

  if (errorApagarAgendamento) {
    throw new Error("Erro ao excluir agendamento.");
  }

  const { error: errorApagarPaciente } = await supabase
    .from("pacientes")
    .delete()
    .eq("id", pacienteId);

  if (errorApagarPaciente) {
    throw new Error("Erro ao excluir paciente.");
  }

  revalidatePath("/admin/painel");
}

export async function validarAcessoPaciente(prevState: any, formData: FormData) {
  const protocolo = formData.get("protocolo") as string;
  const dataNascimento = formData.get("dataNascimento") as string;

  if (!protocolo || !dataNascimento) {
    return { erro: "Por favor, preencha todos os campos." };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agendamentos")
    .select(`
      protocolo,
      pacientes!inner (
        data_nascimento
      )
    `)
    .eq("protocolo", protocolo)
    .eq("pacientes.data_nascimento", dataNascimento)
    .single();

  if (error || !data) {
    return { erro: "Protocolo ou data de nascimento inválidos." };
  }

  // <-- 2. CRIAR A SESSÃO ANTES DE REDIRECIONAR -->
  const cookieStore = await cookies();
  cookieStore.set("paciente_session", protocolo, {
    httpOnly: true, // Impede que extensões do navegador leiam o cookie (Segurança)
    secure: process.env.NODE_ENV === "production", // Usa HTTPS em produção
    maxAge: 60 * 60 * 2, // Expira em 2 horas (tempo suficiente para ele ver a tela)
    path: "/",
  });

  // Redireciona para a página do protocolo (ajustei o caminho para bater com a sua rota atual)
  redirect(`/tratamento/${protocolo}`);
}

export async function buscarAgendamentoPorProtocolo(protocolo: string): Promise<Agendamento | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("agendamentos")
    .select(`
      *,
      pacientes (
        nome_completo,
        data_nascimento,
        pais,
        estado,
        cidade,
        endereco
      )
    `)
    .eq("protocolo", protocolo)
    .single();

  if (error || !data) {
    return null; // Retorna nulo se não encontrar
  }

  // Já fazemos toda a formatação pesada no backend
  return data;
}