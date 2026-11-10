# Gerador de senhas

**Status:** Implementado

Gera uma ou mais senhas com segurança criptográfica, inteiramente no navegador. Cada senha é exibida em uma linha.

## Opções

As opções são informadas como strings JSON no painel compartilhado de opções:

- `length`: comprimento da senha, de 8 a 256 caracteres (padrão `"20"`).
- `count`: quantidade de senhas, de 1 a 100 (padrão `"1"`).
- `uppercase`, `lowercase`, `numbers`, `symbols`: habilitam ou desabilitam cada classe de caracteres (todas são `"true"` por padrão). Cada classe habilitada estará representada em todos os resultados.
- `excludeAmbiguous`: quando `"true"`, remove `I`, `l`, `1`, `O`, `0` e `|` (padrão `"false"`).

É necessário habilitar pelo menos uma classe. Se todas as opções forem desativadas, a geração falha com uma mensagem de erro na interface. A ferramenta não utiliza texto de entrada.

## Segurança e privacidade

As escolhas aleatórias usam `Web Crypto getRandomValues` do navegador e amostragem por rejeição; `Math.random` nunca é usado. O amostrador escolhe uniformemente entre todas as strings possíveis com o comprimento solicitado que atendem às classes habilitadas, evitando substituir caracteres forçadamente. Se o Web Crypto não estiver disponível ou falhar, a geração é interrompida, sem recorrer a uma fonte de aleatoriedade mais fraca.

A geração é local: não há solicitações de rede e esta ferramenta não salva nem envia os segredos. Os resultados permanecem visíveis na página atual até serem apagados ou até a navegação para outra página. A interface compartilhada oferece ações manuais de cópia e download; essas ações do usuário podem transferir ou persistir um segredo, conforme o navegador e o destino escolhido. Para contas críticas, use um gerenciador de senhas confiável e revise a senha gerada antes de armazená-la.

## Limites

A ferramenta permite até 256 caracteres por senha e até 100 senhas por execução. É necessário que o navegador/ambiente ofereça Web Crypto; não há alternativa por serviços externos.
