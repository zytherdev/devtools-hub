'use client'

import { CodeFormatter } from '@/app/components/CodeFormatter'
import { beautifyCSS } from '@/app/tools/css-beautifier/logic'

const sample = `.container{display:flex;flex-direction:column;padding:2rem;background:#f1f5f9;border-radius:.75rem;content:"keep   these spaces"}@media(max-width:768px){.container{padding:1rem}& .child{color:red}}@starting-style{opacity:0}`

export default function CSSBeautifier() {
  return <CodeFormatter title="CSS Beautifier" description="Format and inspect CSS while preserving quoted content, modern at-rules, and nested rules." language="CSS" sample={sample} format={(source, prefs) => beautifyCSS(source, { indentSize: prefs.indentSize, indentChar: prefs.indentChar })} />
}
