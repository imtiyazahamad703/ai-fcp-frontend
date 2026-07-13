import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ArrowRight, Zap, Shield } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const LandingPage: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="h-screen max-h-screen flex flex-col bg-zinc-950 text-white relative overflow-hidden font-sans">
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen"
        style={{ backgroundImage: 'url(/images/fcp_hero_bg.png)' }}
      />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 z-0 bg-black/40 pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-zinc-950/80 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 py-6 md:px-12 flex justify-between items-center w-full max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <img 
            src="/logos/fcp_logo.png" 
            alt="FCP Logo" 
            className="w-14 h-14 md:w-16 md:h-16 rounded-full object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.6)] mix-blend-screen" 
          />
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-bold tracking-wider text-white leading-tight">FCP</span>
            <span className="hidden sm:block text-zinc-400 font-medium text-xs tracking-wide">Full-Stack Coding Platform</span>
          </div>
        </div>
        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <Link 
              to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
              className="px-6 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md flex items-center"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-white text-zinc-400 transition-colors">
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 hover:bg-blue-600/30 transition-all text-sm font-semibold shadow-[0_0_20px_rgba(59,130,246,0.15)] backdrop-blur-md"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-between p-4 pb-8 text-center max-w-5xl mx-auto w-full">
        
        {/* Top Content Group shifted up */}
        <div className="flex-1 flex flex-col justify-center items-center -mt-8 md:-mt-16">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]">
            Master Real-World <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 drop-shadow-sm">
              Full-Stack Engineering
            </span>
          </h1>
          
          <p className="text-base md:text-lg text-zinc-300 mb-10 max-w-3xl mx-auto leading-relaxed font-light px-4">
            Experience the world's most advanced in-browser IDE. Build React frontends with Sandpack, execute code securely via sandboxed Node VMs, with AI-powered challenge generation exclusive to admins.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            {isAuthenticated ? (
              <Link 
                to={user?.role === 'admin' ? '/admin' : '/dashboard'} 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center hover:scale-105 active:scale-95"
              >
                Resume Coding
                <Code2 className="w-5 h-5 ml-2" />
              </Link>
            ) : (
              <Link 
                to="/register" 
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center hover:scale-105 active:scale-95"
              >
                Start Coding for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            )}
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full max-w-4xl opacity-90 px-4 mx-auto shrink-0">
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <Code2 className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">VS Code In Browser</h3>
            <p className="text-sm text-zinc-400">Powered by the Monaco Editor engine for real-time syntax highlighting.</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <Zap className="w-8 h-8 text-indigo-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Live React Bundling</h3>
            <p className="text-sm text-zinc-400">Write React components and see them render instantly via in-browser bundling.</p>
          </div>
          <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 p-6 rounded-2xl">
            <Shield className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-1">Secure Execution</h3>
            <p className="text-sm text-zinc-400">Execute backend algorithms securely with infinite-loop protected V8 sandboxing.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
