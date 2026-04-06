# ZENTRA Logistics OS — Contexto del Proyecto

## Descripción
Zentra es una plataforma logística de envíos con tres portales (Admin, Carrier, Client), un bot de Telegram inteligente (PaulaBot), y tracking en tiempo real. El dueño del proyecto se llama Bryce.

## Stack Tecnológico
- **Frontend:** React 18 + TypeScript + Vite
- **UI:** Tailwind CSS + shadcn/ui (Radix primitives)
- **Backend:** Supabase (Auth, PostgreSQL, Realtime)
- **Bot:** PaulaBot — Telegram bot con grammY + OpenRouter LLM (src/bot/)
- **Mapas:** Leaflet + react-leaflet
- **Gráficas:** Recharts
- **Estado:** TanStack React Query
- **Validación:** Zod + react-hook-form
- **Deploy:** Vercel (vercel.json con SPA rewrite)
- **CI/Testing:** Vitest + @testing-library/react

## Arquitectura del Proyecto
```
src/
├── App.tsx          # Router principal (react-router-dom v6)
├── bot/             # PaulaBot (Telegram) — Se ejecuta con `npm run start:paula`
│   ├── agent.ts     # Agent loop con tool_calls (max 5 iteraciones)
│   ├── config.ts    # Variables de entorno y seguridad
│   ├── google.ts    # Integración Google Workspace (Gmail, Calendar)
│   ├── index.ts     # Entry point del bot (grammY)
│   ├── llm.ts       # Completaciones con OpenRouter + tool definitions
│   └── memory.ts    # Memoria persistente SQLite (paula-memory.sqlite)
├── components/
│   ├── carrier/     # Componentes del portal de transportistas
│   ├── dashboard/   # Layout compartido de dashboards
│   ├── landing/     # Landing page pública
│   ├── notifications/ # Sistema de notificaciones
│   ├── payments/    # Módulo de pagos
│   ├── pwa/         # Progressive Web App components
│   ├── ratings/     # Sistema de calificaciones
│   ├── realtime/    # Componentes de tiempo real (Supabase Realtime)
│   ├── tracking/    # DigitalManifest y tracking de envíos
│   └── ui/          # shadcn/ui primitives
├── hooks/           # Custom hooks (jobs, location, payments, notifications, ratings)
├── pages/           # Páginas/Rutas principales
│   ├── AdminDashboard.tsx    # Panel admin
│   ├── AdminOperations.tsx   # Operaciones admin (38KB — candidato a refactoring)
│   ├── BookShipment.tsx      # Crear envío
│   ├── CarrierDashboard.tsx  # Panel transportista
│   ├── CarrierEarnings.tsx   # Ganancias del carrier
│   ├── CarrierJobs.tsx       # Trabajos asignados
│   ├── ClientDashboard.tsx   # Panel cliente
│   ├── Inventory.tsx         # Inventario
│   ├── Invoices.tsx          # Facturas
│   ├── QuoteCalculator.tsx   # Cotizador
│   └── ShipmentTracking.tsx  # Tracking con mapa
├── types/           # TypeScript interfaces
└── lib/             # Utilidades (Supabase client, helpers)
```

## Roles de Usuario
1. **Admin** — Ve todo, asigna carriers, gestiona operaciones
2. **Carrier** — Ve trabajos asignados, actualiza estados, ganancias
3. **Client** — Crea envíos, ve tracking, facturas, cotizaciones

## Rutas Principales
| Ruta | Componente | Rol |
|------|-----------|-----|
| `/` | Landing | Público |
| `/login`, `/signup` | Auth | Público |
| `/admin` | AdminDashboard | Admin |
| `/admin/operations` | AdminOperations | Admin |
| `/admin/inventory` | Inventory | Admin |
| `/carrier` | CarrierDashboard | Carrier |
| `/carrier/jobs` | CarrierJobs | Carrier |
| `/carrier/earnings` | CarrierEarnings | Carrier |
| `/client` | ClientDashboard | Client |
| `/client/book` | BookShipment | Client |
| `/client/invoices` | Invoices | Client |
| `/quote` | QuoteCalculator | Público |
| `/shipment/:id/tracking` | ShipmentTracking | Todos |

## Convenciones de Código
- Idioma de código: TypeScript estricto
- Idioma de UI: Español (la app es en español)
- Imports con alias `@/` apuntando a `src/`
- Componentes usan shadcn/ui. No instalar otras librerías UI sin preguntar.
- Estilos con Tailwind CSS clases utilitarias
- Hooks siguen el patrón `use[Feature].ts`
- Tests en `src/test/` con Vitest

## Comandos
- `npm run dev` — Servidor de desarrollo (Vite)
- `npm run build` — Build producción
- `npm run start:paula` — Iniciar PaulaBot (Telegram)
- `npm run test` — Correr tests
- `npm run lint` — ESLint

## Variables de Entorno Requeridas (.env)
- `TELEGRAM_BOT_TOKEN` — Token del bot de Telegram
- `TELEGRAM_ALLOWED_USER_IDS` — IDs autorizados (seguridad)
- `GROQ_API_KEY` — API key de Groq (opcional)
- `OPENROUTER_API_KEY` — API key de OpenRouter (LLM principal)
- `OPENROUTER_MODEL` — Modelo a usar
- `FIREBASE_*` — Credenciales de Firebase/Firestore

## Reglas Importantes
1. **NUNCA** hardcodear API keys en el código fuente
2. Siempre usar `@supabase/supabase-js` para operaciones de base de datos
3. AdminOperations.tsx (38KB) necesita refactoring — dividir en sub-componentes
4. El bot tiene un freno de seguridad de 5 iteraciones máximas en el agent loop
5. Preguntar antes de instalar nuevas dependencias
6. Hacer commits descriptivos en español
7. Verificar TypeScript types antes de cada PR
