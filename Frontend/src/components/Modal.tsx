import { useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  description?: string;
  maxWidth?: string;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  description,
  maxWidth = 'max-w-md'
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`relative bg-redhill-sand-deep backdrop-blur-2xl border border-redhill-line rounded-2xl w-full ${maxWidth} p-8 shadow-2xl text-redhill-charcoal max-h-[90vh] overflow-y-auto overflow-hidden`}
          >
            {/* Subtle gold decoration bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-redhill-red via-[#D4AF37] to-amber-500" />

            <div className="flex justify-between items-start mb-6 pt-1">
              <div>
                <h2 className="text-2xl font-bold font-serif">{title}</h2>
                {description && <p className="text-redhill-muted mt-1 text-sm">{description}</p>}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-stone-500 hover:text-redhill-charcoal hover:bg-redhill-sand rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
