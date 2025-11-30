import { AddressData } from './types';

// Simulating the CSV data provided in the prompt plus generated extra data for visualization
export const MOCK_DATA: AddressData[] = [
  {
    rank: 1,
    address: "0x43e9abea1910387c4292bca4b94de81462f8a251",
    alias: "HyperLabs",
    hype_balance: 0.0,
    staked_hype: 240281241.46,
    total_hype: 240281241.46,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: true,
    airdrop_balance: 238000000.0
  },
  {
    rank: 2,
    address: "0xd57ecca444a9acb7208d286be439de12dd09de5d",
    alias: "Hyper Foundation",
    hype_balance: 0.0,
    staked_hype: 60670774.86,
    total_hype: 60670774.86,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: true,
    airdrop_balance: 60000000.0
  },
  {
    rank: 3,
    address: "0x2222222222222222222222222222222222222222",
    alias: "HyperEVM Bridge",
    hype_balance: 54775432.46,
    staked_hype: 0.0,
    total_hype: 54775432.46,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: false,
    airdrop_balance: 0.0
  },
  {
    rank: 4,
    address: "0xfefefefefefefefefefefefefefefefefefefefe",
    alias: "Assistance Fund",
    hype_balance: 36089065.22,
    staked_hype: 0.0,
    total_hype: 36089065.22,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: false,
    airdrop_balance: 0.0
  },
  {
    rank: 5,
    address: "0x393d0b87ed38fc779fd9611144ae649ba6082109",
    alias: undefined,
    hype_balance: 0.0,
    staked_hype: 25007700.77,
    total_hype: 25007700.77,
    open_interest: 5000000, // Whale trader
    pnl: 120000,
    is_airdrop_address: false,
    airdrop_balance: 0.0
  },
  {
    rank: 6,
    address: "0xa20fcfa0507fe762011962cc581b95bbbc3bbdba",
    alias: undefined,
    hype_balance: 0.0,
    staked_hype: 3061514.12,
    total_hype: 3061514.12,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: true,
    airdrop_balance: 3000000.0
  },
  {
    rank: 7,
    address: "0xe44bd27c9f10fa2f89fdb3ab4b4f0e460da29ea8",
    alias: undefined,
    hype_balance: 0.0,
    staked_hype: 2695143.09,
    total_hype: 2695143.09,
    open_interest: 250000,
    pnl: -5000,
    is_airdrop_address: false,
    airdrop_balance: 0.0
  },
  {
    rank: 8,
    address: "0x51156f7002c4f74f4956c9e0f2b7bfb6e9dbfac2",
    alias: undefined,
    hype_balance: 2429107.78,
    staked_hype: 0.0,
    total_hype: 2429107.78,
    open_interest: 0,
    pnl: 0,
    is_airdrop_address: false,
    airdrop_balance: 0.0
  },
  // Generated data with Open Interest and PnL
  ...Array.from({ length: 40 }, (_, i) => {
    const isWhale = Math.random() > 0.9;
    const isTrader = Math.random() > 0.4;
    
    const hypeBal = isWhale ? Math.random() * 500000 + 50000 : Math.random() * 5000 + 100;
    const staked = isWhale ? hypeBal * 0.8 : 0;
    
    // Generate Perp Data
    const oi = isTrader ? (isWhale ? Math.random() * 5000000 : Math.random() * 50000) : 0;
    const pnl = isTrader ? (Math.random() - 0.5) * oi * 0.2 : 0; // +/- 10% PnL

    return {
      rank: 9 + i,
      address: `0x${Math.random().toString(16).slice(2, 42)}`,
      alias: undefined,
      hype_balance: hypeBal,
      staked_hype: staked,
      total_hype: hypeBal + staked,
      open_interest: oi,
      pnl: pnl,
      is_airdrop_address: Math.random() > 0.5,
      airdrop_balance: Math.random() * 5000
    };
  })
];

export const CLUSTER_THRESHOLDS = {
  SPOT_WHALE: 1000000, // 1M+ HYPE
  SPOT_MID_FLOOR: 10000, // 10k - 1M
  
  PERP_WHALE_OI: 1000000, // $1M+ OI
  PERP_MID_OI_FLOOR: 10000 // $10k - $1M OI
};