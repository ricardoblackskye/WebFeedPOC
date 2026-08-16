import { useEffect, useRef, useState, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import rawArchitectureMarkdown from '../../ARCHITECTURE.md?raw'
import { SITE_NAME } from '../utils/structuredData'
import './ArchitecturePage.css'

/**
 * Parse ARCHITECTURE.md into a structured AST of sections, diagrams, and tables.
 */
function parseArchitectureMarkdown(markdown) {
  const lines = markdown.split('\n')
  const blocks = []
  let currentBlock = null

  let inMermaid = false
  let mermaidLines = []

  let inTable = false
  let tableLines = []

  let i = 0
  while (i < lines.length) {
    const line = lines[i]

    if (line.trim().startsWith('```mermaid')) {
      inMermaid = true
      mermaidLines = []
      i++
      continue
    }

    if (inMermaid) {
      if (line.trim() === '```') {
        inMermaid = false
        blocks.push({
          type: 'mermaid',
          id: `mermaid-${blocks.length}`,
          code: mermaidLines.join('\n'),
        })
        mermaidLines = []
      } else {
        mermaidLines.push(line)
      }
      i++
      continue
    }

    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableLines = [line]
      } else {
        tableLines.push(line)
      }
      i++
      continue
    } else if (inTable) {
      inTable = false
      blocks.push(parseTable(tableLines))
      tableLines = []
    }

    if (line.startsWith('# ')) {
      blocks.push({ type: 'h1', text: line.replace(/^#\s+/, '').trim() })
    } else if (line.startsWith('## ')) {
      blocks.push({ type: 'h2', text: line.replace(/^##\s+/, '').trim() })
    } else if (line.startsWith('### ')) {
      blocks.push({ type: 'h3', text: line.replace(/^###\s+/, '').trim() })
    } else if (line.trim() === '---') {
      blocks.push({ type: 'hr' })
    } else if (line.trim().length > 0) {
      blocks.push({ type: 'p', text: line.trim() })
    }

    i++
  }

  if (inTable && tableLines.length > 0) {
    blocks.push(parseTable(tableLines))
  }

  return blocks
}

function parseTable(lines) {
  if (lines.length < 2) return { type: 'table', headers: [], rows: [] }

  const cleanCells = (row) =>
    row
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim())

  const headers = cleanCells(lines[0])
  const rows = lines
    .slice(2)
    .filter((l) => l.trim().length > 0)
    .map(cleanCells)

  return { type: 'table', headers, rows }
}

let mermaidScriptPromise = null

function loadMermaidCDN() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.mermaid) return Promise.resolve(window.mermaid)

  if (!mermaidScriptPromise) {
    mermaidScriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.type = 'module'
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs'
      script.onload = () => {
        import(/* @vite-ignore */ script.src)
          .then((m) => {
            const mermaidInstance = m.default || m
            mermaidInstance.initialize({
              startOnLoad: false,
              theme: 'neutral',
              themeVariables: {
                primaryColor: '#faf8f3',
                primaryTextColor: '#2c2416',
                primaryBorderColor: '#D4AF37',
                lineColor: '#B8941F',
                secondaryColor: '#f4ece1',
                tertiaryColor: '#fff',
                fontFamily: 'Lato, sans-serif',
              },
              securityLevel: 'loose',
            })
            window.mermaid = mermaidInstance
            resolve(mermaidInstance)
          })
          .catch(reject)
      }
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  return mermaidScriptPromise
}

export default function ArchitecturePage() {
  const blocks = useMemo(() => parseArchitectureMarkdown(rawArchitectureMarkdown), [])
  const containerRef = useRef(null)
  const [renderedDiagrams, setRenderedDiagrams] = useState({})

  useEffect(() => {
    let isMounted = true

    loadMermaidCDN()
      .then((mermaid) => {
        if (!isMounted) return
        const mermaidBlocks = blocks.filter((b) => b.type === 'mermaid')

        mermaidBlocks.forEach(async (block, index) => {
          try {
            const id = `mermaid-svg-${index}-${Date.now()}`
            // Clean markdown HTML entities if any
            const cleanedCode = block.code
              .replaceAll('&lt;', '<')
              .replaceAll('&gt;', '>')
              .replaceAll('&amp;', '&')
            const { svg } = await mermaid.render(id, cleanedCode)
            if (isMounted) {
              setRenderedDiagrams((prev) => ({ ...prev, [block.id]: svg }))
            }
          } catch (err) {
            console.warn('Mermaid render warning:', err)
          }
        })
      })
      .catch((err) => {
        console.warn('Failed to load Mermaid from CDN:', err)
      })

    return () => {
      isMounted = false
    }
  }, [blocks])

  return (
    <div className="architecture-page" ref={containerRef}>
      <Helmet>
        <title>Architecture | {SITE_NAME}</title>
        <meta
          name="description"
          content="System architecture, module map, sequence flows, and component hierarchies for Antiques Marketplace."
        />
        <link rel="canonical" href="/architecture" />
      </Helmet>

      <div className="architecture-content">
        {blocks.map((block, index) => {
          switch (block.type) {
            case 'h1':
              return (
                <h1 key={index} className="architecture-h1">
                  {block.text}
                </h1>
              )
            case 'h2':
              return (
                <h2 key={index} className="architecture-h2">
                  {block.text}
                </h2>
              )
            case 'h3':
              return (
                <h3 key={index} className="architecture-h3">
                  {block.text}
                </h3>
              )
            case 'hr':
              return <hr key={index} className="architecture-hr" />
            case 'p':
              return (
                <p key={index} className="architecture-p">
                  {block.text}
                </p>
              )
            case 'table':
              return (
                <div key={index} className="architecture-table-wrapper">
                  <table className="architecture-table">
                    <thead>
                      <tr>
                        {block.headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, rIdx) => (
                        <tr key={rIdx}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            case 'mermaid': {
              const svg = renderedDiagrams[block.id]
              return (
                <div
                  key={block.id}
                  className="architecture-chart-container"
                  data-mermaid="true"
                  data-diagram-id={block.id}
                >
                  {svg ? (
                    <div
                      className="mermaid-svg-wrapper"
                      dangerouslySetInnerHTML={{ __html: svg }}
                    />
                  ) : (
                    <pre className="mermaid-code-fallback">
                      <code>{block.code}</code>
                    </pre>
                  )}
                </div>
              )
            }
            default:
              return null
          }
        })}
      </div>
    </div>
  )
}
