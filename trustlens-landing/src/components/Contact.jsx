import React, { useState } from 'react';

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-8 py-24">
      <h1 className="text-4xl font-bold text-slate-900 mb-6 text-center">Contact Support</h1>
      <p className="text-slate-600 mb-10 text-center">We're here to help you secure your browsing.</p>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input type="text" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
          <input type="email" required className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
          <textarea required rows="4" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/50"></textarea>
        </div>
        <button type="submit" className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors">
          {sent ? 'Message Sent! ✅' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};

export default Contact;
