// O espaco afim F_3^n: 3^n pontos, cada um um vetor de n coordenadas em {0,1,2}.
//
// A peca que faz tudo funcionar: em F_3, tres pontos distintos sao COLINEARES
// se e so se a soma deles e zero coordenada a coordenada. Como consequencia,
// dois pontos distintos determinam o terceiro de forma UNICA:
//
//     c = -(a + b)  (mod 3)
//
// E por isso que procurar um "cap" (conjunto sem tres em linha) nao precisa
// olhar trincas: basta, para cada par ja escolhido, proibir o completamento.

/** Quantos pontos tem o espaco de dimensao n. */
export function tamanho(n) {
  return 3 ** n;
}

/** O ponto `i` como vetor de n coordenadas (menos significativa primeiro). */
export function paraVetor(n, i) {
  const v = new Array(n);
  for (let k = 0; k < n; k++) {
    v[k] = i % 3;
    i = (i - v[k]) / 3;
  }
  return v;
}

/** O caminho de volta: vetor -> indice. */
export function paraIndice(v) {
  let i = 0;
  for (let k = v.length - 1; k >= 0; k--) i = i * 3 + v[k];
  return i;
}

/**
 * O terceiro ponto da reta por `a` e `b`, ambos indices.
 *
 * Em F_3, `-(x + y) mod 3` vale 0 quando x == y e vale a coordenada que falta
 * quando x != y. A tabela abaixo e exatamente isso, aberta para nao pagar
 * divisao por coordenada.
 */
export function terceiro(n, a, b) {
  let resultado = 0;
  let peso = 1;
  for (let k = 0; k < n; k++) {
    const x = a % 3;
    const y = b % 3;
    // -(x+y) mod 3
    resultado += ((6 - x - y) % 3) * peso;
    a = (a - x) / 3;
    b = (b - y) / 3;
    peso *= 3;
  }
  return resultado;
}

/**
 * Tabela `terceiro` inteira, pre-calculada: 3^n x 3^n entradas.
 *
 * Vale a pena a partir de n = 3 porque a busca consulta o completamento
 * milhoes de vezes. Acima de n = 6 a tabela nao cabe (729^2 ja sao 531.441
 * entradas, e 2187^2 passa de 4,7 milhoes) — por isso ela e opcional.
 */
export function tabelaTerceiro(n) {
  const m = tamanho(n);
  const t = new Int16Array(m * m);
  for (let a = 0; a < m; a++) {
    for (let b = 0; b < m; b++) t[a * m + b] = terceiro(n, a, b);
  }
  return t;
}

/** Quantas retas tem o espaco: cada uma e um par nao ordenado com seu terceiro. */
export function quantasRetas(n) {
  const m = tamanho(n);
  return (m * (m - 1)) / 6; // C(m,2) pares, e cada reta e contada 3 vezes
}
