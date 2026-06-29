import React, { useState } from 'react';
import { Search, AlertTriangle, CheckCircle, ShieldAlert, Loader2 } from 'lucide-react';

const LiveScanner = () => {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url && !content) {
      setError('Please provide either a URL or Message Content to analyze.');
      return;
    }

    setIsScanning(true);
    setError(null);
    setResult(null);

    try {
      // Connect to manual scan endpoint
      const apiUrl = 'https://trustlens-manual-api.onrender.com/analyze';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url || "",
          text_content: content || ""
        }),
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

      try {
        const historyStr = localStorage.getItem('trustlens_history');
        let history = historyStr ? JSON.parse(historyStr) : [];
        const newEntry = {
          id: Date.now(),
          target: url || 'Text Content Scan',
          risk_score: data.risk_score,
          classification: data.classification,
          timestamp: new Date().toLocaleString()
        };
        history.unshift(newEntry);
        if (history.length > 5) history = history.slice(0, 5);
        localStorage.setItem('trustlens_history', JSON.stringify(history));
      } catch (e) {
        console.error('Failed to save history', e);
      }
    } catch (err) {
      setError('Connection failed. Service may be starting up, try again in 30s.');
      console.error(err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6 md:p-8 flex flex-col h-full w-full">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Search size={20} className="text-teal-600" />
          Live Threat Scanner
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Test the TrustLens AI intent engine in real-time.
        </p>
      </div>

      <form onSubmit={handleScan} className="space-y-5 flex-grow flex flex-col">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Target URL <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="url"
            placeholder="e.g., http://free-money.xyz"
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex-grow flex flex-col">
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Message Content
          </label>
          <textarea
            placeholder="Paste the text message, email, or webpage content here..."
            className="w-full flex-grow bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors resize-none min-h-[120px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isScanning}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {isScanning ? (
            <><Loader2 size={18} className="animate-spin" /> Analyzing Context...</>
          ) : (
            <>Analyze</>
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Analysis Results</h4>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-slate-500 text-xs font-semibold mb-1 uppercase tracking-wide">Risk Score</div>
              <div className="text-2xl font-bold font-mono">
                <span className={result.risk_score > 70 ? "text-red-600" : result.risk_score > 30 ? "text-amber-500" : "text-emerald-600"}>
                  {result.risk_score}
                </span>
                <span className="text-slate-400 text-sm">/100</span>
              </div>
            </div>
            
            <div className={`rounded-xl p-4 border flex flex-col justify-center ${
              result.classification === "Scam" || result.classification === "High Risk" 
                ? "bg-red-50 border-red-200 text-red-700" 
                : result.classification === "Warning"
                ? "bg-amber-50 border-amber-200 text-amber-700"
                : "bg-emerald-50 border-emerald-200 text-emerald-700"
            }`}>
              <div className="text-xs font-semibold opacity-80 mb-1 uppercase tracking-wide">Classification</div>
              <div className="text-lg font-bold flex items-center gap-2">
                {result.classification === "Scam" || result.classification === "High Risk" ? (
                  <><ShieldAlert size={18} /> {result.classification}</>
                ) : result.classification === "Warning" ? (
                  <><AlertTriangle size={18} /> {result.classification}</>
                ) : (
                  <><CheckCircle size={18} /> {result.classification}</>
                )}
              </div>
            </div>
          </div>
          <div>
            <div className="text-slate-700 text-sm font-semibold mb-2">AI Reasoning</div>
            <ul className="space-y-2">
              {result.reasons.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0"></div>
                  <p>{reason}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveScanner;