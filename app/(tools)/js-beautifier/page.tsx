'use client'

import { CodeFormatter } from '@/app/components/CodeFormatter'
import { beautifyJS } from '@/app/lib/tools/js/beautifier'

const sample = `const Greeting=({name})=><div className="greeting">Hello, {name}</div>;\nconst fn=()=>{const value=1;return value;};`

export default function JSBeautifier() {
  return <CodeFormatter title="JavaScript Beautifier" description="Format JavaScript, JSX, and TypeScript with syntax-aware parsing and readable diagnostics." language="JavaScript / JSX" sample={sample} format={(source, prefs) => beautifyJS(source, { indentSize: prefs.indentSize, indentChar: prefs.indentChar, wrapLineLength: prefs.wrapLineLength })} />
}
