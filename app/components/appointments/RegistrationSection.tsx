"use client";

import { useState, type ChangeEvent, useTransition } from "react";
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCheck, ClipboardList,
  Mail, MapPinned, Megaphone, MessageCircle, Phone, ShieldCheck, UserRound,
} from "lucide-react";
import { SubmitButton } from "@/components/shared/SubmitButton";
import { salvarAgendamento, FormInscricao } from "@/src/features/appointments/presentation/actions/inscricao.actions";

const stepLabels = ["Paciente", "Agendamento", "Revisão"];

// Estado focado apenas no que o usuário preenche na interface
const initialFormData: FormInscricao = {
  nomeCompleto: "",
  dataNascimento: "",
  pais: "",
  estado: "",
  cidade: "",
  endereco: "",
  emailNotificacao: "",
  celular: "",
  tipoWhatsApp: "E_WHATSAPP",
  whatsappAuxiliar: "",
  nomeSolicitante: "",
  tipo: "TRATAMENTO_SEM_CIRURGIA",
};

export function RegistrationSection() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormInscricao>(initialFormData);
  const [protocoloGerado, setProtocoloGerado] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const updateField =
    (field: keyof FormInscricao) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const target = event.target as HTMLInputElement;
      setFormData((current) => ({
        ...current,
        [field]: target.type === "checkbox" ? target.checked : target.value,
      }));
    };

  const handleAction = () => {
    setErro(null);
    startTransition(async () => {
      const resultado = await salvarAgendamento(formData);

      if (resultado.sucesso) {
        setProtocoloGerado(resultado.protocolo!);
      } else {
        setErro(resultado.erro || "Ocorreu um erro desconhecido.");
      }
    });
  };

  if (protocoloGerado) {
    return (
      <section id="inscricao" className="flex flex-col justify-center items-center p-8 min-h-[60vh] scroll-mt-35">
        <div className="bg-card shadow-lg p-10 border border-brand/20 rounded-3xl w-full max-w-md text-center">
          <div className="flex justify-center items-center bg-brand/10 mx-auto mb-6 rounded-full w-20 h-20 text-brand">
            <CheckCheck size={40} />
          </div>
          <h2 className="mb-2 font-bold text-foreground text-2xl">Inscrição Confirmada!</h2>
          <p className="mb-6 text-neutral">Guarde o seu protocolo para acompanhar as atualizações do tratamento.</p>

          <div className="bg-background mb-6 p-4 border border-neutral/15 rounded-xl">
            <p className="mb-1 text-neutral text-xs uppercase tracking-widest">Seu Protocolo</p>
            <p className="font-bold text-brand text-2xl tracking-wider">{protocoloGerado}</p>
          </div>

          <button
            onClick={() => {
              setProtocoloGerado(null);
              setStep(0);
              setFormData(initialFormData);
            }}
            className="w-full text-foreground hover:text-background btn btn-ghost"
          >
            Fazer nova inscrição
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="inscricao" className="relative flex items-center p-8 min-h-screen overflow-hidden scroll-mt-10">
      <div className="-z-10 absolute inset-0 bg-[linear-gradient(180deg,var(--background)_0%,#F5F1EA_55%,var(--background)_100%)]" />

      <div className="gap-8 grid lg:grid-cols-[0.5fr_1.5fr] mx-auto w-full max-w-7xl">
        <aside className="space-y-6">
          <div className="space-y-3">
            <h2 className="font-bold text-foreground text-3xl sm:text-4xl">Solicite o seu Atendimento</h2>
            <p className="max-w-xl text-foreground/80 text-base leading-7">
              Preencha com atenção os dados do paciente e as informações de contato. O formulário é dividido em três etapas rápidas para facilitar a sua inscrição no tratamento espiritual a distância.
            </p>
          </div>

          <div className="bg-card/90 shadow-lg shadow-neutral/8 p-6 border border-neutral/15 rounded-3xl">
            <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.28em]"><ShieldCheck size={14} /> Confidencialidade</p>
            <p className="mt-3 text-foreground/85 text-sm leading-6">
              Todos os dados fornecidos estão seguros e serão utilizados exclusivamente para a sintonia da equipe espiritual e para o envio de orientações sobre o tratamento.
            </p>
          </div>
        </aside>

        <div className="bg-card/95 shadow-2xl shadow-neutral/10 border border-neutral/15 card">
          <div className="gap-6 p-6 sm:p-8 lg:p-10 card-body">
            {erro && (
              <div className="bg-error/10 mb-4 p-3 border border-error/20 rounded-xl text-error text-sm">
                {erro}
              </div>
            )}
            <div className="flex flex-wrap justify-between items-start gap-4">
              <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.25em]"><ClipboardList size={14} />Inscrição</p>
              <ul className="steps steps-vertical lg:steps-horizontal">
                {stepLabels.map((label, index) => (
                  <li key={label} className={`step ${index <= step ? "step-primary text-brand font-semibold" : "text-neutral font-extralight"}`}>
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            <form className="space-y-6" action={handleAction}>
              {step === 0 && (
                <div className="gap-4 grid md:grid-cols-2">
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Nome completo</span>
                    <input required className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="Ex.: Maria Oliveira" value={formData.nomeCompleto} onChange={updateField("nomeCompleto")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Data de nascimento</span>
                    <input required type="date" className="bg-background border-neutral/20 focus:border-brand text-foreground input input-bordered" value={formData.dataNascimento} onChange={updateField("dataNascimento")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">País</span>
                    <input required className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="Brasil" value={formData.pais} onChange={updateField("pais")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Estado</span>
                    <input required className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="CE" value={formData.estado} onChange={updateField("estado")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Cidade</span>
                    <input required className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="Fortaleza" value={formData.cidade} onChange={updateField("cidade")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Endereço</span>
                    <input required className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="Rua, número, bairro e complemento" value={formData.endereco} onChange={updateField("endereco")} />
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="gap-4 grid md:grid-cols-2">
                  <label className="flex flex-col form-control">
                    <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text"><Mail size={14} />E-mail de notificação</span>
                    <input required type="email" className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="contato@exemplo.com" value={formData.emailNotificacao} onChange={updateField("emailNotificacao")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text"><Phone size={14} />Celular</span>
                    <input required type="tel" className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="(85) 99999-9999" value={formData.celular} onChange={updateField("celular")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">É Whatsapp?</span>
                    <select className="bg-background border-neutral/20 focus:border-brand text-foreground select-bordered select" value={formData.tipoWhatsApp} onChange={updateField("tipoWhatsApp")}>
                      <option value="E_WHATSAPP">Sim</option>
                      <option value="NAO_TEM">Não Tenho</option>
                      <option value="OUTRO_NUMERO">Adicionar Whatsapp Auxiliar</option>
                    </select>
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="flex items-center gap-2 mb-2 font-medium text-foreground text-sm label-text"><MessageCircle size={14} /> WhatsApp Auxiliar</span>
                    <input
                      type="tel"
                      className="bg-background disabled:opacity-50 border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered"
                      placeholder="(85) 98888-8888"
                      value={formData.whatsappAuxiliar}
                      onChange={updateField("whatsappAuxiliar")}
                      disabled={formData.tipoWhatsApp !== "OUTRO_NUMERO"}
                    />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="mb-2 font-medium text-foreground text-sm label-text">Nome do solicitante (Opcional)</span>
                    <input className="bg-background border-neutral/20 focus:border-brand text-foreground placeholder:text-neutral/60 input input-bordered" placeholder="Ex.: Irmã Ana" value={formData.nomeSolicitante} onChange={updateField("nomeSolicitante")} />
                  </label>
                  <label className="flex flex-col form-control">
                    <span className="flex items-center gap-2 mb-2 font-extralight text-brand text-sm label-text"><Megaphone size={14} /> As cirurgias acontecem na última sexta-feira do mês.</span>
                    <label className="px-3 py-2 border border-neutral/20 rounded-sm max-w-80 cursor-pointer label">
                      <input
                        type="checkbox"
                        className="border-neutral/30 checkbox checkbox-accent [--chkbg:var(--brand)] [--chkfg:var(--background)]"
                        checked={formData.tipo === "TRATAMENTO_COM_CIRURGIA"}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            tipo: e.target.checked ? "TRATAMENTO_COM_CIRURGIA" : "TRATAMENTO_SEM_CIRURGIA",
                          }));
                        }}
                      />
                      <span className="text-foreground label-text">Tratamento com Cirurgia</span>
                    </label>
                  </label>
                </div>
              )}

              {step === 2 && (
                <div className="gap-4 grid lg:grid-cols-2 py-1.5">
                  <div className="bg-background p-5 border border-neutral/15 rounded-3xl">
                    <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.22em]"><UserRound size={14} />Paciente</p>
                    <dl className="space-y-3 mt-4 text-foreground/85 text-sm">
                      <div className="flex justify-between items-center gap-4"><dt>Nome</dt><dd className="font-medium text-foreground text-right">{formData.nomeCompleto || "Nome não informado"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt>Nascimento</dt><dd className="font-medium text-foreground text-right">{formData.dataNascimento ? formData.dataNascimento.split("-").reverse().join("/") : "--/--/----"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt className="flex items-center gap-2"><MapPinned size={14} />Local</dt><dd className="font-medium text-foreground text-right">{[formData.cidade, formData.estado, formData.pais].filter(Boolean).join(" / ") || "Cidade / Estado / País"}</dd></div>
                    </dl>
                  </div>
                  <div className="bg-background p-5 border border-neutral/15 rounded-3xl">
                    <p className="flex items-center gap-2 text-brand text-sm uppercase tracking-[0.22em]"><CalendarDays size={14} />Agendamento</p>
                    <dl className="space-y-3 mt-4 text-foreground/85 text-sm">
                      <div className="flex justify-between items-center gap-4"><dt>Tipo</dt><dd className="font-medium text-foreground text-right">{formData.tipo === "TRATAMENTO_COM_CIRURGIA" ? "Com Cirurgia" : "Sem Cirurgia"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt>Solicitante</dt><dd className="font-medium text-foreground text-right">{formData.nomeSolicitante || "Para si mesmo"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt>E-mail</dt><dd className="font-medium text-foreground text-right">{formData.emailNotificacao || "Não informado"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt>WhatsApp</dt><dd className="font-medium text-foreground text-right">{formData.tipoWhatsApp === "E_WHATSAPP" ? "Sim" : formData.tipoWhatsApp === "OUTRO_NUMERO" ? "Outro Número" : "Não"}</dd></div>
                      <div className="flex justify-between items-center gap-4"><dt>Celular</dt><dd className="font-medium text-foreground text-right">{formData.celular || "(00) 00000-0000"}</dd></div>
                      {formData.tipoWhatsApp === "OUTRO_NUMERO" && (
                        <div className="flex justify-between items-center gap-4"><dt>Auxiliar</dt><dd className="font-medium text-foreground text-right">{formData.whatsappAuxiliar || "(00) 00000-0000"}</dd></div>
                      )}
                    </dl>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-between items-center gap-3 pt-6 border-neutral/10 border-t">
                <button type="button" className="gap-2 bg-background hover:bg-neutral border-neutral/20 hover:border-neutral text-foreground hover:text-background btn" onClick={() => setStep((current) => Math.max(0, current - 1))} hidden={step === 0}>
                  <ArrowLeft size={16} />
                  Voltar
                </button>

                <div className="flex flex-wrap gap-3 ml-auto">
                  {step < 2 ? (
                    <button type="button" className="gap-2 bg-brand hover:bg-brand-hover border-brand hover:border-brand-hover text-background btn" onClick={() => setStep((current) => Math.min(2, current + 1))}>
                      Próxima etapa
                      <ArrowRight size={16} />
                    </button>
                  ) : (
                    <SubmitButton text="Finalizar inscrição" icon={<CheckCheck size={16} />} />
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}