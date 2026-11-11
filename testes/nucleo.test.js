import { test } from 'node:test';
import assert from 'node:assert/strict';

import { tamanho, paraVetor, paraIndice, terceiro, quantasRetas } from '../src/espaco.js';
import { buscar, nosSemPoda } from '../src/busca.js';
import {
  colineares, ehCap, trincasColineares, maiorCapPorForcaBruta,
  MAXIMOS_CONHECIDOS,
} from '../src/juiz.js';

test('o espaco tem 3^n pontos', () => {
  assert.equal(tamanho(1), 3);
  assert.equal(tamanho(3), 27);
  assert.equal(tamanho(4), 81);
});

test('ponto <-> vetor sao inversos em todo o espaco', () => {
  for (let n = 1; n <= 4; n++) {
    for (let i = 0; i < tamanho(n); i++) {
      assert.equal(paraIndice(paraVetor(n, i)), i);
    }
  }
});

test('o terceiro ponto fecha a reta, pela definicao do juiz', () => {
  for (let n = 1; n <= 3; n++) {
    for (let a = 0; a < tamanho(n); a++) {
      for (let b = 0; b < tamanho(n); b++) {
        if (a === b) continue;
        const c = terceiro(n, a, b);
        assert.notEqual(c, a, `terceiro(${a},${b}) repetiu a`);
        assert.notEqual(c, b, `terceiro(${a},${b}) repetiu b`);
        assert.ok(colineares(n, a, b, c), `${a},${b},${c} deveria ser reta`);
      }
    }
  }
});

test('o terceiro e simetrico nos dois primeiros', () => {
  for (let a = 0; a < 27; a++) {
    for (let b = 0; b < 27; b++) {
      assert.equal(terceiro(3, a, b), terceiro(3, b, a));
    }
  }
});

test('a reta por a e b e UNICA: o terceiro e o unico que fecha', () => {
  const n = 2;
  for (let a = 0; a < 9; a++) {
    for (let b = a + 1; b < 9; b++) {
      let fecham = 0;
      for (let c = 0; c < 9; c++) {
        if (c === a || c === b) continue;
        if (colineares(n, a, b, c)) fecham++;
      }
      assert.equal(fecham, 1);
    }
  }
});

test('quantas retas o espaco tem, contadas e nao calculadas', () => {
  for (let n = 1; n <= 3; n++) {
    const vistas = new Set();
    for (let a = 0; a < tamanho(n); a++) {
      for (let b = a + 1; b < tamanho(n); b++) {
        const c = terceiro(n, a, b);
        vistas.add([a, b, c].sort((x, y) => x - y).join(','));
      }
    }
    assert.equal(vistas.size, quantasRetas(n));
  }
});

test('a busca reencontra os maximos conhecidos ate n = 3', () => {
  for (let n = 1; n <= 3; n++) {
    assert.equal(buscar(n).maior, MAXIMOS_CONHECIDOS[n]);
  }
});

test('o exemplo que a busca devolve passa pelo juiz', () => {
  for (let n = 1; n <= 4; n++) {
    const r = buscar(n, { alvo: MAXIMOS_CONHECIDOS[n], pararNoPrimeiro: true });
    assert.equal(r.exemplo.length, MAXIMOS_CONHECIDOS[n]);
    assert.ok(ehCap(n, r.exemplo));
    assert.equal(trincasColineares(n, r.exemplo), 0);
  }
});

test('a forca bruta sobre TODOS os subconjuntos concorda ate n = 2', () => {
  for (let n = 1; n <= 2; n++) {
    assert.equal(maiorCapPorForcaBruta(n).maior, buscar(n).maior);
  }
});

test('a forca bruta se recusa a passar de n = 2, em vez de rodar a noite toda', () => {
  assert.throws(() => maiorCapPorForcaBruta(3), RangeError);
});

test('acrescentar um ponto a um cap maximo sempre quebra o cap', () => {
  for (let n = 1; n <= 3; n++) {
    const r = buscar(n);
    const dentro = new Set(r.exemplo);
    for (let p = 0; p < tamanho(n); p++) {
      if (dentro.has(p)) continue;
      assert.ok(!ehCap(n, [...r.exemplo, p]), `n=${n}: ${p} ainda cabia`);
    }
  }
});

test('a translacao nao muda o maximo', () => {
  for (let n = 1; n <= 3; n++) {
    assert.equal(
      buscar(n, { fixarZero: true }).maior,
      buscar(n, { fixarZero: false }).maior
    );
  }
});

test('a poda nao muda o maximo, so o custo', () => {
  for (let n = 1; n <= 3; n++) {
    const com = buscar(n, { poda: true });
    const sem = buscar(n, { poda: false });
    assert.equal(com.maior, sem.maior);
    assert.ok(com.nos < sem.nos, `n=${n}: a poda nao cortou nada`);
  }
});

test('o denominador honesto e 2^(3^n), um no por subconjunto', () => {
  assert.equal(nosSemPoda(1), 8n);
  assert.equal(nosSemPoda(2), 512n);
  assert.equal(nosSemPoda(3), 134217728n);
});

test('o orcamento para a busca e marca que ela nao completou', () => {
  const r = buscar(3, { orcamento: 100 });
  assert.equal(r.completou, false);
  assert.ok(r.nos <= 100);
  assert.equal(buscar(3).completou, true);
});
