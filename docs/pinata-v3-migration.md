# Pinata V3 Migration Specification

This document details the transition from Pinata's Legacy API (V1/V2) to the modern **V3 API** for the Sealship project. This migration improves scalability, security, and developer ergonomics by utilizing Pinata's serverless infrastructure and standardized SDK.

## 1. Architectural Overview

### Legacy API (V1/V2)
- **Endpoint-Specific:** Specialized endpoints like `pinJSONToIPFS`.
- **Infrastructure:** Traditional server-based, which can lead to lower rate limits during high traffic.
- **Authentication:** Relies on an API Key and Secret API Key pair.
- **Data Model:** Flat organization; relies heavily on metadata filtering for search.

### V3 API (Modern)
- **Unified File Interface:** Treats all uploads (JSON, Files, Blobs) through a consistent `Files` API.
- **Infrastructure:** Built on serverless technology for near-infinite scale and higher rate limits.
- **Authentication:** Uses **JWT (JSON Web Token)** - a single, more secure bearer token.
- **Data Model:** Introduces **Groups**, allowing for logical collections (e.g., "all analysis reports") and easier management.
- **Performance:** Supports modern protocols like **TUS** for resumable and reliable uploads.

---

## 2. Authentication Transition

The V3 API is optimized for **JWT-based authentication**. While the Legacy API used a Key/Secret pair, V3 requires a single Bearer Token.

### Action: Generate a Pinata JWT
1. Log in to your [Pinata Dashboard](https://app.pinata.cloud/).
2. Navigate to the **API Keys** section.
3. Click **"New Key"**.
4. **Recommendation:** For development, toggle the **Admin** switch to grant all permissions. For production, ensure you grant `Write` permissions to `V3 Resources > Files`.
5. Once created, Pinata will show you the **API Key**, **Secret Key**, and **JWT**.
6. **Copy the JWT**. It is a very long string starting with `eyJ...`.

### Environment Variable Changes
We will move from three variables to one primary variable for the SDK.

**Old (`.env`):**
```env
PINATA_API_KEY=your_key
PINATA_SECRET_API_KEY=your_secret
```

**New (`.env`):**
```env
PINATA_JWT=your_full_jwt_here
```

---

## 3. SDK Implementation

The project should transition to the official `pinata` SDK (v2.x).

### Installation
```bash
npm install pinata
```

### Initialization
The SDK should be initialized using the JWT.

```typescript
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud"
});
```

---

## 4. Code Comparison: Uploading Reports

### Legacy Pattern (Current)
Currently, `sealship` uses a manual `fetch` to a legacy endpoint:

```typescript
const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
    method: 'POST',
    headers: {
        pinata_api_key: process.env.PINATA_API_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
    },
    body: JSON.stringify({
        pinataContent: data,
        pinataMetadata: { name: "report-name" }
    }),
});
```

### V3 Pattern (Recommended)
The V3 SDK simplifies this and provides better error handling and default settings.

```typescript
// The SDK handles CID v1 by default and optimizes the upload
const upload = await pinata.upload.public.json({
    content: data,
    metadata: {
        name: "report-name",
        keyvalues: {
            project: "sealship",
            type: "analysis-report"
        }
    }
});

return upload.cid; // "bafy..." (CID v1)
```

---

## 5. Advanced Features in V3

### Groups
To avoid a messy dashboard, we can group all Sealship reports:

```typescript
// Create a group once
const group = await pinata.groups.public.create({
    name: "Sealship Reports"
});

// Upload to that group
const upload = await pinata.upload.public.json({
    content: data
}).group(group.id);
```

### Listing Files
Retrieving data is significantly faster in V3:

```typescript
const files = await pinata.files.public.list()
    .keyvalues({ project: "sealship" })
    .limit(10);
```

---

## 6. Migration Checklist

- [ ] Generate a new Pinata API Key with **Admin** permissions (or specific V3 Files Write permissions).
- [ ] Copy the **JWT** token.
- [ ] Update `.env` to include `PINATA_JWT`.
- [ ] Install the `pinata` npm package.
- [ ] Update `frontend/src/lib/ipfs/pinata.ts` to use the `PinataSDK`.
- [ ] (Optional) Update Gateway URL in `.env` to use a dedicated Pinata Gateway for faster retrieval.
