import React, { useState, useEffect } from 'react';
import { ClusterType } from '../types';
import { LayoutDashboard, Landmark, Fish, Wallet, Sprout } from 'lucide-react';

interface SidebarProps {
  activeView: ClusterType;
  setActiveView: (view: ClusterType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  
  // Determine initial market state based on activeView
  const isPerpView = activeView.toString().includes('PERP');
  const [marketTab, setMarketTab] = useState<'SPOT' | 'PERP'>(isPerpView ? 'PERP' : 'SPOT');

  // Update internal tab state if activeView changes externally
  useEffect(() => {
    if (activeView.toString().includes('PERP')) setMarketTab('PERP');
    else if (activeView.toString().includes('SPOT')) setMarketTab('SPOT');
  }, [activeView]);

  const handleTabSwitch = (tab: 'SPOT' | 'PERP') => {
    setMarketTab(tab);
    // Auto-switch view context if currently in a cluster view to maintain user context
    if (activeView !== ClusterType.ALL && activeView !== ClusterType.OFFICIAL) {
        if (tab === 'SPOT') {
            if (activeView === ClusterType.PERP_WHALE) setActiveView(ClusterType.SPOT_WHALE);
            else if (activeView === ClusterType.PERP_MID) setActiveView(ClusterType.SPOT_MID);
            else if (activeView === ClusterType.PERP_RETAIL) setActiveView(ClusterType.SPOT_RETAIL);
            else setActiveView(ClusterType.SPOT_WHALE); // Default fallback
        } else {
             if (activeView === ClusterType.SPOT_WHALE) setActiveView(ClusterType.PERP_WHALE);
             else if (activeView === ClusterType.SPOT_MID) setActiveView(ClusterType.PERP_MID);
             else if (activeView === ClusterType.SPOT_RETAIL) setActiveView(ClusterType.PERP_RETAIL);
             else setActiveView(ClusterType.PERP_WHALE); // Default fallback
        }
    }
  };

  // Dynamic Cluster Types based on Tab
  const whaleType = marketTab === 'SPOT' ? ClusterType.SPOT_WHALE : ClusterType.PERP_WHALE;
  const midType = marketTab === 'SPOT' ? ClusterType.SPOT_MID : ClusterType.PERP_MID;
  const retailType = marketTab === 'SPOT' ? ClusterType.SPOT_RETAIL : ClusterType.PERP_RETAIL;
  
  const whaleLabel = marketTab === 'SPOT' ? '巨鲸大户' : '巨鲸大户';
  const midLabel = marketTab === 'SPOT' ? '中层用户' : '合约高手';
  const retailLabel = marketTab === 'SPOT' ? '散户群体' : '高频/散户';

  const navItemClass = (isActive: boolean) => `w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-hyper-teal/10 text-hyper-teal border border-hyper-teal/20'
        : 'text-gray-400 hover:bg-hyper-card hover:text-hyper-white'
    }`;

  const isTabActive = (tab: 'SPOT' | 'PERP') => marketTab === tab;

  return (
    <div className="w-64 bg-hyper-dark border-r border-hyper-border flex flex-col h-screen fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-hyper-border/50">
        <img 
            src="https://hyperliquid.gitbook.io/hyperliquid-docs/~gitbook/image?url=https%3A%2F%2F2356094849-files.gitbook.io%2F%7E%2Ffiles%2Fv0%2Fb%2Fgitbook-x-prod.appspot.com%2Fo%2Fspaces%252FyUdp569E6w18GdfqlGvJ%252Ficon%252FsIAjqhKKIUysM08ahKPh%252FHL-logoSwitchDISliStat.png%3Falt%3Dmedia%26token%3Da81fa25c-0510-4d97-87ff-3fb8944935b1&width=32&dpr=4&quality=100&sign=3e1219e3&sv=2" 
            alt="Hyperliquid" 
            className="w-8 h-8 mr-3"
        />
        <span className="text-lg font-bold text-hyper-white tracking-tight">HypeAnalytics</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-3 overflow-y-auto">
        
        {/* Core Views */}
        <div className="space-y-1 mb-2">
           <button
            onClick={() => setActiveView(ClusterType.ALL)}
            className={navItemClass(activeView === ClusterType.ALL)}
          >
            <LayoutDashboard size={18} />
            <span>全景概览</span>
          </button>
           <button
            onClick={() => setActiveView(ClusterType.OFFICIAL)}
            className={navItemClass(activeView === ClusterType.OFFICIAL)}
          >
            <Landmark size={18} />
            <span>官方 & 项目方</span>
          </button>
        </div>

        {/* Separator */}
        <div className="h-px bg-hyper-border/50 mx-2 my-4"></div>

        {/* Market Tabs */}
        <div className="mx-2 mb-4 bg-[#0F161C] p-1 rounded-lg flex border border-hyper-border/50">
            <button 
                onClick={() => handleTabSwitch('SPOT')}
                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${isTabActive('SPOT') ? 'bg-hyper-teal text-[#0B1217] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
                现货 SPOT
            </button>
            <button 
                onClick={() => handleTabSwitch('PERP')}
                className={`flex-1 text-xs font-bold py-1.5 rounded-md transition-all ${isTabActive('PERP') ? 'bg-hyper-teal text-[#0B1217] shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
                合约 PERPS
            </button>
        </div>

        {/* Dynamic Market Views */}
        <div className="space-y-1">
            <button
                onClick={() => setActiveView(whaleType)}
                className={navItemClass(activeView === whaleType)}
            >
                <Fish size={18} />
                <span>{whaleLabel}</span>
            </button>
            <button
                onClick={() => setActiveView(midType)}
                className={navItemClass(activeView === midType)}
            >
                <Wallet size={18} />
                <span>{midLabel}</span>
            </button>
            <button
                onClick={() => setActiveView(retailType)}
                className={navItemClass(activeView === retailType)}
            >
                <Sprout size={18} />
                <span>{retailLabel}</span>
            </button>
        </div>

      </div>

      {/* Footer */}
      <div className="p-4 border-t border-hyper-border bg-[#0F161C]">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">数据来源</div>
        <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-hyper-teal bg-hyper-teal/5 p-2 rounded border border-hyper-teal/10 hover:bg-hyper-teal/10 transition-colors cursor-default">
                <span>HypurrScan API</span>
                <div className="w-1.5 h-1.5 bg-hyper-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
             <div className="flex items-center justify-between text-xs text-hyper-teal bg-hyper-teal/5 p-2 rounded border border-hyper-teal/10 hover:bg-hyper-teal/10 transition-colors cursor-default">
                <span>Hyperliquid Official API</span>
                <div className="w-1.5 h-1.5 bg-hyper-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            </div>
        </div>
      </div>
    </div>
  );
};
