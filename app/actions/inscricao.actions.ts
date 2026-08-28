"use server";

import { validarAntecedencia15Dias } from "@/libs/services/date.service";
import { enviarEmail } from "@/libs/services/email.service";
import { createClient } from "@/libs/supabase/server";
import { OpcaoWhatsApp } from "@/types/database";
import { formatDate } from "date-fns";
import { format } from "path";

export interface FormInscricao {
  nomeCompleto: string;
  dataNascimento: string;
  pais: string;
  estado: string;
  cidade: string;
  endereco: string;
  emailNotificacao: string;
  celular: string;
  tipoWhatsApp: OpcaoWhatsApp;
  whatsappAuxiliar?: string;
  nomeSolicitante: string;
  tipo: "TRATAMENTO_COM_CIRURGIA" | "TRATAMENTO_SEM_CIRURGIA";
}

export async function salvarAgendamento(dados: FormInscricao) {
  try {
    const supabase = await createClient();

    // 1. Salva o paciente e retorna o ID gerado pelo banco
    const { data: paciente, error: erroPaciente } = await supabase
      .from("pacientes")
      .insert({
        nome_completo: dados.nomeCompleto,
        data_nascimento: dados.dataNascimento,
        pais: dados.pais,
        estado: dados.estado,
        cidade: dados.cidade,
        endereco: dados.endereco,
      })
      .select("id")
      .single();

    if (erroPaciente || !paciente) {
      throw new Error("Não foi possível salvar os dados do paciente.");
    }

    // 2. Gerar Protocolo único e Data de Cadastro
    // Exemplo simples: Prefixo + timestamp + 4 números aleatórios
    const dataCadastro = new Date();
    const protocolo = `AGD-${dataCadastro.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Regra de Negócio: Calcular data da cirurgia se aplicável
    let dataCirurgia = null;
    if (dados.tipo === "TRATAMENTO_COM_CIRURGIA") {
      dataCirurgia = validarAntecedencia15Dias(dataCadastro);
    }

    // Verifica intercessão (se o solicitante não for o próprio paciente)
    const ehIntercessorio = dados.nomeSolicitante.trim() !== "" &&
      dados.nomeSolicitante.trim().toLowerCase() !== dados.nomeCompleto.trim().toLowerCase();

    // 4. Criar o Agendamento
    const { error: erroAgendamento } = await supabase
      .from("agendamentos")
      .insert({
        protocolo,
        paciente_id: paciente.id,
        tipo: dados.tipo,
        data_cadastro: dataCadastro.toISOString(),
        status: 'AGENDADO',
        email_notificacao: dados.emailNotificacao,
        celular: dados.celular,
        tipo_whatsapp: dados.tipoWhatsApp,
        whatsapp_auxiliar: dados.tipoWhatsApp === "OUTRO_NUMERO" ? dados.whatsappAuxiliar : null,
        eh_intercessorio: ehIntercessorio,
        nome_solicitante: dados.nomeSolicitante || "Próprio",
        data_cirurgia: dataCirurgia ? dataCirurgia.toISOString().split('T')[0] : null,
      });

    if (erroAgendamento) {
      // Idealmente, se falhar o agendamento, apagar o paciente criado para evitar órfãos,
      // mas mantendo a simplicidade requerida:
      throw new Error("Não foi possível finalizar o agendamento.");
    }

    const emailStatus = await enviarEmail({
      para: dados.emailNotificacao,
      assunto: "LUZ DA ESPERANÇA | Agendamento Confirmado: Protocolo " + protocolo,
      corpoHtml: `<p>Olá,</p>
                 <p>Seu agendamento foi confirmado com sucesso.</p>
                 <p>Protocolo: <strong>${protocolo}</strong></p>
                 <p>Data do Cadastro: ${formatDate(dataCadastro, "dd/MM/yyyy")}</p>
                 <p>Tipo de Tratamento: ${dados.tipo === "TRATAMENTO_COM_CIRURGIA" ? "Com Cirurgia" : "Sem Cirurgia"}</p>
                  ${dataCirurgia ? `<p>Data Prevista para Cirurgia: <strong>${formatDate(dataCirurgia, "dd/MM/yyyy")}</strong></p>` : ""}
                 <br />
                 <p>Para acompanhar seu agendamento, acesse nosso portal e utilize o protocolo fornecido e sua data de nascimento.</p>
                 <p>Protocolo de acompanhamento: <strong>${protocolo}</strong></p>
                 <p>Data de Nascimento: <strong>${formatDate(new Date(`${dados.dataNascimento}T12:00:00`), "dd/MM/yyyy")}</strong></p>
                 <br />
                 <p>Atenciosamente,</p>
                 <p>Equipe Luz da Esperança</p>`,
    });

    return { sucesso: true, protocolo: protocolo };
  } catch (error: any) {
    console.error("Erro no cadastro:", error);
    return { sucesso: false, erro: error.message };
  }
}