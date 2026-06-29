import React, { useEffect, useState } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

const History = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    try {
      const historyStr = localStorage.getItem('trustlens_history');
      if (historyStr) {
        setHistory(JSON.parse(historyStr));
      }
    } catch (e) {
      console.error('Failed to load history', e);
    }
  }, []);

  const getStatusIcon = (classification) => {
    if (classification === 'Scam' || classification === 'High Risk') return <ShieldAlert size={16} className="text-red-500" />;
    if (classification === 'Warning') return <AlertTriangle size={16} className="text-amber-500" />;
    return <CheckCircle size={16} className="text-emerald-500" />;
  };

  const getScoreColor = (score) => {
    if (score > 70) return 'text-red-600 bg-red-50';
    if (score > 30) return 'text-amber-600 bg-amber-50';
    return 'text-emerald-600 bg-emerald-50';
  };

  return (
    <div className="w-full pb-24 flex flex-col gap-8">
      <div className="max-w-5xl mx-auto px-8 pt-16 w-full">
        <div className="mb-10 text-center">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold text-teal-600 bg-teal-50 border border-teal-100 rounded-full tracking-wider uppercase">
            Activity Log
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Scan History</h1>
          <p className="text-slate-600">Review your most recent automated and manual threat analyses.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {history.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    <th className="p-4 pl-6">Target</th>
                    <th className="p-4">Classification</th>
                    <th className="p-4 text-center">Risk Score</th>
                    <th className="p-4 pr-6 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {history.map((scan) => (
                    <tr key={scan.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-medium text-slate-900 truncate max-w-[250px]">
                        {scan.target}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 font-medium">
                          {getStatusIcon(scan.classification)}
                          <span className="text-slate-700">{scan.classification}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-md font-bold font-mono text-xs ${getScoreColor(scan.risk_score)}`}>
                          {scan.risk_score}/100
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right text-slate-500 flex justify-end items-center gap-1.5">
                        <Clock size={14} className="opacity-70" />
                        {scan.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                <ShieldAlert size={20} className="text-slate-400" />
              </div>
              <p className="font-medium text-slate-700">No scans recorded yet</p>
              <p className="text-sm">Use the Live Scanner to test pages or text, and they will appear here.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default History;
