function parseCsv(source: string, delimiter: string) {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false
  for (let i = 0; i < source.length; i++) {
    const char = source[i]
    if (quoted) {
      if (char === '"' && source[i + 1] === '"') { field += '"'; i++ }
      else if (char === '"') quoted = false
      else field += char
    } else if (char === '"' && field.length === 0) quoted = true
    else if (char === delimiter) { row.push(field); field = '' }
    else if (char === '\n' || char === '\r') {
      if (char === '\r' && source[i + 1] === '\n') i++
      row.push(field); field = ''
      if (row.some(cell => cell !== '') || rows.length) rows.push(row)
      row = []
    } else field += char
  }
  if (quoted) throw new Error('CSV contains an unterminated quoted field.')
  row.push(field)
  if (row.some(cell => cell !== '') || rows.length) rows.push(row)
  return rows
}

function quoteCsvField(value: string, delimiter: string) {
  const clean = value.replace(/\r\n?/g, '\n')
  return clean.includes(delimiter) || clean.includes('"') || clean.includes('\n') || /^\s|\s$/.test(clean)
    ? `"${clean.replace(/"/g, '""')}"` : clean
}

function getDelimiter(option: string | undefined) {
  if (option === 'tab' || option === '\\t') return '\t'
  if (option === 'semicolon') return ';'
  return option?.length === 1 ? option : ','
}

export function run(input: string, options: Record<string, string>): string | Promise<string> {
  if (!input.trim()) throw new Error('Paste data to process.')
  const delimiter = getDelimiter(options.delimiter)
  const rows = parseCsv(input, delimiter)
  return rows.map(row => row.map(value => quoteCsvField(value, delimiter)).join(delimiter)).join('\n')
}
