import React from 'react';
import { Download, Settings, UploadCloud, FolderOpen, ToggleRight } from 'lucide-react';

const InstallationSimulation = () => {
  return (
    <section id="installation" className="py-24 px-8 lg:px-12 bg-white">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-slate-900">
          Install Locally in <span className="text-teal-600">3 Steps</span>
        </h2>
        
        <div className="space-y-8">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 font-bold text-xl rounded-full flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="flex-grow w-full">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Download size={20} className="text-teal-600" /> Download & Extract
              </h3>
              <p className="text-slate-600 mb-4">
                You've just downloaded the <strong>trustlens-extension.zip</strong> file. Extract this ZIP file to a safe location on your PC to get the <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-sm">trustlens-extension</code> folder.
              </p>
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg font-mono text-sm text-slate-700 flex justify-between items-center overflow-x-auto">
                <span className="whitespace-nowrap">Extract trustlens-extension.zip</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 font-bold text-xl rounded-full flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div className="flex-grow w-full">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Settings size={20} className="text-teal-600" /> Enable Developer Mode
              </h3>
              <p className="text-slate-600 mb-4">
                Open Chrome and navigate to <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-sm">chrome://extensions</code>. Toggle the <strong>Developer mode</strong> switch in the top right corner.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between max-w-sm">
                <span className="text-sm font-semibold text-slate-700">Developer mode</span>
                <ToggleRight size={32} className="text-teal-500" />
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-teal-50 text-teal-600 font-bold text-xl rounded-full flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div className="flex-grow w-full">
              <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                <UploadCloud size={20} className="text-teal-600" /> Load Unpacked
              </h3>
              <p className="text-slate-600 mb-4">
                Click the <strong>Load unpacked</strong> button that appears and select the <code className="bg-slate-100 text-teal-700 px-1.5 py-0.5 rounded text-sm">trustlens-extension</code> folder.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mt-6">
                <button className="bg-slate-100 text-slate-700 font-semibold px-4 py-2 rounded border border-slate-200 flex items-center gap-2">
                  <FolderOpen size={18} /> Load unpacked
                </button>
                <span className="text-slate-400">→</span>
                <div className="bg-teal-50 border border-teal-100 px-4 py-2 rounded-lg flex items-center gap-3">
                  <img src="/logo.png" alt="TrustLens AI" className="h-10 w-10 object-contain shadow-[0_0_15px_rgba(0,179,179,0.4)] rounded-lg" />
                  <div>
                    <div className="text-sm font-bold text-teal-900 leading-tight">TrustLens AI</div>
                    <div className="text-xs text-teal-600">Active locally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default InstallationSimulation;
