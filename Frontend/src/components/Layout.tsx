import React, { ReactNode, useState, useEffect } from 'react';
import { Menu, X, LogOut, ShieldCheck } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import Logo from './Logo';
import { User } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  sidebarContent?: (closeMenu: () => void) => ReactNode;
  children: ReactNode;
}

export default function Layout({ user, onLogout, sidebarContent, children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-[#13161F] flex flex-col md:flex-row text-gray-100 overflow-hidden relative selection:bg-redhill-red selection:text-white">
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-redhill-red/5 rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#181C26]/95 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-50">
        <Logo light />
        <button 
          onClick={() => setMobileMenuOpen(true)} 
          className="p-2 text-gray-300 hover:text-white rounded-xl bg-white/[0.04] border border-white/[0.08]"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#181C26] border-r border-white/[0.08] shadow-2xl">
            <div className="p-5 border-b border-white/[0.08] flex justify-between items-center bg-[#1E222B]/90">
               <Logo light />
               <button 
                 onClick={() => setMobileMenuOpen(false)} 
                 className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.06] transition-colors"
               >
                 <X className="w-6 h-6" />
               </button>
            </div>

            {/* Sidebar Content inside Mobile Drawer */}
            <div className="flex-1 overflow-y-auto p-2">
              {sidebarContent ? sidebarContent(() => setMobileMenuOpen(false)) : (
                 <div className="p-4 text-gray-400 text-sm">Navigation</div>
              )}
            </div>

            {/* User details / logout on mobile */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-[#1E222B]/90">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-redhill-red to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-gray-400 capitalize truncate mt-0.5">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="p-2 text-gray-400 hover:text-redhill-red hover:bg-white/[0.04] rounded-xl transition-all"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Admins) */}
      {sidebarContent && (
        <aside className="hidden md:flex w-68 bg-[#181C26]/95 backdrop-blur-2xl border-r border-white/[0.08] text-white flex-col sticky top-0 h-screen flex-shrink-0 z-30">
          <div className="p-6 border-b border-white/[0.08] bg-[#1E222B]/60 flex items-center justify-between">
            <Logo light className="scale-105" />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            {sidebarContent(() => {})}
          </div>

          {/* User Profile Pill at Bottom of Sidebar */}
          <div className="p-4 border-t border-white/[0.08] bg-[#1E222B]/80 flex items-center justify-between gap-3">
             <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-redhill-red to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-white truncate">{user.name}</p>
                  <p className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider capitalize truncate mt-0.5">
                    {user.role.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <button 
                onClick={onLogout} 
                className="p-2 text-gray-400 hover:text-redhill-red hover:bg-white/[0.06] rounded-xl transition-all flex-shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative min-w-0 custom-scrollbar">
         {/* If no sidebar (e.g. Investor dashboard), show desktop top-header */}
         {!sidebarContent && (
           <header className="hidden md:flex bg-[#1E222B]/90 backdrop-blur-xl border-b border-white/[0.08] sticky top-0 z-30">
             <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <Logo light className="scale-105" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/[0.04] px-3.5 py-1.5 rounded-full border border-white/[0.08]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-redhill-red to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-gray-400 capitalize mt-0.5">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={onLogout} 
                    className="p-2.5 text-gray-400 hover:text-redhill-red hover:bg-white/[0.04] rounded-xl transition-all cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
             </div>
           </header>
         )}
         
         {/* Page Children */}
         <div className="flex-1 w-full max-w-[1600px] mx-auto min-w-0">
           {children}
         </div>
      </main>
    </div>
  );
}
