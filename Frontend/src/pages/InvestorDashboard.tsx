import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Project, Milestone, LedgerEntry } from '../types';
import { Link, useLocation } from 'react-router-dom';
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

function buildProjectStages(project: Project): Milestone[] {
  const pct = project.completion_percentage || 0;
  return [
    {
      id: project.id * 100 + 1,
      project_id: project.id,
      name: 'Land Title & Legal Documentation',
      category: 'documentation',
      status: pct >= 15 ? 'completed' : 'in_progress',
      completion_percentage: pct >= 15 ? 100 : Math.min(95, Math.max(40, pct * 5)),
    },
    {
      id: project.id * 100 + 2,
      project_id: project.id,
      name: 'RERA & Statutory Plan Sanctions',
      category: 'approval',
      status: pct >= 30 ? 'completed' : pct >= 15 ? 'in_progress' : 'pending',
      completion_percentage: pct >= 30 ? 100 : pct >= 15 ? 65 : 0,
    },
    {
      id: project.id * 100 + 3,
      project_id: project.id,
      name: 'Excavation, Foundation & Podium',
      category: 'construction',
      status: pct >= 55 ? 'completed' : pct >= 25 ? 'in_progress' : 'pending',
      completion_percentage: pct >= 55 ? 100 : pct >= 25 ? pct : 0,
    },
    {
      id: project.id * 100 + 4,
      project_id: project.id,
      name: '12+ Storey Superstructure & Facade',
      category: 'construction',
      status: pct >= 85 ? 'completed' : pct >= 50 ? 'in_progress' : 'pending',
      completion_percentage: pct >= 85 ? 100 : pct >= 50 ? pct : 0,
    },
    {
      id: project.id * 100 + 5,
      project_id: project.id,
      name: 'Interior Finishes, Landscaping & Handover',
      category: 'construction',
      status: pct >= 100 ? 'completed' : pct >= 80 ? 'in_progress' : 'pending',
      completion_percentage: pct >= 100 ? 100 : pct >= 80 ? pct : 0,
    },
  ];
}

export default function InvestorDashboard({ user, onLogout }: InvestorDashboardProps) {
  const [showAdSidebar, setShowAdSidebar] = useState(true);
  const [viewMode, setViewMode] = useState<'portfolio' | 'explore'>('portfolio');
  const [snapshotMode, setSnapshotMode] = useState<'journey' | 'editorial' | 'chart'>('journey');
  const [selectedMilestoneProjectId, setSelectedMilestoneProjectId] = useState<number | 'all'>('all');
  const [ledgerProjectFilter, setLedgerProjectFilter] = useState<number | 'all'>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string>('all');
  const reduceMotion = useReducedMotion();
  const location = useLocation();

  // Sync top navbar links (Dashboard, My Investments, Ledger, Support) with portfolio view & smooth scroll
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setViewMode('portfolio');
      if (location.hash) {
        const id = location.hash.replace('#', '');
        window.setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        }, 80);
      }
    }
  }, [location.pathname, location.hash, reduceMotion]);

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
    projects.forEach(p => {
      if (selectedMilestoneProjectId === 'all' || selectedMilestoneProjectId === p.id) {
        const pd = portfolioDetails.find(d => d.projectId === p.id);
        const list = pd && pd.milestones.length > 0 ? pd.milestones : buildProjectStages(p);
        list.forEach(m => {
          items.push({ ...m, projectName: p.name });
        });
      }
    });
    return items;
  }, [projects, portfolioDetails, selectedMilestoneProjectId]);

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
                  Welcome Back,{' '}
                  <span className="text-redhill-gold">{user.name.split(' ')[0]}</span>
                </h1>
                <p className="text-redhill-muted text-sm sm:text-base mt-2 max-w-xl">
                  Your investments. Your projects. Your journey.
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
        {/* 02 — YOUR INVESTMENT JOURNEY & PORTFOLIO SNAPSHOT              */}
        {/* ============================================================== */}
        {projects.length > 0 && (
          <Reveal className="lux-card p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-redhill-line">
              <div>
                <p className="eyebrow text-redhill-gold mb-1">01 — Your Investment Journey</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">
                  Featured Holding, Milestones &amp; Valuation
                </h2>
              </div>

              <div role="tablist" aria-label="Snapshot view" className="flex flex-wrap items-center bg-redhill-sand p-1 rounded-md border border-redhill-line self-start sm:self-auto gap-1">
                <button
                  type="button"
                  role="tab"
                  aria-selected={snapshotMode === 'journey'}
                  onClick={() => setSnapshotMode('journey')}
                  className={`btn-press inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold uppercase tracking-[0.12em] cursor-pointer ${
                    snapshotMode === 'journey'
                      ? 'bg-white text-redhill-charcoal shadow-xs'
                      : 'text-redhill-muted hover:text-redhill-charcoal'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-redhill-gold" />
                  Investment Journey
                </button>
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
                  Valuation Table
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

            {snapshotMode === 'journey' ? (
              (() => {
                const featuredHolding = projects[0];
                const rawFeatured = portfolioDetails.find(pd => pd.projectId === featuredHolding.id)?.milestones || [];
                const featuredMilestones = rawFeatured.length > 0 ? rawFeatured : buildProjectStages(featuredHolding);
                return (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* Left 5 Columns: Featured Allocated Property Card */}
                    <div className="lg:col-span-5 rounded-lg overflow-hidden border border-redhill-line bg-redhill-ivory flex flex-col justify-between">
                      <div className="relative h-56 sm:h-64 bg-redhill-sand overflow-hidden">
                        <img
                          src={getAssetUrl(featuredHolding.image_url, featuredHolding.id)}
                          alt={featuredHolding.name}
                          referrerPolicy="no-referrer"
                          onError={(e) => { (e.target as HTMLImageElement).src = getAssetUrl(null, featuredHolding.id); }}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="eyebrow bg-white/95 text-redhill-charcoal px-2.5 py-1 rounded-xs">
                            Featured Investment
                          </span>
                        </div>
                        <div className="absolute top-4 right-4 bg-black/55 backdrop-blur-xs rounded-full">
                          <StatusChip status={featuredHolding.status} />
                        </div>
                        <div className="absolute bottom-4 left-5 right-5 text-white">
                          <p className="text-xs text-redhill-gold-soft flex items-center gap-1.5 mb-0.5">
                            <MapPin className="w-3.5 h-3.5" />
                            {featuredHolding.location}
                          </p>
                          <h3 className="font-serif text-2xl font-semibold text-white">
                            {featuredHolding.name}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <dl className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-white border border-redhill-line rounded-md p-3">
                            <dt className="text-[10px] uppercase tracking-[0.14em] text-redhill-muted">Total Investment</dt>
                            <dd className="font-serif text-base font-semibold text-redhill-charcoal tabular mt-1">
                              {featuredHolding.investment_amount ? formatCurrency(featuredHolding.investment_amount) : (featuredHolding.contribution || 'N/A')}
                            </dd>
                          </div>
                          <div className="bg-white border border-redhill-line rounded-md p-3">
                            <dt className="text-[10px] uppercase tracking-[0.14em] text-redhill-muted">Allocated Area</dt>
                            <dd className="font-serif text-base font-semibold text-redhill-charcoal tabular mt-1">
                              {featuredHolding.allotted_sqft ? `${formatNumber(featuredHolding.allotted_sqft)} sqft` : 'N/A'}
                            </dd>
                          </div>
                          <div className="bg-white border border-redhill-line rounded-md p-3">
                            <dt className="text-[10px] uppercase tracking-[0.14em] text-redhill-muted">Buy Rate</dt>
                            <dd className="font-serif text-sm font-medium text-redhill-charcoal tabular mt-1">
                              {featuredHolding.price_at_investment ? `₹${formatNumber(featuredHolding.price_at_investment)}/sqft` : 'N/A'}
                            </dd>
                          </div>
                          <div className="bg-white border border-redhill-line rounded-md p-3">
                            <dt className="text-[10px] uppercase tracking-[0.14em] text-emerald-700">Current Rate</dt>
                            <dd className="font-serif text-sm font-semibold text-emerald-800 tabular mt-1">
                              {featuredHolding.market_price_per_sqft ? `₹${formatNumber(featuredHolding.market_price_per_sqft)}/sqft` : 'N/A'}
                            </dd>
                          </div>
                        </dl>

                        <div className="flex items-center justify-between pt-2 border-t border-redhill-line text-xs">
                          <span className="text-redhill-muted">
                            {featuredHolding.investment_date ? `Allocated: ${formatDate(featuredHolding.investment_date)}` : `Progress: ${featuredHolding.completion_percentage}%`}
                          </span>
                          <Link
                            to={`/project/${featuredHolding.id}`}
                            className="inline-flex items-center gap-1.5 font-semibold uppercase tracking-[0.14em] text-redhill-red hover:text-redhill-crimson"
                          >
                            Project Dossier
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Right 7 Columns: Your Investment Journey Timeline */}
                    <div className="lg:col-span-7 rounded-lg border border-redhill-line bg-white p-5 sm:p-6 flex flex-col justify-between space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-redhill-line">
                        <div>
                          <span className="eyebrow text-redhill-gold">Milestone Progression</span>
                          <h3 className="font-serif text-xl font-semibold text-redhill-charcoal mt-0.5">
                            {featuredHolding.name} — Ownership &amp; Construction Journey
                          </h3>
                        </div>
                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded bg-redhill-ivory border border-redhill-line text-redhill-charcoal tabular">
                          {featuredHolding.completion_percentage}% Recorded Progress
                        </span>
                      </div>

                      <ol className="relative border-l border-redhill-stone ml-3 space-y-4 pl-5 flex-1">
                        {/* Step 0: Initial Allocation */}
                        <li className="relative">
                          <span className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-white bg-emerald-600" />
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-[10px] uppercase tracking-[0.14em] text-emerald-700 font-semibold">
                                Portfolio Allocation · Verified
                              </span>
                              <p className="text-sm font-semibold text-redhill-charcoal">
                                {featuredHolding.allotted_sqft ? `${formatNumber(featuredHolding.allotted_sqft)} sq.ft. Allotted` : 'Property Allocation Recorded'}{' '}
                                {featuredHolding.investment_amount ? `(${formatCurrency(featuredHolding.investment_amount)})` : ''}
                              </p>
                            </div>
                            {featuredHolding.investment_date && (
                              <span className="text-xs text-redhill-muted font-mono">
                                {formatDate(featuredHolding.investment_date)}
                              </span>
                            )}
                          </div>
                        </li>

                        {featuredMilestones.slice(0, 4).map((m) => (
                          <li key={m.id} className="relative">
                            <span
                              className={`absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-white ${
                                m.status === 'completed'
                                  ? 'bg-emerald-600'
                                  : m.status === 'in_progress'
                                  ? 'bg-redhill-red'
                                  : 'bg-stone-400'
                              }`}
                            />
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <span className="text-[10px] uppercase tracking-[0.14em] text-redhill-gold font-semibold">
                                  {m.category} · {m.status === 'completed' ? 'Completed' : m.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                                </span>
                                <p className="text-sm font-medium text-redhill-charcoal">{m.name}</p>
                                {(m.expected_completion || m.actual_completion) && (
                                  <p className="text-[11px] text-redhill-muted mt-0.5">
                                    {m.actual_completion ? `Completed: ${m.actual_completion}` : `Target: ${m.expected_completion}`}
                                  </p>
                                )}
                              </div>
                              <span className="text-xs font-mono font-semibold text-redhill-charcoal tabular">
                                {m.completion_percentage}%
                              </span>
                            </div>
                          </li>
                        ))}
                      </ol>

                      <div className="pt-4 border-t border-redhill-line flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Link
                            to={`/project/${featuredHolding.id}`}
                            className="btn-secondary py-2 px-3.5 text-xs uppercase tracking-[0.12em]"
                          >
                            <FileText className="w-3.5 h-3.5 text-redhill-gold" />
                            Documents &amp; Approvals
                          </Link>
                          <Link
                            to={`/project/${featuredHolding.id}`}
                            className="btn-secondary py-2 px-3.5 text-xs uppercase tracking-[0.12em]"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-redhill-gold" />
                            Project Updates &amp; Queries
                          </Link>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSnapshotMode('editorial')}
                          className="text-xs font-semibold text-redhill-muted hover:text-redhill-charcoal cursor-pointer"
                        >
                          View Full Valuation Table →
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : snapshotMode === 'editorial' ? (
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
        {/* 02 — PROPERTY HOLDINGS (Full-Width Responsive Grid)            */}
        {/* ============================================================== */}
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
            <div className={`grid grid-cols-1 ${projects.length >= 3 ? 'md:grid-cols-2 xl:grid-cols-3' : 'md:grid-cols-2'} gap-6 items-stretch`}>
              {projects.map((project, index) => {
                const marketValue = (project.allotted_sqft || 0) * (project.market_price_per_sqft || 0);
                const returnDelta = marketValue - (project.investment_amount || 0);
                const returnPct = project.investment_amount && project.investment_amount > 0
                  ? ((returnDelta / project.investment_amount) * 100).toFixed(1)
                  : null;

                return (
                  <Reveal key={project.id} delay={index * 0.06} as="article" className="h-full">
                    <Link
                      to={`/project/${project.id}`}
                      className="group flex flex-col lux-card lux-card-hover overflow-hidden h-full"
                    >
                      {/* Architectural photograph */}
                      <div className="relative h-56 shrink-0 overflow-hidden bg-redhill-sand">
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
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                        <div className="space-y-5">
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
                        </div>

                        <div className="space-y-4 pt-2">
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

                          <div className="flex justify-between items-center pt-3 border-t border-redhill-line text-xs uppercase tracking-[0.16em] font-semibold text-redhill-charcoal group-hover:text-redhill-red transition-colors">
                            <span>Open Full Project Dossier</span>
                            <ChevronRight className="w-4 h-4 text-redhill-gold group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </section>

        {/* ============================================================== */}
        {/* 03 — NEW LAUNCHES & PRE-LAUNCH COMMUNITIES (Full-Width Grid)   */}
        {/* ============================================================== */}
        {hasAds && (
          <section aria-label="New Launches">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-redhill-gold mb-1">03 — Curated Opportunities</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-redhill-charcoal">New Launches &amp; Pre-Launch Communities</h2>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode('explore')}
                  className="btn-secondary py-2 px-4 text-xs uppercase tracking-[0.14em]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-redhill-gold" />
                  View All ({newProjects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdSidebar(false)}
                  aria-label="Dismiss new launches section"
                  className="p-2 rounded-md text-redhill-muted hover:text-redhill-charcoal hover:bg-redhill-sand transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {newProjects.slice(0, 3).map((project) => (
                <article key={project.id} className="lux-card overflow-hidden flex flex-col justify-between">
                  <div className="relative h-44 bg-redhill-sand">
                    <img
                      src={getAssetUrl(project.image_url, project.id)}
                      alt={project.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => { (e.target as HTMLImageElement).src = getAssetUrl(null, project.id); }}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 text-[9px] uppercase tracking-[0.2em] text-redhill-charcoal bg-white/95 px-2.5 py-1 rounded-xs font-semibold">
                      Pre-Launch
                    </span>
                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h4 className="font-serif text-lg font-medium truncate">{project.name}</h4>
                      <p className="text-xs text-white/80 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-redhill-gold-soft" />
                        {project.location}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-redhill-muted">
                      <span>Development Stage</span>
                      <span className="text-redhill-charcoal font-semibold">{project.status}</span>
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
            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* 04 — INVESTOR CONCIERGE & SUPPORT                              */}
        {/* ============================================================== */}
        <section id="support">
          <Reveal className="band-dark rounded-lg p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-2 max-w-2xl">
              <p className="eyebrow text-redhill-gold-soft">04 — Private Client Desk</p>
              <h2 className="font-serif text-2xl sm:text-3xl text-white">
                Direct communication with your Redhill relationship team.
              </h2>
              <p className="text-sm text-white/70 leading-relaxed">
                Open any project dossier to raise a project-specific query with the executive concierge desk, inspect statutory approvals, or view monthly construction progress photos.
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
