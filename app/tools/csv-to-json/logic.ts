type CsvOptions = Record<string, string>;

type CsvRecord = {
  fields: string[];
  rowNumber: number;
  blank: boolean;
};

type ParserLimits = {
  maxInputLength: number;
  maxRows: number;
  maxColumns: number;
  maxCellLength: number;
};

const DEFAULT_LIMITS: ParserLimits = {
  maxInputLength: 5_000_000,
  maxRows: 100_000,
  maxColumns: 10_000,
  maxCellLength: 1_000_000,
};

function optionBoolean(options: CsvOptions, name: string, fallback: boolean): boolean {
  const value = options[name];
  if (value === undefined) return fallback;
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`Invalid option "${name}": expected "true" or "false".`);
}

function optionLimit(options: CsvOptions, name: keyof ParserLimits): number {
  const value = options[name];
  if (value === undefined) return DEFAULT_LIMITS[name];
  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error(`Invalid option "${name}": expected a positive integer.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new Error(`Invalid option "${name}": expected a safe positive integer.`);
  }
  return parsed;
}

function contextualError(message: string, row: number, column: number): Error {
  return new Error(`${message} (row ${row}, column ${column}).`);
}

function parseCsv(input: string, delimiter: string, limits: ParserLimits): CsvRecord[] {
  if (input.length > limits.maxInputLength) {
    throw new Error(`CSV input exceeds maxInputLength (${limits.maxInputLength} characters).`);
  }

  const records: CsvRecord[] = [];
  const fields: string[] = [];
  let field = '';
  let state: 'start' | 'unquoted' | 'quoted' | 'afterQuote' = 'start';
  let rowHasSyntax = false;
  let recordStarted = false;

  const append = (text: string): void => {
    field += text;
    if (field.length > limits.maxCellLength) {
      throw contextualError(`Cell exceeds maxCellLength (${limits.maxCellLength} characters)`, records.length + 1, fields.length + 1);
    }
  };

  const finishField = (): void => {
    if (fields.length >= limits.maxColumns) {
      throw contextualError(`Row exceeds maxColumns (${limits.maxColumns})`, records.length + 1, fields.length + 1);
    }
    fields.push(field);
    field = '';
    state = 'start';
  };

  const finishRecord = (): void => {
    finishField();
    const rowNumber = records.length + 1;
    if (rowNumber > limits.maxRows) {
      throw new Error(`CSV exceeds maxRows (${limits.maxRows}) at row ${rowNumber}.`);
    }
    records.push({ fields: fields.splice(0), rowNumber, blank: !rowHasSyntax });
    rowHasSyntax = false;
    recordStarted = false;
  };

  for (let index = 0; index < input.length; index += 1) {
    const character = input[index];

    if (state === 'quoted') {
      if (character === '"') {
        if (input[index + 1] === '"') {
          append('"');
          index += 1;
        } else {
          state = 'afterQuote';
        }
      } else {
        append(character);
      }
      continue;
    }

    if (character === '\r' || character === '\n') {
      if (character === '\r' && input[index + 1] === '\n') index += 1;
      finishRecord();
      continue;
    }

    if (state === 'afterQuote') {
      if (character === delimiter) {
        rowHasSyntax = true;
        recordStarted = true;
        finishField();
        if (fields.length >= limits.maxColumns) {
          throw contextualError(`Row exceeds maxColumns (${limits.maxColumns})`, records.length + 1, fields.length + 1);
        }
      } else {
        throw contextualError('Unexpected character after a closing quote', records.length + 1, fields.length + 1);
      }
      continue;
    }

    if (character === delimiter) {
      rowHasSyntax = true;
      recordStarted = true;
      finishField();
      if (fields.length >= limits.maxColumns) {
        throw contextualError(`Row exceeds maxColumns (${limits.maxColumns})`, records.length + 1, fields.length + 1);
      }
      continue;
    }

    if (character === '"') {
      if (state !== 'start') {
        throw contextualError('Quote found inside an unquoted field', records.length + 1, fields.length + 1);
      }
      rowHasSyntax = true;
      recordStarted = true;
      state = 'quoted';
      continue;
    }

    rowHasSyntax = true;
    recordStarted = true;
    state = 'unquoted';
    append(character);
  }

  if (state === 'quoted') {
    throw contextualError('Unterminated quoted field', records.length + 1, fields.length + 1);
  }
  if (recordStarted || fields.length > 0 || field.length > 0 || rowHasSyntax) finishRecord();
  return records;
}

function makeHeaders(rawHeaders: string[], trimHeaders: boolean): string[] {
  const used = new Set<string>();
  return rawHeaders.map((rawHeader, index) => {
    const normalized = trimHeaders ? rawHeader.trim() : rawHeader;
    const base = normalized.length > 0 ? normalized : `column_${index + 1}`;
    let candidate = base;
    let suffix = 2;
    while (used.has(candidate)) {
      candidate = `${base}_${suffix}`;
      suffix += 1;
    }
    used.add(candidate);
    return candidate;
  });
}

function inferValue(value: string): string | number | boolean | null {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(value)) {
    const number = Number(value);
    if (Number.isFinite(number) && (!Number.isInteger(number) || Number.isSafeInteger(number))) return number;
  }
  return value;
}

/** Parse CSV text into JSON, honoring the string-valued options supplied by the tool engine. */
export function csvToJson(input: string, options: Record<string, string>): string {
  if (typeof input !== 'string') throw new Error('CSV input must be a string.');
  const safeOptions: CsvOptions = options ?? {};

  const delimiter = safeOptions.delimiter ?? ',';
  if (delimiter.length !== 1 || delimiter === '"' || delimiter === '\r' || delimiter === '\n') {
    throw new Error('Invalid option "delimiter": expected exactly one character other than a quote or newline.');
  }

  const headersEnabled = optionBoolean(safeOptions, 'headers', true);
  const trimHeaders = optionBoolean(safeOptions, 'trimHeaders', false);
  const infer = optionBoolean(safeOptions, 'infer', false);
  const structure = safeOptions.structure ?? 'objects';
  if (structure !== 'objects' && structure !== 'arrays') {
    throw new Error('Invalid option "structure": expected "objects" or "arrays".');
  }
  const rowWidth = safeOptions.rowWidth ?? 'pad';
  if (rowWidth !== 'pad' && rowWidth !== 'error') {
    throw new Error('Invalid option "rowWidth": expected "pad" or "error".');
  }
  const blankRows = safeOptions.blankRows ?? 'skip';
  if (blankRows !== 'skip' && blankRows !== 'preserve') {
    throw new Error('Invalid option "blankRows": expected "skip" or "preserve".');
  }
  const indentText = safeOptions.indent ?? '2';
  if (!/^(?:[0-8])$/.test(indentText)) {
    throw new Error('Invalid option "indent": expected an integer from 0 through 8.');
  }
  const indent = Number(indentText);
  const limits: ParserLimits = {
    maxInputLength: optionLimit(safeOptions, 'maxInputLength'),
    maxRows: optionLimit(safeOptions, 'maxRows'),
    maxColumns: optionLimit(safeOptions, 'maxColumns'),
    maxCellLength: optionLimit(safeOptions, 'maxCellLength'),
  };

  const records = parseCsv(input, delimiter, limits);
  const headerRecord = headersEnabled ? records[0] : undefined;
  const sourceRows = records.slice(headerRecord ? 1 : 0).filter((record) => blankRows === 'preserve' || !record.blank);
  const rawHeaders = headerRecord?.fields ?? [];
  const width = headersEnabled
    ? rawHeaders.length
    : rowWidth === 'pad'
      ? sourceRows.reduce((maximum, record) => Math.max(maximum, record.fields.length), 0)
      : (sourceRows[0]?.fields.length ?? 0);

  if (headersEnabled && headerRecord) {
    for (const record of sourceRows) {
      if (rowWidth === 'error' && record.fields.length !== width) {
        throw contextualError(`Expected ${width} columns but found ${record.fields.length}`, record.rowNumber, Math.min(record.fields.length, width) + 1);
      }
      if (record.fields.length > width) {
        throw contextualError(`Row has ${record.fields.length} columns but the header has ${width}`, record.rowNumber, width + 1);
      }
    }
  } else if (rowWidth === 'error' && sourceRows.length > 0) {
    for (const record of sourceRows) {
      if (record.fields.length !== width) {
        throw contextualError(`Expected ${width} columns but found ${record.fields.length}`, record.rowNumber, Math.min(record.fields.length, width) + 1);
      }
    }
  }

  const headers = makeHeaders(rawHeaders.length > 0 ? rawHeaders : Array.from({ length: width }, (_, index) => `column_${index + 1}`), trimHeaders);
  const data: unknown[] = sourceRows.map((record) => {
    const values = record.fields.slice();
    while (values.length < width) values.push('');
    const converted = values.map((value) => infer ? inferValue(value) : value);
    if (structure === 'arrays') return converted;

    const object: Record<string, unknown> = Object.create(null) as Record<string, unknown>;
    for (let index = 0; index < width; index += 1) {
      object[headers[index]] = converted[index];
    }
    return object;
  });

  return JSON.stringify(data, null, indent);
}

export function run(input: string, options: Record<string, string> = {}): string {
  return csvToJson(input, options)
}
