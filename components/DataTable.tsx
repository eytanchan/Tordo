import React from 'react';
import { AddressData, ClusterType } from '../types';
import { formatNumber, formatAddress } from '../services/dataAnalysis';
import { ArrowTopRightOnSquareIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

interface DataTableProps {
  data: AddressData[];
  title: string;
  viewType: ClusterType;
}

export const DataTable: React.FC<DataTableProps> = ({ data, title, viewType }) => {

  const isPerpView = [ClusterType.PERP_WHALE, ClusterType.PERP_MID, ClusterType.PERP_RETAIL].includes(viewType);

  return (
    <div className="bg-hyper-card border border-hyper-border rounded-xl overflow-hidden flex flex-col h-full">
      <div className="p-4 border-b border-hyper-border flex justify-between items-center bg-[#0F161C]">
        <h3 className="text-hyper-white font-semibold text-lg">{title}</h3>
        <span className="text-xs text-hyper-text bg-hyper-dark px-2 py-1 rounded border border-hyper-border">
          {data.length} 条记录
        </span>
      </div>
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#0F161C] sticky top-0 z-10">
            <tr>
              <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border">排名</th>
              <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border">地址 / 别名</th>

              {isPerpView ? (
                <>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">合约持仓 (OI)</th>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">未实现盈亏 (PnL)</th>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">钱包余额 (HYPE)</th>
                </>
              ) : (
                <>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">持仓总量 (HYPE)</th>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">已质押</th>
                  <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-right">流动</th>
                </>
              )}

              <th className="p-4 text-xs font-semibold text-hyper-text uppercase tracking-wider border-b border-hyper-border text-center">来源</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-hyper-border">
            {data.map((row) => (
              <tr key={row.address} className="hover:bg-hyper-dark/50 transition-colors group">
                <td className="p-4 text-sm text-hyper-text font-mono">#{row.rank}</td>
                <td className="p-4">
                  <div className="flex flex-col">
                    {row.alias && <span className="text-hyper-teal font-medium text-sm mb-1">{row.alias}</span>}
                    <div className="flex items-center space-x-2">
                      <span className={`font-mono text-sm ${row.alias ? 'text-gray-500 text-xs' : 'text-hyper-white'}`}>
                        {formatAddress(row.address)}
                      </span>
                      <DocumentDuplicateIcon className="w-3 h-3 text-gray-600 hover:text-hyper-teal cursor-pointer" />
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-600 hover:text-hyper-teal cursor-pointer" />
                    </div>
                  </div>
                </td>

                {isPerpView ? (
                  <>
                    <td className="p-4 text-right text-sm font-medium text-hyper-white">
                      ${formatNumber(row.open_interest || 0)}
                    </td>
                    <td className={`p-4 text-right text-sm font-medium ${(row.pnl || 0) >= 0 ? 'text-hyper-green' : 'text-red-500'}`}>
                      {row.pnl && row.pnl > 0 ? '+' : ''}{formatNumber(row.pnl || 0)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400">
                      {formatNumber(row.total_hype)}
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-4 text-right text-sm font-medium text-hyper-white">
                      {formatNumber(row.total_hype)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400">
                      {formatNumber(row.staked_hype)}
                    </td>
                    <td className="p-4 text-right text-sm text-gray-400">
                      {formatNumber(row.hype_balance)}
                    </td>
                  </>
                )}

                <td className="p-4 text-center">
                  {row.is_airdrop_address ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-hyper-teal/10 text-hyper-teal border border-hyper-teal/20">
                      创世空投
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                      市场获取
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};