import { useState, useEffect } from 'react';
import IntegratedAnalysis from './components/IntegratedAnalysis';
import './App.css';

interface ProblemSolution {
  problem_statement: {
    primary_question: string;
    sub_problems: string[];
  };
  algorithmic_solution: {
    approach: string;
    phase_1: {
      algorithm: string;
      purpose: string;
      input: string;
      output: string;
    };
    phase_2: {
      algorithm: string;
      purpose: string;
      input: string;
      output: string;
    };
  };
  expected_insights: string[];
  data_summary: {
    total_accidents: number;
    date_range: {
      start: string | null;
      end: string | null;
    };
  };
}

function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis'>('overview');
  const [problemSolution, setProblemSolution] = useState<ProblemSolution | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProblemSolution();
  }, []);

  const fetchProblemSolution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/problem-solution-summary');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch problem-solution summary');
      }
      
      setProblemSolution(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const renderOverview = () => {
    if (loading) {
      return (
        <div className="glass-card rounded-2xl shadow-2xl p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
            <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="glass-card rounded-2xl shadow-2xl p-8">
          <div className="text-center py-12">
            <div className="text-red-500 text-7xl mb-6">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Data Load Failed</h3>
            <p className="text-gray-600 mb-6 text-lg">{error}</p>
            <button
              onClick={fetchProblemSolution}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Retry Loading
            </button>
          </div>
        </div>
      );
    }

    if (!problemSolution) {
      return <div className="glass-card rounded-2xl shadow-2xl p-8 text-center text-gray-500 text-lg">No data available</div>;
    }

    return (
      <div className="space-y-8">
        {/* Problem Definition */}
        <div className="glass-card rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-3 rounded-xl mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Problem Definition</h2>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200 shadow-inner">
            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              {problemSolution.problem_statement.primary_question}
            </h3>
            <ul className="space-y-3">
              {problemSolution.problem_statement.sub_problems.map((problem, index) => (
                <li key={index} className="text-blue-800 flex items-start text-lg">
                  <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 text-sm font-bold flex-shrink-0">{index + 1}</span>
                  <span className="font-medium">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Algorithmic Solution */}
        <div className="glass-card rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-purple-500 to-purple-700 p-3 rounded-xl mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Algorithmic Solution</h2>
          </div>
          <p className="text-xl text-gray-700 mb-8 font-medium leading-relaxed bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-xl border-l-4 border-purple-500">
            {problemSolution.algorithmic_solution.approach}
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Phase 1: K-Means */}
            <div className="border-2 border-blue-200 rounded-2xl p-6 bg-gradient-to-br from-blue-50 via-blue-100 to-cyan-50 hover:shadow-xl transition-all hover:scale-105 transform">
              <div className="flex items-center mb-4">
                <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-3">1</div>
                <h3 className="text-xl font-bold text-blue-900">
                  {problemSolution.algorithmic_solution.phase_1.algorithm}
                </h3>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-blue-800 block mb-1">Purpose:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_1.purpose}</span>
                </div>
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-blue-800 block mb-1">Input:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_1.input}</span>
                </div>
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-blue-800 block mb-1">Output:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_1.output}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analysis')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
              >
                View Analysis Results →
              </button>
            </div>

            {/* Phase 2: Apriori */}
            <div className="border-2 border-purple-200 rounded-2xl p-6 bg-gradient-to-br from-purple-50 via-purple-100 to-pink-50 hover:shadow-xl transition-all hover:scale-105 transform">
              <div className="flex items-center mb-4">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg mr-3">2</div>
                <h3 className="text-xl font-bold text-purple-900">
                  {problemSolution.algorithmic_solution.phase_2.algorithm}
                </h3>
              </div>
              <div className="space-y-4 mb-6">
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-purple-800 block mb-1">Purpose:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_2.purpose}</span>
                </div>
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-purple-800 block mb-1">Input:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_2.input}</span>
                </div>
                <div className="bg-white/80 p-4 rounded-lg shadow-sm">
                  <span className="font-bold text-purple-800 block mb-1">Output:</span> 
                  <span className="text-gray-700">{problemSolution.algorithmic_solution.phase_2.output}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analysis')}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition-all shadow-lg hover:shadow-xl"
              >
                View Analysis Results →
              </button>
            </div>
          </div>
        </div>

        {/* Expected Insights */}
        <div className="glass-card rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-3 rounded-xl mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Expected Insights</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {problemSolution.expected_insights.map((insight, index) => (
              <div key={index} className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border-l-4 border-emerald-500 shadow-lg hover:shadow-xl transition-all hover:scale-105 transform">
                <div className="flex items-start">
                  <div className="bg-emerald-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">{index + 1}</div>
                  <div className="text-emerald-900 font-semibold text-base leading-relaxed">{insight}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="glass-card rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all">
          <div className="flex items-center mb-6">
            <div className="bg-gradient-to-br from-amber-500 to-amber-700 p-3 rounded-xl mr-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Dataset Overview</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center border-2 border-blue-200 hover:shadow-xl transition-all hover:scale-105 transform">
              <div className="text-5xl font-black text-blue-600 mb-2">
                {problemSolution.data_summary.total_accidents.toLocaleString()}
              </div>
              <div className="text-gray-700 font-bold uppercase tracking-wide text-sm">Total Accidents</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border-2 border-green-200 hover:shadow-xl transition-all hover:scale-105 transform">
              <div className="text-2xl font-bold text-green-700 mb-2">
                {formatDate(problemSolution.data_summary.date_range.start)}
              </div>
              <div className="text-gray-700 font-bold uppercase tracking-wide text-sm">Data Start</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl text-center border-2 border-purple-200 hover:shadow-xl transition-all hover:scale-105 transform">
              <div className="text-2xl font-bold text-purple-700 mb-2">
                {formatDate(problemSolution.data_summary.date_range.end)}
              </div>
              <div className="text-gray-700 font-bold uppercase tracking-wide text-sm">Data End</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Professional Header with Branding */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4">
              {/* Logo/Icon */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-3 rounded-xl shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                  CrashInsight Analytics
                </h1>
                <p className="text-sm text-gray-600 font-medium">Advanced Traffic Safety Intelligence Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700">System Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Navigation Tabs */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-1">
            {[
              { id: 'overview', icon: '🎯', label: 'Problem & Solution', desc: 'Project Overview' },
              { id: 'analysis', icon: '📊', label: 'Analysis Dashboard', desc: 'Geographic & Causal Insights' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-6 py-4 font-semibold text-sm transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{tab.icon}</span>
                  <div className="text-left">
                    <div className="font-bold">{tab.label}</div>
                    <div className="text-xs opacity-75 font-normal">{tab.desc}</div>
                  </div>
                </div>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analysis' && <IntegratedAnalysis />}
      </main>

      {/* Professional Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-3 gap-8 mb-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Problem Statement</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                WHERE do traffic accidents happen and WHY do they occur?
              </p>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Algorithmic Solution</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                K-Means Clustering + Apriori Association Rules
              </p>
            </div>
            <div className="text-center md:text-right">
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Data Coverage</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                209,000+ Traffic Accidents Analyzed
              </p>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-gray-500 text-xs">
              © 2024 CrashInsight Analytics • Advanced Data Mining & Business Intelligence Platform
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
