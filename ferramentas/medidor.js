#!/usr/bin/env node
// Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js             todas
//   node ferramentas/medidor.js provar      uma so
//
// Nenhum numero do README e digitado a mao.

import {
  tabelaMaximos,
  tabelaAcharContraProvar,
  tabelaCruzadaDaPoda,
  tabelaTranslacao,
  tabelaQuantosMaximos,
  tabelaDensidade,
  tabelaFracaoDaArvore,
  exemplosConferidosPeloJuiz,
} from '../src/medidas.js';
import { MAXIMOS_CONHECIDOS } from '../src/juiz.js';
import { buscar } from '../src/busca.js';

const tabelas = {
  maximos() {
    console.log('O maior cap por dimensao');
    console.log('------------------------');
    console.log('  n  pontos  retas  melhor  provado?  conhecido  nos');
    for (const l of tabelaMaximos(4)) {
      console.log('  %s  %s  %s  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.pontos).padStart(6),
        String(l.retas).padStart(5), String(l.melhorAchado).padStart(6),
        String(l.provado).padStart(8), String(l.conhecido).padStart(9),
        String(l.nos).padStart(10));
    }
    console.log();
    console.log('  "provado" false = a varredura NAO fechou o espaco: a coluna');
    console.log('  "melhor" e so o melhor encontrado ate o orcamento acabar.');
  },

  provar() {
    console.log('Achar um maximo contra provar que e maximo');
    console.log('------------------------------------------');
    console.log('  n  alvo  nos p/ achar  nos p/ provar  razao');
    for (const l of tabelaAcharContraProvar(4)) {
      console.log('  %s  %s  %s  %s  %s%s',
        String(l.n).padStart(2), String(l.alvo).padStart(4),
        String(l.nosParaAchar).padStart(12),
        String(l.nosParaProvar).padStart(13),
        l.razaoEhPiso ? '> ' : '  ',
        l.razao.toFixed(0) + 'x');
    }
    console.log();
    console.log('  "> " marca a linha em que a prova NAO terminou: a razao e um');
    console.log('  piso, nao um valor.');
  },

  poda() {
    console.log('A poda, em tabela cruzada');
    console.log('-------------------------');
    console.log('  medir a poda sozinha engana: o efeito dela depende do que a');
    console.log('  busca ja encontrou. As duas metades variam juntas.');
    console.log('  n  poda   para-no-primeiro  nos');
    for (const l of tabelaCruzadaDaPoda(3)) {
      console.log('  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.poda).padStart(5),
        String(l.pararNoPrimeiro).padStart(16), String(l.nos).padStart(8));
    }
  },

  translacao() {
    console.log('A translacao: fixar o ponto 0');
    console.log('-----------------------------');
    console.log('  todo cap pode ser deslocado para conter 0, entao fixar 0 nao');
    console.log('  perde maximo nenhum. Quanto isso corta de verdade?');
    console.log('  n  com      sem      corte   mesmo maximo?');
    for (const l of tabelaTranslacao(3)) {
      console.log('  %s  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.comTranslacao).padStart(7),
        String(l.semTranslacao).padStart(7), (l.corte.toFixed(2) + 'x').padStart(6),
        String(l.mesmoMaximo).padStart(13));
    }
  },

  quantos() {
    console.log('Quantos caps do tamanho maximo existem');
    console.log('--------------------------------------');
    console.log('  contados como CONJUNTOS, cada um uma vez so');
    console.log('  n  maximo  quantos  provado?');
    for (const l of tabelaQuantosMaximos(3)) {
      console.log('  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.maximo).padStart(6),
        String(l.quantos).padStart(7), String(l.provado).padStart(8));
    }
  },

  densidade() {
    console.log('Que fracao do espaco um cap maximo ocupa');
    console.log('----------------------------------------');
    console.log('  n  pontos  melhor  densidade  provado?');
    for (const l of tabelaDensidade(4)) {
      console.log('  %s  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.pontos).padStart(6),
        String(l.melhorAchado).padStart(6), l.densidade.toFixed(4).padStart(9),
        String(l.provado).padStart(8));
    }
  },

  arvore() {
    console.log('Que fracao da arvore cheia a busca visita');
    console.log('-----------------------------------------');
    console.log('  a arvore cheia tem 2^(3^n) nos: um por subconjunto');
    console.log('  n  nos      arvore cheia          partes por milhao');
    for (const l of tabelaFracaoDaArvore(3)) {
      console.log('  %s  %s  %s  %s',
        String(l.n).padStart(2), String(l.nos).padStart(7),
        l.arvoreCheia.padStart(20), String(l.porMilhao).padStart(17));
    }
  },

  juiz() {
    console.log('O juiz confere os exemplos da busca');
    console.log('-----------------------------------');
    console.log('  o juiz abre todas as C(k,3) trincas e soma coordenada a');
    console.log('  coordenada; a busca nunca olha trinca nenhuma');
    for (const l of exemplosConferidosPeloJuiz(4)) {
      console.log('  n=%s  cap de %s pontos  juiz diz: %s',
        String(l.n).padStart(2), String(l.tamanho).padStart(2),
        l.ehCap ? 'e cap' : 'NAO E CAP');
    }
    console.log();
    console.log('  e os maximos conhecidos, para comparar: %s',
      MAXIMOS_CONHECIDOS.slice(1).join(', '));
  },

  exemplo() {
    console.log('Um cap maximo de cada dimensao, em coordenadas');
    console.log('----------------------------------------------');
    for (let n = 1; n <= 4; n++) {
      const r = buscar(n, { alvo: MAXIMOS_CONHECIDOS[n], pararNoPrimeiro: true });
      console.log('  n=%d (%d pontos): %s', n, r.exemplo.length, r.exemplo.join(' '));
    }
  },
};

const pedida = process.argv[2];
const nomes = pedida ? [pedida] : Object.keys(tabelas);
for (const nome of nomes) {
  if (!tabelas[nome]) {
    console.error('tabela desconhecida: %s', nome);
    console.error('conhecidas: %s', Object.keys(tabelas).join(', '));
    process.exit(1);
  }
  tabelas[nome]();
  console.log();
}
