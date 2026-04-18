import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

/**
 * Renders text with inline $...$ and block $$...$$ math via KaTeX.
 * Also strips ** markdown bold markers.
 */
const MathText = ({ text }) => {
    if (!text) return null
    const clean = text.replace(/\*\*/g, '')
    const parts = []
    const re = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g
    let last = 0, m
    while ((m = re.exec(clean)) !== null) {
        if (m.index > last) parts.push({ type: 'text', val: clean.slice(last, m.index) })
        const raw = m[0]
        if (raw.startsWith('$$')) parts.push({ type: 'block', val: raw.slice(2, -2) })
        else parts.push({ type: 'inline', val: raw.slice(1, -1) })
        last = m.index + raw.length
    }
    if (last < clean.length) parts.push({ type: 'text', val: clean.slice(last) })
    return (
        <span>
            {parts.map((p, i) =>
                p.type === 'block' ? <BlockMath key={i} math={p.val} /> :
                    p.type === 'inline' ? <InlineMath key={i} math={p.val} /> :
                        <span key={i}>{p.val}</span>
            )}
        </span>
    )
}

export default MathText
