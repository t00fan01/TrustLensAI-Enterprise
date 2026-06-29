import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NavigationBar = () => {
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Setup', path: '/setup' },
    { name: 'Features', path: '/features' },
    { name: 'History', path: '/history' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-8 py-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/logo.png" alt="TrustLens AI Logo" className="h-9 object-contain" />
        <span className="font-bold text-xl tracking-tight text-slate-900">TrustLens AI</span>
      </div>
      
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`transition-colors duration-200 ${
              location.pathname === link.path
                ? 'text-teal-600 font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-teal-700 px-3 py-1.5 bg-teal-50 rounded-full border border-teal-100">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse-glow"></div>
          LLaMA 3.1 Active
        </div>
      </div>
    </header>
  );
};

export default NavigationBar;
