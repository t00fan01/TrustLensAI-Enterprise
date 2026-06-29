import React, { useState } from 'react';
import HeroSection from './HeroSection';
import LiveScanner from './LiveScanner';
import InstallationSimulation from './InstallationSimulation';
import LiveDatabaseFeed from './LiveDatabaseFeed';

const Home = () => {
  const [showInstall, setShowInstall] = useState(false);

  return (
    <div className="w-full">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-6 pb-24">
        <HeroSection onInstallClick={() => setShowInstall(true)} />
      </section>
      <section className="max-w-7xl mx-auto px-6 lg:px-12">
        <LiveScanner />
      </section>
      <section className="max-w-6xl mx-auto px-4 mt-24">
        <LiveDatabaseFeed />
      </section>
      
      {showInstall && (
        <div id="installation-steps" className="w-full border-t border-gray-100 bg-slate-50/50 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <InstallationSimulation />
        </div>
      )}
    </div>
  );
};

export default Home;
