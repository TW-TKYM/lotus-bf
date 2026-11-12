import { useEffect, useMemo, useState } from 'react'

export function Studies ({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sortKey, setSortKey] = useState('year')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const pageSize = 20

  useEffect(() => { setPage(1) }, [query])

  useEffect(() => {
    if (!query) {
      setRows([])
      setError('')
      setLoading(false)
      return
    }

    let active = true
    const controller = new AbortController()
    const loadStudies = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await fetch(`/query/${encodeURIComponent(query)}/studies`, { signal: controller.signal })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`)
        if (active) setRows(Array.isArray(data?.results) ? data.results : [])
      } catch (requestError) {
        if (!active || requestError.name === 'AbortError') return
        setError(`無法載入文獻：${requestError.message || requestError}`)
        setRows([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadStudies()
    return () => { active = false; controller.abort() }
  }, [query])

  const changeSort = (key) => {
    if (key === sortKey) setSortDir((direction) => direction === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const sorted = useMemo(() => {
    const direction = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const first = a?.[sortKey]
      const second = b?.[sortKey]
      if (sortKey === 'year') return (Number(first || 0) - Number(second || 0)) * direction
      return String(first || '').localeCompare(String(second || ''), 'zh-Hant') * direction
    })
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="studies">
      <div className="data-heading">
        <h3>相關研究</h3>
        <span>{query ? `共 ${sorted.length.toLocaleString()} 篇` : '等待查詢'}</span>
      </div>
      {!query && <div className="results-message">輸入詞彙或座標，開始探索相關研究。</div>}
      {query && loading && <div className="results-message">正在搜尋研究資料…</div>}
      {query && error && <div className="alert--error">{error}</div>}
      {query && !loading && !error && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    { key: 'year', label: '年份' },
                    { key: 'journal', label: '期刊' },
                    { key: 'title', label: '研究標題' },
                    { key: 'authors', label: '作者' }
                  ].map(({ key, label }) => (
                    <th key={key} aria-sort={sortKey === key ? `${sortDir === 'asc' ? 'ascending' : 'descending'}` : 'none'}>
                      <button type="button" onClick={() => changeSort(key)}>{label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}</button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={4} className="studies__empty">沒有找到符合條件的研究。</td></tr>
                ) : pageRows.map((row, index) => (
                  <tr key={row.study_id || `${row.title}-${index}`}>
                    <td>{row.year ?? '—'}</td>
                    <td>{row.journal || '—'}</td>
                    <td><div className="studies__title" title={row.title}>{row.title || '—'}</div></td>
                    <td>{row.authors || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {sorted.length > 0 && (
            <div className="table-pagination">
              <span>第 {page} / {totalPages} 頁</span>
              <div className="table-pagination__actions">
                <button type="button" disabled={page <= 1} onClick={() => setPage(1)}>首頁</button>
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>上一頁</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>下一頁</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
