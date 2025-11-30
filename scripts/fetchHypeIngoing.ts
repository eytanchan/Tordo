import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// You can change this address to check different users
const ADDRESS = '0x9b83f16d0a6456f90a8a330f04c0ca1b2f0425b0';
const HYPERLIQUID_API = 'https://api.hyperliquid.xyz/info';

async function fetchLedgerUpdates() {
    console.log('Fetching Ledger Updates for Ingoing Analysis...');
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
    const ledgerUpdates = await fetchLedgerUpdates();

    const ingoingHypeTransfers: { [sender: string]: number } = {};
    const genesisReceived: { [label: string]: number } = {};
    const processedHashes = new Set<string>();

    if (ledgerUpdates && Array.isArray(ledgerUpdates)) {
        for (const update of ledgerUpdates) {
            const delta = update.delta;
            // Ensure we are only looking at HYPE
            if (!delta || delta.token !== 'HYPE') continue;

            const amount = parseFloat(delta.amount);
            if (isNaN(amount) || amount <= 0 || processedHashes.has(update.hash)) continue;

            // 1. Genesis (Airdrops/Initial Allocation)
            if (delta.type === 'spotGenesis') {
                const label = 'Genesis';
                genesisReceived[label] = (genesisReceived[label] || 0) + amount;
                processedHashes.add(update.hash);
            }
            // 2. Standard Ingoing Transfers (Sender -> Me)
            else if (delta.type === 'spotTransfer' || delta.type === 'send') {
                if (delta.destination === ADDRESS && delta.user) {
                    ingoingHypeTransfers[delta.user] = (ingoingHypeTransfers[delta.user] || 0) + amount;
                    processedHashes.add(update.hash);
                }
            }
            // 3. Note: We explicitly ignore 'cStakingTransfer' (deposits) per instruction.
        }
    }

    // Prepare sorted results
    const sortedIngoingHypeTransfers = Object.entries(ingoingHypeTransfers)
        .sort(([, amountA], [, amountB]) => amountB - amountA)
        .map(([sender, amount]) => ({ sender, amount }));

    const sortedGenesis = Object.entries(genesisReceived)
        .map(([label, amount]) => ({ label, amount }));

    const totalIngoing = sortedIngoingHypeTransfers.reduce((acc, cur) => acc + cur.amount, 0);
    const totalGenesis = sortedGenesis.reduce((acc, cur) => acc + cur.amount, 0);

    const results = {
        timestamp: new Date().toISOString(),
        address: ADDRESS,
        analysisType: "HYPE Ingoing & Genesis Only",
        summary: {
            totalGenesisReceived: totalGenesis,
            totalIngoingTransfers: totalIngoing
        },
        genesis: {
            count: sortedGenesis.length,
            details: sortedGenesis
        },
        ingoingTransfers: {
            count: sortedIngoingHypeTransfers.length,
            details: sortedIngoingHypeTransfers
        }
    };

    console.log('\n========== HYPE INGOING ANALYSIS ==========');
    console.log(JSON.stringify(results, null, 2));

    // Save to file
    const scriptDir = path.dirname(fileURLToPath(import.meta.url));
    const outputDir = path.join(scriptDir, '../info_data');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const filePath = path.join(outputDir, `hype_ingoing_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
    console.log(`\nIngoing analysis saved to ${filePath}`);
}

main();
