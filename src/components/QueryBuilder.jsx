export function QueryBuilder ({ query, setQuery }) {
  const append = (token) => setQuery((current) => current ? `${current} ${token}` : token)

  return (
    <div className="qb">
      <div className="qb__heading">
        <div>
          <span className="panel__eyebrow">建立搜尋條件</span>
          <h2>查詢建構器</h2>
        </div>
      </div>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.preventDefault()
        }}
        placeholder="輸入詞彙或座標，例如：reward AND [0,-52,26]"
        aria-label="搜尋詞彙或 MNI 座標"
        className="qb__input"
      />
      <div className="qb__operators" aria-label="布林運算子">
        {['AND', 'OR', 'NOT', '(', ')'].map((token) => (
          <button key={token} type="button" onClick={() => append(token)}>{token}</button>
        ))}
        <button type="button" className="qb__reset" onClick={() => setQuery('')}>清除查詢</button>
      </div>
      <div className="qb__hint">支援 <code>AND</code>、<code>OR</code>、<code>NOT</code> 與 MNI 座標 <code>[x,y,z]</code>。</div>
    </div>
  )
}
