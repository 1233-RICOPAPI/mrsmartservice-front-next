# Deploy (GCP Cloud Run + Cloud SQL + Firebase Hosting como dominio)

Este ZIP ya trae:
- **Backend Nest** (carpeta `api`) listo para Cloud Run con `Dockerfile`.
- **Front Next.js SSR** (carpeta `next_mrsmartservice`) listo para Cloud Run con `Dockerfile`.
- Config de **Firebase Hosting** para usar tu dominio `mrsmartservice-decad.firebaseapp.com` como *reverse proxy* al Cloud Run del front.

> Nombres (según tu caso)
- Backend Cloud Run: `mrsmartservice`
- Front Cloud Run: `mrsmartservice-front`
- Región: `us-central1`
- Cloud SQL (Postgres): `mrsmartservice:us-central1:mrsmartservice-db`

...
