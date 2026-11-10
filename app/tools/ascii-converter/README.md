# Conversor ASCII

**Status:** Implementado

Converte caracteres ASCII em códigos numéricos separados por espaços e faz o caminho inverso. Escolha a direção e a representação decimal, hexadecimal ou binária nas opções da ferramenta.

## Uso e opções

O objeto de opções aceita exatamente os seguintes valores em texto:

- `mode`: `text-to-codes` ou `codes-to-text` (padrão: `text-to-codes`).
- `base`: `decimal`, `hex` ou `binary` (padrão: `decimal`). Define a representação numérica tanto na codificação quanto na decodificação.

Por exemplo, a entrada `ASCII` com as opções padrão produz `65 83 67 73 73`. Para decodificar, use `mode: "codes-to-text"`; a entrada hexadecimal `41 53 43 49 49` requer `base: "hex"`, e a entrada binária requer `base: "binary"`.

A entrada numérica deve conter uma sequência de dígitos separada por um ou mais espaços em branco. Cada item deve usar apenas dígitos válidos para a base escolhida, sem prefixos `0x`/`0b`, pontuação ou separadores como vírgulas. Cada valor deve estar no intervalo inclusivo de 0 a 127. Zeros à esquerda são aceitos; dígitos hexadecimais não diferenciam maiúsculas de minúsculas. Entrada vazia ou composta apenas por espaços produz saída vazia.

## ASCII e caracteres de controle

O conversor aceita toda a faixa ASCII de 7 bits. No modo de conversão de texto para códigos, cada caractere precisa ter um ponto de código Unicode entre 0 e 127. Os controles C0 (0–31), os caracteres imprimíveis (32–126) e DEL (127) são preservados e codificados. Qualquer ponto de código acima de 127 — incluindo caracteres acentuados, pontuação tipográfica e emojis — é rejeitado, com a posição e o valor Unicode informados; nada é transliterado nem substituído silenciosamente.

No modo de códigos para texto, todos os valores entre 0 e 127 são convertidos no caractere correspondente. O ASCII imprimível (32–126) aparece normalmente; os controles (0–31 e 127) são incluídos literalmente e podem parecer invisíveis ou produzir efeitos especiais em alguns editores e terminais. Tenha cuidado ao copiar esses controles. Esta ferramenta trata apenas ASCII de 7 bits; não é um decodificador de arquivos binários ou de bytes arbitrários.

## Limites e privacidade

A entrada é limitada a 100.000 unidades de código UTF-16 e a saída gerada a 800.000 caracteres. Opções inválidas, itens malformados e números fora do intervalo retornam um erro explicativo. O processamento é determinístico e inteiramente local no navegador: nenhum dado é enviado a serviços externos nem armazenado pela ferramenta.

## Exemplo

Entrada: `ASCII`<br>
Opções: `{"mode":"text-to-codes","base":"decimal"}`<br>
Saída: `65 83 67 73 73`
