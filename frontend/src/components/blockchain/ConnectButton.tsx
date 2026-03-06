'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';

export function ConnectButton() {
    const { address, isConnected } = useAccount();
    const { connect } = useConnect();
    const { disconnect } = useDisconnect();

    if (isConnected && address) {
        const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;
        return (
            <button
                onClick={() => disconnect()}
                className="btn btn-secondary"
                title="Click to disconnect"
            >
                <span className="mr-2 h-2 w-2 rounded-full bg-success"></span>
                {shortAddress}
            </button>
        );
    }

    return (
        <button
            onClick={() => connect({ connector: injected() })}
            className="btn btn-primary"
        >
            Connect Wallet
        </button>
    );
}
