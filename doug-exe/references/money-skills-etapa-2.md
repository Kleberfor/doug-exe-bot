# ETAPA 2 — A COMPRESSÃO

**Objetivo:** encontrar o micro-nicho onde a skill do usuário vale o máximo de dinheiro possível.

---

## Princípios fundamentais

1. **Contexto define preço, não skill.** A mesma habilidade vale 30x mais dependendo do contexto. Um nutricionista genérico cobra R$250. Um nutricionista especializado em perimenopausa cobra R$4.500. Mesma formação, outro contexto.

2. **Vantagem injusta vence competência genérica.** Você não quer encontrar onde é competente — quer encontrar onde é extraordinário. Onde sua combinação de experiência, história e repetição cria assimetria real.

3. **Especificidade é magnética pra quem se encaixa.** Quando você fala muito específico, quem está fora passa reto. E é isso que você quer. Quem está dentro sente que você escreveu pra ele.

4. **Nível de dor define disposição a pagar.** Quanto mais agudo, urgente e custoso o problema, mais o cliente paga. Compressão forte mira na dor mais específica e mais dolorida.

---

## Pré-requisito

Confirme que você tem a skill travada da Etapa 1 no contexto. Se o usuário entrou direto nessa etapa pela opção [b] do roteamento, pergunte antes:

```
Antes de comprimir, preciso saber qual skill estamos trabalhando.

Qual é a skill que você travou na Etapa 1?
```

---

## Inputs necessários

Depois de confirmar a skill, peça os inputs:

```
Pra comprimir o nicho, preciso que você liste 3 a 5 clientes reais que você já atendeu com essa skill. Pra cada um:

- Perfil específico (profissão, estágio, situação)
- Resultado que você entregou (numérico quando possível)

Se você ainda não atendeu clientes pagantes, lista 3 a 5 pessoas que te procuraram pedindo ajuda — mesmo gratuito conta como dado.
```

---

## Prompt a executar internamente

> DOUG, aula 1.2 — Compressão de Nicho. Use a skill que a gente travou na aula 1.1.
>
> Exemplos de clientes reais que eu já atendi com essa skill (perfil + resultado entregue): [preencher 3 a 5 casos]
>
> Faça agora: (1) liste de 5 a 10 tipos de comprador reais que pagam por essa skill hoje; (2) cruze com minha experiência e aponte os 3 subgrupos em que eu sou extraordinário, não só competente; (3) pra cada um, construa uma compressão de nicho usando a fórmula [tipo específico] + [estágio específico] + [problema específico], me entregando uma frase pronta; (4) rankeie os 3 micro-nichos por potencial de receita e recomende qual começar. Guarde o micro-nicho escolhido.

---

## Formato de entrega do output

1. **Lista de tipos de comprador reais** que pagam por essa skill hoje
2. **Os 3 subgrupos de vantagem injusta** (onde o usuário é extraordinário, não só competente)
3. **As 3 compressões prontas** — uma frase cada, usando a fórmula tipo + estágio + problema
4. **Ranking + recomendação** de qual começar
5. **Pergunta de fechamento obrigatória:**

> "Qual dessas 3 te causa um leve desconforto do tipo 'isso é muito específico'? É um ótimo sinal. Escolhe UMA."

---

## Checklist de validação interna

- [ ] A compressão final usa palavras específicas do nicho, não jargão genérico
- [ ] Tem os 3 eixos (tipo + estágio + problema)
- [ ] Cabe em uma única frase
- [ ] Não usa palavras como "empresas", "pessoas", "profissionais" sem qualificador
- [ ] Você consegue visualizar uma pessoa real que se encaixa perfeitamente

Se falhar, regenere internamente antes de mostrar.

---

## Handoff pra próxima etapa

Quando o usuário escolher o micro-nicho, guarde no contexto:

```
Micro-nicho travado: [frase da compressão escolhida]

Próximo passo: O Avatar. Essa é a etapa mais importante do módulo — vamos dissecar neurologicamente quem está dentro desse nicho.

Quer continuar agora ou parar?
```
