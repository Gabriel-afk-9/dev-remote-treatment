import { lastDayOfMonth, subDays, differenceInDays, addMonths, isFriday } from "date-fns";

/**
 * Regra: Data da cirurgia é sempre a última sexta-feira do mês.
 */
export function calcularUltimaSextaDoMes(dataReferencia: Date = new Date()): Date {
  let data = lastDayOfMonth(dataReferencia);
  
  // Retrocede os dias até encontrar a sexta-feira (no JS, sexta-feira = 5)
  while (!isFriday(data)) {
    data = subDays(data, 1);
  }
  
  return data;
}

/**
 * Regra: Trava de dataCadastro <= 15 dias antes da cirurgia.
 * Se faltar menos de 15 dias, move automaticamente para a última sexta-feira do mês seguinte.
 */
export function validarAntecedencia15Dias(dataCadastro: Date): Date {
  // 1. Calcula qual seria a cirurgia neste mesmo mês do cadastro
  const ultimaSextaAtual = calcularUltimaSextaDoMes(dataCadastro);
  
  // 2. Verifica quantos dias faltam entre o cadastro e a cirurgia
  const diferencaDias = differenceInDays(ultimaSextaAtual, dataCadastro);

  // 3. Se a diferença for menor que 15 dias, joga para o mês seguinte
  if (diferencaDias < 15) {
    const mesSeguinte = addMonths(dataCadastro, 1);
    return calcularUltimaSextaDoMes(mesSeguinte);
  }

  // Caso cumpra a antecedência, mantém no mês atual
  return ultimaSextaAtual;
}