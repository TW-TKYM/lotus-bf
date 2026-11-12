import { useCallback, useRef, useState } from 'react'
import { Terms } from './components/Terms'
import { QueryBuilder } from './components/QueryBuilder'
import { Studies } from './components/Studies'
import { Locations } from './components/Locations'
import { NiiViewer } from './components/NiiViewer'
import { useUrlQueryState } from './hooks/useUrlQueryState'
import './App.css'

const examples = [
  { label: '獎賞', query: 'reward' },
  { label: '預設模式網路', query: 'default mode' },
  { label: 'MNI 座標', query: '[0,-52,26]' }
]

export default function App () {
  const [query, setQuery] = useUrlQueryState('q')
  const [resultView, setResultView] = useState('studies')
  const gridRef = useRef(null)
  const [sizes, setSizes] = useState([25, 42, 33])

  const handlePickTerm = useCallback((term) => {
    setQuery((current) => current ? `${current} AND ${term}` : term)
  }, [setQuery])

  const startDrag = (which, event) => {
    event.preventDefault()
    const startX = event.clientX
    const rect = gridRef.current.getBoundingClientRect()
    const total = rect.width
    const current = sizes.map((size) => (size / 100) * total)

    const onMouseMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX
      if (which === 0) {
        const left = Math.max(220, Math.min(total - 680, current[0] + delta))
        const right = current[2]
        const adjustedMiddle = total - left - right
        setSizes([left / total * 100, adjustedMiddle / total * 100, right / total * 100])
      } else {
        const middle = Math.max(320, Math.min(total - current[0] - 360, current[1] + delta))
        const right = total - current[0] - middle
        const adjustedMiddle = total - current[0] - right
        setSizes([current[0] / total * 100, adjustedMiddle / total * 100, right / total * 100])
      }
    }
    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div className="app">
      <header className="app__header">
        <a className="app__brand" href="/lotus-bf/" aria-label="LoTUS-BF 首頁">
          <span className="app__brand-mark" aria-hidden="true">L</span>
          <span className="app__brand-copy">
            <span className="app__title">LoTUS<span>-BF</span></span>
            <span className="app__subtitle">腦功能位置與詞彙整合搜尋</span>
          </span>
        </a>
        <div className="app__header-meta">
          <span className="app__status"><span />神經影像研究工具</span>
          <a className="app__help" href="/help" target="_blank" rel="noreferrer">使用說明 ↗</a>
        </div>
      </header>

      <div className="app__workspace">
        <div className="workspace__intro">
          <div>
            <p className="eyebrow">NEUROIMAGING DISCOVERY</p>
            <h1>探索腦區與研究概念</h1>
            <p>以研究詞彙或 MNI 座標搜尋文獻，並在腦影像中檢視結果。</p>
          </div>
          <div className="workspace__examples" aria-label="範例查詢">
            <span>試試看</span>
            {examples.map(({ label, query: example }) => (
              <button key={label} type="button" className="example-chip" onClick={() => setQuery(example)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <main className="app__grid" ref={gridRef} style={{ '--left-size': `${sizes[0]}%`, '--middle-size': `${sizes[1]}%`, '--right-size': `${sizes[2]}%` }}>
          <section className="panel terms-panel">
            <div className="panel__heading">
              <div>
                <span className="panel__eyebrow">詞彙資料庫</span>
                <h2>研究詞彙</h2>
              </div>
              <span className="panel__icon" aria-hidden="true">Aa</span>
            </div>
            <Terms onPickTerm={handlePickTerm} />
          </section>

          <div className="resizer" aria-label="調整詞彙與結果面板寬度" onMouseDown={(event) => startDrag(0, event)} />

          <section className="panel results-panel">
            <QueryBuilder query={query} setQuery={setQuery} />
            <div className="results-toolbar">
              <div className="results-toolbar__title">
                <div>
                  <span className="panel__eyebrow">搜尋結果</span>
                  <h2>資料探索</h2>
                </div>
                <div className="result-tabs" role="tablist" aria-label="搜尋結果類型">
                  <button type="button" role="tab" aria-selected={resultView === 'studies'} className={resultView === 'studies' ? 'is-active' : ''} onClick={() => setResultView('studies')}>文獻</button>
                  <button type="button" role="tab" aria-selected={resultView === 'locations'} className={resultView === 'locations' ? 'is-active' : ''} onClick={() => setResultView('locations')}>座標</button>
                </div>
              </div>
            </div>
            <div className="results-content">
              {resultView === 'studies' ? <Studies query={query} /> : <Locations query={query} />}
            </div>
          </section>

          <div className="resizer" aria-label="調整結果與腦影像面板寬度" onMouseDown={(event) => startDrag(1, event)} />

          <section className="panel viewer-panel">
            <NiiViewer query={query} />
          </section>
        </main>
        <footer className="app__footer">
          <span>LoTUS-BF</span>
          <span>Location-or-Term Unified Search for Brain Functions</span>
          <span className="app__footer-note">資料來源：Neurosynth 資料庫</span>
        </footer>
      </div>
    </div>
  )
}
