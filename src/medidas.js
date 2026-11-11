// Uma funcao por tabela do README. Nenhum numero do README e digitado a mao:
// todos saem daqui, e `testes/medidas.test.js` prende os valores.

import { tamanho, quantasRetas } from './espaco.js';
import { buscar, nosSemPoda, acharContraProvar } from './busca.js';
import { ehCap, MAXIMOS_CONHECIDOS, ALCANCE_DA_VARREDURA } from './juiz.js';

/** Orcamento padrao para as ordens que nao fecham. */
export const ORCAMENTO = 6e7;

/**
 * Tabela 1 — o maximo por dimensao.
 *
 * A coluna `provado` e a que importa: ela e true so quando a varredura fechou
 * o espaco inteiro. Em n = 4 ela e false, e o `maximo` da linha passa a
 * significar "o melhor que achei", nao "o maximo". A coluna `conhecido` fica
 * ao lado para mostrar que o melhor achado ja bate com o valor da literatura
 * — mas bater nao e provar, e a tabela nao finge que e.
 */
export function tabelaMaximos(ate = ALCANCE_DA_VARREDURA, orcamento = ORCAMENTO) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const r = buscar(n, { orcamento });
    linhas.push({
      n,
      pontos: tamanho(n),
      retas: quantasRetas(n),
      melhorAchado: r.maior,
      provado: r.completou,
      conhecido: MAXIMOS_CONHECIDOS[n],
      bateComConhecido: r.maior === MAXIMOS_CONHECIDOS[n],
      nos: r.nos,
    });
  }
  return linhas;
}

/**
 * Tabela 2 — achar contra provar, que e o assunto do projeto.
 *
 * `nosParaProvar` so e um numero fechado quando `provaCompletou` e true. Em
 * n = 4 ele e o orcamento, e a razao vira um PISO: "pelo menos tantas vezes".
 */
export function tabelaAcharContraProvar(ate = ALCANCE_DA_VARREDURA, orcamento = ORCAMENTO) {
  const linhas = [];
  for (let n = 2; n <= ate; n++) {
    const alvo = MAXIMOS_CONHECIDOS[n];
    const achar = buscar(n, { alvo, pararNoPrimeiro: true, orcamento });
    const provar = buscar(n, { orcamento });
    linhas.push({
      n,
      alvo,
      nosParaAchar: achar.nos,
      nosParaProvar: provar.nos,
      provaCompletou: provar.completou,
      razao: provar.nos / achar.nos,
      razaoEhPiso: !provar.completou,
    });
  }
  return linhas;
}

/**
 * Tabela 3 — a poda medida em tabela CRUZADA.
 *
 * Medir a poda sozinha e somar o ganho no papel engana: o efeito dela depende
 * do que a busca ja encontrou. As duas metades variam juntas, e cada celula
 * diz qual era a outra metade.
 */
export function tabelaCruzadaDaPoda(ate = 3, orcamento = ORCAMENTO) {
  const linhas = [];
  for (let n = 2; n <= ate; n++) {
    for (const poda of [true, false]) {
      for (const pararNoPrimeiro of [true, false]) {
        const r = buscar(n, {
          poda,
          pararNoPrimeiro,
          alvo: pararNoPrimeiro ? MAXIMOS_CONHECIDOS[n] : null,
          orcamento,
        });
        linhas.push({
          n, poda, pararNoPrimeiro, nos: r.nos,
          maior: r.maior, completou: r.completou,
        });
      }
    }
  }
  return linhas;
}

/**
 * Tabela 4 — a translacao, medida.
 *
 * Todo cap pode ser deslocado para conter o ponto 0, entao fixar 0 nao perde
 * maximo nenhum. Quanto isso corta, de verdade?
 */
export function tabelaTranslacao(ate = 3, orcamento = ORCAMENTO) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const com = buscar(n, { fixarZero: true, orcamento });
    const sem = buscar(n, { fixarZero: false, orcamento });
    linhas.push({
      n,
      comTranslacao: com.nos,
      semTranslacao: sem.nos,
      corte: sem.nos / com.nos,
      mesmoMaximo: com.maior === sem.maior,
    });
  }
  return linhas;
}

/** Tabela 5 — quantos caps do tamanho maximo o espaco tem. */
export function tabelaQuantosMaximos(ate = 3, orcamento = ORCAMENTO) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    // `contarTodos` e obrigatorio aqui: sem ele a poda corta os ramos que so
    // empatam com o melhor, e a contagem sai silenciosamente menor.
    const r = buscar(n, { orcamento, fixarZero: false, contarTodos: true });
    linhas.push({ n, maximo: r.maior, quantos: r.quantos, provado: r.completou });
  }
  return linhas;
}

/** Tabela 6 — a densidade do maior cap dentro do espaco. */
export function tabelaDensidade(ate = ALCANCE_DA_VARREDURA) {
  return tabelaMaximos(ate).map(({ n, pontos, melhorAchado, provado }) => ({
    n,
    pontos,
    melhorAchado,
    provado,
    densidade: melhorAchado / pontos,
  }));
}

/** A fracao da arvore cheia que a busca chegou a visitar. */
export function tabelaFracaoDaArvore(ate = 3) {
  return tabelaMaximos(ate).map(({ n, nos }) => ({
    n,
    nos,
    arvoreCheia: nosSemPoda(n).toString(),
    // em partes por milhao, porque a fracao e pequena demais para casas decimais
    porMilhao: Number((BigInt(nos) * 1000000n) / nosSemPoda(n)),
  }));
}

/** Confere, com o juiz, que o exemplo devolvido pela busca e mesmo um cap. */
export function exemplosConferidosPeloJuiz(ate = ALCANCE_DA_VARREDURA) {
  const linhas = [];
  for (let n = 1; n <= ate; n++) {
    const r = buscar(n, { alvo: MAXIMOS_CONHECIDOS[n], pararNoPrimeiro: true });
    linhas.push({ n, tamanho: r.exemplo.length, ehCap: ehCap(n, r.exemplo) });
  }
  return linhas;
}

export { acharContraProvar };
