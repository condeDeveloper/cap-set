// Os numeros do README, presos.
//
// Se o codigo mudar e um numero mudar, este arquivo quebra. Nenhum valor aqui
// foi digitado de cabeca: todos sairam do medidor, e as razoes foram
// calculadas com `node -e` antes de entrar — estender uma curva com o olho ja
// me custou cinco erros num lote so.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { quantasRetas } from '../src/espaco.js';
import { buscar } from '../src/busca.js';
import {
  tabelaMaximos,
  tabelaAcharContraProvar,
  tabelaCruzadaDaPoda,
  tabelaTranslacao,
  tabelaQuantosMaximos,
} from '../src/medidas.js';
import { MAXIMOS_CONHECIDOS } from '../src/juiz.js';

test('o maximo e o custo de cada dimensao ate n = 3', () => {
  const esperado = [
    { n: 1, maior: 2, nos: 3 },
    { n: 2, maior: 4, nos: 26 },
    { n: 3, maior: 9, nos: 10505 },
  ];
  for (const e of esperado) {
    const r = buscar(e.n);
    assert.equal(r.maior, e.maior, `maximo de n=${e.n}`);
    assert.equal(r.nos, e.nos, `nos de n=${e.n}`);
    assert.equal(r.completou, true, `n=${e.n} tem que fechar`);
  }
});

test('o maximo achado bate com o conhecido em toda dimensao medida', () => {
  for (const l of tabelaMaximos(3)) {
    assert.equal(l.melhorAchado, MAXIMOS_CONHECIDOS[l.n]);
    assert.equal(l.bateComConhecido, true);
    assert.equal(l.provado, true);
  }
});

test('quantas retas tem cada espaco', () => {
  assert.equal(quantasRetas(1), 1);
  assert.equal(quantasRetas(2), 12);
  assert.equal(quantasRetas(3), 117);
  assert.equal(quantasRetas(4), 1080);
});

test('achar contra provar: 5x em n=2 e 618x em n=3', () => {
  const linhas = tabelaAcharContraProvar(3);
  const n2 = linhas.find((l) => l.n === 2);
  assert.equal(n2.nosParaAchar, 5);
  assert.equal(n2.nosParaProvar, 26);
  assert.equal(Math.round(n2.razao), 5);

  const n3 = linhas.find((l) => l.n === 3);
  assert.equal(n3.nosParaAchar, 17);
  assert.equal(n3.nosParaProvar, 10505);
  // 10505 / 17 = 617,94...
  assert.equal(Math.round(n3.razao), 618);
  assert.equal(n3.razaoEhPiso, false);
});

test('a translacao corta 2,31x em n=2 e 3,60x em n=3', () => {
  const linhas = tabelaTranslacao(3);
  const esperado = [
    { n: 1, com: 3, sem: 3 },
    { n: 2, com: 26, sem: 60 },
    { n: 3, com: 10505, sem: 37787 },
  ];
  for (const e of esperado) {
    const l = linhas.find((x) => x.n === e.n);
    assert.equal(l.comTranslacao, e.com, `com translacao, n=${e.n}`);
    assert.equal(l.semTranslacao, e.sem, `sem translacao, n=${e.n}`);
    assert.equal(l.mesmoMaximo, true);
  }
  // 60/26 = 2,307...  e  37787/10505 = 3,597...
  assert.equal(linhas.find((l) => l.n === 2).corte.toFixed(2), '2.31');
  assert.equal(linhas.find((l) => l.n === 3).corte.toFixed(2), '3.60');
});

test('quantos caps maximos existem: 3, 54 e 2.106', () => {
  const esperado = [
    { n: 1, maximo: 2, quantos: 3 },
    { n: 2, maximo: 4, quantos: 54 },
    { n: 3, maximo: 9, quantos: 2106 },
  ];
  for (const e of esperado) {
    const l = tabelaQuantosMaximos(e.n).find((x) => x.n === e.n);
    assert.equal(l.maximo, e.maximo);
    assert.equal(l.quantos, e.quantos, `quantos maximos em n=${e.n}`);
  }
});

test('a contagem com poda estrita bate com a varredura sem poda', () => {
  for (let n = 1; n <= 3; n++) {
    const comPoda = buscar(n, { fixarZero: false, contarTodos: true });
    const semPoda = buscar(n, { fixarZero: false, poda: false });
    assert.equal(comPoda.quantos, semPoda.quantos, `contagem de n=${n}`);
  }
});

test('a poda cruzada de n = 3, celula a celula', () => {
  const linhas = tabelaCruzadaDaPoda(3).filter((l) => l.n === 3);
  const celula = (poda, parar) =>
    linhas.find((l) => l.poda === poda && l.pararNoPrimeiro === parar).nos;
  assert.equal(celula(true, true), 17);
  assert.equal(celula(true, false), 10505);
  assert.equal(celula(false, true), 19);
  assert.equal(celula(false, false), 87934);
});

test('a poda vale 8,4x quando a busca vai ate o fim, e quase nada quando para no primeiro', () => {
  const linhas = tabelaCruzadaDaPoda(3).filter((l) => l.n === 3);
  const celula = (poda, parar) =>
    linhas.find((l) => l.poda === poda && l.pararNoPrimeiro === parar).nos;
  // 87934 / 10505 = 8,37...   contra   19 / 17 = 1,12...
  assert.equal((celula(false, false) / celula(true, false)).toFixed(2), '8.37');
  assert.equal((celula(false, true) / celula(true, true)).toFixed(2), '1.12');
});
