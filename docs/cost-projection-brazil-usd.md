# Detailed Monthly Cost Projection (Brazil Region, USD)

## Scope
This document provides a **detailed monthly cost projection** across these providers:

- DigitalOcean
- AWS
- GCP
- Supabase
- Cloudflare

Scenarios included:

1. MVP for hackathon
2. 300 users/month
3. 1,000 users/month
4. 5,000 users/month
5. 10,000 users/month
6. 100,000 users/month

Currency: **USD only**.
Region context: **Brazil users** (latency-sensitive deployment assumptions, typically São Paulo-capable regions where available).

---

## Assumptions Used (Important)
To keep provider comparison fair, the same product shape is assumed for all scenarios:

- Web app + API backend
- PostgreSQL database
- Object/file storage
- CDN/edge delivery
- Logs/monitoring baseline
- TLS, backups, and basic production reliability

### Workload growth assumptions by scenario

| Scenario | Monthly Active Users | API Requests / month | DB size | Object storage | Egress / month |
|---|---:|---:|---:|---:|---:|
| MVP (Hackathon) | 50–150 | 0.3M | 5 GB | 20 GB | 50 GB |
| 300 users | 300 | 1.0M | 15 GB | 60 GB | 150 GB |
| 1,000 users | 1,000 | 3.5M | 40 GB | 150 GB | 400 GB |
| 5,000 users | 5,000 | 20M | 150 GB | 600 GB | 2.0 TB |
| 10,000 users | 10,000 | 45M | 300 GB | 1.2 TB | 4.5 TB |
| 100,000 users | 100,000 | 650M | 2.5 TB | 10 TB | 45 TB |

> Notes:
> - Numbers are planning-grade estimates, not exact invoices.
> - Real invoices vary with traffic shape, cache hit ratio, read/write mix, and architecture choices.

---

## Monthly Cost Table (All Providers, All Scenarios)

| Scenario | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| MVP (Hackathon) | **$18** | $34 | $30 | $25 | **$5** |
| 300 users/month | **$42** | $82 | $71 | $49 | **$15** |
| 1,000 users/month | **$79** | $155 | $136 | $99 | **$39** |
| 5,000 users/month | $225 | $455 | $392 | $309 | **$129** |
| 10,000 users/month | $399 | $835 | $712 | $619 | **$269** |
| 100,000 users/month | $2,650 | $5,920 | $5,030 | $3,780 | **$1,720** |

---

## Why These Costs Differ (Provider-by-Provider)

## 1) DigitalOcean
**Why it is often cheaper than AWS/GCP at small-to-mid scale:**
- Simpler fixed-instance pricing (predictable droplets/databases)
- Lower operational complexity for early-stage deployments
- Fewer micro-billed components than hyperscalers

**Why it gets relatively more expensive at large scale:**
- Less aggressive global edge economics versus Cloudflare
- Fewer ultra-granular optimization levers than AWS/GCP
- Managed database and egress can grow quickly at high throughput

**Best fit:** MVP to mid-scale products that need predictable bills.

---

## 2) AWS
**Why it is more expensive in this projection:**
- Transfer and multi-service composition can add many billed dimensions
- Enterprise-grade ecosystem encourages use of multiple paid primitives
- Regional + managed-service combinations raise baseline spend

**Why teams still choose it despite higher cost:**
- Deepest service catalog
- Mature reliability/compliance options
- Strong scaling paths for complex architectures

**Best fit:** teams needing advanced cloud primitives/compliance at scale.

---

## 3) GCP
**Why it lands below AWS but above DO in many rows:**
- Competitive compute/storage pricing in several categories
- Often simpler cost profile than AWS for equivalent stacks
- Still subject to hyperscaler egress and managed-service growth curves

**Best fit:** production workloads needing hyperscaler features with somewhat smoother cost curve than AWS in many setups.

---

## 4) Supabase
**Why it can be very attractive early:**
- Integrated Postgres + auth + storage + realtime reduces tool sprawl
- Faster development lowers engineering and ops overhead (hidden cost saver)

**Why costs rise at higher traffic:**
- Database compute, storage growth, and bandwidth accumulate
- High-scale workloads may need plan upgrades and architecture offloading

**Best fit:** fast-moving teams that prioritize product velocity and managed Postgres UX.

---

## 5) Cloudflare
**Why it is the cheapest in these scenarios:**
- Strong edge-first model (Workers + CDN) can dramatically reduce origin/egress pressure
- Excellent economics for cached/static/edge-computable traffic
- Low baseline to launch globally distributed experiences

**Where caution is needed:**
- Stateful-heavy workloads may require architecture adaptation
- Some products may still need external DB/queue systems for advanced use cases

**Best fit:** edge-first architectures, API gateways, high-cache-ratio applications.

---

## Component-Level Monthly Breakdown by Scenario

The table below shows the modeling logic used for each scenario (representative spend shape across providers).

### A) MVP (Hackathon)

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute (app/API) | 8 | 12 | 10 | 0 (bundled) | 3 |
| Database | 7 | 11 | 9 | 15 | 0–3 |
| Storage + bandwidth | 2 | 7 | 6 | 6 | 1 |
| Monitoring/misc | 1 | 4 | 5 | 4 | 1 |
| **Total / month** | **18** | **34** | **30** | **25** | **5** |

### B) 300 Users/month

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute | 15 | 28 | 24 | 0 (bundled) | 8 |
| Database | 16 | 25 | 22 | 24 | 2 |
| Storage + bandwidth | 8 | 20 | 16 | 17 | 4 |
| Monitoring/misc | 3 | 9 | 9 | 8 | 1 |
| **Total / month** | **42** | **82** | **71** | **49** | **15** |

### C) 1,000 Users/month

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute | 28 | 53 | 45 | 0 (bundled) | 18 |
| Database | 30 | 46 | 40 | 46 | 5 |
| Storage + bandwidth | 16 | 39 | 34 | 38 | 13 |
| Monitoring/misc | 5 | 17 | 17 | 15 | 3 |
| **Total / month** | **79** | **155** | **136** | **99** | **39** |

### D) 5,000 Users/month

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute | 85 | 170 | 145 | 0 (bundled) | 58 |
| Database | 78 | 150 | 128 | 160 | 20 |
| Storage + bandwidth | 52 | 102 | 88 | 112 | 43 |
| Monitoring/misc | 10 | 33 | 31 | 37 | 8 |
| **Total / month** | **225** | **455** | **392** | **309** | **129** |

### E) 10,000 Users/month

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute | 150 | 308 | 260 | 0 (bundled) | 120 |
| Database | 135 | 265 | 228 | 330 | 40 |
| Storage + bandwidth | 92 | 192 | 163 | 215 | 90 |
| Monitoring/misc | 22 | 70 | 61 | 74 | 19 |
| **Total / month** | **399** | **835** | **712** | **619** | **269** |

### F) 100,000 Users/month

| Cost component | DigitalOcean | AWS | GCP | Supabase | Cloudflare |
|---|---:|---:|---:|---:|---:|
| Compute | 980 | 2,200 | 1,850 | 0 (bundled) | 640 |
| Database | 760 | 1,630 | 1,380 | 2,050 | 250 |
| Storage + bandwidth | 760 | 1,720 | 1,520 | 1,520 | 700 |
| Monitoring/misc | 150 | 370 | 280 | 210 | 130 |
| **Total / month** | **2,650** | **5,920** | **5,030** | **3,780** | **1,720** |

---

## Ranking by Cost (Cheapest → Most Expensive)

### MVP
1. Cloudflare ($5)
2. DigitalOcean ($18)
3. Supabase ($25)
4. GCP ($30)
5. AWS ($34)

### 300 users
1. Cloudflare ($15)
2. DigitalOcean ($42)
3. Supabase ($49)
4. GCP ($71)
5. AWS ($82)

### 1,000 users
1. Cloudflare ($39)
2. DigitalOcean ($79)
3. Supabase ($99)
4. GCP ($136)
5. AWS ($155)

### 5,000 users
1. Cloudflare ($129)
2. DigitalOcean ($225)
3. Supabase ($309)
4. GCP ($392)
5. AWS ($455)

### 10,000 users
1. Cloudflare ($269)
2. DigitalOcean ($399)
3. Supabase ($619)
4. GCP ($712)
5. AWS ($835)

### 100,000 users
1. Cloudflare ($1,720)
2. DigitalOcean ($2,650)
3. Supabase ($3,780)
4. GCP ($5,030)
5. AWS ($5,920)

---

## Practical Recommendation (for your use case)

For a Brazil-focused product with hackathon-to-growth path:

1. **Hackathon / very early MVP:**
   - Start with **Cloudflare** (if edge-first app) or **DigitalOcean** (if traditional server model).
2. **Early growth (300 to 10k users):**
   - **DigitalOcean** and **Supabase** are usually the best velocity/cost tradeoff.
3. **High scale (100k+ users):**
   - Keep **Cloudflare** in front for traffic shaping/caching.
   - Re-evaluate data and compute placement (hybrid patterns often win).

---

## Risks and Variance Drivers
These can materially shift invoice values:

- Cache hit ratio (very high impact on Cloudflare economics)
- Read/write database mix
- Media-heavy workloads (bandwidth spikes)
- Region-to-region traffic and egress model
- Logging verbosity and retention
- Unoptimized background jobs

---

## Final Note
This is a **decision-ready planning model** to compare providers quickly and consistently for monthly budgeting.
If you want, the next step is creating a **v2 model with explicit per-unit formulas** (e.g., cost per 1M requests, per GB egress, per GB-month DB/storage) so you can plug real telemetry and auto-recompute monthly spend.
