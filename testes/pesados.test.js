// O caso que nao fecha: n = 4.
//
// A varredura roda UMA vez e todos os testes deste arquivo leem o mesmo
// resultado. Varrer tres vezes o mesmo espaco nao prova nada a mais e custa
// tres vezes o relogio.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buscar } from '../src/busca.js';
import { ehCap, MAXIMOS_CONHECIDOS } from '../src/juiz.js';

const ORCAMENTO = 6e7;

let cache = null;
function varreduraDeQuatro() {
  if (cache === null) {
    cache = {
      achar: buscar(4, { alvo: 20, pararNoPrimeiro: true, orcamento: ORCAMENTO }),
      provar: buscar(4, { orcamento: ORCAMENTO }),
    };
  }
  return cache;
}

test('achar um cap de 20 pontos em n = 4 custa 3.850 nos', { timeout: 600000 }, () => {
  const { achar } = varreduraDeQuatro();
  assert.equal(achar.maior, 20);
  assert.equal(achar.nos, 3850);
  assert.equal(achar.completou, true);
});

test('o cap de 20 pontos passa pelo juiz, trinca a trinca', { timeout: 600000 }, () => {
  const { achar } = varreduraDeQuatro();
  assert.equal(achar.exemplo.length, 20);
  assert.ok(ehCap(4, achar.exemplo));
});

test('provar que 20 e o maximo NAO fecha em 60 milhoes de nos', { timeout: 600000 }, () => {
  const { provar } = varreduraDeQuatro();
  assert.equal(provar.completou, false, 'se isto passar a fechar, a tabela muda');
  assert.equal(provar.nos, ORCAMENTO);
  // ate onde foi, nada melhor que 20 apareceu
  assert.equal(provar.maior, 20);
});

test('a razao provar/achar em n = 4 passa de 15.584 vezes', { timeout: 600000 }, () => {
  const { achar, provar } = varreduraDeQuatro();
  // 60.000.000 / 3.850 = 15.584,4...
  assert.equal(Math.floor(provar.nos / achar.nos), 15584);
});

test('o melhor achado em n = 4 bate com o conhecido, mas bater nao e provar',
  { timeout: 600000 }, () => {
    const { provar } = varreduraDeQuatro();
    assert.equal(provar.maior, MAXIMOS_CONHECIDOS[4]);
    assert.equal(provar.completou, false);
  });
