// Sealship — IPFS Pinata Client
// Handles uploading analysis reports to IPFS via Pinata Free Tier
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

export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
}

/**
 * Upload JSON data to IPFS using Pinata.
 * 
 * The data parameter contains the complete analysis report:
 * - Repository info and commit
 * - All scoring signals and category breakdowns
 * - AI-generated analysis text
 * - Timestamp and version
 * 
 * @param data - The JSON object to upload
 * @param name - A descriptive name for the pin (helps in Pinata dashboard)
 * @returns The IPFS CID (Content Identifier) - starts with "Qm" or "bafy"
 * 
 * @note When MOCK_IPFS=true, returns a fake CID for testing without API keys
 */
export async function uploadToIPFS(data: Record<string, unknown>, name: string): Promise<string> {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

    // MOCK MODE: For development/testing without Pinata keys
    // This allows the app to work out of the box for demo purposes
    if (!pinataApiKey || !pinataSecretApiKey || process.env.MOCK_IPFS === 'true') {
        console.log('[IPFS Mock] Simulating upload to IPFS...', name);
        // Simulate network delay to mimic real API behavior
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Return a fake CID (looks like IPFS v0 hash)
        // Real CIDs start with "Qm" (v0) or "bafy" (v1)
        return `QmMockHashFor${name.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    }

    try {
        // Pinata's API endpoint for JSON uploads
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey,
            },
            body: JSON.stringify({
                // CID v1 uses base32 encoding (bafy...) - more modern
                // CID v0 uses base58 (Qm...) - wider compatibility
                pinataOptions: {
                    cidVersion: 1,
                },
                // Metadata helps organize pins in Pinata dashboard
                pinataMetadata: {
                    name,
                },
                // The actual content to pin
                pinataContent: data,
            }),
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`Pinata API error: ${response.status} - ${errorData}`);
        }

        const result = (await response.json()) as PinataResponse;
        return result.IpfsHash;
    } catch (error) {
        console.error('IPFS Upload Error:', error);
        throw new Error('Failed to upload report to IPFS');
    }
}
