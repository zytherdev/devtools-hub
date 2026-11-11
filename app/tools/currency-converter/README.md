# Currency converter

**Status:** Implemented

Converts an amount from one currency to another using exclusively the conversion rate provided by the user in the options. Processing is local: there are no network calls, rate lookups, or real-time updates.

## Input and options

The input must be a finite decimal number with up to 100 characters. Scientific notation, text, and non-finite values are not accepted.

The default options are:

~~~json
{"from":"USD","to":"EUR","rate":"1","precision":"2"}
~~~

`from` and `to` must contain exactly three ASCII letters; lowercase letters are normalized to uppercase. `rate` is the amount of the target currency corresponding to one unit of the source currency and must be a finite decimal number greater than zero. `precision` is an integer from 0 to 6 and defines the number of decimal places in the rounded result. Unknown options, non-text option values, and option text longer than 100 characters are rejected.

**Important:** the default rate `1` is only an example/placeholder value, not a real exchange rate. Replace it with a known rate appropriate for the desired conversion before using the result. The tool does not verify, update, or recommend rates.

## Example

To convert 100 USD to EUR at a declared rate of 0.92 EUR per USD, use the input `100` and these options:

~~~json
{"from":"USD","to":"EUR","rate":"0.92","precision":"2"}
~~~

The output is JSON containing the source and target currencies, the declared rate, the input amount, and the rounded result. For the example above:

~~~json
{"from":"USD","to":"EUR","rate":0.92,"amount":100,"result":92}
~~~

## Privacy and limitations

All conversion takes place locally, with no network calls. The result reflects only the rate provided by the user and the chosen precision; it does not constitute an up-to-date quote or financial advice.

## Files

- [definition.ts](definition.ts): tool metadata and default options.
- [logic.ts](logic.ts): validation and local conversion.
- [Tool.tsx](Tool.tsx): shared `UniversalTool` interface.
- Dedicated test: [tests/tools/currency-converter.test.cjs](../../../tests/tools/currency-converter.test.cjs).
