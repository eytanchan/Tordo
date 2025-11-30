import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { DashboardCard } from './components/DashboardCard';
import { DataTable } from './components/DataTable';
import { MOCK_DATA } from './constants';
import { filterByCluster, calculateStakingRatio, formatNumber } from './services/dataAnalysis';
import { ClusterType, AddressData } from './types';
import ReactECharts from 'echarts-for-react';
import { CurrencyDollarIcon, WalletIcon as AnchorIcon, ArrowTrendingUpIcon, UsersIcon } from '@heroicons/react/24/outline';

const App: React.FC = () => {
    const [activeView, setActiveView] = useState<ClusterType>(ClusterType.ALL);

    // Memoized derived data
    const filteredData = useMemo(() => filterByCluster(MOCK_DATA, activeView), [activeView]);
    const stakingRatio = useMemo(() => calculateStakingRatio(MOCK_DATA), []);
    const totalHypeTracked = useMemo(() => MOCK_DATA.reduce((acc, curr) => acc + curr.total_hype, 0), []);
    const genesisCount = useMemo(() => MOCK_DATA.filter(d => d.is_airdrop_address).length, []);

    // Charts Data Prep
    const distributionData = [
        { name: '官方份额', value: filterByCluster(MOCK_DATA, ClusterType.OFFICIAL).reduce((acc, c) => acc + c.total_hype, 0), color: '#0D9488' }, // Teal 600
        { name: '巨鲸', value: filterByCluster(MOCK_DATA, ClusterType.SPOT_WHALE).reduce((acc, c) => acc + c.total_hype, 0), color: '#2DD4BF' }, // Teal 400
        { name: '中户', value: filterByCluster(MOCK_DATA, ClusterType.SPOT_MID).reduce((acc, c) => acc + c.total_hype, 0), color: '#99F6E4' }, // Teal 200
        { name: '散户', value: filterByCluster(MOCK_DATA, ClusterType.SPOT_RETAIL).reduce((acc, c) => acc + c.total_hype, 0), color: '#F0FDFA' }, // Teal 50
    ];

    // ECharts Pie Chart Option
    const pieOption = {
        backgroundColor: 'transparent',
        tooltip: {
            trigger: 'item',
            backgroundColor: '#151E25',
            borderColor: '#2C3B47',
            textStyle: { color: '#F8FAFC' },
            formatter: (params: any) => `${params.name}: ${formatNumber(params.value)} (${params.percent.toFixed(1)}%)`
        },
        series: [{
            type: 'pie',
            radius: ['60%', '80%'],
            center: ['50%', '50%'],
            data: distributionData.map(d => ({
                name: d.name,
                value: d.value,
                itemStyle: { color: d.color }
            })),
            label: { show: false },
            labelLine: { show: false },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(45, 212, 191, 0.5)'
                }
            }
        }]
    };

    // ECharts Bar Chart Option
    const barOption = {
        backgroundColor: 'transparent',
        grid: { top: 20, right: 20, bottom: 30, left: 50 },
        xAxis: {
            type: 'category',
            data: filteredData.slice(0, 5).map(d => `#${d.rank}`),
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#94A3B8', fontSize: 10 }
        },
        yAxis: { type: 'value', show: false },
        series: [
            {
                name: '已质押',
                type: 'bar',
                stack: 'total',
                data: filteredData.slice(0, 5).map(d => d.staked_hype),
                itemStyle: {
                    color: '#2DD4BF',
                    borderRadius: [0, 0, 4, 4]
                }
            },
            {
                name: '流动',
                type: 'bar',
                stack: 'total',
                data: filteredData.slice(0, 5).map(d => d.hype_balance),
                itemStyle: {
                    color: '#0F161C',
                    borderColor: '#2DD4BF',
                    borderWidth: 1,
                    borderRadius: [4, 4, 0, 0]
                }
            }
        ],
        tooltip: {
            trigger: 'axis',
            backgroundColor: '#151E25',
            borderColor: '#2C3B47',
            textStyle: { color: '#F8FAFC' },
            axisPointer: {
                type: 'shadow',
                shadowStyle: {
                    color: 'rgba(44, 59, 71, 0.4)'
                }
            }
        }
    };

    const getTitle = (view: ClusterType) => {
        switch (view) {
            case ClusterType.ALL: return "生态系统全景";
            case ClusterType.OFFICIAL: return "官方 & 项目方";
            case ClusterType.SPOT_WHALE: return "现货市场 - 巨鲸大户";
            case ClusterType.SPOT_MID: return "现货市场 - 中层用户";
            case ClusterType.SPOT_RETAIL: return "现货市场 - 散户群体";
            case ClusterType.PERP_WHALE: return "合约市场 - 巨鲸大户";
            case ClusterType.PERP_MID: return "合约市场 - 合约高手";
            case ClusterType.PERP_RETAIL: return "合约市场 - 高频/散户";
            default: return "数据看板";
        }
    };

    const renderAnalystOpinion = () => (
        <div className="bg-gradient-to-r from-hyper-card to-[#0F161C] border border-hyper-border rounded-xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-hyper-teal/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <h3 className="text-hyper-white font-bold text-lg mb-2 relative z-10">📊 分析师笔记</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-5xl relative z-10">
                当前生态数据显示 $HYPE 代币高度集中在 <span className="text-hyper-white">官方渠道（HyperLabs, 基金会）</span>，约占追踪总量的 70% 以上。
                然而，<span className="text-hyper-teal"> 巨鲸集群 </span>（非官方账户 &gt;1M HYPE）自 TGE 以来显示出持续的积累迹象。
                散户质押率保持在 {stakingRatio.toFixed(1)}%，表明尽管近期市场波动，社区共识依然强劲。
                建议重点监控 <span className="text-hyper-white">HyperEVM 跨链桥</span> 的资金流出情况，以预测短期的抛压风险。
            </p>
        </div>
    );

    return (
        <div className="min-h-screen bg-hyper-dark text-hyper-white font-sans flex">
            {/* Sidebar */}
            <Sidebar activeView={activeView} setActiveView={setActiveView} />

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">

                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-hyper-white">
                            {getTitle(activeView)}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm">基于链上数据的实时聚类分析</p>
                    </div>
                    <div className="flex space-x-3">
                        <button className="px-4 py-2 bg-hyper-card border border-hyper-border rounded-lg text-sm text-gray-300 hover:text-white hover:border-hyper-teal transition-colors">
                            导出 CSV
                        </button>
                    </div>
                </div>

                {/* Global KPI Cards (Always visible or specific to view) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <DashboardCard
                        title="已追踪 HYPE 总量"
                        value={formatNumber(totalHypeTracked)}
                        subValue="覆盖当前所有聚类"
                        icon={<CurrencyDollarIcon className="w-5 h-5" />}
                    />
                    <DashboardCard
                        title="全网质押率"
                        value={`${stakingRatio.toFixed(2)}%`}
                        subValue="本周环比 +1.2%"
                        trend="up"
                        icon={<AnchorIcon className="w-5 h-5" />}
                    />
                    <DashboardCard
                        title="空投留存率"
                        value={`${((genesisCount / MOCK_DATA.length) * 100).toFixed(1)}%`}
                        subValue="基于初始空投地址追踪"
                        trend="neutral"
                        icon={<UsersIcon className="w-5 h-5" />}
                    />
                    <DashboardCard
                        title="24h 交易量 (预估)"
                        value="$3.35T"
                        subValue="Hyperliquid 交易所"
                        trend="up"
                        icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
                    />
                </div>

                {/* Analyst Note - Only on Overview */}
                {activeView === ClusterType.ALL && renderAnalystOpinion()}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Data Table (Span 2) */}
                    <div className="lg:col-span-2 h-[600px]">
                        <DataTable data={filteredData} title={activeView === ClusterType.ALL ? "持仓排名 TOP 榜单" : "聚类详细数据"} viewType={activeView} />
                    </div>

                    {/* Right Column: Visualizations */}
                    <div className="space-y-8">

                        {/* Distribution Pie Chart */}
                        <div className="bg-hyper-card border border-hyper-border rounded-xl p-6">
                            <h3 className="text-hyper-white font-semibold mb-6">持仓分布情况</h3>
                            <div className="h-64 w-full">
                                <ReactECharts option={pieOption} style={{ height: '100%', width: '100%' }} />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                {distributionData.map((d) => (
                                    <div key={d.name} className="flex items-center space-x-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }}></div>
                                        <span className="text-sm text-gray-400">{d.name}</span>
                                        <span className="text-sm font-medium text-white ml-auto">{((d.value / totalHypeTracked) * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Stacked vs Liquid Bar Chart (Contextual) */}
                        <div className="bg-hyper-card border border-hyper-border rounded-xl p-6">
                            <h3 className="text-hyper-white font-semibold mb-6">前 5 名持仓结构：质押 vs 流动</h3>
                            <div className="h-48 w-full">
                                <ReactECharts option={barOption} style={{ height: '100%', width: '100%' }} />
                            </div>
                            <div className="flex justify-center space-x-6 mt-4 text-xs">
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-hyper-teal rounded-sm"></div>
                                    <span className="text-gray-400">已质押</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 border border-hyper-teal bg-[#0F161C] rounded-sm"></div>
                                    <span className="text-gray-400">流动中</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;