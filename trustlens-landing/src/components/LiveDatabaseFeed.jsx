import React, { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Server, ChevronDown, ChevronUp } from 'lucide-react';

export default function LiveDatabaseFeed() {
  const [transactions, setTransactions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch('https://trustlens-manual-api.onrender.com/api/transactions');
        if (res.ok) {
          const data = await res.json();
          setTransactions(data);
          setError(null);
        } else {
          setError("Waking up secure server... this may take 30 seconds");
        }
      } catch (err) {
        console.error("Failed to fetch transactions", err);
        setError("Waking up secure server... this may take 30 seconds");
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 2000);
    return () => clearInterval(interval);
  }, []);

  const toggleExpand = (id) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  return (
    <div className="w-full mt-12 mb-12">
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="p-5 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
          <Server className="text-emerald-400 w-6 h-6 animate-pulse" />
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            Live Database Guardian 
            <span className="text-xs font-normal px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full">Active</span>
          </h2>
        </div>
        
        <div className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                <Activity className="w-8 h-8 mb-3 animate-pulse text-slate-600" />
                <p>{error ? error : "Waiting for live transaction feed..."}</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Tx ID</th>
                    <th className="px-6 py-4">Account</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {transactions.map((tx) => {
                    const isAnomaly = tx.is_flagged === 1;
                    const isExpanded = expandedId === tx.id;
                    
                    return (
                      <React.Fragment key={tx.id}>
                        <tr 
                          onClick={() => isAnomaly && toggleExpand(tx.id)}
                          className={`group transition-all duration-300 ${
                            isAnomaly 
                              ? 'bg-red-950/30 hover:bg-red-900/40 cursor-pointer' 
                              : 'hover:bg-slate-800/30 text-slate-400'
                          }`}
                        >
                          <td className="px-6 py-4">
                            {isAnomaly ? (
                              <div className="flex items-center gap-2 text-red-400 font-bold">
                                <ShieldAlert className="w-5 h-5 animate-pulse" />
                                <span>CRITICAL</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 text-emerald-500/70">
                                <Activity className="w-4 h-4" />
                                <span>OK</span>
                              </div>
                            )}
                          </td>
                          <td className={`px-6 py-4 font-mono text-sm ${isAnomaly ? 'text-red-300' : 'text-slate-500'}`}>
                            #{tx.id}
                          </td>
                          <td className={`px-6 py-4 font-mono text-sm ${isAnomaly ? 'text-red-200 font-bold' : ''}`}>
                            {tx.account_id}
                          </td>
                          <td className={`px-6 py-4 font-mono ${isAnomaly ? 'text-red-400 font-bold text-lg' : ''}`}>
                            ${tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </td>
                          <td className={`px-6 py-4 text-right text-sm ${isAnomaly ? 'text-red-400/80' : 'text-slate-500'}`}>
                            {new Date(tx.timestamp).toLocaleTimeString()}
                            {isAnomaly && (
                              <div className="inline-block ml-3 text-red-400">
                                {isExpanded ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />}
                              </div>
                            )}
                          </td>
                        </tr>
                        
                        {isAnomaly && isExpanded && tx.ai_analysis && (
                          <tr className="bg-red-950/20 border-b border-red-900/50">
                            <td colSpan="5" className="px-6 py-4">
                              <div className="bg-slate-950 rounded-lg p-5 border border-red-900/50 shadow-inner">
                                <h4 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                                  <ShieldAlert className="w-4 h-4" /> 
                                  Groq AI Guardian Mitigation Report
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="bg-red-900/10 p-3 rounded-md border border-red-900/30">
                                    <span className="block text-xs text-red-500/70 uppercase font-bold mb-1">Threat Level</span>
                                    <span className="text-red-300 font-mono text-lg">{tx.ai_analysis.threat_level || 'UNKNOWN'}</span>
                                  </div>
                                  <div className="bg-red-900/10 p-3 rounded-md border border-red-900/30">
                                    <span className="block text-xs text-red-500/70 uppercase font-bold mb-1">Action Recommended</span>
                                    <span className="text-red-300 font-mono text-lg">{tx.ai_analysis.action_recommended || 'MANUAL REVIEW'}</span>
                                  </div>
                                  <div className="bg-red-900/10 p-4 rounded-md border border-red-900/30 md:col-span-2">
                                    <span className="block text-xs text-red-500/70 uppercase font-bold mb-1">AI Reasoning</span>
                                    <span className="text-red-200">{tx.ai_analysis.reasoning || 'No additional details provided by AI.'}</span>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
