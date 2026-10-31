const TOKEN_PATTERN = /(?<string>"[^"]*"|'[^']*')|(?<tag><\/?[\w-]+|\/?>)|(?<attribute>[:@#]?[\w-]+(?==))/g

// Minimal template tokenizer, enough for the snippets shown on this page.
export function tokenize(code) {
  const tokens = []
  let lastIndex = 0

  for (const match of code.matchAll(TOKEN_PATTERN)) {
    if (match.index > lastIndex) {
      tokens.push({ type: null, text: code.slice(lastIndex, match.index) })
    }

    const type = Object.keys(match.groups).find((name) => match.groups[name] !== undefined)
    tokens.push({ type, text: match[0] })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < code.length) {
    tokens.push({ type: null, text: code.slice(lastIndex) })
  }

  return tokens
}
