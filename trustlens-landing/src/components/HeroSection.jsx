import React from 'react';

const HeroSection = () => {

  const handleInstallClick = (e) => {
    e.preventDefault();
    window.location.href = '/setup';
  };

  return (
    <div className="flex flex-col justify-center items-start text-left pt-12 md:pt-24 pb-16 px-4 md:pr-12">
      <div className="inline-block px-4 py-1.5 mb-8 text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-full tracking-widest uppercase shadow-sm">
        Security Command Center
      </div>
      
      <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 leading-[1.1]">
        Secure your <br className="hidden md:block"/> browsing with <br className="hidden md:block"/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-600">
          Intent-Based AI
        </span>
      </h1>
      
      <p className="text-xl text-slate-600 mb-10 max-w-xl font-normal leading-relaxed">
        TrustLens AI analyzes the underlying intent of web pages in real-time to instantly shield you from zero-day phishing and social engineering attacks.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-start items-center w-full">
        <a href="#scanner" className="w-full sm:w-auto text-center px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl shadow-lg shadow-teal-500/30 transition-all duration-300 transform hover:-translate-y-1">
          Live Threat Scanner
        </a>
        <button onClick={handleInstallClick} className="w-full sm:w-auto text-center px-8 py-4 bg-white text-slate-700 hover:text-slate-900 font-bold rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-300 cursor-pointer">
          Install Extension
        </button>
      </div>

      <div className="mt-16 flex flex-col sm:flex-row gap-6 text-sm text-slate-500 font-medium bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          Sub-second AI Guardian
        </div>
        <div className="hidden sm:block w-px h-8 bg-slate-200"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          Active Blocker
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
