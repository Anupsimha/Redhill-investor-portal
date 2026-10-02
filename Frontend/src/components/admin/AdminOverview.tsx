import React from 'react';
import { 
  Building2, 
  Users, 
  Bell, 
  Shield, 
  Sparkles, 
  MapPin, 
  ArrowUpRight, 
  PlusCircle, 
  UserPlus, 
  MessageSquare, 
  CheckCircle2, 
  TrendingUp, 
  Compass, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Lock
} from 'lucide-react';
import { Project, User } from '../../types';
import { ROLE_CONFIG } from '../../constants/roles';
import { getAssetUrl } from '../../config/env';

interface AdminOverviewProps {
  user: User;
  projects: Project[];
  investors: User[];
  unansweredCount: number;
  adminsCount?: number;
  analytics?: {
    totalFundsRaised?: number;
    totalAllottedSqft?: number;
    activeProjectsCount?: number;
    activeProjects?: number;
  };
  setActiveView: (view: 'overview' | 'investors' | 'projects' | 'queries' | 'admins' | 'ledger') => void;
  onNewProject?: () => void;
  onNewInvestor?: () => void;
  onSelectProject?: (project: Project) => void;
}

export default function AdminOverview({
  user,
  projects = [],
  investors = [],
  unansweredCount = 0,
  adminsCount = 0,
  setActiveView,
  onNewProject,
  onNewInvestor,
  onSelectProject
}: AdminOverviewProps) {
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'senior_admin';
  const isSiteManager = user?.role === 'site_manager';
  const isFinancialOfficer = user?.role === 'financial_officer';
  const isMarketingManager = user?.role === 'marketing_manager';
  const isSupportAgent = user?.role === 'support_agent';

  const roleMeta = ROLE_CONFIG[user?.role || 'super_admin'] || ROLE_CONFIG.super_admin;
  const RoleIcon = roleMeta?.icon || Shield;

  return (
    <div className="space-y-10 relative">
      {/* Ambient Lighting Orbs */}
      <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-redhill-red/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-40 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* ======================================================== */}
      {/* 1. EXECUTIVE WELCOME BANNER (Matching Showcase Hero Theme) */}
      {/* ======================================================== */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#181C26] via-[#1E222B] to-[#2B1B20] border border-redhill-red/30 p-6 sm:p-8 lg:p-10 shadow-2xl">
        {/* Subtle Ambient Redhill Glows */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-redhill-red/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Gold Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/30 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-400" />
                REDHILL ENTERPRISE EXECUTIVE CONSOLE 2026
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-serif leading-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">
                {user?.name || user?.email || 'Administrator'}
              </span>
            </h1>

            {/* Subheadline & Role Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${roleMeta?.bg || 'bg-amber-500/15'} ${roleMeta?.color || 'text-amber-400'} border ${roleMeta?.border || 'border-amber-500/30'} shadow-sm`}>
                <RoleIcon className="w-3.5 h-3.5" />
                {roleMeta?.badge || 'STAFF'}
              </span>
              <p className="text-gray-300 text-xs sm:text-sm font-medium">
                {roleMeta?.desc || 'Real-time project oversight & client relationship portal.'}
              </p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-3 pt-2 lg:pt-0">
            {!isSiteManager && !isSupportAgent && onNewProject && (
              <button
                onClick={onNewProject}
                className="bg-redhill-red hover:bg-red-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg shadow-redhill-red/30 transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}

            {(isSuperAdmin || isFinancialOfficer) && onNewInvestor && (
              <button
                onClick={onNewInvestor}
                className="bg-white/[0.08] hover:bg-white/[0.14] text-white font-bold px-5 py-3 rounded-xl border border-white/[0.12] transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>Add Investor</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('queries')}
              className="bg-black/40 hover:bg-black/60 text-gray-200 hover:text-white font-bold px-4 py-3 rounded-xl border border-white/[0.08] transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span>Inquiries</span>
              {unansweredCount > 0 && (
                <span className="bg-redhill-red text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                  {unansweredCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MODERN KPI CARDS GRID (Clean, No "Total Capital Raised") */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Projects */}
        {!isSupportAgent && (
          <div
            onClick={() => setActiveView('projects')}
            className="group relative bg-gradient-to-br from-[#1E222B] to-[#252B38] rounded-2xl p-6 border border-white/[0.08] hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            
            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-blue-500 flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Projects
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                  {projects.length}
                </span>
                <span className="text-xs font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Active Launches
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% RERA Registered</span>
              </p>
            </div>
          </div>
        )}

        {/* Card 2: Registered Investors */}
        {(isSuperAdmin || isFinancialOfficer) && (
          <div
            onClick={() => setActiveView('investors')}
            className="group relative bg-gradient-to-br from-[#1E222B] to-[#252B38] rounded-2xl p-6 border border-white/[0.08] hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-emerald-500 flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Verified Investors & Clients
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                  {investors.length}
                </span>
                <span className="text-xs font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Portfolios
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Allocations & Ledgers Synced</span>
              </p>
            </div>
          </div>
        )}

        {/* Card 3: Inquiries & Site Walkthroughs */}
        <div
          onClick={() => setActiveView('queries')}
          className="group relative bg-gradient-to-br from-[#1E222B] to-[#252B38] rounded-2xl p-6 border border-white/[0.08] hover:border-redhill-red/50 shadow-xl hover:shadow-2xl hover:shadow-redhill-red/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-redhill-red/10 rounded-full blur-2xl group-hover:bg-redhill-red/20 transition-all" />

          <div className="flex items-center justify-between pb-4">
            <div className="w-12 h-12 rounded-xl bg-redhill-red/15 text-redhill-red border border-redhill-red/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-redhill-red flex items-center justify-center text-gray-400 group-hover:text-white transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
              Investor Inquiries & Site Visits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                {unansweredCount}
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded border ${
                unansweredCount > 0 
                  ? 'text-redhill-red bg-redhill-red/10 border-redhill-red/30 animate-pulse'
                  : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {unansweredCount > 0 ? 'Pending Action' : 'All Answered'}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Real-time Chat & Direct Messaging</span>
            </p>
          </div>
        </div>

        {/* Card 4: Admin Staff & Roles */}
        {isSuperAdmin && (
          <div
            onClick={() => setActiveView('admins')}
            className="group relative bg-gradient-to-br from-[#1E222B] to-[#252B38] rounded-2xl p-6 border border-white/[0.08] hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-white/[0.06] group-hover:bg-amber-500 flex items-center justify-center text-gray-400 group-hover:text-gray-950 transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block mb-1">
                Admin & Operations Staff
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-white font-sans tracking-tight">
                  {adminsCount}
                </span>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Role Permissions
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Super Admins, Engineers & Support</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 3. SHOWCASE PREVIEW PANELS (Matching Showcase Style)     */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Active Projects */}
        {!isSupportAgent && (
          <div className="bg-[#1E222B] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/[0.08] bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-blue-400 animate-ping" />
                <div>
                  <h2 className="font-bold text-white text-lg font-serif">Projects</h2>
                  <p className="text-xs text-gray-400">Live construction progress & milestones</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('projects')}
                className="text-xs font-bold text-redhill-red hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer bg-redhill-red/10 px-3 py-1.5 rounded-lg border border-redhill-red/20"
              >
                <span>View All ({projects.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.05] p-2 flex-1">
              {projects.slice(0, 4).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onSelectProject ? onSelectProject(p) : setActiveView('projects')}
                  className="p-4 rounded-2xl hover:bg-white/[0.05] border border-transparent hover:border-white/10 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                  title="Click to manage milestones, CCTV and progress updates"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0 relative">
                      <img
                        src={getAssetUrl(p.image_url) || 'https://picsum.photos/seed/thumb/200/200'}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=300';
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                      </h4>
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-redhill-red shrink-0" />
                        <span>{p.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-extrabold text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {p.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-black/40 h-1.5 rounded-full overflow-hidden border border-white/10">
                        <div 
                          className="bg-gradient-to-r from-redhill-red to-amber-500 h-full rounded-full" 
                          style={{ width: `${p.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-white">
                        {p.completion_percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Recent Verified Investors */}
        {(isSuperAdmin || isFinancialOfficer) && (
          <div className="bg-[#1E222B] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/[0.08] bg-black/20 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                <div>
                  <h2 className="font-bold text-white text-lg font-serif">Recent Investor Accounts</h2>
                  <p className="text-xs text-gray-400">Verified investor directory & access credentials</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('investors')}
                className="text-xs font-bold text-redhill-red hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer bg-redhill-red/10 px-3 py-1.5 rounded-lg border border-redhill-red/20"
              >
                <span>Directory ({investors.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-white/[0.05] p-2 flex-1">
              {investors.slice(0, 4).map(i => (
                <div 
                  key={i.id} 
                  className="p-4 rounded-2xl hover:bg-white/[0.03] transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-redhill-red/80 to-amber-600 border border-white/10 flex items-center justify-center text-sm font-black text-white shadow-md shrink-0">
                      {i.name ? i.name.charAt(0).toUpperCase() : 'I'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors truncate">
                        {i.name}
                      </h4>
                      <p className="text-xs text-gray-400 font-mono truncate">{i.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      ID: {i.login_id || 'N/A'}
                    </span>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {i.phone || 'Phone verified'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
