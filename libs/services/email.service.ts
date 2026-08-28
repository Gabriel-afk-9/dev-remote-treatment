import { Resend } from 'resend';

// Inicializa o SDK do Resend com a chave do .env
const resend = new Resend(process.env.RESEND_API_KEY);

// O e-mail de remetente precisa ser um domínio verificado no Resend.
// Para testes, o Resend permite usar "onboarding@resend.dev" enviando apenas para o seu próprio e-mail.
const EMAIL_REMETENTE = "Luz da Esperança <onboarding@resend.dev>"; 


interface EnviarEmailParams {
  para: string | string[];
  assunto: string;
  corpoHtml: string;
}

/**
 * Função base disparadora de e-mails. 
 * Será consumida pelas rotinas de Terça, Quarta e pelos Alertas de Cirurgia.
 */
export async function enviarEmail({ para, assunto, corpoHtml }: EnviarEmailParams) {
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_REMETENTE,
      to: para,
      subject: assunto,
      html: corpoHtml,
    });

    if (error) {
      console.error("[EmailService] Erro ao disparar e-mail:", error);
      return { sucesso: false, erro: error };
    }

    return { sucesso: true, id: data?.id };
  } catch (error) {
    console.error("[EmailService] Exceção crítica ao disparar e-mail:", error);
    return { sucesso: false, erro: error };
  }
}