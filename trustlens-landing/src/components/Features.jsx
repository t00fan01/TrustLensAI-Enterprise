import React from 'react';
import { Shield, Brain, Ban, Zap, Lock, EyeOff } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Shield className="w-8 h-8 text-teal-500" />,
      title: "Real-time Shielding",
      description: "Instantly injects visual safety indicators into Google Search results before you even click a link. TrustLens acts as your first line of defense.",
      color: "from-teal-500/10 to-transparent",
      borderColor: "group-hover:border-teal-500/30"
    },
    {
      icon: <Brain className="w-8 h-8 text-purple-500" />,
      title: "Contextual Threat Reasoning",
      description: "Goes beyond simple blocklists. We leverage a high-speed heuristic threat engine to analyze the actual contextual intent of a webpage to catch zero-day phishing.",
      color: "from-purple-500/10 to-transparent",
      borderColor: "group-hover:border-purple-500/30"
    },
    {
      icon: <Ban className="w-8 h-8 text-red-500" />,
      title: "Active Blocker Technology",
      description: "When a malicious site is detected, a high-z-index interstitial blocker is teleported over the DOM, blurring out hostile content and preventing interaction.",
      color: "from-red-500/10 to-transparent",
      borderColor: "group-hover:border-red-500/30"
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: "Lightning Fast Inference",
      description: "Powered by our local heuristics and caching engine, the threat oracle returns intent analysis in less than 800 milliseconds. Security without sacrificing browsing speed.",
      color: "from-amber-500/10 to-transparent",
      borderColor: "group-hover:border-amber-500/30"
    },
    {
      icon: <Lock className="w-8 h-8 text-blue-500" />,
      title: "Dual-Key Bulkhead",
      description: "Enterprise-grade fault isolation. Background scanning and manual click analysis are completely separated endpoints to prevent rate limits from dropping coverage.",
      color: "from-blue-500/10 to-transparent",
      borderColor: "group-hover:border-blue-500/30"
    },
    {
      icon: <EyeOff className="w-8 h-8 text-indigo-500" />,
      title: "Privacy First Cache",
      description: "Local sessionStorage caching ensures domains are only scanned once per browser session. Your history never leaves your device more than necessary.",
      color: "from-indigo-500/10 to-transparent",
      borderColor: "group-hover:border-indigo-500/30"
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-8 py-16 w-full">
      <div className="text-center mb-20">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 rounded-full tracking-wider uppercase">
          Technology Stack
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6">
          Advanced Protection Features
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          TrustLens AI combines the speed of local extension execution with a decentralized threat intelligence cache to secure your browsing experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className={`group relative bg-white rounded-2xl p-8 border border-gray-100 shadow-lg shadow-slate-200/40 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden ${feature.borderColor}`}
          >
            <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-b ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
            
            <div className="relative z-10">
              <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center mb-6 border border-gray-100 group-hover:scale-110 transition-transform duration-300 shadow-sm">
                {feature.icon}
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-3">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 leading-relaxed text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-24 border-t border-gray-100 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Want to see it in action?</h3>
          <p className="text-slate-600">Head over to the live scanner and test a URL.</p>
        </div>
        <a href="/#scanner" className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
          Try the Scanner <Shield className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

export default Features;
