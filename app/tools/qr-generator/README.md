# QR Code Generator

Generates a QR Code from text or a URL. The tool uses the locally installed `qrcode` encoder and returns a single SVG document, compatible with the shared preview and `.svg` download. It does not generate PNG or other formats.

## Options

Provide the options as a JSON object:

- `errorCorrection`: `L`, `M`, `Q` or `H`; default `M`.
- `margin`: width of the quiet zone in modules, an integer from 0 to 16; default `4`.
- `scale`: SVG scale in pixels per module, an integer from 1 to 16; default `4`.

Unknown options and values outside these ranges are rejected. The input must contain at least one character and be no more than 1,200 UTF-8 bytes. The generated SVG is also limited to 512,000 characters. Some inputs near the limit may exceed the QR Code capacity when using a higher error correction level; if this happens, try a shorter input or a lower level.

## Privacy and limitations

Encoding is performed locally in the browser using the `qrcode` dependency included in the application; the input is not sent to a service. The output is SVG only. No external service is used to validate or read QR Codes, and the tool does not guarantee that all destination URLs are accessible or that a printed code can be read under every condition.
