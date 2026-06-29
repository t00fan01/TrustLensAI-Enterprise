import { Download, FileArchive, Settings, FolderOpen, ArrowRight } from 'lucide-react';

const Setup = () => {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-16 px-4 font-sans">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex flex-col items-center text-center mb-24 animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10">
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 text-xs font-bold text-teal-700 bg-teal-100/50 border border-teal-200 rounded-full uppercase tracking-wider shadow-sm">
            Installation Guide
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6">
            Get TrustLens AI
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 max-w-2xl mx-auto font-medium mb-12">
            Download the extension package to secure your browser.
          </p>
          
          <a
            href="/trustlens-extension.zip"
            download
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-teal-600 hover:bg-teal-500 text-white text-2xl font-bold rounded-3xl shadow-[0_0_25px_rgba(13,148,136,0.5)] animate-pulse hover:animate-none transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_0_35px_rgba(13,148,136,0.7)]"
          >
            <Download className="w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
            <span>Download Extension (ZIP)</span>
            <div className="absolute inset-0 border-[3px] border-white/20 rounded-3xl"></div>
          </a>
          <p className="mt-6 text-sm text-slate-400 font-medium">
            Version 1.0.0 • Free & Open Source
          </p>
        </div>

        <div className="relative">
          <h2 className="text-xl font-bold text-center text-slate-400 mb-10 uppercase tracking-[0.2em]">
            Installation Steps
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-slate-700 shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-teal-900/20 hover:-translate-y-2 group">
              <div className="w-24 h-24 rounded-3xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300">
                <FileArchive className="text-teal-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Step 1: Extract the File
              </h3>
              <p className="text-slate-300 text-lg leading-tight">
                Locate the downloaded <strong className="text-slate-100 font-semibold">trustlens-extension.zip</strong> file, right-click it, and select <strong className="text-slate-100 font-semibold">"Extract All..."</strong>
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-slate-700 shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-2 group">
              <div className="w-24 h-24 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300">
                <Settings className="text-blue-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Step 2: Enable Developer Mode
              </h3>
              <p className="text-slate-300 text-lg leading-tight">
                Open Chrome and navigate to <code className="bg-slate-900/50 px-2 py-1 rounded-md text-base text-slate-300 border border-slate-700 font-mono">chrome://extensions</code>. Toggle the <strong className="text-slate-100 font-semibold">Developer mode</strong> switch in the top-right corner.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-[2rem] p-8 md:p-10 border border-slate-700 shadow-lg flex flex-col items-center text-center transition-all duration-300 hover:shadow-2xl hover:shadow-purple-900/20 hover:-translate-y-2 group">
              <div className="w-24 h-24 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-all duration-300">
                <FolderOpen className="text-purple-400 w-12 h-12" />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Step 3: Load Unpacked
              </h3>
              <p className="text-slate-300 text-lg leading-tight">
                Click the <strong className="text-slate-100 font-semibold">Load unpacked</strong> button in the top-left, select your extracted <code className="bg-slate-900/50 px-2 py-1 rounded-md text-base text-slate-300 border border-slate-700 font-mono">trustlens-extension</code> folder, and confirm.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-20 flex justify-center pb-20">
           <a href="/" className="inline-flex items-center gap-3 px-10 py-5 bg-slate-900 hover:bg-slate-800 text-white text-xl font-bold rounded-2xl shadow-xl shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1">
             Go to Dashboard <ArrowRight className="w-6 h-6" />
           </a>
        </div>
      </div>
    </div>
  );
};

export default Setup;
