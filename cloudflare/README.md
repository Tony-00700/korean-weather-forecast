# Korean weather API proxy

This Cloudflare Worker keeps the KMA API key on the server and adds the CORS
headers that the GitHub Pages browser app needs. It only accepts requests from
`https://tony-00700.github.io` and only forwards the six fixed KMA operations in
`worker.js`.

## Deploy

1. Deploy this directory as a Worker named `korean-weather-forecast-proxy`.
2. Add a Worker secret named `KMA_AUTH_KEY` containing the KMA API Hub key.
   Do not commit the key or put it in the frontend URL.
3. Use these Worker routes in the app's URL settings:
   - `/api/kma/ncst`
   - `/api/kma/ultra`
   - `/api/kma/short`
   - `/api/kma/version`
   - `/api/kma/mapVillage`
   - `/api/kma/mapUltra`

The deployed Worker origin for this account is
`https://korean-weather-forecast-proxy.canigetsome.workers.dev`. The GitHub
Pages app already uses this origin for its six KMA operations. The API key stays
in the Worker secret and is removed from the browser's legacy local storage once
the app sees the proxy URLs.

