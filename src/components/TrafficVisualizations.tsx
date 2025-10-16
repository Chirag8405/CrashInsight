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
      {/* Section Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <span className="text-4xl">📊</span>
          Data Visualizations & Insights
        </h2>
        <p className="text-indigo-100">Interactive charts showing accident patterns and risk distribution</p>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar Chart - Main Analysis */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border-2 border-blue-100">
          <div className="h-96">
            <Bar data={zoneBarData} options={barOptions} />
          </div>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-700">
              <strong className="text-blue-700">Analysis:</strong> This chart shows the total number of accidents in each geographic danger zone. 
              Bar colors indicate risk levels: <span className="text-red-600 font-semibold">Red (Critical)</span>, 
              <span className="text-orange-600 font-semibold"> Orange (High)</span>, 
              <span className="text-yellow-600 font-semibold"> Yellow (Moderate)</span>.
            </p>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <div className="h-80">
            <Pie data={pieData} options={pieOptions} />
          </div>
          <div className="mt-4 p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-700">
              <strong className="text-purple-700">Insight:</strong> Shows the proportion of accidents across different risk categories, 
              helping prioritize resource allocation.
            </p>
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-green-100">
          <div className="h-80">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
          <div className="mt-4 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-700">
              <strong className="text-green-700">Insight:</strong> Breakdown of crash severity levels, showing the distribution 
              from minor incidents to severe/fatal accidents.
            </p>
          </div>
        </div>

        {/* Horizontal Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6 border-2 border-indigo-100">
          <div className="h-80">
            <Bar data={horizontalBarData} options={horizontalBarOptions} />
          </div>
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-500">
            <p className="text-sm text-gray-700">
              <strong className="text-indigo-700">Key Finding:</strong> This chart ranks the most significant factors contributing to accidents, 
              based on association rule analysis. Higher scores indicate stronger correlation with accident occurrence.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrafficVisualizations;
