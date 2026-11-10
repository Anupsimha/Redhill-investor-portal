import { useState, useEffect, useRef, FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2, MapPin, Calendar, CheckCircle2, Clock, AlertCircle,
  FileText, Image as ImageIcon, Video, Bell, ChevronLeft,
  Download, ExternalLink, LogOut, MessageCircle, Send, ChevronUp, ChevronRight, IndianRupee, Sparkles
} from 'lucide-react';
import { User, Project, Milestone, ProgressUpdate, Announcement, Query, LedgerEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '../components/Layout';
import Skeleton from '../components/Skeleton';
import StatusChip from '../components/StatusChip';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import { apiFetch } from '../api/client';
import { getAssetUrl } from '../config/env';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ProjectDetailProps {
  user: User;
  onLogout: () => void;
}

export default function ProjectDetail({ user, onLogout }: ProjectDetailProps) {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'progress' | 'docs' | 'media' | 'queries' | 'ledger'>('progress');
  const [newMessage, setNewMessage] = useState('');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data, isLoading: loading } = useQuery<{
    project: Project;
    milestones: Milestone[];
    updates: ProgressUpdate[];
    announcements: Announcement[];
    queries: Query[];
  }>({
    queryKey: ['project', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/investor/projects/${id}`);
      if (!res.ok) throw new Error('Failed to fetch project details');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: payments = [], isLoading: loadingPayments } = useQuery<any[]>({
    queryKey: ['project-payments', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/investor/payments/${id}`);
      if (!res.ok) throw new Error('Failed to fetch payments');
      return res.json();
    },
    enabled: !!id,
  });

  const { data: ledgerEntries = [] } = useQuery<LedgerEntry[]>({
    queryKey: ['investor-ledger', id],
    queryFn: async () => {
      const res = await apiFetch(`/api/investor/ledger/${id}`);
      if (!res.ok) throw new Error('Failed to fetch ledger');
      return res.json();
    },
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const res = await apiFetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: id, message }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['project', id] });
    },
    onError: (err) => {
      console.error(err);
    }
  });

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (activeTab === 'queries') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, data?.queries]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sendMessageMutation.isPending) return;
    sendMessageMutation.mutate(newMessage);
  };

  const sending = sendMessageMutation.isPending;

  if (loading) {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="pb-20">
        <div className="relative py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton type="text" className="w-1/3 mb-4" />
            <Skeleton type="text" className="w-2/3 h-12 mb-8" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-2">
                <Skeleton type="image" className="h-64 rounded-2xl" />
              </div>
              <div>
                <Skeleton type="image" className="h-64 rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </Layout>
    );
  }

  if (!data) return <div className="text-center py-20 text-redhill-charcoal">Project not found</div>;

  const { project, milestones = [], updates = [], announcements = [], queries = [] } = data || {};

  const docMilestones = (milestones || []).filter(m => m.category === 'documentation');
  const approvalMilestones = (milestones || []).filter(m => m.category === 'approval');
  const constructionMilestones = (milestones || []).filter(m => m.category === 'construction');

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case 'completed':
        return (
          <span className="flex items-center gap-1.5 text-emerald-700 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" /> Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="flex items-center gap-1.5 text-amber-700 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <Clock className="w-3 h-3" /> In Progress
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-redhill-muted bg-redhill-sand/70 border border-redhill-line px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="text-redhill-charcoal pb-20">
        
      {/* Navigation */}
      <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 pt-6">
        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-redhill-muted">
          <Link 
            to={['admin', 'super_admin', 'senior_admin', 'site_manager', 'financial_officer', 'marketing_manager', 'support_agent'].includes(user.role) ? '/admin' : '/dashboard'} 
            className="hover:text-redhill-charcoal transition-colors flex items-center gap-1 font-medium"
          >
            <ChevronLeft className="w-3.5 h-3.5 text-redhill-gold" />
            Dashboard
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-stone-400" />
          <span className="text-redhill-charcoal font-medium truncate max-w-[240px] sm:max-w-xs">{project.name}</span>
        </div>
      </div>

      {/* Hero Header */}
      <div className="relative py-8 sm:py-10 bg-white border-b border-redhill-line">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-8 h-px bg-redhill-gold" />
                  <span className="eyebrow text-redhill-gold">Boutique Residence Dossier · Bengaluru</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-serif text-redhill-charcoal tracking-tight mb-3">{project.name}</h1>
                <div className="flex flex-wrap items-center gap-5 text-stone-600 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-redhill-gold" />
                    {project.location}
                  </div>
                  {project.investment_date && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-redhill-muted" />
                      Commenced: {formatDate(project.investment_date)}
                    </div>
                  )}
                  {updates.length > 0 && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-emerald-700" />
                      Last Site Update: {formatDate(updates[0].date)}
                    </div>
                  )}
                </div>
              </div>

              {/* Boutique Apartment Architectural Preview + Telemetry Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-stretch pt-1">
                <div className="sm:col-span-6 relative rounded-lg overflow-hidden border border-redhill-line bg-redhill-sand min-h-[156px]">
                  <img
                    src={getAssetUrl(project.image_url, project.id)}
                    alt={project.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getAssetUrl(null, project.id);
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white flex items-end justify-between gap-2">
                    <div>
                      <span className="block text-[9px] uppercase tracking-[0.18em] text-redhill-gold-soft font-semibold">
                        Asset #{project.id}
                      </span>
                      <span className="text-xs font-medium text-white/95 line-clamp-1">
                        {project.location} · Boutique Residences
                      </span>
                    </div>
                  </div>
                </div>

                <div className="sm:col-span-6 grid grid-cols-2 gap-2.5">
                  <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-redhill-muted">Milestones</p>
                    <p className="font-serif text-lg font-semibold text-redhill-charcoal tabular mt-1">
                      {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
                      <span className="text-[11px] font-normal text-redhill-muted ml-1">Done</span>
                    </p>
                  </div>
                  <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-redhill-muted">Approvals &amp; Docs</p>
                    <p className="font-serif text-lg font-semibold text-redhill-charcoal tabular mt-1">
                      {docMilestones.length + approvalMilestones.length}
                      <span className="text-[11px] font-normal text-redhill-muted ml-1">Filed</span>
                    </p>
                  </div>
                  <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-redhill-muted">Site Dispatches</p>
                    <p className="font-serif text-lg font-semibold text-redhill-charcoal tabular mt-1">
                      {updates.length}
                      <span className="text-[11px] font-normal text-redhill-muted ml-1">Media</span>
                    </p>
                  </div>
                  <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3 flex flex-col justify-between">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-redhill-muted">Ledger Entries</p>
                    <p className="font-serif text-lg font-semibold text-redhill-charcoal tabular mt-1">
                      {ledgerEntries.length}
                      <span className="text-[11px] font-normal text-redhill-muted ml-1">Audited</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 lux-card p-6 sm:p-7 flex flex-col justify-between space-y-5">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="eyebrow text-redhill-muted">Overall Construction Progress</span>
                  <span className="font-serif text-2xl text-redhill-charcoal tracking-tight tabular">{project.completion_percentage}%</span>
                </div>
                <div className="w-full bg-redhill-sand h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.completion_percentage}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                    className="bg-redhill-gold h-full rounded-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1.5">Status</p>
                  <StatusChip status={project.status} />
                </div>
                <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1">Investment</p>
                  <p className="font-serif text-sm text-redhill-charcoal tabular">
                    {project.investment_amount ? formatCurrency(project.investment_amount) : (project.contribution || 'N/A')}
                  </p>
                </div>
                <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1">Allotted Area</p>
                  <p className="font-serif text-sm text-redhill-charcoal tabular">
                    {project.allotted_sqft ? `${project.allotted_sqft.toLocaleString('en-IN')} sqft` : 'N/A'}
                  </p>
                </div>
                <div className="bg-[#FBF9F5] border border-redhill-line rounded-md p-3">
                  <p className="text-[10px] uppercase tracking-[0.16em] text-redhill-muted mb-1">Buy Rate</p>
                  <p className="font-serif text-sm text-redhill-charcoal tabular">
                    {project.price_at_investment ? `₹${project.price_at_investment.toLocaleString('en-IN')}/sqft` : 'N/A'}
                  </p>
                </div>
              </div>

              {project.market_price_per_sqft && project.allotted_sqft ? (
                <div className="p-4 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-md space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-semibold mb-0.5">Current Rate</p>
                      <p className="font-serif text-base text-emerald-700 tabular">₹{project.market_price_per_sqft.toLocaleString('en-IN')}/sqft</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.16em] text-emerald-700 font-semibold mb-0.5">Current Value</p>
                      <p className="font-serif text-base text-emerald-700 tabular">{formatCurrency(project.allotted_sqft * project.market_price_per_sqft)}</p>
                    </div>
                  </div>
                  
                  {project.investment_amount && project.investment_amount > 0 && (() => {
                    const gain = (project.allotted_sqft * project.market_price_per_sqft) - project.investment_amount;
                    const gainPct = ((gain / project.investment_amount) * 100).toFixed(1);
                    return (
                      <div className="flex justify-between items-center pt-2 border-t border-emerald-500/20 text-xs">
                        <span className="text-emerald-700">Net Capital Change</span>
                        <span className={`font-serif font-medium tabular ${gain >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                          {gain >= 0 ? '+' : ''}{formatCurrency(gain)}
                          <span className="ml-1 text-[11px] font-mono">
                            ({gain >= 0 ? '+' : ''}{gainPct}%)
                          </span>
                        </span>
                      </div>
                    );
                  })()}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-redhill-sand-deep backdrop-blur-md border-b border-redhill-line sticky top-0 md:top-20 z-20">
        <div className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12">
          <div className="flex gap-2 sm:gap-6 overflow-x-auto scrollbar-hide">
            {[
              { id: 'progress', label: 'Progress', labelFull: 'Project Progress', icon: Clock, count: milestones.length },
              { id: 'docs', label: 'Documents', labelFull: 'Documents & Approvals', icon: FileText, count: docMilestones.length + approvalMilestones.length },
              { id: 'ledger', label: 'Ledger', labelFull: 'Investment Ledger', icon: IndianRupee, count: ledgerEntries.length },
              { id: 'media', label: 'Media', labelFull: 'Media & CCTV', icon: ImageIcon, count: updates.length },
              { id: 'queries', label: 'Queries', labelFull: 'Executive Desk', icon: MessageCircle, count: queries.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 py-4 border-b-2 transition-all font-medium text-xs uppercase tracking-[0.14em] cursor-pointer whitespace-nowrap shrink-0",
                  activeTab === tab.id
                    ? "border-redhill-gold text-redhill-charcoal font-semibold"
                    : "border-transparent text-redhill-muted hover:text-redhill-charcoal"
                )}
              >
                <tab.icon className={cn("w-3.5 h-3.5", activeTab === tab.id ? "text-redhill-gold" : "text-redhill-muted")} />
                <span className="hidden sm:inline">{tab.labelFull}</span>
                <span className="sm:hidden">{tab.label}</span>
                {tab.count > 0 && (
                  <span className={cn(
                    "ml-1 px-1.5 py-0.5 rounded text-[10px] tabular font-medium",
                    activeTab === tab.id
                      ? "bg-redhill-sand text-redhill-charcoal"
                      : "bg-redhill-sand/70 text-redhill-muted"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-5 sm:px-8 lg:px-12 py-10">
        <AnimatePresence mode="wait">
          {activeTab === 'progress' && (
            <motion.div
              key="progress"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Construction Milestones */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-redhill-charcoal flex items-center gap-3 font-serif">
                    <Building2 className="text-redhill-red w-6 h-6" />
                    Construction Milestones
                  </h2>
                </div>

                <div className="space-y-4">
                  {constructionMilestones.map((m, idx) => (
                    <div key={m.id} className="bg-white rounded-xl p-6 border border-redhill-line shadow-lg hover:border-redhill-line transition-all">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold text-sm",
                            m.status === 'completed' ? "bg-emerald-500/10 text-emerald-700" :
                              m.status === 'in_progress' ? "bg-amber-500/10 text-amber-700" : "bg-redhill-sand/70 text-stone-500"
                          )}>
                            {idx + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-redhill-charcoal font-serif">{m.name}</h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-redhill-muted">
                              {m.status === 'completed' ? (
                                <span className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Completed
                                </span>
                              ) : (
                                <>
                                  <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-redhill-red/70" /> Start: {m.start_date || 'TBA'}</span>
                                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-amber-500/70" /> Expected: {m.expected_completion || 'TBA'}</span>
                                </>
                              )}
                              {m.actual_completion && (
                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                  <CheckCircle2 className="w-3 h-3" /> Actual: {m.actual_completion}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3 w-full md:w-64">
                          <div className="flex justify-between w-full text-sm mb-1">
                            <StatusBadge status={m.status} />
                            <span className="font-bold text-redhill-charcoal">{m.completion_percentage}%</span>
                          </div>
                          <div className="w-full bg-redhill-sand/70 h-2 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${m.completion_percentage}%` }}
                              className={cn(
                                "h-full rounded-full shadow-[0_0_10px_rgba(227,30,36,0.3)]",
                                m.status === 'completed' ? "bg-emerald-500" : "bg-redhill-red"
                              )}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Announcements */}
              <section className="bg-white rounded-2xl p-8 border border-redhill-line shadow-xl">
                <h2 className="text-2xl font-bold text-redhill-charcoal mb-8 flex items-center gap-3 font-serif">
                  <Bell className="text-redhill-red" />
                  Latest Announcements
                </h2>
                <div className="space-y-6">
                  {announcements.length > 0 ? announcements.map(a => (
                    <div key={a.id} className="border-l-4 border-redhill-red pl-6 py-2 relative bg-[#FBF9F5] rounded-r-xl p-4">
                      <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">
                        {new Date(a.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="font-bold text-lg text-redhill-charcoal mb-2 font-serif">{a.title}</h3>
                      <p className="text-stone-700 text-sm leading-relaxed">{a.content}</p>
                    </div>
                  )) : (
                    <p className="text-stone-500 italic text-sm">No announcements at this time.</p>
                  )}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'docs' && (
            <motion.div
              key="docs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-10"
            >
              {/* Documentation Stage */}
              <section className="bg-white rounded-2xl p-8 border border-redhill-line shadow-xl">
                <h2 className="text-xl font-bold text-redhill-charcoal mb-8 flex items-center gap-3 font-serif">
                  <FileText className="text-redhill-red" />
                  Documentation Stage
                </h2>
                <div className="space-y-4">
                  {docMilestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-[#FBF9F5] rounded-xl border border-redhill-line">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          m.status === 'completed' ? "bg-emerald-500/10 text-emerald-700" : "bg-redhill-sand/70 text-stone-500"
                        )}>
                          {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-redhill-charcoal text-sm font-serif">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={m.status} />
                        {m.doc_url && (
                          <a
                            href={m.doc_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-redhill-sand/70 hover:bg-redhill-red hover:text-white text-stone-700 rounded-lg transition-all text-xs font-bold border border-redhill-line"
                          >
                            <Download className="w-3 h-3" />
                            Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Approval Stage */}
              <section className="bg-white rounded-2xl p-8 border border-redhill-line shadow-xl">
                <h2 className="text-xl font-bold text-redhill-charcoal mb-8 flex items-center gap-3 font-serif">
                  <CheckCircle2 className="text-redhill-red" />
                  Approval Stage
                </h2>
                <div className="space-y-4">
                  {approvalMilestones.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-[#FBF9F5] rounded-xl border border-redhill-line">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                          m.status === 'completed' ? "bg-emerald-500/10 text-emerald-700" : "bg-redhill-sand/70 text-stone-500"
                        )}>
                          {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <span className="font-bold text-redhill-charcoal text-sm font-serif">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={m.status} />
                        {m.doc_url && (
                          <a
                            href={m.doc_url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-redhill-sand/70 hover:bg-redhill-red hover:text-white text-stone-700 rounded-lg transition-all text-xs font-bold border border-redhill-line"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Plan
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'media' && (
            <motion.div
              key="media"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-12"
            >
              {/* Live Camera Section */}
              <section className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-redhill-line">
                <div className="p-6 border-b border-redhill-line flex items-center justify-between bg-redhill-ivory">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Video className="text-redhill-red w-6 h-6" />
                      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-sm shadow-red-500/50"></span>
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-redhill-charcoal tracking-tight font-serif">Live Site Camera</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-redhill-sand/70 rounded-full border border-redhill-line">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-[10px] font-bold text-redhill-muted uppercase tracking-widest">System Online</span>
                    </div>
                    <div className="text-xs font-mono text-stone-500 italic">CAM-01 / NW-SECTOR</div>
                  </div>
                </div>

                <div className="relative aspect-video bg-black group">
                  {project.cctv_url ? (
                    <video
                      src={project.cctv_url}
                      autoPlay
                      muted
                      loop
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-stone-500 gap-4">
                      <Video className="w-16 h-16 opacity-20" />
                      <p className="text-sm font-medium">Camera Feed Temporarily Unavailable</p>
                    </div>
                  )}

                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-redhill-red font-bold uppercase tracking-[0.2em] text-[10px] mb-1">Live Feed</p>
                        <h3 className="text-white font-bold text-lg font-serif">Main Construction Yard</h3>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-4 py-2 bg-redhill-sand hover:bg-redhill-sand-deep backdrop-blur-md border border-redhill-line rounded-lg text-xs font-bold text-redhill-charcoal transition-all cursor-pointer">HD</button>
                        <button className="px-4 py-2 bg-redhill-red hover:bg-redhill-red/90 rounded-lg text-xs font-bold text-white transition-all shadow-lg shadow-red-600/20 cursor-pointer">Expand View</button>
                      </div>
                    </div>
                  </div>

                  {/* Scanline Effect */}
                  <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_2px,3px_100%] z-10 opacity-20" />
                </div>
              </section>

              {/* Gallery Section */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-redhill-charcoal flex items-center gap-3 font-serif">
                    <ImageIcon className="text-redhill-red" />
                    Project Media
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {updates.map((update, idx) => (
                    <motion.div
                      key={update.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group bg-white rounded-2xl overflow-hidden border border-redhill-line shadow-lg hover:border-redhill-line transition-all"
                    >
                      <div className="relative aspect-video overflow-hidden bg-redhill-ivory">
                        {update.type === 'video' ? (
                          update.url ? (
                            <video
                              src={update.url}
                              controls
                              preload="metadata"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Video className="w-12 h-12 text-stone-400" />
                            </div>
                          )
                        ) : (
                          <img
                            src={getAssetUrl(update.url, update.id)}
                            alt={update.caption}
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getAssetUrl(null, update.id);
                            }}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                        )}
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-widest border border-white/10">
                          {new Date(update.date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <div className="p-5">
                        <p className="text-sm text-stone-700 font-medium leading-relaxed">{update.caption}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            </motion.div>
          )}

          {activeTab === 'queries' && (
            <motion.div
              key="queries"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
              {/* Left 4 Columns: Executive Concierge & Allocation Dossier Panel */}
              <aside className="lg:col-span-4 flex flex-col justify-between gap-5">
                <div className="lux-card p-6 space-y-5">
                  <div className="flex items-start justify-between gap-3 pb-4 border-b border-redhill-line">
                    <div>
                      <span className="eyebrow text-redhill-gold">Private Client Advisory</span>
                      <h3 className="font-serif text-lg font-bold text-redhill-charcoal mt-1">
                        Dedicated Relationship Desk
                      </h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      Active
                    </span>
                  </div>

                  <p className="text-xs text-redhill-muted leading-relaxed">
                    Direct communication thread with your Redhill Bengaluru asset-management team regarding site progress, statutory filings, and capital ledger statements for <strong className="text-redhill-charcoal">{project.name}</strong>.
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-redhill-ivory border border-redhill-line rounded-md p-3">
                      <span className="block text-[10px] uppercase tracking-wider text-redhill-muted">Response SLA</span>
                      <span className="font-semibold text-redhill-charcoal mt-0.5 block">&lt; 4 Business Hrs</span>
                    </div>
                    <div className="bg-redhill-ivory border border-redhill-line rounded-md p-3">
                      <span className="block text-[10px] uppercase tracking-wider text-redhill-muted">Desk Hours</span>
                      <span className="font-semibold text-redhill-charcoal mt-0.5 block">Mon–Sat · IST</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-redhill-line space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-redhill-muted">Concierge Email</span>
                      <a href="mailto:invest@redhillinfra.com" className="font-mono text-redhill-red hover:underline">
                        invest@redhillinfra.com
                      </a>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-redhill-muted">Bengaluru Desk</span>
                      <span className="font-mono text-redhill-charcoal">+91 80 4123 9000</span>
                    </div>
                  </div>
                </div>

                {/* Quick Topic Triggers */}
                <div className="lux-card p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-redhill-gold" />
                      <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-redhill-charcoal">
                        Quick Inquiry Topics
                      </h4>
                    </div>
                    <p className="text-xs text-redhill-muted">
                      Select a topic below to pre-fill your message to the project concierge:
                    </p>
                    <div className="space-y-2 pt-1">
                      {[
                        "Can I get an update on current milestone progress?",
                        "Where can I find the latest payment receipts?",
                        "Is the live CCTV feed active on site today?",
                        "I would like to schedule a guided site walkthrough this week.",
                      ].map((text, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewMessage(text)}
                          className="w-full px-3.5 py-2.5 bg-redhill-ivory hover:bg-redhill-sand border border-redhill-line hover:border-redhill-red/30 rounded-lg text-xs text-stone-700 hover:text-redhill-charcoal transition-all cursor-pointer text-left flex items-center justify-between gap-2"
                        >
                          <span className="line-clamp-1">{text}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-redhill-gold shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-redhill-line flex items-center justify-between text-xs text-redhill-muted">
                    <span>Total Thread Messages</span>
                    <span className="font-mono font-semibold text-redhill-charcoal">{queries.length} recorded</span>
                  </div>
                </div>
              </aside>

              {/* Right 8 Columns: Executive Support Desk Conversation Console */}
              <div className="lg:col-span-8 h-[600px] sm:h-[640px] flex flex-col bg-white rounded-2xl border border-redhill-line shadow-xl overflow-hidden">
                {/* Support Desk Header */}
                <div className="p-4 sm:p-5 border-b border-redhill-line bg-redhill-sand/70 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-redhill-red rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg border border-white/10">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-redhill-charcoal text-base font-serif">Redhill Executive Support Desk</h2>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Online &amp; Active
                        </span>
                      </div>
                      <p className="text-xs text-redhill-muted mt-0.5">
                        Direct inquiries for {project.name} &bull; Typical reply within a few hours
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chat Message Stream */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 bg-redhill-ivory">
                  {/* Pinned Concierge Advisory Welcome Card */}
                  <div className="bg-white border border-redhill-line rounded-xl p-4 shadow-xs flex items-start gap-3.5">
                    <div className="w-9 h-9 rounded-lg bg-redhill-sand flex items-center justify-center text-redhill-gold shrink-0 mt-0.5">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-redhill-charcoal uppercase tracking-wider text-[10px]">
                          Redhill Concierge Desk · {project.name}
                        </span>
                        <span className="text-[10px] text-redhill-muted font-mono">Pinned Advisory</span>
                      </div>
                      <p className="text-redhill-muted leading-relaxed">
                        Welcome to your private executive channel for <strong className="text-redhill-charcoal">{project.name}</strong> ({project.location}). Messages sent here are routed directly to your assigned Relationship Manager and Site Engineering Lead.
                      </p>
                    </div>
                  </div>

                  {queries.length > 0 ? queries.map((q) => {
                    const isInvestor = q.sender_role === 'investor';
                    return (
                      <div
                        key={q.id}
                        className={cn(
                          "flex flex-col w-full group",
                          isInvestor ? "items-end" : "items-start"
                        )}
                      >
                        {/* Sender Info Tag */}
                        <div className={cn(
                          "flex items-center gap-2 mb-1 px-1",
                          isInvestor ? "flex-row-reverse" : "flex-row"
                        )}>
                          <span className={cn(
                            "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border shadow-sm",
                            isInvestor
                              ? "bg-redhill-sand text-stone-700 border-redhill-line"
                              : "bg-redhill-red/20 text-red-700 border-red-500/30"
                          )}>
                            {isInvestor ? 'You (Investor)' : 'Redhill Support'}
                          </span>
                          <span className="text-[10px] text-redhill-muted font-mono">
                            {formatRelativeTime(q.created_at)}
                          </span>
                        </div>

                        {/* Message Bubble */}
                        <div className={cn(
                          "p-4 max-w-[85%] sm:max-w-[75%] text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap transition-all",
                          isInvestor
                            ? "bg-redhill-charcoal text-white rounded-2xl rounded-tr-none border border-redhill-charcoal"
                            : "bg-white text-redhill-charcoal border border-redhill-line rounded-2xl rounded-tl-none"
                        )}>
                          <p className={cn("text-[13px] sm:text-sm font-normal", isInvestor ? "text-white" : "text-redhill-charcoal")}>{q.message}</p>
                        </div>
                      </div>
                    );
                  }) : (
                    <div className="py-12 flex flex-col items-center justify-center text-center px-6">
                      <div className="w-12 h-12 bg-redhill-sand/70 rounded-2xl flex items-center justify-center mb-3 border border-redhill-line">
                        <MessageCircle className="w-6 h-6 text-redhill-muted" />
                      </div>
                      <h3 className="font-bold text-redhill-charcoal text-sm mb-1 font-serif">No inquiries posted yet</h3>
                      <p className="text-xs text-redhill-muted max-w-sm">Have a question regarding construction progress, payment receipts, or allotment details? Submit a query below.</p>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input Form */}
                <form onSubmit={handleSendMessage} className="p-4 bg-redhill-sand/70 border-t border-redhill-line flex items-center gap-3 shrink-0">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Ask a question regarding this boutique residence..."
                    className="flex-1 bg-white border border-redhill-line rounded-xl px-4 py-3 text-sm text-redhill-charcoal placeholder-stone-400 focus:outline-none focus:border-redhill-red/50 focus:ring-2 focus:ring-redhill-red/20 transition-all"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-redhill-red hover:bg-redhill-crimson disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">
                      {sending ? 'Sending...' : 'Send'}
                    </span>
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === 'ledger' && (
            <motion.div
              key="ledger"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
            >
              {/* Left 4 Columns: Capital Account Summary */}
              <aside className="lg:col-span-4 space-y-5">
                <div className="lux-card p-6 space-y-4">
                  <div className="pb-3 border-b border-redhill-line">
                    <span className="eyebrow text-redhill-gold">Folio Summary</span>
                    <h3 className="font-serif text-lg font-bold text-redhill-charcoal mt-0.5">{project.name}</h3>
                    <p className="text-xs text-redhill-muted mt-0.5">{project.location}</p>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between py-2 border-b border-redhill-line/70">
                      <span className="text-redhill-muted">Committed Capital</span>
                      <span className="font-semibold text-redhill-charcoal tabular">
                        {project.investment_amount ? formatCurrency(project.investment_amount) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-redhill-line/70">
                      <span className="text-redhill-muted">Allotted Area</span>
                      <span className="font-semibold text-redhill-charcoal tabular">
                        {project.allotted_sqft ? `${project.allotted_sqft.toLocaleString('en-IN')} sqft` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-redhill-line/70">
                      <span className="text-redhill-muted">Entry Buy Rate</span>
                      <span className="font-semibold text-redhill-charcoal tabular">
                        {project.price_at_investment ? `₹${project.price_at_investment.toLocaleString('en-IN')}/sqft` : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-redhill-muted">Prevailing Market Rate</span>
                      <span className="font-semibold text-emerald-700 tabular">
                        {project.market_price_per_sqft ? `₹${project.market_price_per_sqft.toLocaleString('en-IN')}/sqft` : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Right 8 Columns: Investment Ledger Section */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-redhill-line overflow-hidden shadow-sm">
                <div className="p-4 sm:p-6 border-b border-redhill-line bg-redhill-sand/70 flex items-center justify-between">
                  <h3 className="font-bold text-redhill-charcoal flex items-center gap-2 text-sm sm:text-base">
                    <IndianRupee className="w-5 h-5 text-redhill-red" />
                    Investment Ledger
                  </h3>
                  <span className="text-[10px] font-bold text-redhill-muted px-2 py-0.5 bg-redhill-sand rounded">{ledgerEntries.length} entries</span>
                </div>
                <div className="divide-y divide-redhill-line">
                  {ledgerEntries.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                      <div className="w-14 h-14 bg-redhill-sand/70 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-redhill-line">
                        <IndianRupee className="w-7 h-7 text-redhill-muted" />
                      </div>
                      <p className="text-sm text-redhill-muted font-bold">No investment transactions recorded yet.</p>
                      <p className="text-xs text-stone-500 mt-1">Your investment history will appear here once assigned.</p>
                    </div>
                  ) : (
                    ledgerEntries.map((entry: LedgerEntry) => (
                      <div key={entry.id} className="p-4 sm:p-5 hover:bg-[#FBF9F5] transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex gap-3 sm:gap-4 min-w-0">
                            <div className={cn(
                              "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center shrink-0",
                              entry.transaction_type === 'initial_assignment'
                                ? "bg-blue-500/10 text-blue-700"
                                : "bg-emerald-500/10 text-emerald-700"
                            )}>
                              <IndianRupee className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className={cn(
                                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                                  entry.transaction_type === 'initial_assignment'
                                    ? "bg-blue-500/15 text-blue-700 border-blue-500/30"
                                    : "bg-emerald-500/15 text-emerald-700 border-emerald-500/30"
                                )}>
                                  {entry.transaction_type === 'initial_assignment' ? 'Initial Assignment' : 'Sub Investment'}
                                </span>
                              </div>
                              {entry.note && <p className="text-xs sm:text-sm text-stone-700 truncate">{entry.note}</p>}
                              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-[10px] sm:text-xs text-stone-500">
                                <span>Amount: <span className="text-redhill-charcoal font-bold">{formatCurrency(entry.investment_amount)}</span></span>
                                <span>Area: <span className="text-redhill-charcoal font-bold">{entry.allotted_sqft?.toLocaleString('en-IN')} sqft</span></span>
                                {entry.price_at_investment > 0 && (
                                  <span>Rate: <span className="text-redhill-charcoal font-bold">₹{entry.price_at_investment?.toLocaleString('en-IN')}/sqft</span></span>
                                )}
                              </div>
                              <p className="text-[10px] text-stone-500 mt-1">{formatDate(entry.transaction_date || entry.created_at)}</p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right shrink-0 pl-13 sm:pl-0">
                            <p className="text-base sm:text-lg font-bold text-redhill-charcoal">{formatCurrency(entry.investment_amount)}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-8 right-8 z-40 w-12 h-12 bg-redhill-sand-deep backdrop-blur-xl border border-redhill-line rounded-full flex items-center justify-center text-redhill-muted hover:text-redhill-charcoal hover:border-redhill-red/40 shadow-[0_8px_30px_rgba(0,0,0,0.4)] transition-colors cursor-pointer"
            title="Back to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </Layout>
  );
}

function TrendingUpIndicator() {
  return (
    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
      <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    </div>
  );
}
