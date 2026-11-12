# LoTUS-BF

LoTUS-BF（Location-or-Term Unified Search for Brain Functions）可依研究詞彙與 MNI 座標搜尋 Neurosynth 研究，並呈現文獻、座標與 NIfTI 統計圖譜。

## 使用 `ns-nano-master` 資料庫

後端直接使用 `ns-nano-master` 建立的 PostgreSQL `ns` schema：

- `ns.metadata`：研究中繼資料與全文搜尋欄位
- `ns.coordinates`：PostGIS 三維座標
- `ns.annotations_terms`：研究詞彙及權重

`/terms` 端點直接讀取 `annotations_terms`，不需要啟用較大的選配 `annotations_json` 資料表。請將 `DB_URL` 設為已載入上述資料表的同一個 PostgreSQL 連線字串。密碼應存在私密環境變數或部署平台的密鑰設定中，不要提交至 Git。

## 本機啟動

先安裝 Python 相依套件：

```powershell
python -m pip install -r requirements.txt
```

設定資料庫連線環境變數後，在此資料夾啟動 API：

```powershell
$env:DB_URL = "<ns-nano PostgreSQL 連線字串>"
python -m flask --app app run --port 5000
```

另開終端機啟動網頁：

```powershell
npm install
npm run dev
```

Vite 開發伺服器預設將 API 請求代理至 `http://127.0.0.1:5000`。若本機 Flask API 使用其他連接埠，啟動 Vite 前設定 `LOTUS_API_URL`。LoTUS-BF 所需的 `/terms`、`/query` 與 `/help` 端點須由此專案的 Flask API 提供。

## 建置

```powershell
npm run build
npm run lint
```

建置產物位於 `dist/`。預設 base path 為 `/`，適用於 Render Static Site；若部署在 `/lotus-bf/` 子路徑，建置前設定 `VITE_BASE=/lotus-bf/`。

## Render 部署

- **Flask Web Service**：Build Command 為 `pip install -r requirements.txt`；Start Command 為 `gunicorn app:app --bind 0.0.0.0:$PORT`。設定 `DB_URL` 為 ns-nano PostgreSQL 連線字串。
- **Static Site**：Build Command 為 `npm ci && npm run build`；Publish Directory 為 `dist`。設定 `VITE_API_URL` 為 Flask Web Service 的公開網址，例如 `https://your-api.onrender.com`。
- 資料庫密碼只放在 Render 環境變數，不要提交至 Git。

## 查詢語法

- 詞彙：`reward`、`default mode`
- MNI 座標：`[0,-52,26]`
- 可混合使用 `AND`、`OR`、`NOT` 與括號
- 座標搜尋半徑預設為 6 mm
