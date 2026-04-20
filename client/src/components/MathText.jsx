import { InlineMath, BlockMath } from 'react-katex'
import 'katex/dist/katex.min.css'

// Allowed tags for HTML rendering — strip everything else
const ALLOWED_TAGS = new Set(['strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'p', 'br', 'span', 'h1', 'h2', 'h3'])

function sanitizeHtml(html) {
    // Remove all attributes (prevents XSS via onclick, href, style, etc.)
    return html.replace(/<([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
        return ALLOWED_TAGS.has(tag.toLowerCase()) ? `<${tag.toLowerCase()}>` : ''
    }).replace(/<\/([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag) => {
        return ALLOWED_TAGS.has(tag.toLowerCase()) ? `</${tag.toLowerCase()}>` : ''
    })
}

const HTML_TAG_RE = /<[a-z][\s\S]*?>/i

/**
 * Renders text with inline $...$ and block $$...$$ math via KaTeX.
 * If the text contains HTML markup, renders it as sanitized HTML.
 * Also normalises backtick math and strips ** bold markers.
 */
const MathText = ({ text }) => {
    if (!text) return null

    // If the text contains HTML tags, sanitize and render as HTML
    if (HTML_TAG_RE.test(text)) {
        return (
            <span
                className="math-html-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(text) }}
            />
        )
    }

    // Normalise: convert backtick-wrapped math `...` → $...$
    const clean = text
        .replace(/\*\*/g, '')
        .replace(/`([^`\n]+)`/g, (_, inner) => `$${inner}$`)
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

export default MathText
