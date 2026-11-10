import React, { useState } from 'react';
import { LedgerEntry, Project } from '../../types';
import { BookOpen, Search, X, TrendingUp, Filter } from 'lucide-react';
import { formatCurrency, formatDate, formatRelativeTime } from '../../utils/formatters';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InvestmentLedgerProps {
  ledgerEntries: LedgerEntry[];
  projects: Project[];
}

export default function InvestmentLedger({
  ledgerEntries = [],
  projects = []
}: InvestmentLedgerProps) {
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [ledgerProjectFilter, setLedgerProjectFilter] = useState('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState('all');

  const filteredEntries = ledgerEntries.filter(e => {
    const matchesSearch = !ledgerSearch || 
      (e.investor_name?.toLowerCase().includes(ledgerSearch.toLowerCase()) || false) ||
      (e.investor_login_id?.toLowerCase().includes(ledgerSearch.toLowerCase()) || false) ||
      (e.project_name?.toLowerCase().includes(ledgerSearch.toLowerCase()) || false) ||
      (e.note?.toLowerCase().includes(ledgerSearch.toLowerCase()) || false);

    const matchesProject = ledgerProjectFilter === 'all' || e.project_id === Number(ledgerProjectFilter);
    const matchesType = ledgerTypeFilter === 'all' || e.transaction_type === ledgerTypeFilter;

    return matchesSearch && matchesProject && matchesType;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-redhill-red" />
            <h1 className="text-3xl font-bold text-redhill-charcoal font-serif">Investment Ledger System</h1>
          </div>
          <p className="text-redhill-muted mt-1">Audit log of all investor assignments, sub-investments, and capital upgrades.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-redhill-line p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              placeholder="Search ledger by investor name, ID, project, or notes..."
              className="w-full bg-[#FBF9F5] border border-redhill-line rounded-xl pl-11 pr-4 py-2.5 text-sm text-redhill-charcoal placeholder-stone-400 focus:outline-none focus:bg-redhill-sand/70 focus:border-redhill-red/40"
            />
            {ledgerSearch && (
              <button onClick={() => setLedgerSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-redhill-charcoal">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={ledgerProjectFilter}
              onChange={(e) => setLedgerProjectFilter(e.target.value)}
              className="bg-[#FBF9F5] border border-redhill-line text-stone-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-redhill-red/40"
            >
              <option value="all" className="bg-white">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-white">{p.name}</option>
              ))}
            </select>

            <select
              value={ledgerTypeFilter}
              onChange={(e) => setLedgerTypeFilter(e.target.value)}
              className="bg-[#FBF9F5] border border-redhill-line text-stone-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:border-redhill-red/40"
            >
              <option value="all" className="bg-white">All Types</option>
              <option value="initial_assignment" className="bg-white">Initial Assignment</option>
              <option value="sub_investment" className="bg-white">Sub-Investment</option>
              <option value="adjustment" className="bg-white">Adjustment</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-redhill-line">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-redhill-ivory border-b border-redhill-line text-[10px] font-bold text-redhill-muted uppercase tracking-widest">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Investor</th>
                <th className="px-5 py-3">Project</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Capital Amount</th>
                <th className="px-5 py-3">Allotted Sqft</th>
                <th className="px-5 py-3">Inv / Market Rate</th>
                <th className="px-5 py-3">Remarks / Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-redhill-line text-sm">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-[#FBF9F5] transition-colors">
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-redhill-charcoal text-xs">{formatDate(entry.transaction_date)}</p>
                    <p className="text-[10px] text-stone-500">{formatRelativeTime(entry.created_at)}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="font-bold text-redhill-charcoal">{entry.investor_name}</p>
                    <p className="text-xs text-redhill-muted font-mono">ID: {entry.investor_login_id || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-medium text-redhill-charcoal">{entry.project_name}</span>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    {entry.transaction_type === 'initial_assignment' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-700 border border-blue-500/20">
                        Initial Assignment
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        <TrendingUp className="w-3 h-3" /> Sub-Investment
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-emerald-700">+{formatCurrency(entry.investment_amount)}</p>
                    {entry.contribution && <p className="text-[11px] text-redhill-muted">{entry.contribution}</p>}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <p className="font-bold text-redhill-charcoal">+{entry.allotted_sqft?.toLocaleString('en-IN') || 0} sqft</p>
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                    <p className="text-stone-700">Inv: {formatCurrency(entry.price_at_investment)}/sqft</p>
                    <p className="text-emerald-700 font-medium">Mkt: {formatCurrency(entry.market_price_per_sqft)}/sqft</p>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    <p className="text-xs text-stone-700 truncate" title={entry.note}>{entry.note || 'No notes'}</p>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-stone-500">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold">No ledger transactions found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
