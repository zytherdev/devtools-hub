export function cssToObject(
  css: string,
): string {
  const declarations =
    splitDeclarations(css)

  const properties: string[] = []

  for (const declaration of declarations) {
    const separator =
      findPropertySeparator(declaration)

    if (separator === -1) {
      continue
    }

    const property = declaration
      .slice(0, separator)
      .trim()

    const value = declaration
      .slice(separator + 1)
      .trim()

    if (!property || !value) {
      continue
    }

    const key =
      cssPropertyToJSX(property)

    properties.push(
      `${key}: ${toJSValue(value)}`,
    )
  }

  return `{ ${properties.join(', ')} }`
}

function splitDeclarations(
  css: string,
): string[] {
  const result: string[] = []

  let start = 0
  let quote = ''
  let parentheses = 0

  for (let i = 0; i < css.length; i++) {
    const char = css[i]

    if (quote) {
      if (
        char === quote &&
        css[i - 1] !== '\\'
      ) {
        quote = ''
      }

      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === '(') {
      parentheses++
      continue
    }

    if (char === ')') {
      parentheses--
      continue
    }

    if (
      char === ';' &&
      parentheses === 0
    ) {
      result.push(
        css.slice(start, i),
      )

      start = i + 1
    }
  }

  result.push(css.slice(start))

  return result
}

function findPropertySeparator(
  declaration: string,
): number {
  let quote = ''
  let parentheses = 0

  for (
    let i = 0;
    i < declaration.length;
    i++
  ) {
    const char = declaration[i]

    if (quote) {
      if (
        char === quote &&
        declaration[i - 1] !== '\\'
      ) {
        quote = ''
      }

      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === '(') {
      parentheses++
      continue
    }

    if (char === ')') {
      parentheses--
      continue
    }

    if (
      char === ':' &&
      parentheses === 0
    ) {
      return i
    }
  }

  return -1
}

function cssPropertyToJSX(
  property: string,
): string {
  const trimmed = property.trim()

  // CSS custom properties stay untouched.
  if (trimmed.startsWith('--')) {
    return `'${trimmed}'`
  }

  // Vendor prefixes
  if (trimmed.startsWith('-')) {
    return trimmed.replace(
      /^-([a-z]+)-/,
      (_, prefix: string) =>
        prefix.charAt(0).toUpperCase() +
        prefix.slice(1),
    ).replace(
      /-([a-z])/g,
      (_, char: string) =>
        char.toUpperCase(),
    )
  }

  return trimmed.replace(
    /-([a-z])/g,
    (_, char: string) =>
      char.toUpperCase(),
  )
}

function toJSValue(
  value: string,
): string {
  const trimmed = value.trim()

  if (
    trimmed.startsWith('"') &&
    trimmed.endsWith('"')
  ) {
    return `'${trimmed
      .slice(1, -1)
      .replace(/'/g, "\\'")}'`
  }

  if (
    trimmed.startsWith("'") &&
    trimmed.endsWith("'")
  ) {
    return `"${trimmed
      .slice(1, -1)
      .replace(/"/g, '\\"')}"`
  }

  return `'${trimmed
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")}'`
}