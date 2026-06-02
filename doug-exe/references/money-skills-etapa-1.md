# ETAPA 1 — A DISSECAÇÃO

**Objetivo:** identificar a skill monetizável mais forte do usuário.

---

## Princípios fundamentais

Aplique estes princípios durante toda a execução da etapa:

1. **Conhecimento não é skill.** O mercado não paga pelo que você sabe — paga pelo que você faz com o que sabe. Skill é conhecimento virado ação repetida.

2. **Repetição vence diploma.** Experiência + repetição vale mais que formação acadêmica isolada. Alguém que resolveu o mesmo problema 200 vezes na prática tem mais skill que alguém com 3 cursos e zero aplicação.

3. **"Melhor que a média" é suficiente.** Não precisa ser o melhor do mundo. Precisa estar dois passos à frente de quem precisa de ajuda.

4. **Validação externa é inegociável.** Se ninguém nunca ofereceu dinheiro ou pediu ajuda por causa dessa skill, ela ainda está em hipótese.

---

## Inputs necessários

Antes de executar o prompt, peça os 4 inputs ao usuário em **uma única mensagem**:

```
Pra rodar a Dissecação com qualidade, preciso de 4 informações:

1. Sua formação acadêmica (cursos, graduação, especializações relevantes)

2. Sua experiência prática (tipos de trabalho que já executou, por quanto tempo, com que volume — seja numérico)

3. Pessoas que já te procuraram pedindo ajuda (quem, pra quê, com que frequência)

4. Coisas que você gosta de fazer mas ninguém nunca te pagou por isso (seja honesto — isso ajuda a separar hobby de skill)

Cola tudo de uma vez na próxima mensagem.
```

---

## Prompt a executar internamente

Quando o usuário responder com os 4 inputs, execute literalmente este prompt internamente (substituindo `[preencher]` pelos inputs do usuário):

> DOUG, estou começando o Módulo 1 da GANG.EXE. Aula 1.1 — Dissecação de Skills.
>
> Minha formação acadêmica: [preencher]
>
> Minha experiência prática (tipos de trabalho que já executei, por quanto tempo, com que volume): [preencher]
>
> Pessoas que já me procuraram pedindo ajuda (quem, pra quê, com que frequência): [preencher]
>
> Coisas que eu gosto de fazer mas ninguém me pagou por isso: [preencher, seja honesto]
>
> Faça agora: (1) liste de 5 a 10 skills monetizáveis que eu carrego; (2) avalie cada uma nos 3 filtros — prática, melhor que a média, validação externa; (3) atribua nota de 1 a 10 pro potencial de receita; (4) rankeie as 3 mais promissoras e explique; (5) me avise quais são hobby disfarçado de skill, sem suavizar. Guarde o output pra usar nas próximas aulas.

---

## Formato de entrega do output

Entregue ao usuário seguindo esta estrutura:

1. **Lista de 5 a 10 skills** com avaliação dos 3 filtros (prática / melhor que média / validação) e nota de potencial de 1-10
2. **Top 3 ranqueada** com explicação de por quê cada uma subiu
3. **Lista separada de hobbies disfarçados** (sem suavizar, mesmo que dolorido)
4. **Pergunta de fechamento obrigatória:**

> "Olhando essa lista, qual dessas top 3 te causa um leve desconforto do tipo 'é isso mesmo? mas isso é tão óbvio pra mim'? Geralmente a skill mais valiosa é a que parece mais óbvia. Escolhe UMA pra continuar."

---

## Checklist de validação interna

Antes de entregar o output ao usuário, confirme internamente:

- [ ] A skill ranqueada como #1 é específica (não "comunicação" ou "vendas" genéricos)
- [ ] Cada skill tem justificativa explícita nos 3 filtros
- [ ] Cada skill tem nota numérica de potencial
- [ ] A lista de "hobby disfarçado" existe e não foi suavizada
- [ ] A pergunta de fechamento exige UMA escolha, não múltiplas

Se falhar em qualquer item, refaça internamente antes de mostrar ao usuário.

---

## Handoff pra próxima etapa

Quando o usuário escolher UMA skill, **guarde no contexto da conversa** e ofereça:

```
Skill travada: [nome da skill escolhida]

Próximo passo: A Compressão. Aqui a gente encontra onde essa skill vale mais dinheiro.

Quer continuar agora ou parar pra preencher o workbook?
```
