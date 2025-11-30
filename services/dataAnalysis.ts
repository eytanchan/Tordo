import { AddressData, ClusterType } from '../types';
import { CLUSTER_THRESHOLDS } from '../constants';

export const filterByCluster = (data: AddressData[], cluster: ClusterType): AddressData[] => {
  switch (cluster) {
    case ClusterType.OFFICIAL:
      return data.filter(d => !!d.alias);
      
    // SPOT FILTERS
    case ClusterType.SPOT_WHALE:
      return data.filter(d => !d.alias && d.total_hype >= CLUSTER_THRESHOLDS.SPOT_WHALE);
    case ClusterType.SPOT_MID:
      return data.filter(d => !d.alias && d.total_hype < CLUSTER_THRESHOLDS.SPOT_WHALE && d.total_hype >= CLUSTER_THRESHOLDS.SPOT_MID_FLOOR);
    case ClusterType.SPOT_RETAIL:
      return data.filter(d => !d.alias && d.total_hype < CLUSTER_THRESHOLDS.SPOT_MID_FLOOR);
      
    // PERP FILTERS
    case ClusterType.PERP_WHALE:
      return data.filter(d => (d.open_interest || 0) >= CLUSTER_THRESHOLDS.PERP_WHALE_OI);
    case ClusterType.PERP_MID:
      return data.filter(d => (d.open_interest || 0) < CLUSTER_THRESHOLDS.PERP_WHALE_OI && (d.open_interest || 0) >= CLUSTER_THRESHOLDS.PERP_MID_OI_FLOOR);
    case ClusterType.PERP_RETAIL:
      return data.filter(d => (d.open_interest || 0) > 0 && (d.open_interest || 0) < CLUSTER_THRESHOLDS.PERP_MID_OI_FLOOR);
      
    default:
      return data;
  }
};

export const formatNumber = (num: number): string => {
  if (Math.abs(num) >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
  if (Math.abs(num) >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (Math.abs(num) >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
};

export const formatAddress = (addr: string): string => {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export const calculateStakingRatio = (data: AddressData[]): number => {
    const total = data.reduce((acc, curr) => acc + curr.total_hype, 0);
    const staked = data.reduce((acc, curr) => acc + curr.staked_hype, 0);
    return total > 0 ? (staked / total) * 100 : 0;
};