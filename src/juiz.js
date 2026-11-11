// O juiz. Nao importa NADA de `busca.js` nem usa a tabela de terceiros.
//
// A busca decide pela via rapida: "este ponto e o completamento de algum par
// que ja escolhi?". O juiz decide pela definicao crua: abre todas as C(k,3)
// trincas do conjunto e soma coordenada a coordenada. Se os dois concordam, o
// numero vale; se discordam, um dos dois esta errado — e e ai que mora o
// achado. Dois caminhos independentes para a mesma pergunta.

import { paraVetor } from './espaco.js';

/**
 * Verdadeiro se os tres pontos sao colineares, pela definicao: a soma das tres
 * coordenadas e 0 mod 3 em TODAS as posicoes.
 */
export function colineares(n, a, b, c) {
  const va = paraVetor(n, a);
  const vb = paraVetor(n, b);
  const vc = paraVetor(n, c);
  for (let k = 0; k < n; k++) {
    if ((va[k] + vb[k] + vc[k]) % 3 !== 0) return false;
  }
  return true;
}

/**
 * Verdadeiro se `conjunto` e um cap, conferido trinca a trinca.
 *
 * Custo C(k,3), proposital: e a versao burra, e a lentidao dela e o preco de
 * ela nao compartilhar raciocinio com a busca.
 */
export function ehCap(n, conjunto) {
  const v = [...conjunto];
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      for (let k = j + 1; k < v.length; k++) {
        if (colineares(n, v[i], v[j], v[k])) return false;
      }
    }
  }
  return true;
}

/** Quantas trincas colineares o conjunto contem (0 e o que define um cap). */
export function trincasColineares(n, conjunto) {
  const v = [...conjunto];
  let total = 0;
  for (let i = 0; i < v.length; i++) {
    for (let j = i + 1; j < v.length; j++) {
      for (let k = j + 1; k < v.length; k++) {
        if (colineares(n, v[i], v[j], v[k])) total++;
      }
    }
  }
  return total;
}

/**
 * O segundo juiz: os maximos conhecidos, que a varredura tem que reencontrar.
 *
 * Indice = dimensao. O valor de n = 6 (112) foi estabelecido por computador em
 * 2002 e NAO e alcancavel por esta busca em tempo util — ele esta aqui para a
 * tabela do README dizer onde a minha varredura parou, nao para eu fingir que
 * cheguei la.
 */
export const MAXIMOS_CONHECIDOS = [1, 2, 4, 9, 20, 45, 112];

/** Ate onde esta busca chega de verdade, varrendo o espaco inteiro. */
export const ALCANCE_DA_VARREDURA = 4;

/**
 * Forca bruta de verdade: percorre TODOS os subconjuntos de F_3^n e devolve o
 * maior que e cap. So existe para n <= 2 (2^9 = 512 subconjuntos); em n = 3
 * ja seriam 2^27, e e por isso que a busca com poda precisa existir.
 */
export function maiorCapPorForcaBruta(n) {
  if (n > 2) throw new RangeError('forca bruta so vai ate n = 2');
  const m = 3 ** n;
  let maior = 0;
  let exemplo = [];
  for (let mascara = 0; mascara < 1 << m; mascara++) {
    const conjunto = [];
    for (let p = 0; p < m; p++) if (mascara & (1 << p)) conjunto.push(p);
    if (conjunto.length > maior && ehCap(n, conjunto)) {
      maior = conjunto.length;
      exemplo = conjunto;
    }
  }
  return { maior, exemplo };
}
