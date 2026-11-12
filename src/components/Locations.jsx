import { useEffect, useMemo, useState } from 'react'
import { apiUrl } from '../api'

export function Locations ({ query }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [radius, setRadius] = useState(6)
  const [limit, setLimit] = useState(200)
  const [sortKey, setSortKey] = useState('study_id')
  const [sortDir, setSortDir] = useState('asc')
  const [page, setPage] = useState(1)
  const pageSize = 30

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
    const loadLocations = async () => {
      setLoading(true)
      setError('')
      try {
        const url = new URL(apiUrl(`/query/${encodeURIComponent(query)}/locations`), window.location.origin)
        url.searchParams.set('r', String(radius))
        url.searchParams.set('limit', String(limit))
        const response = await fetch(url.toString(), { signal: controller.signal })
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data?.error || `HTTP ${response.status}`)
        if (active) setRows(Array.isArray(data?.results) ? data.results : [])
      } catch (requestError) {
        if (!active || requestError.name === 'AbortError') return
        setError(`無法載入座標：${requestError.message || requestError}`)
        setRows([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadLocations()
    return () => { active = false; controller.abort() }
  }, [query, radius, limit])

  const sorted = useMemo(() => {
    const direction = sortDir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const first = a?.[sortKey]
      const second = b?.[sortKey]
      if (['study_id', 'x', 'y', 'z'].includes(sortKey)) return (Number(first) - Number(second)) * direction
      return String(first || '').localeCompare(String(second || '')) * direction
    })
  }, [rows, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const pageRows = sorted.slice((page - 1) * pageSize, page * pageSize)
  const changeSort = (key) => {
    if (key === sortKey) setSortDir((direction) => direction === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  return (
    <div className="locations">
      <div className="data-heading">
        <h3>座標位置</h3>
        <span>{query ? `共 ${rows.length.toLocaleString()} 筆` : '等待查詢'}</span>
      </div>
      <div className="locations__controls">
        <label>搜尋半徑
          <input type="number" min="0" max="100" step="0.5" value={radius} onChange={(event) => setRadius(Number(event.target.value) || 0)} />
          mm
        </label>
        <label>最多顯示
          <input type="number" min="1" max="10000" step="50" value={limit} onChange={(event) => setLimit(Math.min(10000, Math.max(1, Number(event.target.value) || 1)))} />
          筆
        </label>
      </div>
      {!query && <div className="results-message">輸入包含座標的查詢，例如 <code>[0,-52,26]</code>。</div>}
      {query && loading && <div className="results-message">正在搜尋座標…</div>}
      {query && error && <div className="alert--error">{error}</div>}
      {query && !loading && !error && (
        <>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    { key: 'study_id', label: '研究編號' },
                    { key: 'x', label: 'X (mm)' },
                    { key: 'y', label: 'Y (mm)' },
                    { key: 'z', label: 'Z (mm)' }
                  ].map(({ key, label }) => (
                    <th key={key} onClick={() => changeSort(key)}>{label} {sortKey === key ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr><td colSpan={4} className="studies__empty">沒有找到符合條件的座標。</td></tr>
                ) : pageRows.map((row, index) => (
                  <tr key={`${row.study_id}-${row.x}-${row.y}-${row.z}-${index}`}>
                    <td>{row.study_id}</td>
                    <td>{Number(row.x).toFixed(1)}</td>
                    <td>{Number(row.y).toFixed(1)}</td>
                    <td>{Number(row.z).toFixed(1)}</td>
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
