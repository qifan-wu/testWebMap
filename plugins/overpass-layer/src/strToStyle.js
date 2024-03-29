function strToStyle (style) {
  try {
    return JSON.parse(style)
  } catch (e) {
    // not JSON? -> ignore, because it could be line-based
  }

  const str = style.split('\n')
  style = {}

  for (let i = 0; i < str.length; i++) {
    const m = str[i].match(/^\s*([a-zA-Z0-9_]+)\s*:\s*(.*)\s*$/)
    if (m) {
      let v = m[2].trim()

      if (v.match(/^-?[0-9]+(\.[0-9]+)?/)) {
        v = parseFloat(v)
      }

      style[m[1]] = v
    }
  }

  return style
}

module.exports = strToStyle
