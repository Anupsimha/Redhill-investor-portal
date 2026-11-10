import React, { useState } from 'react';
import { UserPlus, X } from 'lucide-react';

interface CreateInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<void>;
}

export default function CreateInvestorModal({
  isOpen,
  onClose,
  onSubmit
}: CreateInvestorModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('investor123');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({ name, email, phone, password });
      setName('');
      setEmail('');
      setPhone('');
      setPassword('investor123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white border border-redhill-line rounded-2xl w-full max-w-lg p-8 shadow-2xl text-redhill-charcoal">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-redhill-charcoal font-serif flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-redhill-red" />
            Add New Investor
          </h2>
          <button onClick={onClose} className="text-redhill-muted hover:text-redhill-charcoal transition-colors cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-bold text-redhill-muted mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-[#FBF9F5] border border-redhill-line rounded-xl outline-none text-redhill-charcoal focus:bg-redhill-sand/70 focus:border-redhill-red/40 transition-all"
              placeholder="e.g. John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-redhill-muted mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-[#FBF9F5] border border-redhill-line rounded-xl outline-none text-redhill-charcoal focus:bg-redhill-sand/70 focus:border-redhill-red/40 transition-all"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-redhill-muted mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 bg-[#FBF9F5] border border-redhill-line rounded-xl outline-none text-redhill-charcoal focus:bg-redhill-sand/70 focus:border-redhill-red/40 transition-all"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-redhill-muted mb-1">Initial Password</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-[#FBF9F5] border border-redhill-line rounded-xl outline-none text-redhill-charcoal focus:bg-redhill-sand/70 focus:border-redhill-red/40 font-mono transition-all"
              required
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-redhill-sand/70 hover:bg-redhill-sand border border-redhill-line rounded-xl font-bold transition-all text-stone-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-redhill-red hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-redhill-red/25 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
