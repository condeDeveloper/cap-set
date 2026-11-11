# cap-set

Conjuntos sem três em linha no espaço afim sobre três símbolos, varridos ponto
a ponto. O espaço é `F_3^n`: `3^n` pontos, cada um um vetor de `n` coordenadas
em `{0,1,2}`. Três pontos distintos estão em linha quando a soma deles é zero
coordenada a coordenada — e isso faz com que **dois pontos determinem o
terceiro de forma única**. Um *cap* é um conjunto que não contém nenhuma dessas
trincas.

É o jogo SET escrito em matemática: com `n = 4` as 81 cartas do baralho são os
81 pontos, e um cap é uma mesa sem nenhuma jogada possível.

Sem dependência nenhuma. 29 testes.

## O que este repositório mede

| | |
|---|---|
| varredura | espaço inteiro até `n = 3` (27 pontos), com prova |
| `n = 4` | 81 pontos: acha, **não prova** — e é esse o assunto |
| juiz | abre todas as `C(k,3)` trincas; a busca nunca olha trinca |
| maiores achados | 2, 4, 9, 20 — batem com os conhecidos |

## Os quatro achados

**1. Achar custa 3.850 nós; provar não fecha em 60.000.000.** Em `n = 4`,
encontrar um cap de 20 pontos custa 3.850 nós e termina em centésimos de
segundo. Provar que não existe um de 21 não fechou em sessenta milhões de nós —
pelo menos **15.584 vezes mais caro**, e o número é um piso, não um valor. A
distância entre exibir um objeto e fechar o caso é o projeto inteiro.

**2. A ordem 3 tem 2.106 caps máximos; a ordem 2 tem 54.** Contados como
conjuntos, cada um uma vez só. Os de nove pontos em `F_3^3` são muitos, mas
todos têm o mesmo tamanho: nove é o teto, e 2.106 arranjos diferentes o
alcançam.

**3. A poda vale 8,37x para provar e 1,12x para achar.** Medido em tabela
cruzada, com a outra metade fixada em cada célula. Cortar pelo limite superior
quase não ajuda quem só quer um exemplo — o primeiro cap aparece antes de o
limite apertar. Quem paga a conta da prova é quem recebe o desconto.

**4. A translação corta 3,60x, não 27x.** Todo cap pode ser deslocado para
conter o ponto 0, então fixar 0 não perde máximo nenhum: é simetria legítima.
Eu esperava que ela cortasse pelo número de translações, `3^n = 27` em `n = 3`.
Corta 3,60. A busca em ordem crescente de índice já estava descartando quase
tudo que a translação descartaria.

## Como rodar

```bash
node --test testes/*.test.js      # os testes
node ferramentas/medidor.js       # todas as tabelas
node ferramentas/medidor.js provar
```

## As tabelas

### O maior cap por dimensão

```
  n  pontos  retas  melhor  provado?  conhecido  nos
   1       3      1       2      true          2           3
   2       9     12       4      true          4          26
   3      27    117       9      true          9       10505
   4      81   1080      20     false         20    60000001
```

`provado = false` quer dizer que a varredura **não fechou o espaço**: a coluna
`melhor` passa a significar "o melhor que encontrei", não "o máximo". A coluna
`conhecido` fica ao lado para mostrar que o melhor achado já bate com o valor
estabelecido na literatura — mas bater não é provar, e a tabela não finge que é.

### Achar contra provar

```
  n  alvo  nos p/ achar  nos p/ provar  razao
   2     4             5             26    5x
   3     9            17          10505    618x
   4    20          3850       60000001  > 15584x
```

### A poda, em tabela cruzada (`n = 3`)

```
  poda   para-no-primeiro  nos
  true   true                 17
  true   false             10505
  false  true                 19
  false  false             87934
```

Medir a poda sozinha e somar o ganho no papel engana: o efeito dela depende do
que a busca já encontrou. Por isso as duas metades variam juntas e cada célula
diz qual era a outra metade.

### A translação

```
  n  com      sem      corte   mesmo maximo?
   1        3        3   1.00x           true
   2       26       60   2.31x           true
   3    10505    37787   3.60x           true
```

### Quantos caps máximos existem

```
  n  maximo  quantos
   1       2        3
   2       4       54
   3       9     2106
```

## O que as medidas me corrigiram

**A contagem dos máximos estava errada em silêncio, e quase passou.** A poda
corta o ramo que só consegue **empatar** com o melhor já encontrado — o que é
exatamente certo para *achar* o máximo e silenciosamente errado para *contá-los*.
Com a poda normal eu media 15 caps máximos em `n = 2`; o número é **54**. A
conta à mão confirma o 54: `C(9,4) = 126` subconjuntos de quatro pontos, menos
os `12 × 6 = 72` que contêm uma reta inteira. O conserto foi um limite estrito
para quando o objetivo é contar, e o teste que cruza a contagem podada com a
varredura sem poda nenhuma existe para isso não voltar.

**O orçamento de nós estourava o próprio teto em um.** Eu contava o nó raiz
*depois* da busca, então ele escapava da checagem e o total voltava 101 com teto
de 100. O teste que prende `nos <= orcamento` pegou na primeira rodada.

**Eu esperava que a translação cortasse 27x em `n = 3`.** Fixar o ponto 0
descarta uma classe inteira de caps deslocados, e são `3^n` translações. Corta
3,60x. Virou o achado 4, e a lição é a de sempre: ganho de simetria se mede, não
se deduz do tamanho do grupo.

**A primeira busca não fechava `n = 4` nem em meia hora.** O corte original
comparava o melhor com os *índices* restantes (`m - q`), o que é quase sempre
folgado demais — a maioria desses índices já está bloqueada. Contar os
candidatos que de fato ainda cabem foi o que fez `n = 3` cair de 87.934 para
10.505 nós. Ainda assim `n = 4` não fecha, e a tabela diz isso em vez de copiar
o valor conhecido como se fosse meu.

## Os arquivos

```
src/espaco.js     o espaco F_3^n, a reta e o terceiro ponto
src/busca.js      a busca, com contador de bloqueio e limite superior
src/juiz.js       trinca a trinca, mais os maximos conhecidos
src/medidas.js    uma funcao por tabela
ferramentas/medidor.js
testes/nucleo.test.js    15 testes
testes/medidas.test.js    9 testes
testes/pesados.test.js    5 testes, n = 4
```

O juiz não importa nada da busca e não usa a tabela de terceiros: a busca
decide pela via rápida ("este ponto completa algum par que já escolhi?") e o
juiz pela definição crua (abre as trincas e soma). Se os dois concordam, o
número vale.
