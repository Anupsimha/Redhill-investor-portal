import React from 'react';
import { X, Mail, CheckCircle2, User, Building2, Calendar, ExternalLink } from 'lucide-react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  subject: string;
  recipientName: string;
  recipientEmail: string;
  projectName?: string;
  milestoneName?: string;
  htmlContent: string;
  sentAt?: string;
}

export default function EmailPreviewModal({
  isOpen,
  onClose,
  subject,
  recipientName,
  recipientEmail,
  projectName,
  milestoneName,
  htmlContent,
  sentAt,
}: EmailPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative bg-[#13171F] border border-redhill-line rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden z-10 text-redhill-charcoal animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-redhill-line flex items-center justify-between bg-redhill-ivory">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-redhill-red/10 border border-red-500/20 flex items-center justify-center text-redhill-red">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-redhill-charcoal font-serif flex items-center gap-2">
                Automated Email Message
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 font-sans font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Dispatched
                </span>
              </h2>
              <p className="text-xs text-redhill-muted mt-0.5">
                Exact HTML email sent to targeted project investor
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-redhill-sand/70 hover:bg-redhill-sand text-redhill-muted hover:text-redhill-charcoal transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Metadata Header */}
        <div className="px-6 py-4 bg-[#FBF9F5] border-b border-redhill-line text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-redhill-muted font-semibold w-16">Subject:</span>
              <span className="font-bold text-redhill-charcoal text-sm">{subject}</span>
            </div>
            {sentAt && (
              <div className="text-redhill-muted flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(sentAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-redhill-muted font-semibold w-16">Recipient:</span>
              <span className="text-redhill-charcoal flex items-center gap-1.5 bg-redhill-sand/70 px-2.5 py-1 rounded-lg border border-redhill-line">
                <User className="w-3 h-3 text-redhill-red" />
                <strong className="text-redhill-charcoal">{recipientName}</strong> &lt;{recipientEmail}&gt;
              </span>
            </div>
            {projectName && (
              <div className="flex items-center gap-1.5 text-redhill-muted">
                <Building2 className="w-3.5 h-3.5 text-redhill-muted" />
                <span>Project: <strong className="text-redhill-charcoal">{projectName}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Rendered HTML Email Preview */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#0a0c0f] flex justify-center">
          <div className="w-full max-w-[620px] bg-[#171a21] rounded-xl overflow-hidden border border-redhill-line shadow-lg">
            <iframe
              srcDoc={htmlContent}
              title="Email Preview"
              className="w-full min-h-[640px] border-0"
              sandbox="allow-same-origin allow-popups"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-redhill-line bg-white flex items-center justify-between">
          <span className="text-xs text-stone-500">
            Automated messaging engine powered by Redhill Infra
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-redhill-sand hover:bg-redhill-sand text-redhill-charcoal text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Preview
          </button>
        </div>

      </div>
    </div>
  );
}
