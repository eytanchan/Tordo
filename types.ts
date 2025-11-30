// Fix: Import React to resolve namespace error for React.ReactNode
import React from 'react';

export interface AddressData {
  rank: number;
  address: string;
  alias?: string;
  hype_balance: number;
  staked_hype: number;
  total_hype: number;
  // New fields for Perps
  open_interest?: number;
  pnl?: number;
  is_airdrop_address: boolean;
  airdrop_balance: number;
}

export enum ClusterType {
  ALL = 'ALL',
  OFFICIAL = 'OFFICIAL',
  
  // Spot Clusters
  SPOT_WHALE = 'SPOT_WHALE',
  SPOT_MID = 'SPOT_MID',
  SPOT_RETAIL = 'SPOT_RETAIL',
  
  // Perp Clusters
  PERP_WHALE = 'PERP_WHALE',
  PERP_MID = 'PERP_MID',
  PERP_RETAIL = 'PERP_RETAIL'
}

export interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ReactNode;
}