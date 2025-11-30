import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const ADDRESS = '0x9b83f16d0a6456f90a8a330f04c0ca1b2f0425b0';
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';

async function fetchL1SpotState() {
    console.log('Fetching L1 Spot Clearinghouse State...');
    try {
        const response = await fetch(HYPERLIQUID_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'spotClearinghouseState',
                user: ADDRESS
            })
        });
        return await response.json();
    } catch (e) {
        console.error('L1 Spot Error:', e);
        return null;
    }
}

async function fetchStakingInfo() {
    console.log('Fetching Staking Summary...');
    try {
        const response = await fetch(HYPERLIQUID_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'delegatorSummary',
                user: ADDRESS
            })
        });
        return await response.json();
    } catch (e) {
        console.error('Staking Error:', e);
        return null;
    }
}

async function fetchSpotFills() {
    console.log('Fetching Spot Fills (Trade History)...');
    try {
        const response = await fetch(HYPERLIQUID_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userFills',
                user: ADDRESS
            })
        });
        return await response.json();
    } catch (e) {
        console.error('Spot Fills Error:', e);
        return null;
    }
}

async function fetchLedgerUpdates() {
    console.log('Fetching Ledger Updates...');
    try {
        const response = await fetch(HYPERLIQUID_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'userNonFundingLedgerUpdates',
                user: ADDRESS
            })
        });
        return await response.json();
    } catch (e) {
        console.error('Ledger Updates Error:', e);
        return null;
    }
}

async function main() {
    const [spotState, stakingState, spotFills, ledgerUpdates] = await Promise.all([
        fetchL1SpotState(),
        fetchStakingInfo(),
        fetchSpotFills(),
        fetchLedgerUpdates()
    ]);

    const results = {
        timestamp: new Date().toISOString(),
        address: ADDRESS,
        hyperliquidL1: {
            spotState: spotState,
            staking: stakingState,
            spotFills: spotFills,
            ledgerUpdates: ledgerUpdates
        }
    };

    // Filter for HYPE-specific information
    const hypeSpotBalance = results.hyperliquidL1.spotState?.balances?.find(b => b.coin === 'HYPE')?.total || '0.0';
    const hypeStakedBalance = results.hyperliquidL1.staking?.delegated || '0.0';
    const hypeUnstakedBalance = hypeSpotBalance; // On L1, spot is effectively unstaked

    const totalHypeBalance = parseFloat(hypeSpotBalance) + parseFloat(hypeStakedBalance);

    const outgoingHypeTransfers: { [destination: string]: number } = {};
    const ingoingHypeTransfers: { [sender: string]: number } = {};
    const genesisReceived: { [label: string]: number } = {};
    const processedHashes = new Set<string>(); // To handle potential duplicates or re-orgs

    if (results.hyperliquidL1.ledgerUpdates && Array.isArray(results.hyperliquidL1.ledgerUpdates)) {
        for (const update of results.hyperliquidL1.ledgerUpdates) {
            const delta = update.delta;
            if (!delta || delta.token !== 'HYPE') continue;

            const amount = parseFloat(delta.amount);
            if (isNaN(amount) || amount <= 0 || processedHashes.has(update.hash)) continue;

            // 1. Standard Spot Transfers (Outgoing: User is Sender)
            if (delta.type === 'spotTransfer') {
                if (delta.user === ADDRESS && delta.destination) {
                    outgoingHypeTransfers[delta.destination] = (outgoingHypeTransfers[delta.destination] || 0) + amount;
                    processedHashes.add(update.hash);
                }
            }

            // 2. Ingoing Transfers (Sender -> Me) - Supports spotTransfer and send
            if (delta.type === 'spotTransfer' || delta.type === 'send') {
                if (delta.destination === ADDRESS && delta.user) {
                    ingoingHypeTransfers[delta.user] = (ingoingHypeTransfers[delta.user] || 0) + amount;
                    processedHashes.add(update.hash);
                }
            }

            // 3. Genesis (Airdrops/Initial Allocation)
            if (delta.type === 'spotGenesis') {
                const label = 'Genesis';
                genesisReceived[label] = (genesisReceived[label] || 0) + amount;
                processedHashes.add(update.hash);
            }
        }
    }

    // Sort destinations by amount
    const sortedOutgoingHypeTransfers = Object.entries(outgoingHypeTransfers)
        .sort(([, amountA], [, amountB]) => amountB - amountA)
        .map(([destination, amount]) => ({ destination, amount }));

    // Sort senders by amount
    const sortedIngoingHypeTransfers = Object.entries(ingoingHypeTransfers)
        .sort(([, amountA], [, amountB]) => amountB - amountA)
        .map(([sender, amount]) => ({ sender, amount }));

    const sortedGenesis = Object.entries(genesisReceived)
        .map(([label, amount]) => ({ label, amount }));

    const totalIngoing = sortedIngoingHypeTransfers.reduce((acc, cur) => acc + cur.amount, 0);
    const totalGenesis = sortedGenesis.reduce((acc, cur) => acc + cur.amount, 0);

    const hypeOnlyResults = {
        timestamp: results.timestamp,
        address: results.address,
        totalHypeBalance: totalHypeBalance,
        hypeBalances: {
            staked: parseFloat(hypeStakedBalance),
            unstakedL1Spot: parseFloat(hypeUnstakedBalance)
        },
        summary: {
            totalGenesisReceived: totalGenesis,
            totalIngoingTransfers: totalIngoing
        },
        hypeOutgoingTransfers: {
            count: sortedOutgoingHypeTransfers.length,
            details: sortedOutgoingHypeTransfers
        },
        hypeIngoingTransfers: {
            count: sortedIngoingHypeTransfers.length,
            details: sortedIngoingHypeTransfers
        },
        genesis: {
            count: sortedGenesis.length,
            details: sortedGenesis
        }
    };
    console.log('\n========== HYPE-SPECIFIC RESULTS ==========');
    console.log(JSON.stringify(hypeOnlyResults, null, 2));

    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const outputDir = path.join(scriptDir, '../info_data');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(
        path.join(outputDir, `hype_details_filtered_${Date.now()}.json`),
        JSON.stringify(hypeOnlyResults, null, 2)
    );
    console.log(`\nFiltered HYPE data saved to ${outputDir}`);
}

main();
