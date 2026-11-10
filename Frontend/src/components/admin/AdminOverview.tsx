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
      <div className="relative rounded-xl overflow-hidden bg-white border border-redhill-line p-6 sm:p-8 lg:p-10">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            {/* Gold Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-redhill-ivory border border-redhill-line">
              <span className="w-2 h-2 rounded-full bg-redhill-red" />
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.2em] text-redhill-gold flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-redhill-gold" />
                REDHILL ENTERPRISE EXECUTIVE CONSOLE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl font-bold text-redhill-charcoal tracking-tight leading-tight">
              Welcome back,{' '}
              <span className="text-redhill-gold">
                {user?.name || user?.email || 'Administrator'}
              </span>
            </h1>

            {/* Subheadline & Role Pill */}
            <div className="flex flex-wrap items-center gap-3 pt-0.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold ${roleMeta?.bg || 'bg-amber-500/15'} ${roleMeta?.color || 'text-amber-700'} border ${roleMeta?.border || 'border-amber-500/30'} shadow-sm`}>
                <RoleIcon className="w-3.5 h-3.5" />
                {roleMeta?.badge || 'STAFF'}
              </span>
              <p className="text-stone-700 text-xs sm:text-sm font-medium">
                {roleMeta?.desc || 'Real-time project oversight & client relationship portal.'}
              </p>
            </div>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2 lg:pt-0">
            {!isSiteManager && !isSupportAgent && onNewProject && (
              <button
                onClick={onNewProject}
                className="bg-redhill-red hover:bg-redhill-crimson text-white font-semibold px-4 py-2.5 rounded-xl shadow-md border border-redhill-red/40 transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Project</span>
              </button>
            )}

            {(isSuperAdmin || isFinancialOfficer) && onNewInvestor && (
              <button
                onClick={onNewInvestor}
                className="bg-redhill-sand/70 hover:bg-redhill-sand text-redhill-charcoal font-semibold px-4 py-2.5 rounded-xl border border-redhill-line transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <UserPlus className="w-4 h-4 text-emerald-700" />
                <span>Add Investor</span>
              </button>
            )}

            <button
              onClick={() => setActiveView('queries')}
              className="bg-redhill-ivory hover:bg-redhill-sand text-redhill-charcoal font-semibold px-4 py-2.5 rounded-xl border border-redhill-line transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
            >
              <MessageSquare className="w-4 h-4 text-amber-700" />
              <span>Inquiries</span>
              {unansweredCount > 0 && (
                <span className="bg-redhill-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
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
            className="group relative bg-white rounded-2xl p-6 border border-redhill-line hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
            
            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/15 text-blue-700 border border-blue-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-redhill-sand/70 group-hover:bg-blue-500 flex items-center justify-center text-redhill-muted group-hover:text-white transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-redhill-muted block mb-1">
                Projects
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-redhill-charcoal font-sans tracking-tight">
                  {projects.length}
                </span>
                <span className="text-xs font-extrabold text-blue-700 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                  Active Launches
                </span>
              </div>
              <p className="text-[11px] text-redhill-muted mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>100% RERA Registered</span>
              </p>
            </div>
          </div>
        )}

        {/* Card 2: Registered Investors */}
        {(isSuperAdmin || isFinancialOfficer) && (
          <div
            onClick={() => setActiveView('investors')}
            className="group relative bg-white rounded-2xl p-6 border border-redhill-line hover:border-emerald-500/50 shadow-xl hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />

            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-redhill-sand/70 group-hover:bg-emerald-500 flex items-center justify-center text-redhill-muted group-hover:text-white transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-redhill-muted block mb-1">
                Verified Investors & Clients
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-redhill-charcoal font-sans tracking-tight">
                  {investors.length}
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active Portfolios
                </span>
              </div>
              <p className="text-[11px] text-redhill-muted mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span>Allocations & Ledgers Synced</span>
              </p>
            </div>
          </div>
        )}

        {/* Card 3: Inquiries & Site Walkthroughs */}
        <div
          onClick={() => setActiveView('queries')}
          className="group relative bg-white rounded-2xl p-6 border border-redhill-line hover:border-redhill-red/50 shadow-xl hover:shadow-2xl hover:shadow-redhill-red/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 w-24 h-24 bg-redhill-red/10 rounded-full blur-2xl group-hover:bg-redhill-red/20 transition-all" />

          <div className="flex items-center justify-between pb-4">
            <div className="w-12 h-12 rounded-xl bg-redhill-red/15 text-redhill-red border border-redhill-red/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div className="w-8 h-8 rounded-full bg-redhill-sand/70 group-hover:bg-redhill-red flex items-center justify-center text-redhill-muted group-hover:text-white transition-all">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-redhill-muted block mb-1">
              Investor Inquiries & Site Visits
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-redhill-charcoal font-sans tracking-tight">
                {unansweredCount}
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${
                unansweredCount > 0 
                  ? 'text-redhill-red bg-redhill-red/10 border-redhill-red/30'
                  : 'text-emerald-700 bg-emerald-500/10 border-emerald-500/20'
              }`}>
                {unansweredCount > 0 ? 'Pending Action' : 'All Answered'}
              </span>
            </div>
            <p className="text-[11px] text-redhill-muted mt-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-redhill-muted shrink-0" />
              <span>Real-time Chat & Direct Messaging</span>
            </p>
          </div>
        </div>

        {/* Card 4: Admin Staff & Roles */}
        {isSuperAdmin && (
          <div
            onClick={() => setActiveView('admins')}
            className="group relative bg-white rounded-2xl p-6 border border-redhill-line hover:border-amber-500/50 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />

            <div className="flex items-center justify-between pb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/15 text-amber-700 border border-amber-500/30 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Shield className="w-6 h-6" />
              </div>
              <div className="w-8 h-8 rounded-full bg-redhill-sand/70 group-hover:bg-amber-500 flex items-center justify-center text-redhill-muted group-hover:text-white transition-all">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-redhill-muted block mb-1">
                Admin & Operations Staff
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-redhill-charcoal font-sans tracking-tight">
                  {adminsCount}
                </span>
                <span className="text-xs font-extrabold text-amber-700 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Role Permissions
                </span>
              </div>
              <p className="text-[11px] text-redhill-muted mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
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
          <div className="bg-white rounded-3xl border border-redhill-line shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 sm:p-6 border-b border-redhill-line bg-redhill-ivory flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-700 shadow-xs shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-redhill-charcoal text-base sm:text-lg font-serif">Projects</h2>
                  <p className="text-xs text-redhill-muted">Live construction progress & milestones</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('projects')}
                className="text-xs font-semibold text-redhill-charcoal hover:text-redhill-red flex items-center gap-1 transition-colors cursor-pointer bg-white hover:bg-redhill-sand/70 px-3 py-1.5 rounded-lg border border-redhill-line"
              >
                <span>View All ({projects.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-redhill-line p-2 flex-1">
              {projects.slice(0, 4).map(p => (
                <div 
                  key={p.id} 
                  onClick={() => onSelectProject ? onSelectProject(p) : setActiveView('projects')}
                  className="p-4 rounded-2xl hover:bg-redhill-sand/70 border border-transparent hover:border-redhill-line transition-all flex items-center justify-between gap-4 group cursor-pointer"
                  title="Click to manage milestones, CCTV and progress updates"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-redhill-ivory border border-redhill-line shrink-0 relative">
                      <img
                        src={getAssetUrl(p.image_url, p.id)}
                        alt={p.name}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAssetUrl(null, p.id);
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-redhill-charcoal group-hover:text-amber-700 transition-colors truncate flex items-center gap-1.5">
                        <span>{p.name}</span>
                        <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-amber-700" />
                      </h4>
                      <p className="text-xs text-redhill-muted flex items-center gap-1 mt-0.5 truncate">
                        <MapPin className="w-3 h-3 text-redhill-red shrink-0" />
                        <span>{p.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex flex-col items-end gap-1.5">
                    <span className="text-[10px] font-extrabold text-amber-700 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      {p.status}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-redhill-ivory h-1.5 rounded-full overflow-hidden border border-redhill-line">
                        <div 
                          className="bg-redhill-gold h-full rounded-full" 
                          style={{ width: `${p.completion_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-bold text-redhill-charcoal">
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
          <div className="bg-white rounded-3xl border border-redhill-line shadow-2xl overflow-hidden flex flex-col">
            <div className="p-5 sm:p-6 border-b border-redhill-line bg-redhill-ivory flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-700 shadow-xs shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-redhill-charcoal text-base sm:text-lg font-serif">Recent Investor Accounts</h2>
                  <p className="text-xs text-redhill-muted">Verified investor directory & access credentials</p>
                </div>
              </div>
              <button
                onClick={() => setActiveView('investors')}
                className="text-xs font-semibold text-redhill-charcoal hover:text-redhill-red flex items-center gap-1 transition-colors cursor-pointer bg-white hover:bg-redhill-sand/70 px-3 py-1.5 rounded-lg border border-redhill-line"
              >
                <span>Directory ({investors.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-redhill-line p-2 flex-1">
              {investors.slice(0, 4).map(i => (
                <div 
                  key={i.id} 
                  className="p-4 rounded-2xl hover:bg-[#FBF9F5] transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-redhill-charcoal border border-white/10 flex items-center justify-center text-sm font-black text-white shadow-md shrink-0">
                      {i.name ? i.name.charAt(0).toUpperCase() : 'I'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-redhill-charcoal group-hover:text-amber-700 transition-colors truncate">
                        {i.name}
                      </h4>
                      <p className="text-xs text-redhill-muted font-mono truncate">{i.email}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-mono font-bold text-amber-700 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      ID: {i.login_id || 'N/A'}
                    </span>
                    <p className="text-[11px] text-redhill-muted mt-1">
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
