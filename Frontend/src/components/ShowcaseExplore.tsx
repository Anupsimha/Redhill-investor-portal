import React, { useState } from 'react';
import { User, Project } from '../types';
import { 
  Calendar, 
  Gift, 
  HeartHandshake, 
  Home, 
  Sparkles, 
  MapPin, 
  Phone, 
  X, 
  Share2, 
  Check, 
  Copy, 
  Send,
  Building2,
  ShieldCheck,
  ChevronRight,
  User as UserIcon,
  LogOut,
  ExternalLink,
  Star,
  Download,
  Clock,
  Compass,
  CheckCircle2,
  Car,
  FileCheck,
  BadgeCheck,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { SHOWCASE_CONFIG, ShowcaseProject } from '../config/showcaseConfig';
import { apiFetch } from '../api/client';

interface ShowcaseExploreProps {
  user: User;
  onLogout: () => void;
  apiProjects?: Project[];
  onNavigateToPortfolio?: () => void;
  hasInvestments?: boolean;
}

export default function ShowcaseExplore({
  user,
  onLogout,
  apiProjects = [],
  onNavigateToPortfolio,
  hasInvestments = false
}: ShowcaseExploreProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<ShowcaseProject | null>(null);
  const [showReferModal, setShowReferModal] = useState(false);
  const [showSiteVisitModal, setShowSiteVisitModal] = useState(false);
  const [showEnquirySuccess, setShowEnquirySuccess] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [activeSection, setActiveSection] = useState<'projects' | 'referral' | 'events' | 'services'>('projects');

  // Form states
  const [enquiryPhone, setEnquiryPhone] = useState(user.phone || '');
  const [enquiryMessage, setEnquiryMessage] = useState('');
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [submittingEnquiry, setSubmittingEnquiry] = useState(false);

  const referralCode = `REDHILL-${(user.name.split(' ')[0] || 'VIP').toUpperCase()}-${user.id || '2026'}`;
  const referralLink = `${window.location.origin}/login?ref=${referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  // Filter projects by category
  const filteredProjects = selectedCategory === 'all' 
    ? SHOWCASE_CONFIG.featuredProjects 
    : SHOWCASE_CONFIG.featuredProjects.filter(p => p.category === selectedCategory);

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingEnquiry(true);

    try {
      const projectName = selectedProject?.name || 'Redhill Premier Development';
      const matchingDbProject = apiProjects.find(p => p.name.toLowerCase().includes(projectName.toLowerCase()));
      const projectId = matchingDbProject ? matchingDbProject.id : (apiProjects[0]?.id || 1);

      await apiFetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId,
          message: `[Showcase Lead - ${projectName}] Phone: ${enquiryPhone}. Preferred Date: ${siteVisitDate || 'Flexible'}. Notes: ${enquiryMessage || 'Requested detailed brochure and VIP site walkthrough.'}`,
        })
      });

      setShowEnquirySuccess(true);
      setTimeout(() => {
        setShowEnquirySuccess(false);
        setSelectedProject(null);
        setShowSiteVisitModal(false);
        setEnquiryMessage('');
      }, 2500);
    } catch (err) {
      console.error('Failed to submit enquiry', err);
      setShowEnquirySuccess(true);
      setTimeout(() => {
        setShowEnquirySuccess(false);
        setSelectedProject(null);
        setShowSiteVisitModal(false);
      }, 2500);
    } finally {
      setSubmittingEnquiry(false);
    }
  };

  const renderSocialIcon = (iconName: string) => {
    switch (iconName) {
      case 'youtube':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      case 'linkedin':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
          </svg>
        );
      case 'instagram':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      case 'facebook':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        );
      case 'twitter':
        return (
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#13161F] text-gray-100 selection:bg-redhill-red selection:text-white flex flex-col">
      
      {/* ======================================================== */}
      {/* 1. DESKTOP STICKY TOP NAVIGATION BAR                     */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#1E222B]/90 backdrop-blur-xl border-b border-white/[0.08] shadow-lg">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Logo light className="scale-105" />
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 bg-black/30 p-1 rounded-xl border border-white/[0.06]">
              <button
                onClick={() => setActiveSection('projects')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'projects' ? 'bg-redhill-red text-white shadow-md shadow-redhill-red/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                Featured Projects
              </button>
              <button
                onClick={() => setActiveSection('referral')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSection === 'referral' ? 'bg-redhill-red text-white shadow-md shadow-redhill-red/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5 text-amber-400" />
                Refer & Earn
              </button>
              <button
                onClick={() => setActiveSection('events')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'events' ? 'bg-redhill-red text-white shadow-md shadow-redhill-red/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                Events & Conclaves
              </button>
              <button
                onClick={() => setActiveSection('services')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeSection === 'services' ? 'bg-redhill-red text-white shadow-md shadow-redhill-red/25' : 'text-gray-400 hover:text-white'
                }`}
              >
                VIP Concierge
              </button>
            </nav>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-4">
            {/* If user has investments, allow switching back to portfolio */}
            {hasInvestments && onNavigateToPortfolio && (
              <button
                onClick={onNavigateToPortfolio}
                className="hidden sm:flex items-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 text-xs font-bold transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4" />
                My Portfolio
              </button>
            )}

            {/* User Pill */}
            <div className="flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] px-3.5 py-1.5 rounded-full border border-white/[0.08] transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-redhill-red to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user.role.replace('_', ' ')}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2.5 text-gray-400 hover:text-redhill-red hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. PC / DESKTOP FULL-BLEED LUXURY HERO BANNER            */}
      {/* ======================================================== */}
      <section className="relative overflow-hidden min-h-[520px] lg:min-h-[580px] flex items-center">
        {/* Background Image with Ambient Overlays */}
        <div className="absolute inset-0 z-0">
          <img 
            src={SHOWCASE_CONFIG.hero.backgroundImage} 
            alt="Redhill Architectural Horizon" 
            className="w-full h-full object-cover brightness-[0.65] contrast-[1.05] scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#13161F] via-[#13161F]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#13161F] via-transparent to-black/50" />
          
          {/* Subtle Ambient Redhill Glows */}
          <div className="absolute top-1/4 left-10 w-[500px] h-[500px] bg-redhill-red/10 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        </div>

        {/* Hero Content Container */}
        <div className="relative z-10 max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Headlines & CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-8 space-y-6"
            >
              {/* Gold Collection Tag */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-amber-500/30 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">
                  {SHOWCASE_CONFIG.brand.taglineBadge}
                </span>
              </div>

              {/* Bold Hero Headline */}
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] font-sans">
                {SHOWCASE_CONFIG.hero.headlinePrefix} <br />
                <span className="bg-gradient-to-r from-white via-gray-100 to-amber-300 bg-clip-text text-transparent">
                  {SHOWCASE_CONFIG.hero.headlineMain}
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl leading-relaxed font-normal">
                {SHOWCASE_CONFIG.hero.subheadline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <button
                  onClick={() => {
                    const el = document.getElementById('projects-grid');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-redhill-red hover:bg-red-700 text-white font-bold px-8 py-4 rounded-xl shadow-xl shadow-redhill-red/30 transition-all flex items-center gap-2 group cursor-pointer hover:scale-[1.02]"
                >
                  <span>{SHOWCASE_CONFIG.hero.ctaExploreText}</span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setShowSiteVisitModal(true)}
                  className="bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 font-bold px-7 py-4 rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Car className="w-4 h-4 text-amber-400" />
                  <span>{SHOWCASE_CONFIG.hero.ctaSiteVisitText}</span>
                </button>
              </div>
            </motion.div>

            {/* Right Column: Social Media Hub & Redhill Highlights Card */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="lg:col-span-4 space-y-5"
            >
              {/* Redhill Premier Badge Card */}
              <div className="bg-[#1E222B]/80 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.08] shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Official Portals</span>
                    <h3 className="text-sm font-bold text-white">Connect With Redhill</h3>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                  Follow our verified digital channels for real-time site updates, architectural walkthroughs, and executive announcements.
                </p>

                {/* Social Media Circular Handle Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  {SHOWCASE_CONFIG.socialMediaHandles.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={social.handle}
                      className="w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-redhill-red text-gray-300 hover:text-white transition-all flex items-center justify-center border border-white/[0.08] hover:border-redhill-red shadow-lg hover:scale-110 group"
                    >
                      {renderSocialIcon(social.icon)}
                    </a>
                  ))}
                </div>
              </div>

              {/* Live Stat Banner */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-4 border border-white/[0.06]">
                  <span className="text-2xl font-black text-amber-400">₹1,850+ Cr</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">Asset Value Built</p>
                </div>
                <div className="bg-white/[0.03] backdrop-blur-md rounded-xl p-4 border border-white/[0.06]">
                  <span className="text-2xl font-black text-emerald-400">100%</span>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mt-0.5">RERA Compliant</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 3. FEATURED REDHILL PROJECTS SHOWCASE (Desktop Grid)     */}
      {/* ======================================================== */}
      <section id="projects-grid" className="py-16 bg-[#171B24] border-t border-white/[0.06] flex-1">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Section Header with Category Filters */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 text-redhill-red font-bold uppercase tracking-[0.2em] text-xs mb-2">
                <span className="w-6 h-[2px] bg-redhill-red" />
                Curated Real Estate Portfolio
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                Featured Residential & Commercial Launches
              </h2>
              <p className="text-gray-400 text-sm mt-1 max-w-xl">
                Explore signature properties designed for high capital growth and exceptional lifestyle experiences.
              </p>
            </div>

            {/* Desktop Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: 'all', label: 'All Launches' },
                { id: 'highrise', label: 'Sky Condos' },
                { id: 'villas', label: 'Luxury Villas' },
                { id: 'township', label: 'Integrated Townships' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === tab.id
                      ? 'bg-redhill-red text-white shadow-lg shadow-redhill-red/25 border border-redhill-red'
                      : 'bg-white/[0.04] text-gray-400 hover:text-white border border-white/[0.06] hover:bg-white/[0.08]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project Cards Grid (PC / Desktop 2-4 cols) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group bg-[#1E222B] rounded-2xl overflow-hidden border border-white/[0.08] hover:border-redhill-red/40 transition-all duration-500 flex flex-col shadow-xl hover:shadow-2xl hover:shadow-redhill-red/10"
              >
                {/* Project Image Container */}
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.92]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1E222B] via-transparent to-black/40" />

                  {/* Top-Left Status Ribbon */}
                  <div className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-950 font-black text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{project.badge}</span>
                  </div>

                  {/* Top-Right Star Rating */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20 text-white text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{project.rating}</span>
                  </div>

                  {/* Price Tag Overlay */}
                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Starting from</span>
                    <span className="text-lg font-black text-amber-400">{project.priceStarting}</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-redhill-red text-xs font-semibold mb-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{project.location}</span>
                    </div>

                    <h3 className="text-xl font-bold text-white group-hover:text-amber-300 transition-colors leading-tight font-serif">
                      {project.name}
                    </h3>
                    
                    <p className="text-xs text-gray-400 mt-1 font-medium">
                      {project.configuration} • {project.carpetArea}
                    </p>

                    <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  </div>

                  {/* Highlights Pills */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.06]">
                    {project.highlights.slice(0, 2).map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => setSelectedProject(project)}
                      className="bg-white/[0.06] hover:bg-white/[0.12] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all border border-white/[0.08] cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProject(project);
                        setShowSiteVisitModal(true);
                      }}
                      className="bg-redhill-red hover:bg-red-700 text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-redhill-red/20 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>Enquire</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. REDHILL LUXURY REFERRAL SPOTLIGHT (Desktop Banner)    */}
      {/* ======================================================== */}
      <section className="py-16 bg-[#13161F] border-t border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#292F3D] via-[#1E222B] to-[#2B1B20] border border-redhill-red/30 p-8 sm:p-12 shadow-2xl">
            
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-redhill-red/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-0 left-10 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-redhill-red/20 text-redhill-red text-xs font-bold border border-redhill-red/30">
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  VIP Referral Advantage
                </div>

                <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-sans">
                  {SHOWCASE_CONFIG.referral.headline}
                </h2>

                <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  {SHOWCASE_CONFIG.referral.subtitle}
                </p>

                {/* Steps Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  {SHOWCASE_CONFIG.referral.steps.map((st, i) => (
                    <div key={i} className="bg-black/30 backdrop-blur-md rounded-xl p-3.5 border border-white/[0.06]">
                      <span className="text-amber-400 font-black text-xs font-mono">{st.step}</span>
                      <h4 className="text-xs font-bold text-white mt-1">{st.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Instant Share Code Box */}
              <div className="lg:col-span-5 bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/[0.1] space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Your Personalized Referral Link</span>
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] p-3 rounded-xl text-xs font-mono text-gray-200">
                  <span className="truncate flex-1">{referralLink}</span>
                  <button
                    onClick={handleCopyReferral}
                    className="p-2 bg-redhill-red hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer flex-shrink-0"
                    title="Copy Link"
                  >
                    {copiedReferral ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleCopyReferral}
                    className="flex-1 bg-redhill-red hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                    {copiedReferral ? 'Link Copied!' : 'Share VIP Referral'}
                  </button>
                  <button
                    onClick={() => setShowReferModal(true)}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. UPCOMING EVENTS & CONCLAVES                           */}
      {/* ======================================================== */}
      <section className="py-16 bg-[#171B24] border-t border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-redhill-red font-bold uppercase tracking-[0.2em] text-xs mb-2">
                <span className="w-6 h-[2px] bg-redhill-red" />
                By Private Invitation
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Upcoming Investor Events & Project Walkthroughs
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SHOWCASE_CONFIG.events.map((evt) => (
              <div 
                key={evt.id}
                className="bg-[#1E222B] rounded-2xl p-6 border border-white/[0.08] hover:border-amber-500/30 transition-all flex flex-col justify-between space-y-4 shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 px-3 py-1 rounded-full border border-amber-400/20">
                      {evt.tag}
                    </span>
                    <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-redhill-red" />
                      {evt.date}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white font-serif">{evt.title}</h3>
                  
                  <p className="text-xs text-gray-400 leading-relaxed">{evt.desc}</p>

                  <div className="flex items-center gap-2 text-xs text-gray-300 pt-2">
                    <MapPin className="w-4 h-4 text-redhill-red" />
                    <span>{evt.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <button
                    onClick={() => alert(`RSVP registered for "${evt.title}". Our concierge will send your digital invite badge to ${user.email}.`)}
                    className="w-full bg-white/[0.06] hover:bg-redhill-red text-white py-3 rounded-xl text-xs font-bold transition-all border border-white/[0.08] hover:border-redhill-red flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    Reserve Complimentary Seat
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. VIP CONCIERGE & INVESTOR SERVICES                     */}
      {/* ======================================================== */}
      <section className="py-16 bg-[#13161F] border-t border-white/[0.06]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div>
            <div className="flex items-center gap-2 text-redhill-red font-bold uppercase tracking-[0.2em] text-xs mb-2">
              <span className="w-6 h-[2px] bg-redhill-red" />
              End-to-End Asset Management
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Redhill Dedicated Concierge Services
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWCASE_CONFIG.services.map((svc, idx) => (
              <div
                key={idx}
                className="bg-[#1E222B] rounded-2xl p-6 border border-white/[0.08] hover:border-white/20 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/[0.06] text-gray-300 px-2.5 py-1 rounded-full border border-white/[0.08]">
                    {svc.badge}
                  </span>
                  <h3 className="text-base font-bold text-white">{svc.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{svc.desc}</p>
                </div>

                <button
                  onClick={() => {
                    setShowSiteVisitModal(true);
                    setEnquiryMessage(`Assistance requested for: ${svc.title}`);
                  }}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-2 transition-colors cursor-pointer"
                >
                  Request Assistance <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. FOOTER                                                */}
      {/* ======================================================== */}
      <footer className="bg-[#0E1017] border-t border-white/[0.08] py-12 text-gray-500 text-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo light className="scale-95" />
          <p>© 2026 Redhill Infrastructure Pvt Ltd. All rights reserved. RERA Registered.</p>
          <div className="flex items-center gap-4 text-gray-400">
            {SHOWCASE_CONFIG.socialMediaHandles.map((s) => (
              <a 
                key={s.name} 
                href={s.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors"
                title={s.name}
              >
                {renderSocialIcon(s.icon)}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 8. PROJECT DETAILS MODAL                                 */}
      {/* ======================================================== */}
      <AnimatePresence>
        {selectedProject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#1E222B] rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/[0.1] shadow-2xl text-white relative"
            >
              {/* Modal Banner */}
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <img 
                  src={selectedProject.image} 
                  alt={selectedProject.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E222B] via-transparent to-black/60" />

                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-redhill-red text-white flex items-center justify-center transition-colors cursor-pointer border border-white/20"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-amber-400 text-gray-950 font-black text-xs px-3 py-1 rounded-full shadow">
                      {selectedProject.badge}
                    </span>
                    <span className="bg-black/60 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full border border-white/20 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {selectedProject.rating}
                    </span>
                  </div>
                  <h3 className="text-3xl font-extrabold text-white font-serif">{selectedProject.name}</h3>
                  <p className="text-sm text-gray-300 flex items-center gap-1.5 mt-1">
                    <MapPin className="w-4 h-4 text-redhill-red" />
                    {selectedProject.location}
                  </p>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 sm:p-8 space-y-6">
                
                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Pricing</span>
                    <span className="text-sm font-black text-amber-400">{selectedProject.priceStarting}</span>
                  </div>
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Configuration</span>
                    <span className="text-sm font-bold text-white">{selectedProject.configuration}</span>
                  </div>
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Carpet Area</span>
                    <span className="text-sm font-bold text-white">{selectedProject.carpetArea}</span>
                  </div>
                  <div className="bg-white/[0.04] p-3.5 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Possession</span>
                    <span className="text-sm font-bold text-emerald-400">{selectedProject.possessionDate}</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-2">Project Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{selectedProject.description}</p>
                </div>

                {/* Highlights */}
                <div>
                  <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Signature Amenities & Highlights</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedProject.highlights.map((hl, i) => (
                      <div key={i} className="flex items-center gap-2.5 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] text-xs text-gray-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>{hl}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Enquiry & Site Visit Form */}
                <form onSubmit={handleSendEnquiry} className="pt-4 border-t border-white/[0.08] space-y-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-amber-400" />
                    Book VIP Site Visit / Request Detailed Floor Plans
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input 
                      type="tel" 
                      value={enquiryPhone}
                      onChange={(e) => setEnquiryPhone(e.target.value)}
                      placeholder="Your Mobile (+91 ...)"
                      className="w-full text-xs p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-2 focus:ring-redhill-red/30 outline-none"
                      required
                    />
                    <input 
                      type="date" 
                      value={siteVisitDate}
                      onChange={(e) => setSiteVisitDate(e.target.value)}
                      className="w-full text-xs p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-2 focus:ring-redhill-red/30 outline-none"
                    />
                  </div>

                  <input 
                    type="text" 
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    placeholder="Specific questions or custom requirements?"
                    className="w-full text-xs p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white focus:ring-2 focus:ring-redhill-red/30 outline-none"
                  />

                  {showEnquirySuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                      <Check className="w-4 h-4" /> Thank you! Your VIP request has been submitted. Our team will contact you shortly.
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submittingEnquiry}
                      className="flex-1 bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-redhill-red/30 cursor-pointer disabled:opacity-60"
                    >
                      <Send className="w-4 h-4" />
                      {submittingEnquiry ? 'Sending...' : 'Schedule Private Site Tour'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProject(null)}
                      className="bg-white/[0.06] hover:bg-white/[0.1] text-white font-bold py-3.5 px-6 rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </form>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 9. SITE VISIT & ENQUIRY MODAL                            */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showSiteVisitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1E222B] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/[0.1] text-white relative shadow-2xl space-y-5"
            >
              <button
                onClick={() => setShowSiteVisitModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-redhill-red/20 text-redhill-red rounded-2xl flex items-center justify-center mx-auto">
                  <Car className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Book VIP Chauffeur Tour</h3>
                <p className="text-xs text-gray-400">
                  Enjoy complimentary pickup and guided preview across our Bangalore flagship properties.
                </p>
              </div>

              <form onSubmit={handleSendEnquiry} className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Contact Phone</label>
                  <input 
                    type="tel"
                    value={enquiryPhone}
                    onChange={(e) => setEnquiryPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:ring-2 focus:ring-redhill-red/30"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 block mb-1">Preferred Date</label>
                  <input 
                    type="date"
                    value={siteVisitDate}
                    onChange={(e) => setSiteVisitDate(e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:ring-2 focus:ring-redhill-red/30"
                  />
                </div>

                {showEnquirySuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Check className="w-4 h-4" /> Tour booked! Our concierge will connect with you.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingEnquiry}
                  className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-redhill-red/30 cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-4 h-4" />
                  {submittingEnquiry ? 'Submitting...' : 'Confirm VIP Booking'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* 10. REFERRAL MODAL                                       */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showReferModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1E222B] rounded-3xl max-w-md w-full p-6 sm:p-8 border border-white/[0.1] text-white relative shadow-2xl space-y-5"
            >
              <button
                onClick={() => setShowReferModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Redhill Referral Program</h3>
                <p className="text-xs text-gray-400">
                  Earn up to ₹7,00,000 INR for each friend or family member who reserves a property in any Redhill residential enclave.
                </p>
              </div>

              <div className="bg-white/[0.04] p-4 rounded-xl border border-white/[0.08] space-y-2">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Your Referral Link</span>
                <div className="flex items-center gap-2 bg-black/40 p-2.5 rounded-lg text-xs font-mono text-gray-200">
                  <span className="truncate flex-1">{referralLink}</span>
                  <button 
                    onClick={handleCopyReferral}
                    className="p-1.5 text-gray-400 hover:text-redhill-red transition-colors cursor-pointer"
                  >
                    {copiedReferral ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyReferral}
                className="w-full bg-redhill-red hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-redhill-red/30 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                {copiedReferral ? 'Link Copied to Clipboard!' : 'Copy & Share via WhatsApp'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
