// Sealship — IPFS Pinata Client
// Handles uploading analysis reports to IPFS via Pinata Free Tier

export interface PinataResponse {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
}

/**
 * Upload JSON data to IPFS using Pinata.
 * Used to store the complete structural report and AI analysis.
 */
export async function uploadToIPFS(data: Record<string, unknown>, name: string): Promise<string> {
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;

    // For testing/mocking when API keys aren't available yet
    if (!pinataApiKey || !pinataSecretApiKey || process.env.MOCK_IPFS === 'true') {
        console.log('[IPFS Mock] Simulating upload to IPFS...', name);
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Return a fake CID starting with Qm (IPFS v0 hash style)
        return `QmMockHashFor${name.replace(/[^a-zA-Z0-9]/g, '')}${Date.now()}`;
    }

    try {
        const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey,
            },
            body: JSON.stringify({
                pinataOptions: {
                    cidVersion: 1, // Use CID v1 for better modern compatibility
                },
                pinataMetadata: {
                    name,
                },
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
