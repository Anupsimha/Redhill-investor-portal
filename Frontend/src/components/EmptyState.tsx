import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = ''
}: EmptyStateProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col items-center justify-center p-12 text-center border border-redhill-line border-dashed rounded-2xl bg-[#FBF9F5] ${className}`}
    >
      <div className="w-16 h-16 bg-[#FBF9F5] rounded-2xl flex items-center justify-center mb-6 border border-redhill-line">
        <Icon className="w-8 h-8 text-stone-500" />
      </div>
      <h3 className="text-xl font-bold text-redhill-charcoal mb-2 font-serif">{title}</h3>
      <p className="text-sm text-redhill-muted max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-redhill-sand/70 hover:bg-redhill-sand border border-redhill-line text-redhill-charcoal rounded-xl text-sm font-bold transition-colors cursor-pointer"
        >
          {actionLabel}
        </button>
      )}
    </motion.div>
  );
}
