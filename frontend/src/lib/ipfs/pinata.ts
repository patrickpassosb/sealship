// Sealship — IPFS Pinata Client (V3 SDK)
// Handles uploading analysis reports to IPFS via Pinata
//
// WHY IPFS?
// IPFS (InterPlanetary File System) provides decentralized, permanent storage.
// Once a report is uploaded, it can be retrieved by anyone using the CID,
// without depending on Sealship's servers staying online.
//
// WHY PINATA?
// Pinata is a managed IPFS pinning service with a generous free tier.
// They handle the infrastructure while we get IPFS benefits.
//
// WORKFLOW:
// 1. After scoring, we generate a JSON report with all details
// 2. Upload to IPFS via Pinata → get back a CID (Content Identifier)
// 3. Store the CID on-chain in the Sealship contract
// 4. Anyone can retrieve the full report via IPFS using the CID

import { PinataSDK } from "pinata";

let pinata: PinataSDK | null = null;

function getPinataClient(): PinataSDK | null {
    const jwt = process.env.PINATA_JWT;
    if (!jwt || process.env.MOCK_IPFS === 'true') {
        return null;
    }
    if (!pinata) {
        pinata = new PinataSDK({
            pinataJwt: jwt,
            pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud",
        });
    }
    return pinata;
}

/**
 * Upload JSON data to IPFS using Pinata V3 SDK.
 *
 * The data parameter contains the complete analysis report:
 * - Repository info and commit
 * - All scoring signals and category breakdowns
 * - AI-generated analysis text
 * - Timestamp and version
 *
 * @param data - The JSON object to upload
 * @param name - A descriptive name for the pin (helps in Pinata dashboard)
 * @returns The IPFS CID (Content Identifier) - CID v1 format ("bafy...")
 *
 * @note When MOCK_IPFS=true or PINATA_JWT is unset, returns a fake CID for testing
 */
export async function uploadToIPFS(data: Record<string, unknown>, name: string): Promise<string> {
    const client = getPinataClient();

    // MOCK MODE: For development/testing without Pinata keys
    if (!client) {
        console.log('[IPFS Mock] Simulating upload to IPFS...', name);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return `QmMockHashFor${name.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    }

    try {
        const upload = await client.upload.public
            .json(data)
            .name(name)
            .keyvalues({
                project: "sealship",
                type: "analysis-report",
            });

        return upload.cid;
    } catch (error) {
        console.error('IPFS Upload Error:', error);
        throw new Error('Failed to upload report to IPFS');
    }
}
