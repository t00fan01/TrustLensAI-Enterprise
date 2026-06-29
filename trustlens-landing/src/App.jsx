import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavigationBar from './components/NavigationBar';
import Home from './components/Home';
import Setup from './components/Setup';
import Features from './components/Features';
import History from './components/History';
import Contact from './components/Contact';
import InstallationSimulation from './components/InstallationSimulation';

function App() {
  return (
    <Router>
      <div className="bg-white min-h-screen text-slate-900 font-sans selection:bg-teal-500/30">
        <NavigationBar />
        
        <main className="relative flex flex-col pt-24 pb-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/features" element={<Features />} />
            <Route path="/history" element={<History />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        
        <footer className="border-t border-gray-100 py-8 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} TrustLens AI. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
