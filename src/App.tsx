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
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-500 text-6xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Data Load Failed</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchProblemSolution}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    if (!problemSolution) {
      return <div className="bg-white rounded-lg shadow-lg p-6 text-center text-gray-500">No data available</div>;
    }

    return (
      <div className="space-y-6">
        {/* Problem Definition */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎯 Problem Definition</h2>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 mb-4">
            <h3 className="text-xl font-semibold text-blue-800 mb-2">
              {problemSolution.problem_statement.primary_question}
            </h3>
            <ul className="space-y-2">
              {problemSolution.problem_statement.sub_problems.map((problem, index) => (
                <li key={index} className="text-blue-700 flex items-start">
                  <span className="text-blue-500 mr-2">•</span>
                  {problem}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Algorithmic Solution */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🧠 Algorithmic Solution</h2>
          <p className="text-lg text-gray-700 mb-6 font-medium">
            {problemSolution.algorithmic_solution.approach}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Phase 1: K-Means */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                Phase 1: {problemSolution.algorithmic_solution.phase_1.algorithm}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Purpose:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_1.purpose}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Input:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_1.input}</span>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Output:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_1.output}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analysis')}
                className="mt-3 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                View Analysis →
              </button>
            </div>

            {/* Phase 2: Apriori */}
            <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-purple-100">
              <h3 className="text-lg font-semibold text-purple-800 mb-3">
                Phase 2: {problemSolution.algorithmic_solution.phase_2.algorithm}
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-purple-700">Purpose:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_2.purpose}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Input:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_2.input}</span>
                </div>
                <div>
                  <span className="font-medium text-purple-700">Output:</span> 
                  <span className="text-gray-700 ml-2">{problemSolution.algorithmic_solution.phase_2.output}</span>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analysis')}
                className="mt-3 bg-purple-500 text-white px-4 py-2 rounded text-sm hover:bg-purple-600 transition-colors"
              >
                View Analysis →
              </button>
            </div>
          </div>
        </div>

        {/* Expected Insights */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">💡 Expected Insights</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {problemSolution.expected_insights.map((insight, index) => (
              <div key={index} className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <div className="text-green-800 font-medium">{insight}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Dataset Overview</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-600">
                {problemSolution.data_summary.total_accidents.toLocaleString()}
              </div>
              <div className="text-gray-600">Total Accidents</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-medium text-green-600">
                {formatDate(problemSolution.data_summary.date_range.start)}
              </div>
              <div className="text-gray-600">Data Start</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg text-center">
              <div className="text-lg font-medium text-green-600">
                {formatDate(problemSolution.data_summary.date_range.end)}
              </div>
              <div className="text-gray-600">Data End</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Traffic Accident Analysis
              </h1>
              <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                Core Solution
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: '🎯 Problem & Solution', desc: 'Overview' },
              { id: 'analysis', label: '� Analysis Results', desc: 'Combined WHERE & WHY' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>{tab.label}</div>
                <div className="text-xs opacity-75">{tab.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'analysis' && <IntegratedAnalysis />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              <strong>Problem:</strong> WHERE do traffic accidents happen and WHY do they occur?
            </p>
            <p>
              <strong>Solution:</strong> K-Means Clustering (location patterns) + Apriori Association Rules (causal patterns)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;