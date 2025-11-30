import React from 'react';
import { MetricCardProps } from '../types';
import { ArrowUpRightIcon, ArrowDownRightIcon, MinusIcon } from '@heroicons/react/24/outline';

export const DashboardCard: React.FC<MetricCardProps> = ({ title, value, subValue, trend, icon }) => {
  let TrendIcon = MinusIcon;
  let trendColor = 'text-gray-500';

  if (trend === 'up') {
    TrendIcon = ArrowUpRightIcon;
    trendColor = 'text-hyper-green';
  } else if (trend === 'down') {
    TrendIcon = ArrowDownRightIcon;
    trendColor = 'text-red-500';
  }

  return (
    <div className="bg-hyper-card border border-hyper-border rounded-xl p-6 flex flex-col justify-between hover:border-hyper-teal/30 transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-hyper-text text-sm font-medium uppercase tracking-wider">{title}</h3>
        {icon && <div className="text-hyper-teal opacity-70 group-hover:opacity-100 transition-opacity">{icon}</div>}
      </div>
      <div>
        <div className="text-2xl font-bold text-hyper-white mb-1">{value}</div>
        <div className="flex items-center text-sm">
          {subValue && (
            <>
              <span className={`flex items-center ${trendColor} mr-2`}>
                <TrendIcon className="w-4 h-4 mr-1" />
              </span>
              <span className="text-gray-400">{subValue}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
