import React, { useState } from 'react';
import { User } from '../../types';
import { ROLE_CONFIG } from '../../constants/roles';
import { Shield, Hammer, IndianRupee, TrendingUp, MessageCircle, Users, Search, X, Pencil, Trash2, Copy, UserPlus } from 'lucide-react';
import { useToast } from '../Toast';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AdminManagementProps {
  adminsList: any[];
  currentUserId: number;
  onAddNewAdmin: () => void;
  onEditAdmin: (admin: any) => void;
  onDeleteAdmin: (id: number, name: string) => void;
}

export default function AdminManagement({
  adminsList = [],
  currentUserId,
  onAddNewAdmin,
  onEditAdmin,
  onDeleteAdmin
}: AdminManagementProps) {
  const { showToast } = useToast();
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('all');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-redhill-red" />
            <h1 className="text-3xl font-bold text-redhill-charcoal font-serif">Admin & Role Management</h1>
          </div>
          <p className="text-redhill-muted mt-1">Configure staff credentials, create administrators, and manage granular role access permissions.</p>
        </div>
        <button
          onClick={onAddNewAdmin}
          className="flex items-center gap-2 bg-redhill-red hover:bg-red-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg  cursor-pointer"
        >
          <UserPlus className="w-5 h-5" />
          Add Administrator
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <button
          onClick={() => setAdminRoleFilter('all')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'all' ? "bg-redhill-sand border-redhill-stone shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-redhill-sand text-redhill-charcoal rounded-xl flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">All Staff</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">{adminsList.length}</p>
        </button>

        <button
          onClick={() => setAdminRoleFilter('super_admin')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'super_admin' ? "bg-amber-500/15 border-amber-500/40 shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-amber-500/10 text-amber-700 rounded-xl flex items-center justify-center mb-3">
            <Shield className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">Super Admin</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">
            {adminsList.filter((a: any) => a.role === 'super_admin').length}
          </p>
        </button>

        <button
          onClick={() => setAdminRoleFilter('site_manager')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'site_manager' ? "bg-emerald-500/15 border-emerald-500/40 shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-emerald-500/10 text-emerald-700 rounded-xl flex items-center justify-center mb-3">
            <Hammer className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">Site Engineer</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">
            {adminsList.filter((a: any) => a.role === 'site_manager').length}
          </p>
        </button>

        <button
          onClick={() => setAdminRoleFilter('financial_officer')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'financial_officer' ? "bg-purple-500/15 border-purple-500/40 shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-purple-500/10 text-purple-700 rounded-xl flex items-center justify-center mb-3">
            <IndianRupee className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">Finance Lead</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">
            {adminsList.filter((a: any) => a.role === 'financial_officer').length}
          </p>
        </button>

        <button
          onClick={() => setAdminRoleFilter('marketing_manager')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'marketing_manager' ? "bg-rose-500/15 border-rose-500/40 shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-rose-500/10 text-rose-700 rounded-xl flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">Marketing</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">
            {adminsList.filter((a: any) => a.role === 'marketing_manager').length}
          </p>
        </button>

        <button
          onClick={() => setAdminRoleFilter('support_agent')}
          className={cn(
            "p-5 rounded-2xl border text-left transition-all cursor-pointer",
            adminRoleFilter === 'support_agent' ? "bg-blue-500/15 border-blue-500/40 shadow-lg" : "bg-white border-redhill-line hover:bg-redhill-sand/70"
          )}
        >
          <div className="w-10 h-10 bg-blue-500/10 text-blue-700 rounded-xl flex items-center justify-center mb-3">
            <MessageCircle className="w-5 h-5" />
          </div>
          <p className="text-[10px] font-bold text-redhill-muted uppercase tracking-wider">Support Agent</p>
          <p className="text-2xl font-bold text-redhill-charcoal mt-0.5">
            {adminsList.filter((a: any) => a.role === 'support_agent').length}
          </p>
        </button>
      </div>

      {/* Interactive Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-redhill-line p-6 space-y-4 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-stone-500 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              placeholder="Search administrators by name or email..."
              className="w-full bg-[#FBF9F5] border border-redhill-line rounded-xl pl-11 pr-4 py-2.5 text-sm text-redhill-charcoal placeholder-stone-400 focus:outline-none focus:bg-redhill-sand/70 focus:border-redhill-red/40"
            />
            {adminSearch && (
              <button onClick={() => setAdminSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-redhill-charcoal">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {['all', 'super_admin', 'site_manager', 'financial_officer', 'marketing_manager', 'support_agent'].map(r => {
              const cfg = r === 'all' ? null : ROLE_CONFIG[r];
              const label = r === 'all' ? 'All Roles' : cfg?.label || r;
              const isActive = adminRoleFilter === r;
              return (
                <button
                  key={r}
                  onClick={() => setAdminRoleFilter(r)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer border",
                    isActive
                      ? "bg-redhill-sand text-redhill-charcoal border-redhill-stone shadow-sm"
                      : "bg-[#FBF9F5] text-redhill-muted border-redhill-line hover:text-redhill-charcoal hover:bg-redhill-sand/70"
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-redhill-line">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-redhill-ivory border-b border-redhill-line text-[10px] font-bold text-redhill-muted uppercase tracking-widest">
                <th className="px-6 py-4">Staff Member</th>
                <th className="px-6 py-4">Email Address</th>
                <th className="px-6 py-4">Assigned Role & Scope</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-redhill-line text-sm">
              {adminsList
                .filter((a: any) => {
                  const matchesSearch = !adminSearch ||
                    (a.name?.toLowerCase().includes(adminSearch.toLowerCase()) || false) ||
                    (a.email?.toLowerCase().includes(adminSearch.toLowerCase()) || false);
                  const matchesRole = adminRoleFilter === 'all' || a.role === adminRoleFilter;
                  return matchesSearch && matchesRole;
                })
                .map((a: any) => {
                  const roleCfg = ROLE_CONFIG[a.role] || ROLE_CONFIG.support_agent;
                  const RoleIcon = roleCfg.icon;
                  return (
                    <tr key={a.id} className="hover:bg-[#FBF9F5] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm",
                            roleCfg.bg,
                            roleCfg.color,
                            roleCfg.border
                          )}>
                            {a.name ? a.name.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <p className="font-bold text-redhill-charcoal flex items-center gap-2">
                              {a.name}
                              {a.id === currentUserId && (
                                <span className="text-[10px] font-bold text-redhill-red bg-redhill-red/10 border border-redhill-red/20 px-2 py-0.5 rounded-full">
                                  You (Current)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-stone-500 font-mono">ID: #{a.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-700 font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {a.email}
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(a.email);
                              showToast('Email copied to clipboard', 'info');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-stone-700 transition-opacity p-1 cursor-pointer"
                            title="Copy Email"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider border shadow-sm",
                          roleCfg.bg,
                          roleCfg.color,
                          roleCfg.border
                        )}>
                          <RoleIcon className="w-3.5 h-3.5" />
                          {roleCfg.badge}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onEditAdmin(a)}
                            className="p-2 text-redhill-muted hover:text-redhill-charcoal hover:bg-redhill-sand rounded-lg transition-all cursor-pointer"
                            title="Edit Role & Permissions"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          {a.id !== currentUserId && (
                            <button
                              onClick={() => onDeleteAdmin(a.id, a.name)}
                              className="p-2 text-redhill-muted hover:text-red-700 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                              title="Revoke Admin Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {adminsList.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-stone-500">
                    <Shield className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-bold">No administrators found</p>
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
