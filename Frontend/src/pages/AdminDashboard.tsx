import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Project, Milestone, MilestoneCategory, MilestoneStatus, ProgressUpdate, Query, Role, LedgerEntry } from '../types';
import {
  Users, Building2, LayoutDashboard, CheckCircle2, Clock, AlertCircle,
  Image as ImageIcon, Video, Bell, Save, Trash2, UserPlus, MapPin,
  MessageCircle, Send, ArrowLeft, Pencil, Copy, Check, ExternalLink, Eye, EyeOff,
  Search, MoreHorizontal, ChevronDown, ChevronUp, Wallet, MoreVertical, Hammer,
  Upload, Link as LinkIcon, X, FileVideo, IndianRupee, Shield, Mail, BookOpen,
  PlusCircle, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Logo from '../components/Logo';
import Layout from '../components/Layout';
import { useToast } from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import ManageMilestonesModal from '../components/admin/ManageMilestonesModal';
import AutomatedMessagesView from '../components/admin/AutomatedMessagesView';
import { formatCurrency, formatDate, formatRelativeTime } from '../utils/formatters';
import { ROLE_CONFIG, RoleMetadata } from '../constants/roles';
import { apiFetch } from '../api/client';
import { getAssetUrl } from '../config/env';

// Modular Admin Components
import AdminOverview from '../components/admin/AdminOverview';
import AdminManagement from '../components/admin/AdminManagement';
import InvestmentLedger from '../components/admin/InvestmentLedger';
import AdminQueries from '../components/admin/AdminQueries';
import ProjectDrawer from '../components/admin/ProjectDrawer';

// Modular Modals
import CreateAdminModal from '../components/admin/modals/CreateAdminModal';
import EditAdminModal from '../components/admin/modals/EditAdminModal';
import CreateProjectModal from '../components/admin/modals/CreateProjectModal';
import CreateInvestorModal from '../components/admin/modals/CreateInvestorModal';
import AssignProjectModal from '../components/admin/modals/AssignProjectModal';
import RecordPaymentModal from '../components/admin/modals/RecordPaymentModal';
import SubInvestmentModal from '../components/admin/modals/SubInvestmentModal';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const { showToast } = useToast();
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'senior_admin';
  const isSiteManager = user?.role === 'site_manager';
  const isFinancialOfficer = user?.role === 'financial_officer';
  const isMarketingManager = user?.role === 'marketing_manager';
  const isSupportAgent = user?.role === 'support_agent';

  const [activeView, setActiveView] = useState<'overview' | 'investors' | 'projects' | 'queries' | 'admins' | 'ledger'>('overview');
  const [selectedThread, setSelectedThread] = useState<Query | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  // Queries fetching
  const { data: investors = [], isLoading: loadingInvestors, refetch: refetchInvestors } = useQuery<User[]>({
    queryKey: ['admin-investors'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/investors');
      return res.json();
    },
    enabled: isSuperAdmin || isFinancialOfficer
  });

  const { data: projects = [], isLoading: loadingProjects, refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/projects');
      return res.json();
    }
  });

  const { data: assignments = [], refetch: refetchAssignments } = useQuery<any[]>({
    queryKey: ['admin-investor-projects'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/investor-projects');
      return res.json();
    },
    enabled: isSuperAdmin || isFinancialOfficer
  });

  const { data: threads = [], refetch: refetchQueries } = useQuery<Query[]>({
    queryKey: ['admin-queries'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/queries');
      return res.json();
    },
    refetchInterval: 15000
  });

  const { data: adminsList = [], refetch: refetchAdmins } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/users');
      return res.json();
    },
    enabled: isSuperAdmin
  });

  const { data: ledgerEntries = [], refetch: refetchLedger } = useQuery<LedgerEntry[]>({
    queryKey: ['admin-ledger'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/ledger');
      return res.json();
    },
    enabled: isSuperAdmin || isFinancialOfficer
  });

  const { data: analyticsData, refetch: refetchAnalytics } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/analytics');
      return res.json();
    }
  });

  // Modal Visibility State
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showEditAdminModal, setShowEditAdminModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<any | null>(null);

  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubInvestmentModal, setShowSubInvestmentModal] = useState(false);
  const [targetAssignment, setTargetAssignment] = useState<any | null>(null);

  // Project Detail Drawer / Milestone state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projectMilestones, setProjectMilestones] = useState<Milestone[]>([]);
  const [projectUpdates, setProjectUpdates] = useState<ProgressUpdate[]>([]);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCctvModal, setShowCctvModal] = useState(false);
  const [cctvUrl, setCctvUrl] = useState('');

  // Form states for Milestones
  const [mCategory, setMCategory] = useState<MilestoneCategory>('documentation');
  const [mName, setMName] = useState('');
  const [mStatus, setMStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');
  const [mDocUrl, setMDocUrl] = useState('');
  const [mDocFile, setMDocFile] = useState<File | null>(null);
  const mDocFileRef = useRef<HTMLInputElement>(null);

  // Form states for Updates
  const [updateType, setUpdateType] = useState<'photo' | 'video'>('photo');
  const [updateUrl, setUpdateUrl] = useState('');
  const [updateCaption, setUpdateCaption] = useState('');
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Assignment Modal state
  const [editingAssignment, setEditingAssignment] = useState<any | null>(null);
  const [editContribution, setEditContribution] = useState('');
  const [editInvestmentAmt, setEditInvestmentAmt] = useState('');
  const [editSqft, setEditSqft] = useState('');
  const [editMarketPrice, setEditMarketPrice] = useState('');
  const [editPriceAtInv, setEditPriceAtInv] = useState('');
  const [editInvDate, setEditInvDate] = useState('');

  // Search & Pagination States
  const [investorSearch, setInvestorSearch] = useState('');
  const [investorPage, setInvestorPage] = useState(1);
  const [investorSortField, setInvestorSortField] = useState('name');
  const [investorSortDir, setInvestorSortDir] = useState<'asc' | 'desc'>('asc');

  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [assignmentProjectFilter, setAssignmentProjectFilter] = useState('');
  const [assignmentPage, setAssignmentPage] = useState(1);
  const [assignmentSortField, setAssignmentSortField] = useState('investor');
  const [assignmentSortDir, setAssignmentSortDir] = useState<'asc' | 'desc'>('asc');

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const unansweredCount = threads.filter((t: any) => t.last_sender_role === 'investor').length;

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedThread) {
      scrollToBottom();
    }
  }, [selectedThread, threads]);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast(`Copied "${text}" to clipboard`, 'info');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Failed to copy to clipboard', 'error');
    }
  }, [showToast]);

  const fetchProjectDetails = async (projectId: number) => {
    try {
      const res = await apiFetch(`/api/investor/projects/${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setProjectMilestones(data.milestones || []);
        setProjectUpdates(data.updates || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openProjectDrawer = (project: Project) => {
    setSelectedProject(project);
    setCctvUrl(project.cctv_url || '');
    fetchProjectDetails(project.id);
  };

  // --- Handlers ---
  const handleCreateAdmin = async (data: { name: string; email: string; role: Role; password: string }) => {
    try {
      const res = await apiFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        refetchAdmins();
        setShowAdminModal(false);
        showToast('Admin staff created successfully', 'success');
      } else {
        const err = await res.json();
        showToast(`Error: ${err.error}`, 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    }
  };

  const handleUpdateAdmin = async (id: number, data: { name: string; email: string; role: Role; password?: string }) => {
    try {
      const res = await apiFetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        refetchAdmins();
        setShowEditAdminModal(false);
        showToast('Admin user updated successfully', 'success');
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to update admin', 'error');
      }
    } catch {
      showToast('An error occurred', 'error');
    }
  };

  const handleDeleteAdmin = (id: number, name: string) => {
    if (id === user.id) {
      showToast('You cannot delete your own Super Admin account', 'error');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: `Remove ${name}?`,
      message: `Are you sure you want to remove "${name}" from administrators? This will permanently revoke their access to the portal.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
          if (res.ok) {
            refetchAdmins();
            showToast('Admin account removed successfully', 'success');
          } else {
            const data = await res.json();
            showToast(data.error || 'Failed to delete admin', 'error');
          }
        } catch {
          showToast('Failed to delete admin', 'error');
        }
      }
    });
  };

  const handleCreateProject = async (data: {
    name: string;
    location: string;
    totalValue: string;
    status: string;
    imageUrl: string;
    completionPercentage: number;
    cctvUrl: string;
    imageFile: File | null;
  }) => {
    let finalImageUrl = data.imageUrl;
    if (data.imageFile) {
      const formData = new FormData();
      formData.append('file', data.imageFile);
      const uploadRes = await apiFetch('/api/admin/upload', { method: 'POST', body: formData });
      if (uploadRes.ok) {
        const uploadData = await uploadRes.json();
        finalImageUrl = uploadData.url;
      }
    }

    const res = await apiFetch('/api/admin/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        location: data.location,
        total_value: data.totalValue,
        status: data.status,
        image_url: finalImageUrl,
        completion_percentage: data.completionPercentage,
        cctv_url: data.cctvUrl
      })
    });

    if (res.ok) {
      setShowProjectModal(false);
      refetchProjects();
      showToast('Project created successfully!', 'success');
    } else {
      showToast('Failed to create project', 'error');
    }
  };

  const handleCreateInvestor = async (data: { name: string; email: string; phone: string; password: string }) => {
    const res = await apiFetch('/api/admin/investors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      setShowInvestorModal(false);
      refetchInvestors();
      showToast('Investor account created successfully!', 'success');
    } else {
      const err = await res.json();
      showToast(`Error: ${err.error}`, 'error');
    }
  };

  const handleDeleteInvestor = (id: number, name: string) => {
    setConfirmDialog({
      isOpen: true,
      title: `Delete ${name}?`,
      message: `This will permanently remove the investor "${name}" and all their project assignments, investment records, and query history.`,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        try {
          const res = await apiFetch(`/api/admin/investors/${id}`, { method: 'DELETE' });
          if (res.ok) {
            refetchInvestors();
            refetchAssignments();
            refetchLedger();
            showToast(`${name} has been deleted successfully.`, 'success');
          } else {
            showToast('Failed to delete investor', 'error');
          }
        } catch {
          showToast('An error occurred', 'error');
        }
      }
    });
  };

  const handleAssignProject = async (data: {
    userId: string;
    projectId: string;
    contribution: string;
    investmentAmount: string;
    allottedSqft: string;
    marketPricePerSqft: string;
  }) => {
    const res = await apiFetch('/api/admin/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: parseInt(data.userId),
        project_id: parseInt(data.projectId),
        contribution: data.contribution,
        investment_amount: parseFloat(data.investmentAmount) || 0,
        allotted_sqft: parseFloat(data.allottedSqft) || 0,
        market_price_per_sqft: parseFloat(data.marketPricePerSqft) || 0
      })
    });

    if (res.ok) {
      setShowAssignModal(false);
      refetchAssignments();
      refetchLedger();
      showToast('Investor assigned to project successfully!', 'success');
    } else {
      const err = await res.json();
      showToast(`Error: ${err.error}`, 'error');
    }
  };

  const handleRecordPayment = async (data: {
    type: 'receipt' | 'invoice';
    amount: string;
    date: string;
    notes: string;
    file: File | null;
  }) => {
    if (!targetAssignment) return;
    let docUrl = '';
    if (data.file) {
      const formData = new FormData();
      formData.append('file', data.file);
      const upRes = await apiFetch('/api/admin/upload', { method: 'POST', body: formData });
      if (upRes.ok) {
        const upData = await upRes.json();
        docUrl = upData.url;
      }
    }

    const res = await apiFetch('/api/admin/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        project_id: targetAssignment.project_id,
        user_id: targetAssignment.user_id,
        type: data.type,
        amount: Number(data.amount),
        date: data.date,
        status: 'paid',
        description: data.notes,
        file_url: docUrl
      })
    });

    if (res.ok) {
      setShowPaymentModal(false);
      showToast('Payment transaction recorded successfully!', 'success');
    } else {
      const err = await res.json();
      showToast(`Error: ${err.error}`, 'error');
    }
  };

  const handleAddSubInvestment = async (data: {
    userId: number;
    projectId: number;
    addCapital: number;
    addSqft: number;
    currentPrice: number;
    notes: string;
    transactionDate: string;
  }) => {
    const res = await apiFetch('/api/admin/ledger/sub-investment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: data.userId,
        project_id: data.projectId,
        investment_amount: data.addCapital,
        allotted_sqft: data.addSqft,
        price_at_investment: data.currentPrice,
        market_price_per_sqft: data.currentPrice,
        note: data.notes,
        transaction_date: data.transactionDate
      })
    });

    if (res.ok) {
      setShowSubInvestmentModal(false);
      setTargetAssignment(null);
      refetchAssignments();
      refetchLedger();
      refetchAnalytics();
      showToast('Sub-investment upgraded & logged to Ledger successfully!', 'success');
    } else {
      const err = await res.json();
      showToast(`Error: ${err.error}`, 'error');
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyMessage.trim()) return;

    setSendingReply(true);
    try {
      const res = await apiFetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: selectedThread.project_id,
          user_id: selectedThread.user_id,
          message: replyMessage
        })
      });

      if (res.ok) {
        setReplyMessage('');
        refetchQueries();
        showToast('Reply dispatched successfully', 'success');
      } else {
        showToast('Failed to send reply', 'error');
      }
    } catch {
      showToast('Error sending message', 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const handleLogout = async () => {
    await apiFetch('/api/logout', { method: 'POST' });
    onLogout();
  };

  // Filtered Investors for Investors Tab
  const filteredInvestors = investors
    .filter(i => {
      if (!investorSearch) return true;
      const q = investorSearch.toLowerCase();
      return (
        (i.name?.toLowerCase().includes(q) ?? false) ||
        (i.email?.toLowerCase().includes(q) ?? false) ||
        (i.login_id?.toLowerCase().includes(q) ?? false)
      );
    });
  const paginatedInvestors = filteredInvestors.slice((investorPage - 1) * 10, investorPage * 10);
  const investorTotalPages = Math.max(1, Math.ceil(filteredInvestors.length / 10));

  // Filtered Assignments for Investors Tab
  const filteredAssignments = assignments.filter((a: any) => {
    const matchesSearch = !assignmentSearch || 
      (a.investor_name?.toLowerCase().includes(assignmentSearch.toLowerCase()) || false) ||
      (a.investor_email?.toLowerCase().includes(assignmentSearch.toLowerCase()) || false);
    const matchesProject = !assignmentProjectFilter || a.project_id === Number(assignmentProjectFilter);
    return matchesSearch && matchesProject;
  });
  const paginatedAssignments = filteredAssignments.slice((assignmentPage - 1) * 10, assignmentPage * 10);
  const assignmentTotalPages = Math.max(1, Math.ceil(filteredAssignments.length / 10));

  // Navigation Items
  const sidebarNav = (closeMenu: () => void) => (
    <nav className="flex-1 space-y-1.5 pt-2">
      {[
        { id: 'overview', label: 'Executive Overview', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Building2, hidden: isSupportAgent },
        { id: 'investors', label: 'Investor Directory', icon: Users, hidden: isSiteManager || isMarketingManager || isSupportAgent },
        { id: 'ledger', label: 'Investment Ledger', icon: BookOpen, hidden: isSiteManager || isMarketingManager || isSupportAgent },
        { id: 'queries', label: 'Inquiries & Site Visits', icon: MessageCircle },
        { id: 'admins', label: 'Staff & Roles', icon: Shield, hidden: !isSuperAdmin },
      ].filter(item => !item.hidden).map((item) => {
        const isActive = activeView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => { setActiveView(item.id as any); closeMenu(); }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-xs sm:text-sm cursor-pointer",
              isActive
                ? "bg-gradient-to-r from-redhill-red via-red-600 to-amber-600 text-white shadow-lg shadow-redhill-red/30 border border-redhill-red/40 font-bold scale-[1.02]"
                : "text-gray-300 hover:text-white hover:bg-white/[0.06] border border-transparent"
            )}
          >
            <item.icon className={cn("w-4 h-4", isActive ? "text-white" : "text-gray-400")} />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'queries' && unansweredCount > 0 && (
              <span className="min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse shadow-sm">
                {unansweredCount}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );

  return (
    <Layout user={user} onLogout={handleLogout} sidebarContent={sidebarNav}>
      <div className={cn("p-4 sm:p-6 lg:p-10", activeView === 'queries' ? "h-full flex flex-col" : "")}>
        {/* Overview Tab */}
        {activeView === 'overview' && (
          <AdminOverview
            user={user}
            projects={projects}
            investors={investors}
            unansweredCount={unansweredCount}
            adminsCount={adminsList.length}
            analytics={analyticsData}
            setActiveView={setActiveView}
            onNewProject={() => setShowProjectModal(true)}
            onNewInvestor={() => setShowInvestorModal(true)}
            onSelectProject={openProjectDrawer}
          />
        )}

        {/* Projects Tab */}
        {activeView === 'projects' && !isSupportAgent && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-redhill-red font-bold uppercase tracking-[0.2em] text-xs mb-1">
                  <span className="w-5 h-[2px] bg-redhill-red" />
                  Projects
                </div>
                <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">Project Management</h1>
                <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage construction developments, milestone schedules, and live CCTV feeds.</p>
              </div>
              {!isSiteManager && (
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="bg-redhill-red hover:bg-red-700 text-white px-6 py-3.5 rounded-xl font-bold flex items-center gap-2 shadow-xl shadow-redhill-red/30 transition-all cursor-pointer text-xs sm:text-sm hover:scale-[1.02]"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>New Project Launch</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map(p => (
                <div 
                  key={p.id} 
                  className="bg-[#1E222B] rounded-2xl border border-white/[0.08] shadow-xl overflow-hidden flex flex-col hover:border-redhill-red/50 hover:shadow-2xl hover:shadow-redhill-red/15 transition-all duration-300 group hover:-translate-y-1 cursor-pointer"
                  onClick={() => openProjectDrawer(p)}
                >
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={getAssetUrl(p.image_url) || 'https://picsum.photos/seed/project/800/600'}
                      alt={p.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=600';
                      }}
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E222B] via-transparent to-black/30" />
                    <div className="absolute top-3 right-3 shadow-lg rounded-full bg-black/60 backdrop-blur border border-white/20">
                      <StatusChip status={p.status} />
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-1">
                        <h3 className="text-lg font-bold text-white font-serif leading-tight group-hover:text-amber-300 transition-colors">
                          {p.name}
                        </h3>
                        <Link
                          to={`/project/${p.id}`}
                          target="_blank"
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 bg-white/[0.06] hover:bg-white/[0.12] text-gray-300 hover:text-white rounded-lg transition-colors border border-white/10"
                          title="Preview as Investor"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-redhill-red shrink-0" />
                        <span className="truncate">{p.location}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
                      <div>
                        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                          <span>Construction Completion</span>
                          <span className="font-bold text-amber-400">{p.completion_percentage}%</span>
                        </div>
                        <div className="w-full bg-black/40 h-2 rounded-full overflow-hidden border border-white/10">
                          <div 
                            className="bg-gradient-to-r from-redhill-red to-amber-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${p.completion_percentage}%` }} 
                          />
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openProjectDrawer(p);
                        }}
                        className="w-full py-3 bg-white/[0.06] hover:bg-redhill-red text-white text-xs font-bold rounded-xl transition-all border border-white/[0.08] hover:border-redhill-red cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                      >
                        <span>Manage Milestones & CCTV Updates</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Investors Tab */}
        {activeView === 'investors' && (isSuperAdmin || isFinancialOfficer) && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/[0.08]">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase tracking-[0.2em] text-xs mb-1">
                  <span className="w-5 h-[2px] bg-emerald-400" />
                  Client Relationship Desk
                </div>
                <h1 className="text-3xl font-extrabold text-white font-serif tracking-tight">Investor Directory & Allocations</h1>
                <p className="text-gray-400 mt-1 text-xs sm:text-sm">Manage investor accounts, login credentials, and project portfolio allocations.</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-5 py-3 bg-white/[0.06] hover:bg-white/[0.12] text-white rounded-xl font-bold border border-white/[0.1] transition-all flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <PlusCircle className="w-4 h-4 text-amber-400" />
                  <span>Assign Project</span>
                </button>
                <button
                  onClick={() => setShowInvestorModal(true)}
                  className="px-5 py-3 bg-redhill-red hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-redhill-red/30 flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Investor</span>
                </button>
              </div>
            </div>

            {/* Investors Table */}
            <div className="bg-[#1E222B] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/[0.08] flex flex-col sm:flex-row justify-between items-center gap-4 bg-black/20">
                <h2 className="font-bold text-white text-lg font-serif">Registered Investors ({investors.length})</h2>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search name, email, or ID..."
                    value={investorSearch}
                    onChange={(e) => setInvestorSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.04] border border-white/[0.08] rounded-xl outline-none text-xs sm:text-sm text-white focus:bg-white/[0.08] focus:border-redhill-red/40"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-black/30 border-b border-white/[0.08] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-4">Investor</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Login ID</th>
                      <th className="px-6 py-4">Phone</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05] text-sm">
                    {paginatedInvestors.map(i => (
                      <tr key={i.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-redhill-red to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                              {i.name ? i.name.charAt(0).toUpperCase() : 'I'}
                            </div>
                            <span className="font-bold text-white">{i.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300 font-mono text-xs">{i.email}</td>
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 text-amber-400 font-bold">
                            {i.login_id || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{i.phone || 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteInvestor(i.id, i.name)}
                            className="p-2 text-gray-500 hover:text-redhill-red hover:bg-white/[0.04] rounded-lg transition-colors cursor-pointer"
                            title="Delete Investor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Assignments Table */}
            {assignments.length > 0 && (
              <div className="bg-[#1E222B] rounded-3xl border border-white/[0.08] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-white/[0.08] bg-black/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-bold text-white text-lg font-serif">Active Portfolio Allocations</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Assigned developments and allotted area per investor.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-black/30 border-b border-white/[0.08] text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <th className="px-5 py-3">Investor</th>
                        <th className="px-5 py-3">Project</th>
                        <th className="px-5 py-3">Investment</th>
                        <th className="px-5 py-3">Allotted Area</th>
                        <th className="px-5 py-3">Market Rate</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.05]">
                      {paginatedAssignments.map((a: any) => (
                        <tr key={`${a.user_id}-${a.project_id}`} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-5 py-3 font-bold text-white">{a.investor_name}</td>
                          <td className="px-5 py-3 text-gray-300">{a.project_name}</td>
                          <td className="px-5 py-3 font-bold text-white">{a.contribution || formatCurrency(a.investment_amount)}</td>
                          <td className="px-5 py-3 text-gray-300">{a.allotted_sqft?.toLocaleString('en-IN') || 0} sqft</td>
                          <td className="px-5 py-3 text-emerald-400 font-bold">{formatCurrency(a.market_price_per_sqft)}/sqft</td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => { setTargetAssignment(a); setShowPaymentModal(true); }}
                                className="p-2 text-gray-400 hover:text-emerald-400 bg-white/[0.04] hover:bg-emerald-500/10 rounded-lg transition-all cursor-pointer border border-white/[0.06]"
                                title="Record Payment / Invoice"
                              >
                                <IndianRupee className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => { setTargetAssignment(a); setShowSubInvestmentModal(true); }}
                                className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-emerald-500/20"
                                title="Add Sub-Investment"
                              >
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Upgrade</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Investment Ledger Tab */}
        {activeView === 'ledger' && (isSuperAdmin || isFinancialOfficer) && (
          <InvestmentLedger ledgerEntries={ledgerEntries} projects={projects} />
        )}

        {/* Admin Management Tab */}
        {activeView === 'admins' && isSuperAdmin && (
          <AdminManagement
            adminsList={adminsList}
            currentUserId={user.id}
            onAddNewAdmin={() => setShowAdminModal(true)}
            onEditAdmin={(admin) => { setEditingAdmin(admin); setShowEditAdminModal(true); }}
            onDeleteAdmin={handleDeleteAdmin}
          />
        )}

        {/* Queries Tab */}
        {activeView === 'queries' && (
          <AdminQueries />
        )}
      </div>

      {/* Modular Modals */}
      <CreateAdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        onSubmit={handleCreateAdmin}
      />

      <EditAdminModal
        isOpen={showEditAdminModal}
        admin={editingAdmin}
        onClose={() => { setShowEditAdminModal(false); setEditingAdmin(null); }}
        onSubmit={handleUpdateAdmin}
      />

      <CreateProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleCreateProject}
      />

      <CreateInvestorModal
        isOpen={showInvestorModal}
        onClose={() => setShowInvestorModal(false)}
        onSubmit={handleCreateInvestor}
      />

      <AssignProjectModal
        isOpen={showAssignModal}
        investors={investors}
        projects={projects}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssignProject}
      />

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setTargetAssignment(null); }}
        onSubmit={handleRecordPayment}
      />

      <SubInvestmentModal
        isOpen={showSubInvestmentModal}
        assignment={targetAssignment}
        onClose={() => { setShowSubInvestmentModal(false); setTargetAssignment(null); }}
        onSubmit={handleAddSubInvestment}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Project Drawer for Milestones, Updates & CCTV */}
      {selectedProject && (
        <ProjectDrawer
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onRefreshProjects={refetchProjects}
        />
      )}
    </Layout>
  );
}
