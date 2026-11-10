# Gerador de QR Code

Gera um QR Code a partir de texto ou URL. A ferramenta usa o codificador `qrcode` instalado localmente e retorna um único documento SVG, compatível com a pré-visualização compartilhada e o download em `.svg`. Não gera PNG nem outros formatos.

## Opções

Informe as opções como um objeto JSON:

- `errorCorrection`: `L`, `M`, `Q` ou `H`; padrão `M`.
- `margin`: largura da zona livre em módulos, número inteiro de 0 a 16; padrão `4`.
- `scale`: escala SVG em pixels por módulo, número inteiro de 1 a 16; padrão `4`.

Opções desconhecidas e valores fora desses intervalos são rejeitados. A entrada deve conter ao menos um caractere e ter no máximo 1.200 bytes UTF-8. O SVG gerado também é limitado a 512.000 caracteres. Algumas entradas próximas do limite podem exceder a capacidade do QR Code quando usado um nível mais alto de correção de erros; se isso acontecer, tente uma entrada mais curta ou um nível mais baixo.

## Privacidade e limitações

A codificação é feita localmente no navegador com a dependência `qrcode` incluída no aplicativo; a entrada não é enviada a um serviço. A saída é apenas SVG. Não se usa um serviço externo para validar ou ler QR Codes, e a ferramenta não garante que todas as URLs de destino estejam acessíveis nem que um código impresso possa ser lido em qualquer condição.
