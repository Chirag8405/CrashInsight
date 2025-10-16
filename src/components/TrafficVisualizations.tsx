import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface Hotspot {
  hotspot_id: number;
  area_name: string;
  center_lat: number;
  center_lng: number;
  location_description: string;
  accident_count: number;
  avg_severity: number;
  severity_description: string;
  radius_km: number;
  risk_level: string;
}

interface CausalPattern {
  rule_id: number;
  conditions: string[];
  result: string[];
  support: number;
  confidence: number;
  lift: number;
  interpretation: string;
  strength: 'Strong' | 'Moderate' | 'Weak';
}

interface TrafficVisualizationsProps {
  hotspots: Hotspot[];
  patterns: CausalPattern[];
}

const TrafficVisualizations: React.FC<TrafficVisualizationsProps> = ({ hotspots, patterns }) => {
  
  // 1. Bar Chart Data - Accidents by Zone
  const zoneBarData = {
    labels: hotspots.map(h => h.area_name.split(' ').slice(0, 2).join(' ')), // Shortened labels
    datasets: [
      {
        label: 'Total Accidents',
        data: hotspots.map(h => h.accident_count),
        backgroundColor: hotspots.map(h => {
          const severity = h.avg_severity;
          if (severity > 2.5) return 'rgba(239, 68, 68, 0.8)'; // Red
          if (severity > 1.5) return 'rgba(249, 115, 22, 0.8)'; // Orange
          return 'rgba(234, 179, 8, 0.8)'; // Yellow
        }),
        borderColor: hotspots.map(h => {
          const severity = h.avg_severity;
          if (severity > 2.5) return 'rgb(220, 38, 38)';
          if (severity > 1.5) return 'rgb(234, 88, 12)';
          return 'rgb(202, 138, 4)';
        }),
        borderWidth: 2,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Accidents by Geographic Zone',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const hotspot = hotspots[context.dataIndex];
            return [
              `Accidents: ${value.toLocaleString()}`,
              `Risk: ${hotspot.risk_level}`,
              `Severity: ${hotspot.severity_description}`
            ];
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return value.toLocaleString();
          }
        },
        title: {
          display: true,
          text: 'Number of Accidents',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Danger Zones',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        }
      }
    },
  };

  // 2. Pie Chart Data - Risk Level Distribution
  const riskCounts = hotspots.reduce((acc, h) => {
    const level = h.avg_severity > 2.5 ? 'Critical' : h.avg_severity > 1.5 ? 'High Risk' : 'Moderate';
    acc[level] = (acc[level] || 0) + h.accident_count;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(riskCounts),
    datasets: [
      {
        label: 'Accidents by Risk Level',
        data: Object.values(riskCounts),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Red - Critical
          'rgba(249, 115, 22, 0.8)',  // Orange - High
          'rgba(234, 179, 8, 0.8)',   // Yellow - Moderate
        ],
        borderColor: [
          'rgb(220, 38, 38)',
          'rgb(234, 88, 12)',
          'rgb(202, 138, 4)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: 'Risk Level Distribution',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  // 3. Doughnut Chart - Severity Distribution
  const severityCounts = hotspots.reduce((acc, h) => {
    acc[h.severity_description] = (acc[h.severity_description] || 0) + h.accident_count;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: Object.keys(severityCounts),
    datasets: [
      {
        label: 'Accidents',
        data: Object.values(severityCounts),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green
          'rgba(234, 179, 8, 0.8)',   // Yellow
          'rgba(249, 115, 22, 0.8)',  // Orange
          'rgba(239, 68, 68, 0.8)',   // Red
        ],
        borderColor: [
          'rgb(22, 163, 74)',
          'rgb(202, 138, 4)',
          'rgb(234, 88, 12)',
          'rgb(220, 38, 38)',
        ],
        borderWidth: 2,
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          font: {
            size: 12,
          }
        }
      },
      title: {
        display: true,
        text: 'Crash Severity Breakdown',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
  };

  // 4. Horizontal Bar Chart - Contributing Factors
  const factorCounts = patterns.reduce((acc, p) => {
    p.conditions.forEach(condition => {
      // Extract readable factor name
      let factor = condition.replace('CAUSE_', '').replace(/_/g, ' ');
      if (factor.includes('Weather')) factor = factor.split(' ')[1] + ' Weather';
      else if (factor.includes('Rush')) factor = factor.replace('Rush', 'Rush Hour');
      else if (factor.includes('Dark')) factor = 'Poor Lighting';
      
      acc[factor] = (acc[factor] || 0) + (p.confidence * 100);
    });
    return acc;
  }, {} as Record<string, number>);

  const topFactors = Object.entries(factorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const horizontalBarData = {
    labels: topFactors.map(([factor]) => factor),
    datasets: [
      {
        label: 'Impact Score (%)',
        data: topFactors.map(([, score]) => score),
        backgroundColor: 'rgba(99, 102, 241, 0.8)',
        borderColor: 'rgb(79, 70, 229)',
        borderWidth: 2,
      },
    ],
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Top Contributing Factors',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        color: '#1f2937',
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Impact: ${context.parsed.x.toFixed(1)}%`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Contribution to Accidents (%)',
          font: {
            size: 14,
            weight: 'bold' as const,
          }
        }
      }
    },
  };

  return (
    <div className="space-y-8">
      {/* Professional Section Header */}
      <div className="professional-card rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-8 py-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20 flex-shrink-0">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2 text-white">
                Data Visualizations & Insights
              </h2>
              <p className="text-slate-300 text-base leading-relaxed">
                Interactive charts revealing accident patterns and risk distribution across Baltimore
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart - Main Analysis */}
        <div className="lg:col-span-2 professional-card rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Zone Comparison Analysis</h3>
                <p className="text-sm text-slate-600">Total accidents by geographic zone</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-96 bg-slate-50 rounded border border-slate-200 p-4">
              <Bar data={zoneBarData} options={barOptions} />
            </div>
            <div className="mt-5 p-4 bg-blue-50 rounded border-l-4 border-blue-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-1">Analysis Overview</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    This chart displays the total number of accidents across each geographic danger zone. 
                    Bar colors represent risk severity: <span className="font-medium text-red-600">Red (Critical)</span>, 
                    <span className="font-medium text-orange-600"> Orange (High)</span>, 
                    <span className="font-medium text-yellow-600"> Yellow (Moderate)</span>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="professional-card rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-600 p-2 rounded flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Risk Distribution</h3>
                <p className="text-sm text-slate-600">Proportional accident allocation</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80 bg-slate-50 rounded border border-slate-200 p-4">
              <Pie data={pieData} options={pieOptions} />
            </div>
            <div className="mt-5 p-4 bg-purple-50 rounded border-l-4 border-purple-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-1">Key Insight</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Proportional distribution of accidents across risk categories, enabling strategic resource allocation and priority planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="professional-card rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Severity Breakdown</h3>
                <p className="text-sm text-slate-600">Incident classification by severity</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80 bg-slate-50 rounded border border-slate-200 p-4">
              <Doughnut data={doughnutData} options={doughnutOptions} />
            </div>
            <div className="mt-5 p-4 bg-emerald-50 rounded border-l-4 border-emerald-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-1">Key Insight</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    Comprehensive breakdown of crash severity levels, ranging from minor property damage to severe and fatal incidents.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="lg:col-span-2 professional-card rounded-lg shadow-sm border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Contributing Factors Analysis</h3>
                <p className="text-sm text-slate-600">Primary accident causation factors</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="h-80 bg-slate-50 rounded border border-slate-200 p-4">
              <Bar data={horizontalBarData} options={horizontalBarOptions} />
            </div>
            <div className="mt-5 p-4 bg-indigo-50 rounded border-l-4 border-indigo-600">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-medium text-slate-900 text-sm mb-1">Critical Finding</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    This chart ranks the most significant factors contributing to accidents based on association rule analysis. 
                    Higher confidence scores indicate stronger correlation with accident occurrence and severity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficVisualizations;