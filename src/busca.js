// A busca pelo maior cap de F_3^n.
//
// Duas pecas sustentam o custo.
//
// 1. CONTADOR DE BLOQUEIO. Em vez de testar trincas, cada ponto do espaco
//    guarda quantos pares do cap atual o teriam como terceiro. Um ponto pode
//    entrar se e so se esse contador e zero. Entrar e sair custam O(k), e o
//    desfazer e exato — estado por nivel, nunca compartilhado.
//
// 2. LIMITE SUPERIOR PELOS CANDIDATOS REAIS. O corte ingenuo compara com os
//    indices que faltam (`m - q`), o que e quase sempre folgado demais: a
//    maioria desses indices ja esta bloqueada. Contar os candidatos que de
//    fato ainda cabem e o que faz n = 4 fechar em vez de rodar a noite toda.
//
// A translacao tambem e usada: todo cap pode ser deslocado para conter o ponto
// 0, entao fixar 0 nao perde nenhum maximo. E simetria legitima, nao chute.

import { tamanho, tabelaTerceiro } from './espaco.js';

/**
 * @param {number} n dimensao
 * @param {object} opcoes
 *   - `pararNoPrimeiro` + `alvo`: para ao achar um cap do tamanho alvo
 *   - `poda`: limite superior pelos candidatos (padrao true)
 *   - `fixarZero`: usa a translacao (padrao true)
 * @returns {{maior:number, exemplo:number[], nos:number, quantos:number}}
 */
export function buscar(n, opcoes = {}) {
  const {
    pararNoPrimeiro = false,
    alvo = null,
    poda = true,
    fixarZero = true,
    // Para CONTAR os caps maximos, e nao so achar um. A poda normal corta o
    // ramo que so consegue EMPATAR com o melhor — o que e certo para achar o
    // maximo e silenciosamente errado para conta-los. Com isto ligado o corte
    // passa a exigir que o ramo nao alcance nem o empate.
    contarTodos = false,
    // Teto de nos. A busca para ao estourar e avisa com `completou: false`.
    // Existe porque n = 4 NAO fecha: sem isso a tabela ficaria com uma linha em
    // branco ou, pior, com o valor conhecido copiado de fora como se fosse meu.
    orcamento = Infinity,
  } = opcoes;

  const m = tamanho(n);
  const t = tabelaTerceiro(n);

  const bloqueado = new Int32Array(m);
  const atual = [];
  let maior = 0;
  let exemplo = [];
  let nos = 0;
  let quantos = 0;
  let parou = false;
  let estourou = false;

  function entra(q) {
    for (const p of atual) bloqueado[t[p * m + q]]++;
    atual.push(q);
  }

  function sai(q) {
    atual.pop();
    for (const p of atual) bloqueado[t[p * m + q]]--;
  }

  function desce(inicio) {
    if (parou) return;
    nos++;
    if (nos >= orcamento) {
      parou = true;
      estourou = true;
      return;
    }

    if (atual.length > maior) {
      maior = atual.length;
      exemplo = atual.slice();
      quantos = 1;
    } else if (atual.length === maior && maior > 0) {
      quantos++;
    }

    if (alvo !== null && pararNoPrimeiro && atual.length >= alvo) {
      parou = true;
      return;
    }

    // lista de candidatos DESTE nivel: nada compartilhado com o nivel de cima
    const candidatos = [];
    for (let q = inicio; q < m; q++) if (bloqueado[q] === 0) candidatos.push(q);

    const folga = contarTodos ? 1 : 0;
    if (poda && atual.length + candidatos.length + folga <= maior) return;

    for (let i = 0; i < candidatos.length; i++) {
      // o limite encolhe a cada irmao ja tentado
      if (poda && atual.length + (candidatos.length - i) + folga <= maior) return;
      const q = candidatos[i];
      if (bloqueado[q] !== 0) continue; // pode ter sido bloqueado por um irmao
      entra(q);
      desce(q + 1);
      sai(q);
      if (parou) return;
    }
  }

  if (fixarZero) {
    // o no raiz (conjunto vazio) conta ANTES de descer: contado depois, ele
    // escapava do orcamento e o total estourava o teto em um.
    nos++;
    entra(0);
    desce(1);
  } else {
    desce(0);
  }

  // `completou` e o que separa "varri o espaco inteiro" de "parei no meio".
  // So quando ele e true o `maior` e um MAXIMO provado; caso contrario e
  // apenas o melhor encontrado ate o orcamento acabar.
  return { maior, exemplo, nos, quantos, completou: !estourou };
}

/**
 * O denominador honesto: quantos NOS a arvore teria sem poda nenhuma.
 *
 * Cada no e um subconjunto parcial construido em ordem crescente, entao a
 * arvore cheia tem 2^m nos, um por subconjunto. Comparar nos com o numero de
 * caps, ou com C(m,k), compara no com folha e infla a conta a meu favor.
 */
export function nosSemPoda(n) {
  return 2n ** BigInt(tamanho(n));
}

/**
 * Custo de ACHAR um cap do tamanho alvo contra o custo de PROVAR que nao
 * existe maior. Duas varreduras diferentes do mesmo espaco.
 */
export function acharContraProvar(n, alvo) {
  const achar = buscar(n, { alvo, pararNoPrimeiro: true });
  const provar = buscar(n);
  return {
    n,
    alvo,
    nosParaAchar: achar.nos,
    nosParaProvar: provar.nos,
    razao: provar.nos / achar.nos,
    maximo: provar.maior,
  };
}
