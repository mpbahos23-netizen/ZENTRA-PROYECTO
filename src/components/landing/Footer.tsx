import { Truck, Shield, Zap, Info, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

// ============================================
// ZENTRA OBSIDIAN: Stealth Footer
// Terminal Closing Protocol
// ============================================

const Footer = () => (
  <footer className="bg-[#060E20] py-24 border-t border-white/5 font-inter relative overflow-hidden">
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-600/5 blur-[120px] rounded-full -mr-48 -mb-48" />
    
    <div className="container mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
        
        {/* Branding */}
        <div className="space-y-6 text-center md:text-left">
           <Link to="/" className="flex items-center gap-4 group justify-center md:justify-start">
             <div className="w-12 h-12 rounded-[22px] bg-white/5 flex items-center justify-center border border-white/5 transition-all group-hover:bg-blue-600 group-hover:border-blue-500 shadow-2xl">
               <Zap className="w-6 h-6 text-zinc-600 transition-colors group-hover:text-white fill-none group-hover:fill-white" />
             </div>
             <span className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">Zentra</span>
           </Link>
           <p className="text-xs text-zinc-500 font-medium max-w-[280px] leading-relaxed">
             The Professional Logistics Operating System for the Modern Era.
           </p>
        </div>

        {/* Tactical Links */}
        <div className="flex flex-wrap items-center justify-center gap-10">
           {[
             { label: 'Sistemas', href: '#features' },
             { label: 'Precios', href: '#pricing' },
             { label: 'Acceso', href: '/login' },
             { label: 'Empresa', href: '#' },
           ].map(link => (
             <a 
              key={link.label} 
              href={link.href} 
              className="group flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-all uppercase tracking-widest"
             >
               {link.label}
               <ArrowUpRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-all -translate-y-0.5" />
             </a>
           ))}
        </div>

        {/* Global Status Badge */}
        <div className="space-y-4 text-center md:text-right">
           <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full shadow-lg shadow-emerald-500/5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Global Systems: Optimal</span>
           </div>
           <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">
             © 2026 ZENTRA PROJECT. All Rights Reserved. <br /> <span className="opacity-50">Logistics OS v3.1.2</span>
           </p>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
