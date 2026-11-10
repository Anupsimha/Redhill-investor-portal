import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Project, NotificationLog } from '../../types';
import {
  Mail, Search, Filter, Calendar, CheckCircle2, User, Building2,
  Layers, ExternalLink, RefreshCw, Send, ShieldCheck, Clock
} from 'lucide-react';
import EmailPreviewModal from './EmailPreviewModal';
import { apiFetch } from '../../api/client';

export default function AutomatedMessagesView() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<NotificationLog | null>(null);

  // Fetch Projects for filter dropdown
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ['admin-projects'],
    queryFn: async () => {
      const res = await apiFetch('/api/admin/projects');
      return res.json();
    },
  });

  // Fetch All Notification Logs
  const {
    data: logs = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery<NotificationLog[]>({
    queryKey: ['admin-notifications', selectedProjectId],
    queryFn: async () => {
      const url = selectedProjectId === 'all'
        ? '/api/admin/notifications'
        : `/api/admin/notifications?projectId=${selectedProjectId}`;
      const res = await apiFetch(url);
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Filter logs by search query (recipient name, email, subject, milestone)
  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.recipient_name?.toLowerCase().includes(q) ||
      log.recipient_email?.toLowerCase().includes(q) ||
      log.subject?.toLowerCase().includes(q) ||
      log.project_name?.toLowerCase().includes(q) ||
      log.milestone_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-redhill-red/10 border border-red-500/20 flex items-center justify-center text-redhill-red">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-redhill-charcoal font-serif">Automated Messages & Notifications</h1>
              <p className="text-redhill-muted text-sm mt-0.5">
                Audit history of all automated milestone and daily construction emails sent to targeted project investors.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="self-start md:self-auto bg-redhill-sand/70 hover:bg-redhill-sand text-stone-700 hover:text-redhill-charcoal px-4 py-2.5 rounded-xl border border-redhill-line text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          Refresh Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-redhill-line shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-redhill-red/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="text-redhill-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Send className="w-4 h-4 text-redhill-red" />
            Total Dispatched Emails
          </div>
          <div className="text-3xl font-bold text-redhill-charcoal font-serif">{logs.length}</div>
          <div className="text-xs text-stone-500 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Across all projects
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-redhill-line shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="text-redhill-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            Active Projects Covered
          </div>
          <div className="text-3xl font-bold text-redhill-charcoal font-serif">{projects.length}</div>
          <div className="text-xs text-stone-500 mt-2">
            Automated targeted routing active
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-redhill-line shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="text-redhill-muted text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            Strict Targeted Routing
          </div>
          <div className="text-sm font-bold text-emerald-700 mt-2">100% Enforced</div>
          <div className="text-xs text-redhill-muted mt-1">
            Emails dispatched strictly to each project&apos;s investors
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-redhill-sand-deep p-4 rounded-2xl border border-redhill-line">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Project Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-redhill-muted" />
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-redhill-sand/70 border border-redhill-line rounded-xl px-3 py-2 text-xs font-bold text-redhill-charcoal outline-none focus:border-redhill-red"
            >
              <option value="all" className="bg-[#171a21]">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#171a21]">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-redhill-muted absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by investor, subject, milestone..."
            className="w-full bg-redhill-sand/70 border border-redhill-line rounded-xl pl-10 pr-4 py-2 text-xs text-redhill-charcoal placeholder-stone-400 outline-none focus:border-redhill-red transition-all"
          />
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-2xl border border-redhill-line shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="text-center py-16 text-redhill-muted text-sm">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-redhill-red" />
            Loading automated message history...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-16 text-redhill-muted">
            <Mail className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <p className="font-bold text-redhill-charcoal text-base">No automated message records found</p>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              When admin updates daily construction progress and completes a milestone in Project A, automated emails dispatched to Project A&apos;s investors will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-redhill-line bg-[#FBF9F5] text-redhill-muted text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6">Project</th>
                  <th className="py-4 px-6">Milestone</th>
                  <th className="py-4 px-6">Recipient Investor</th>
                  <th className="py-4 px-6">Subject</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-redhill-line text-xs">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FBF9F5] transition-colors group">
                    <td className="py-4 px-6 text-redhill-muted whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        {new Date(log.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </td>

                    <td className="py-4 px-6 font-semibold text-redhill-charcoal">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-redhill-red shrink-0" />
                        <span className="truncate max-w-[160px]">{log.project_name || `Project #${log.project_id}`}</span>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-stone-700">
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span className="truncate max-w-[180px] font-medium">
                          {log.milestone_name || 'Milestone Target'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        <div>
                          <div className="font-bold text-redhill-charcoal">{log.recipient_name}</div>
                          <div className="text-[11px] text-redhill-muted">{log.recipient_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-stone-700 font-medium max-w-[220px] truncate">
                      {log.subject}
                    </td>

                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Sent
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-3 py-1.5 bg-redhill-sand/70 hover:bg-redhill-sand text-stone-700 hover:text-redhill-charcoal rounded-lg border border-redhill-line text-xs font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View Email
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rendered Email Preview Modal */}
      {selectedLog && (
        <EmailPreviewModal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          subject={selectedLog.subject}
          recipientName={selectedLog.recipient_name}
          recipientEmail={selectedLog.recipient_email}
          projectName={selectedLog.project_name}
          milestoneName={selectedLog.milestone_name}
          htmlContent={selectedLog.content_html}
          sentAt={selectedLog.created_at}
        />
      )}
    </div>
  );
}
