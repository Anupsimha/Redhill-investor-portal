import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Project, Milestone, LedgerEntry } from '../types';
import { Link } from 'react-router-dom';
import {
  MapPin, TrendingUp, ChevronRight,
  IndianRupee, Maximize, BarChart3, Wallet, LayoutDashboard, Calendar,
  Sparkles, Building2, Phone, X, Download, FileText, PieChart,
  CheckCircle2, Clock, BookOpen, MessageCircle, ArrowUpRight, Filter
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import ShowcaseExplore from '../components/ShowcaseExplore';
import InteractiveMap from '../components/InteractiveMap';
import Reveal from '../components/Reveal';
import { formatCurrency, formatDate } from '../utils/formatters';
import { apiFetch } from '../api/client';
import { getAssetUrl } from '../config/env';

interface InvestorDashboardProps {
  user: User;
  onLogout: () => void;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-IN');
}

export default function InvestorDashboard({ user, onLogout }: InvestorDashboardProps) {
  const [showAdSidebar, setShowAdSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'portfolio' | 'explore'>('portfolio');
  const [snapshotMode, setSnapshotMode] = useState<'editorial' | 'chart'>('editorial');
  const [selectedMilestoneProjectId, setSelectedMilestoneProjectId] = useState<number | 'all'>('all');
  const [ledgerProjectFilter, setLedgerProjectFilter] = useState<number | 'all'>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all');
  const reduceMotion = useReducedMotion();

  const { data: projects = [], isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ['investor-projects'],
    queryFn: async () => {
      const res = await apiFetch('/api/investor/projects');
      if (!res.ok) throw new Error('Failed to fetch projects');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  const { data: newProjects = [] } = useQuery<Project[]>({
    queryKey: ['investor-new-projects'],
    queryFn: async () => {
      const res = await apiFetch('/api/investor/new-projects');
      if (!res.ok) throw new Error('Failed to fetch new projects');
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch milestones & ledger across assigned projects for the unified dashboard sections
  const { data: portfolioDetails = [] } = useQuery<{
    projectId: number;
    projectName: string;
    milestones: Milestone[];
    ledger: LedgerEntry[];
  }[]>({
    queryKey: ['investor-portfolio-details', projects.map(p => p.id).join(',')],
    enabled: projects.length > 0,
    queryFn: async () => {
      const results = await Promise.all(
        projects.map(async (p) => {
          const [detailRes, ledgerRes] = await Promise.all([
            apiFetch(`/api/investor/projects/${p.id}`),
            apiFetch(`/api/investor/ledger/${p.id}`),
          ]);
          const detailData = detailRes.ok ? await detailRes.json() : { milestones: [] };
          const ledgerData = ledgerRes.ok ? await ledgerRes.json() : [];
          return {
            projectId: p.id,
            projectName: p.name,
            milestones: Array.isArray(detailData.milestones) ? detailData.milestones : [],
            ledger: Array.isArray(ledgerData)
              ? ledgerData.map((entry: LedgerEntry) => ({ ...entry, project_name: p.name }))
              : [],
          };
        })
      );
      return results;
    }
  });

  const loading = loadingProjects;

  const totalInvestment = projects.reduce((sum, p) => sum + (p.investment_amount || 0), 0);
  const totalSqft = projects.reduce((sum, p) => sum + (p.allotted_sqft || 0), 0);
  const totalMarketValue = projects.reduce((sum, p) => sum + ((p.allotted_sqft || 0) * (p.market_price_per_sqft || 0)), 0);
  const avgCompletion = projects.length > 0
    ? Math.round(projects.reduce((sum, p) => sum + p.completion_percentage, 0) / projects.length)
    : 0;

  const appreciation = totalMarketValue - totalInvestment;
  const appreciationPercent = totalInvestment > 0 ? ((appreciation / totalInvestment) * 100).toFixed(1) : '0.0';

  const hasAds = newProjects.length > 0 && showAdSidebar;

  const chartData = projects.map(p => ({
    name: p.name,
    Investment: p.investment_amount || 0,
    Value: (p.allotted_sqft || 0) * (p.market_price_per_sqft || 0)
  }));

  const allMilestones = useMemo(() => {
    const items: (Milestone & { projectName: string })[] = [];
    portfolioDetails.forEach(pd => {
      if (selectedMilestoneProjectId === 'all' || selectedMilestoneProjectId === pd.projectId) {
        pd.milestones.forEach(m => {
          items.push({ ...m, projectName: pd.projectName });
        });
      }
    });
    return items;
  }, [portfolioDetails, selectedMilestoneProjectId]);

  const allLedgerEntries = useMemo(() => {
    const items: LedgerEntry[] = [];
    portfolioDetails.forEach(pd => {
      if (ledgerProjectFilter === 'all' || ledgerProjectFilter === pd.projectId) {
        pd.ledger.forEach(entry => {
          if (ledgerTypeFilter === 'all' || entry.transaction_type === ledgerTypeFilter) {
            items.push(entry);
          }
        });
      }
    });
    return items;
  }, [portfolioDetails, ledgerProjectFilter, ledgerTypeFilter]);

  const downloadCSV = () => {
    if (projects.length === 0) return;

    const headers = ['Project Name', 'Location', 'Investment Date', 'Investment Amount (INR)', 'Allotted Area (sqft)', 'Buy Rate (INR/sqft)', 'Current Market Rate (INR/sqft)', 'Current Market Value (INR)'];

    const rows = projects.map(p => [
      p.name,
      p.location,
      p.investment_date ? formatDate(p.investment_date) : 'N/A',
      p.investment_amount || 0,
      p.allotted_sqft || 0,
      p.price_at_investment || 0,
      p.market_price_per_sqft || 0,
      (p.allotted_sqft || 0) * (p.market_price_per_sqft || 0)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `redhill_portfolio_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = async () => {
    if (projects.length === 0) return;

    const element = document.getElementById('portfolio-report');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#F7F4EE',
        useCORS: true
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`redhill_portfolio_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('Error generating PDF', err);
    }
  };

  if (!loading && (projects.length === 0 || viewMode === 'explore')) {
    return (
      <ShowcaseExplore
        user={user}
        onLogout={onLogout}
        apiProjects={newProjects}
        hasInvestments={projects.length > 0}
        onNavigateToPortfolio={() => setViewMode('portfolio')}
      />
    );
  }

  const greeting = (() => {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  })();

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* ================================================================ */}
      {/* EDITORIAL PORTFOLIO HEADER                                       */}
      {/* ================================================================ */}
      <section className="bg-white border-b border-redhill-line pt-10 sm:pt-12 pb-8">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: reduceMotion ? 0 : 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-px bg-redhill-red" />
                <span className="eyebrow text-redhill-gold">Private Wealth Portfolio · Bengaluru</span>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('explore')}
                className="btn-secondary py-2 px-4 text-xs uppercase tracking-[0.14em]"
              >
                <Sparkles className="w-3.5 h-3.5 text-redhill-gold" />
                Explore New Launches
              </button>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <h1 className="display text-3xl sm:text-4xl text-redhill-charcoal font-semibold">
                  {greeting},{' '}
                  <span className="text-redhill-gold">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-redhill-muted text-sm sm:text-base mt-2 max-w-xl">
                  Consolidated overview of your Redhill property holdings, prevailing market valuations, construction milestones and transaction ledger.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={downloadCSV}
                  disabled={projects.length === 0}
                  className="btn-secondary py-2.5 px-4 text-xs uppercase tracking-[0.14em]"
                >
                  <Download className="w-3.5 h-3.5 text-redhill-gold" />
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={downloadPDF}
                  disabled={projects.length === 0}
                  className="btn-dark py-2.5 px-4 text-xs uppercase tracking-[0.14em]"
                >
                  <FileText className="w-3.5 h-3.5 text-redhill-gold-soft" />
                  Portfolio PDF
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Primary Report Container (captured by html2canvas for PDF) */}
      <div id="portfolio-report" className="py-10 sm:py-12 max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 space-y-14">

        {/* ============================================================== */}
        {/* 01 — INVESTMENT OVERVIEW KPI STRIP                             */}
        {/* ============================================================== */}
        <section aria-label="Investment Overview">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                label: 'Total Invested Capital',
                value: formatCurrency(totalInvestment),
                icon: Wallet,
                hint: 'Committed principal',
                accent: false,
              },
              {
                label: 'Current Portfolio Value',
                value: formatCurrency(totalMarketValue),
                icon: BarChart3,
                hint: 'Prevailing market valuation',
                accent: true,
              },
              {
                label: 'Net Appreciation',
                value: `${appreciation >= 0 ? '+' : ''}${formatCurrency(appreciation)}`,
                icon: TrendingUp,
                hint: `${appreciation >= 0 ? '+' : ''}${appreciationPercent}% over cost basis`,
                accent: false,
                positive: appreciation >= 0,
              },
              {
                label: 'Allotted Area',
                value: `${formatNumber(totalSqft)} sqft`,
                icon: Maximize,
                hint: 'Gross portfolio footprint',
                accent: false,
              },
              {
                label: 'Active Holdings',
                value: `${projects.length} ${projects.length === 1 ? 'Asset' : 'Assets'}`,
                icon: Building2,
                hint: `${avgCompletion}% avg. site completion`,
                accent: false,
              },
            ].map((stat, idx) => (
              <Reveal
                key={stat.label}
                delay={idx * 0.04}
                className={`p-5 sm:p-6 rounded-lg border flex flex-col justify-between min-h-[144px] ${
                  stat.accent
                    ? 'bg-redhill-ink text-white border-redhill-ink'
                    : 'lux-card'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className={`eyebrow ${stat.accent ? 'text-redhill-gold-soft' : 'text-redhill-muted'}`}>
                    {stat.label}
                  </span>
                  <stat.icon className={`w-4 h-4 ${stat.accent ? 'text-redhill-gold-soft' : 'text-redhill-gold'}`} />
                </div>
                <div>
                  <p
                    className={`font-serif text-2xl sm:text-[1.65rem] tracking-tight tabular ${
                      stat.accent
                        ? 'text-white'
                        : 'positive' in stat
                        ? stat.positive
                          ? 'text-emerald-700'
                          : 'text-red-700'
                        : 'text-redhill-charcoal'
                    }`}
                  >
                    {stat.value}
                  </p>
                  <p className={`text-[11px] mt-1 ${stat.accent ? 'text-white/65' : 'text-redhill-muted'}`}>
                    {stat.hint}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 02 — INVESTMENT PORTFOLIO SNAPSHOT                             */}
        {/* ============================================================== */}
        {projects.length > 0 && (
          <Reveal className="lux-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-redhill-line">
              <div>
                <p className="eyebrow text-redhill-gold mb-1">01 — Portfolio Snapshot</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">
                  Valuation, Appreciation &amp; Allocation Weight
                </h2>
              </div>

              <div role="tablist" aria-label="Snapshot view" className="flex items-center bg-redhill-sand p-1 rounded-md border border-redhill-line self-start sm:self-auto">
                <button
                  type="button"
                  role="tab"
                  aria-selected={snapshotMode === 'editorial'}
                  onClick={() => setSnapshotMode('editorial')}
                  className={`btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer ${
                    snapshotMode === 'editorial'
                      ? 'bg-white text-redhill-charcoal shadow-xs'
                      : 'text-redhill-muted hover:text-redhill-charcoal'
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5 text-redhill-gold" />
                  Portfolio Breakdown
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={snapshotMode === 'chart'}
                  onClick={() => setSnapshotMode('chart')}
                  className={`btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer ${
                    snapshotMode === 'chart'
                      ? 'bg-white text-redhill-charcoal shadow-xs'
                      : 'text-redhill-muted hover:text-redhill-charcoal'
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5 text-redhill-gold" />
                  Comparative Chart
                </button>
              </div>
            </div>

            {/* Proportional allocation bar */}
            {totalMarketValue > 0 && (
              <div className="p-4 sm:p-5 rounded-md bg-redhill-ivory border border-redhill-line space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <span className="eyebrow text-redhill-muted">Portfolio Allocation by Market Value</span>
                  <span className="font-mono text-redhill-charcoal font-medium tabular">
                    Total Valuation: {formatCurrency(totalMarketValue)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-redhill-sand gap-0.5">
                  {projects.map((p, i) => {
                    const val = (p.allotted_sqft || 0) * (p.market_price_per_sqft || 0);
                    const pct = totalMarketValue > 0 ? Math.max(4, Math.round((val / totalMarketValue) * 100)) : 0;
                    const palette = ['bg-redhill-charcoal', 'bg-redhill-red', 'bg-redhill-gold', 'bg-stone-500'];
                    return (
                      <div
                        key={p.id}
                        style={{ width: `${pct}%` }}
                        className={`${palette[i % palette.length]} h-full transition-all duration-500`}
                        title={`${p.name}: ${pct}%`}
                      />
                    );
                  })}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1">
                  {projects.map((p, i) => {
                    const val = (p.allotted_sqft || 0) * (p.market_price_per_sqft || 0);
                    const pct = totalMarketValue > 0 ? Math.round((val / totalMarketValue) * 100) : 0;
                    const dots = ['bg-redhill-charcoal', 'bg-redhill-red', 'bg-redhill-gold', 'bg-stone-500'];
                    return (
                      <span key={p.id} className="inline-flex items-center gap-2 text-xs text-redhill-charcoal">
                        <span className={`w-2.5 h-2.5 rounded-xs ${dots[i % dots.length]}`} />
                        <span className="font-medium">{p.name}</span>
                        <span className="text-redhill-muted tabular">({pct}%)</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {snapshotMode === 'editorial' ? (
              <div className="overflow-x-auto">
                <table className="table-lux">
                  <thead>
                    <tr>
                      <th>Development</th>
                      <th>Allotted Area</th>
                      <th>Entry Rate</th>
                      <th>Market Rate</th>
                      <th>Invested Capital</th>
                      <th>Current Valuation</th>
                      <th>Net Appreciation</th>
                      <th className="text-right">Site Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projects.map((p) => {
                      const val = (p.allotted_sqft || 0) * (p.market_price_per_sqft || 0);
                      const inv = p.investment_amount || 0;
                      const delta = val - inv;
                      const pct = inv > 0 ? ((delta / inv) * 100).toFixed(1) : null;

                      return (
                        <tr key={p.id}>
                          <td>
                            <Link
                              to={`/project/${p.id}`}
                              className="font-serif text-base text-redhill-charcoal hover:text-redhill-red transition-colors font-medium inline-flex items-center gap-1.5"
                            >
                              {p.name}
                              <ArrowUpRight className="w-3.5 h-3.5 text-redhill-gold" />
                            </Link>
                            <p className="text-xs text-redhill-muted flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-redhill-gold" />
                              {p.location}
                            </p>
                          </td>
                          <td className="tabular font-medium text-redhill-charcoal">
                            {p.allotted_sqft ? `${formatNumber(p.allotted_sqft)} sqft` : 'N/A'}
                          </td>
                          <td className="tabular text-redhill-muted">
                            {p.price_at_investment ? `₹${formatNumber(p.price_at_investment)}/sqft` : 'N/A'}
                          </td>
                          <td className="tabular font-medium text-redhill-charcoal">
                            {p.market_price_per_sqft ? `₹${formatNumber(p.market_price_per_sqft)}/sqft` : 'N/A'}
                          </td>
                          <td className="tabular text-redhill-charcoal">
                            {formatCurrency(inv)}
                          </td>
                          <td className="tabular font-semibold text-redhill-charcoal">
                            {formatCurrency(val)}
                          </td>
                          <td className={`tabular font-semibold ${delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                            {delta >= 0 ? '+' : ''}{formatCurrency(delta)}
                            {pct && <span className="text-xs font-mono ml-1 text-redhill-muted">({delta >= 0 ? '+' : ''}{pct}%)</span>}
                          </td>
                          <td className="text-right">
                            <div className="inline-flex items-center gap-2">
                              <div className="w-20 bg-redhill-sand h-1.5 rounded-full overflow-hidden">
                                <div className="bg-redhill-gold h-full rounded-full" style={{ width: `${p.completion_percentage}%` }} />
                              </div>
                              <span className="tabular text-xs font-semibold text-redhill-charcoal w-9 text-right">
                                {p.completion_percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-[320px] w-full pt-4 min-w-0">
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="2 4" stroke="#E3DCCF" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="#716C63"
                      fontSize={12}
                      tickLine={false}
                      axisLine={{ stroke: '#E3DCCF' }}
                    />
                    <YAxis
                      stroke="#716C63"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `₹${(value / 10000000).toFixed(1)}Cr`}
                    />
                    <Tooltip
                      cursor={{ fill: '#F7F4EE' }}
                      contentStyle={{ backgroundColor: '#FFFFFF', border: '1px solid #E3DCCF', borderRadius: '8px', color: '#1D1E22' }}
                      itemStyle={{ color: '#1D1E22' }}
                      formatter={(value: any) => formatCurrency(Number(value) || 0)}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#716C63', paddingTop: '12px' }} />
                    <Bar dataKey="Investment" name="Invested Capital" fill="#1D1E22" radius={[3, 3, 0, 0]} maxBarSize={42} />
                    <Bar dataKey="Value" name="Current Valuation" fill="#A6803F" radius={[3, 3, 0, 0]} maxBarSize={42} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Reveal>
        )}

        {/* ============================================================== */}
        {/* 03 — MAIN WORKSPACE: HOLDINGS + MILESTONES vs NEW LAUNCHES     */}
        {/* ============================================================== */}
        <div className={hasAds ? 'lg:flex lg:items-stretch lg:gap-8 space-y-12 lg:space-y-0' : 'space-y-12'}>
          {/* Left Main Column: Property Holdings + Milestones */}
          <div className={hasAds ? 'flex-1 min-w-0 flex flex-col justify-between gap-10' : 'w-full space-y-12'}>
            {/* 02 — Property Holdings */}
            <section id="investments">
              <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-redhill-gold mb-1">02 — Property Holdings</p>
                  <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">Your Investment Portfolio</h2>
                </div>
                <span className="text-xs uppercase tracking-[0.16em] text-redhill-muted bg-white border border-redhill-line px-3.5 py-1.5 rounded-md">
                  {projects.length} {projects.length === 1 ? 'Allocated Property' : 'Allocated Properties'}
                </span>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map(i => (
                    <div key={i} className="lux-card overflow-hidden h-[460px]">
                      <Skeleton type="image" className="h-56" />
                      <div className="p-6 space-y-4">
                        <Skeleton type="text" className="w-1/2" />
                        <Skeleton type="text" className="w-1/3" />
                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <Skeleton type="row" />
                          <Skeleton type="row" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <EmptyState
                  icon={LayoutDashboard}
                  title="No Developments Assigned"
                  description="Your investor account does not have active allocations yet. Contact your relationship manager for onboarding."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {projects.map((project, index) => {
                    const marketValue = (project.allotted_sqft || 0) * (project.market_price_per_sqft || 0);
                    const returnDelta = marketValue - (project.investment_amount || 0);
                    const returnPct = project.investment_amount && project.investment_amount > 0
                      ? ((returnDelta / project.investment_amount) * 100).toFixed(1)
                      : null;

                    return (
                      <Reveal key={project.id} delay={index * 0.06} as="article">
                        <Link
                          to={`/project/${project.id}`}
                          className="group block lux-card lux-card-hover overflow-hidden h-full"
                        >
                          {/* Architectural photograph */}
                          <div className="relative h-56 overflow-hidden bg-redhill-sand">
                            <img
                              src={getAssetUrl(project.image_url, project.id)}
                              alt={project.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => { (e.target as HTMLImageElement).src = getAssetUrl(null, project.id); }}
                              className="w-full h-full object-cover img-zoom"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            <div className="absolute top-4 left-4">
                              <span className="eyebrow bg-white/95 text-redhill-charcoal px-2.5 py-1 rounded-xs">
                                Asset #{project.id}
                              </span>
                            </div>
                            <div className="absolute top-4 right-4 bg-black/55 backdrop-blur-xs rounded-full">
                              <StatusChip status={project.status} />
                            </div>
                            <div className="absolute bottom-4 left-6 right-6 text-white">
                              <p className="text-xs text-redhill-gold-soft flex items-center gap-1.5 mb-1">
                                <MapPin className="w-3.5 h-3.5" />
                                {project.location}
                              </p>
                              <h3 className="font-serif text-2xl text-white group-hover:text-redhill-gold-soft transition-colors">
                                {project.name}
                              </h3>
                            </div>
                          </div>

                          {/* Property investment dossier */}
                          <div className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="p-3.5 rounded-md bg-redhill-ivory border border-redhill-line">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1 flex items-center gap-1">
                                  <IndianRupee className="w-3 h-3 text-redhill-red" />
                                  Invested Capital
                                </p>
                                <p className="font-serif text-lg text-redhill-charcoal font-medium tabular">
                                  {project.investment_amount ? formatCurrency(project.investment_amount) : (project.contribution || 'N/A')}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-md bg-redhill-ivory border border-redhill-line">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1 flex items-center gap-1">
                                  <Maximize className="w-3 h-3 text-redhill-gold" />
                                  Allotted Area
                                </p>
                                <p className="font-serif text-lg text-redhill-charcoal font-medium tabular">
                                  {project.allotted_sqft ? `${formatNumber(project.allotted_sqft)} sqft` : 'N/A'}
                                </p>
                              </div>

                              <div className="p-3.5 rounded-md bg-redhill-ivory border border-redhill-line">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1">Entry Rate</p>
                                <p className="font-serif text-sm text-redhill-charcoal font-medium tabular">
                                  {project.price_at_investment ? `₹${formatNumber(project.price_at_investment)}/sqft` : 'N/A'}
                                </p>
                                {project.investment_date && (
                                  <p className="text-[10px] text-redhill-muted mt-1 flex items-center gap-1">
                                    <Calendar className="w-2.5 h-2.5" />
                                    {formatDate(project.investment_date)}
                                  </p>
                                )}
                              </div>

                              <div className="p-3.5 rounded-md bg-redhill-ivory border border-redhill-line">
                                <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 mb-1">Market Rate</p>
                                <p className="font-serif text-sm text-emerald-800 font-semibold tabular">
                                  {project.market_price_per_sqft ? `₹${formatNumber(project.market_price_per_sqft)}/sqft` : 'N/A'}
                                </p>
                                <p className="text-[10px] text-redhill-muted mt-1 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  Prevailing
                                </p>
                              </div>
                            </div>

                            {/* Current plot valuation & return */}
                            {marketValue > 0 && (
                              <div className="p-4 bg-redhill-ink text-white rounded-md space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] uppercase tracking-[0.18em] text-white/65">Current Holding Value</span>
                                  <span className="font-serif text-lg text-redhill-gold-soft font-medium tabular">
                                    {formatCurrency(marketValue)}
                                  </span>
                                </div>
                                {project.investment_amount && project.investment_amount > 0 && (
                                  <div className="flex items-center justify-between text-xs pt-2 border-t border-white/15">
                                    <span className="text-white/65">Unrealised Gain</span>
                                    <span className={`tabular font-medium ${returnDelta >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {returnDelta >= 0 ? '+' : ''}{formatCurrency(returnDelta)}
                                      {returnPct && <span className="ml-1 text-[11px] font-mono">({returnDelta >= 0 ? '+' : ''}{returnPct}%)</span>}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Construction progress */}
                            <div>
                              <div className="flex justify-between text-xs text-redhill-muted mb-2">
                                <span className="uppercase tracking-[0.14em] text-[10px] font-semibold">Construction Progress</span>
                                <span className="tabular font-semibold text-redhill-charcoal">{project.completion_percentage}%</span>
                              </div>
                              <div className="w-full bg-redhill-sand h-2 rounded-full overflow-hidden">
                                <div
                                  className="bg-redhill-gold h-full rounded-full transition-all duration-700"
                                  style={{ width: `${project.completion_percentage}%` }}
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center pt-2 border-t border-redhill-line text-xs uppercase tracking-[0.16em] font-semibold text-redhill-charcoal group-hover:text-redhill-red transition-colors">
                              <span>Open Full Project Dossier</span>
                              <ChevronRight className="w-4 h-4 text-redhill-gold group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 03 — Project Milestones Timeline (directly beneath Property Holdings so there is zero empty space) */}
            {allMilestones.length > 0 && (
              <Reveal className="lux-card p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-redhill-line">
                  <div>
                    <p className="eyebrow text-redhill-gold mb-1">03 — Development Schedule</p>
                    <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">
                      Project Milestones Timeline
                    </h2>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedMilestoneProjectId('all')}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-[0.12em] border cursor-pointer transition-colors ${
                        selectedMilestoneProjectId === 'all'
                          ? 'bg-redhill-charcoal text-white border-redhill-charcoal'
                          : 'bg-white text-redhill-muted border-redhill-line hover:text-redhill-charcoal'
                      }`}
                    >
                      All Holdings
                    </button>
                    {projects.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedMilestoneProjectId(p.id)}
                        className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-[0.12em] border cursor-pointer transition-colors ${
                          selectedMilestoneProjectId === p.id
                            ? 'bg-redhill-charcoal text-white border-redhill-charcoal'
                            : 'bg-white text-redhill-muted border-redhill-line hover:text-redhill-charcoal'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 flex-1">
                  {[
                    { key: 'completed', title: 'Completed Stages', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
                    { key: 'in_progress', title: 'Active On-Site', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
                    { key: 'upcoming', title: 'Upcoming Schedule', badge: 'bg-redhill-ivory text-redhill-muted border-redhill-line' },
                  ].map((col) => {
                    const items = allMilestones.filter(m =>
                      col.key === 'completed'
                        ? m.status === 'completed'
                        : col.key === 'in_progress'
                        ? m.status === 'in_progress'
                        : m.status !== 'completed' && m.status !== 'in_progress'
                    );

                    return (
                      <div key={col.key} className="bg-redhill-ivory rounded-lg border border-redhill-line p-5 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-redhill-line">
                          <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-redhill-charcoal">
                            {col.title}
                          </h3>
                          <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${col.badge}`}>
                            {items.length}
                          </span>
                        </div>

                        {items.length === 0 ? (
                          <p className="text-xs text-redhill-muted py-4 text-center">No stages in this category.</p>
                        ) : (
                          <ol className="relative border-l border-redhill-stone ml-2 space-y-4 pl-4">
                            {items.slice(0, 6).map((m) => (
                              <li key={m.id} className="relative">
                                <span
                                  className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                                    m.status === 'completed'
                                      ? 'bg-emerald-600'
                                      : m.status === 'in_progress'
                                      ? 'bg-redhill-red'
                                      : 'bg-stone-400'
                                  }`}
                                />
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="text-[10px] uppercase tracking-[0.14em] text-redhill-gold font-semibold">
                                      {m.projectName} · {m.category}
                                    </p>
                                    <p className="text-sm font-medium text-redhill-charcoal mt-0.5">{m.name}</p>
                                  </div>
                                  <span className="text-xs font-mono font-semibold text-redhill-charcoal tabular">
                                    {m.completion_percentage}%
                                  </span>
                                </div>
                                {(m.start_date || m.expected_completion) && (
                                  <p className="text-[11px] text-redhill-muted mt-1 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {m.expected_completion ? `Target: ${formatDate(m.expected_completion)}` : `Started: ${formatDate(m.start_date!)}`}
                                  </p>
                                )}
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>

          {/* Right Sidebar: New Launches & Private Allocation Desk (stretched to match left column height) */}
          {hasAds && (
            <aside className="w-full lg:w-[320px] shrink-0 flex flex-col justify-between gap-5">
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-redhill-line">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-redhill-gold" />
                    <h3 className="text-xs font-semibold text-redhill-charcoal uppercase tracking-[0.18em]">New Launches</h3>
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-redhill-sand text-redhill-charcoal border border-redhill-line">
                      {newProjects.length}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdSidebar(false)}
                    aria-label="Dismiss new launches sidebar"
                    className="p-1 text-redhill-muted hover:text-redhill-charcoal transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {newProjects.slice(0, 3).map((project) => (
                  <article key={project.id} className="lux-card overflow-hidden">
                    <div className="relative h-36 bg-redhill-sand">
                      <img
                        src={getAssetUrl(project.image_url, project.id)}
                        alt={project.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => { (e.target as HTMLImageElement).src = getAssetUrl(null, project.id); }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                      <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] text-redhill-charcoal bg-white/95 px-2 py-0.5 rounded-xs font-semibold">
                        Pre-Launch
                      </span>
                      <div className="absolute bottom-2.5 left-3 right-3 text-white">
                        <h4 className="font-serif text-base truncate">{project.name}</h4>
                        <p className="text-[11px] text-white/75 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-redhill-gold-soft" />
                          {project.location}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between text-redhill-muted">
                        <span>Stage</span>
                        <span className="text-redhill-charcoal font-medium">{project.status}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setViewMode('explore')}
                        className="btn-secondary w-full py-2.5 text-[11px] uppercase tracking-[0.14em]"
                      >
                        <Phone className="w-3 h-3 text-redhill-gold" />
                        Enquire with Concierge
                      </button>
                    </div>
                  </article>
                ))}

                {newProjects.length > 3 && (
                  <div className="lux-card p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between text-xs">
                      <span className="eyebrow text-redhill-gold">More Pre-Launches</span>
                      <span className="text-[11px] text-redhill-muted">+{newProjects.length - 3} corridors</span>
                    </div>
                    <div className="divide-y divide-redhill-line">
                      {newProjects.slice(3).map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => setViewMode('explore')}
                          className="w-full py-2.5 text-left flex items-center justify-between gap-2 group cursor-pointer"
                        >
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-redhill-charcoal group-hover:text-redhill-red transition-colors truncate">
                              {project.name}
                            </p>
                            <p className="text-[11px] text-redhill-muted truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5 text-redhill-gold shrink-0" />
                              {project.location}
                            </p>
                          </div>
                          <ArrowUpRight className="w-3.5 h-3.5 text-redhill-muted group-hover:text-redhill-red shrink-0" />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setViewMode('explore')}
                      className="btn-dark w-full py-2.5 text-[11px] uppercase tracking-[0.14em]"
                    >
                      <Sparkles className="w-3 h-3 text-redhill-gold-soft" />
                      View All {newProjects.length} Launches
                    </button>
                  </div>
                )}
              </div>

              <div className="lux-card p-5 text-center space-y-2 bg-white">
                <Building2 className="w-5 h-5 text-redhill-gold mx-auto" />
                <h4 className="text-xs uppercase tracking-[0.16em] font-semibold text-redhill-charcoal">Private Allocation Desk</h4>
                <p className="text-xs text-redhill-muted leading-relaxed">
                  Direct inquiries regarding secondary market allotments and commercial equity.
                </p>
                <p className="text-xs font-mono text-redhill-gold font-medium pt-1">invest@redhillinfra.com</p>
              </div>
            </aside>
          )}
        </div>

        {/* ============================================================== */}
        {/* 05 — CONSOLIDATED CAPITAL LEDGER (Full-Width Section)          */}
        {/* ============================================================== */}
        <section id="ledger">
          <Reveal className="lux-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-redhill-line">
              <div>
                <p className="eyebrow text-redhill-gold mb-1">04 — Audited Capital Ledger</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">
                  Allocations &amp; Transaction Statement
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-redhill-ivory border border-redhill-line rounded-md px-3 py-1.5">
                  <Filter className="w-3.5 h-3.5 text-redhill-gold" />
                  <select
                    aria-label="Filter ledger by project"
                    value={ledgerProjectFilter}
                    onChange={(e) => setLedgerProjectFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="bg-transparent text-xs font-medium text-redhill-charcoal outline-none cursor-pointer"
                  >
                    <option value="all">All Developments</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="inline-flex items-center gap-2 bg-redhill-ivory border border-redhill-line rounded-md px-3 py-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-redhill-gold" />
                  <select
                    aria-label="Filter ledger by transaction type"
                    value={ledgerTypeFilter}
                    onChange={(e) => setLedgerTypeFilter(e.target.value)}
                    className="bg-transparent text-xs font-medium text-redhill-charcoal outline-none cursor-pointer"
                  >
                    <option value="all">All Transaction Types</option>
                    <option value="initial_assignment">Initial Assignment</option>
                    <option value="sub_investment">Additional Allocation</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
              </div>
            </div>

            {allLedgerEntries.length === 0 ? (
              <div className="py-10 text-center text-sm text-redhill-muted">
                No ledger transactions match the selected filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table-lux">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Development</th>
                      <th>Transaction Type</th>
                      <th>Allotted Area</th>
                      <th>Buy Rate</th>
                      <th>Amount</th>
                      <th>Notes &amp; Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allLedgerEntries.map((entry) => {
                      const typeLabel =
                        entry.transaction_type === 'initial_assignment'
                          ? 'Initial Assignment'
                          : entry.transaction_type === 'sub_investment'
                          ? 'Additional Allocation'
                          : entry.transaction_type;

                      return (
                        <tr key={`${entry.project_id}-${entry.id}`}>
                          <td className="tabular text-xs text-redhill-muted whitespace-nowrap">
                            {entry.transaction_date ? formatDate(entry.transaction_date) : (entry.created_at ? formatDate(entry.created_at) : '—')}
                          </td>
                          <td>
                            <Link
                              to={`/project/${entry.project_id}`}
                              className="font-serif font-medium text-redhill-charcoal hover:text-redhill-red transition-colors"
                            >
                              {entry.project_name || `Project #${entry.project_id}`}
                            </Link>
                          </td>
                          <td>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xs text-[11px] font-semibold uppercase tracking-wider bg-redhill-sand text-redhill-charcoal border border-redhill-line">
                              <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                              {typeLabel}
                            </span>
                          </td>
                          <td className="tabular text-redhill-charcoal">
                            {entry.allotted_sqft ? `${formatNumber(entry.allotted_sqft)} sqft` : '—'}
                          </td>
                          <td className="tabular text-redhill-muted">
                            {entry.price_at_investment ? `₹${formatNumber(entry.price_at_investment)}/sqft` : '—'}
                          </td>
                          <td className="tabular font-semibold text-redhill-charcoal">
                            {formatCurrency(entry.investment_amount || 0)}
                          </td>
                          <td className="text-xs text-redhill-muted max-w-xs">
                            {entry.note || 'Verified & posted to investor folio'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Reveal>
        </section>

        {/* ============================================================== */}
        {/* 06 — STRATEGIC ASSET MAP                                       */}
        {/* ============================================================== */}
        <section>
          <InteractiveMap />
        </section>

        {/* ============================================================== */}
        {/* 07 — INVESTOR CONCIERGE & SUPPORT                              */}
        {/* ============================================================== */}
        <section id="support">
          <Reveal className="band-dark rounded-lg p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <p className="eyebrow text-redhill-gold-soft">05 — Private Client Desk</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-white">
                Direct communication with your Redhill relationship team.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Open any project dossier to raise a project-specific query with the executive concierge desk, inspect statutory approvals, or watch live site camera feeds.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {projects[0] && (
                <Link
                  to={`/project/${projects[0].id}`}
                  className="btn-primary py-3 px-5 text-xs uppercase tracking-[0.14em]"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open Executive Desk
                </Link>
              )}
              <a
                href="mailto:invest@redhillinfra.com"
                className="btn-secondary py-3 px-5 text-xs uppercase tracking-[0.14em]"
              >
                invest@redhillinfra.com
              </a>
            </div>
          </Reveal>
        </section>
      </div>
    </Layout>
  );
}
