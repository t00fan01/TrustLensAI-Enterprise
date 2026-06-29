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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <HeroSection onInstallClick={() => setShowInstall(true)} />
          <div id="scanner" className="w-full max-w-2xl mx-auto lg:max-w-none scroll-mt-24 flex flex-col gap-8">
            <LiveScanner />
            <LiveDatabaseFeed />
          </div>
        </div>
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
