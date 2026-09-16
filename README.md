# B/K Bolværket — bestyrelsens intranet

Next.js-intranet til Bådklubben Bolværket. Login, medlemsliste, kanal-kort og dokumentarkiv.

## Lokalt

```bash
npm install
cp .env.example .env.local
npm run dev
```

Åbn [http://localhost:3000](http://localhost:3000). Demo-adgangskode til bestyrelsen: `Christianshavn1985`.

## Docker

```bash
docker compose up --build
```

Åbn [http://localhost:8080](http://localhost:8080).

## Google Cloud Run

Fra denne mappe:

```bash
gcloud run deploy bk-bolvaerket \
  --source . \
  --region europe-west1 \
  --max-instances 1 \
  --memory 512Mi \
  --allow-unauthenticated \
  --set-env-vars SESSION_SECRET=$(openssl rand -hex 32)
```

`--max-instances 1` er vigtigt, fordi medlems- og dokumentdata ligger i filer i containeren. Flere instanser vil ikke dele de samme ændringer.
