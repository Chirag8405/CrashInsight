import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  ChartBarIcon, 
  CpuChipIcon,
  DocumentChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import AssociationRules from './AssociationRules';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
);

interface BasicStats {
  total_accidents: number;
  fatal_accidents: number;
  injury_accidents: number;
  property_damage_only: number;
  avg_injuries_per_accident: number;
  most_common_crash_type: string;
  most_common_weather: string;
  most_common_lighting: string;
}

interface TimeAnalysis {
  hourly_distribution: { hour: number; accidents: number }[];
  daily_distribution: { day: string; accidents: number }[];
  monthly_distribution: { month: string; accidents: number }[];
}

interface SeverityAnalysis {
  severity_distribution: { severity: string; count: number }[];
  severity_by_weather: Record<string, Record<string, number>>;
  severity_by_lighting: Record<string, Record<string, number>>;
}

interface LocationAnalysis {
  traffic_control_distribution: { type: string; count: number }[];
  road_surface_distribution: { condition: string; count: number }[];
  trafficway_distribution: { type: string; count: number }[];
}

interface MLModel {
  accuracy: number;
  feature_importance: Record<string, number>;
  model_performance: any;
}

interface ClusterAnalysis {
  n_clusters: number;
  cluster_analysis: Record<string, any>;
  cluster_centers: number[][];
}

const API_BASE_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingML, setLoadingML] = useState(false);
  const [loadingClustering, setLoadingClustering] = useState(false);
  const [basicStats, setBasicStats] = useState<BasicStats | null>(null);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis | null>(null);
  const [severityAnalysis, setSeverityAnalysis] = useState<SeverityAnalysis | null>(null);
  const [locationAnalysis, setLocationAnalysis] = useState<LocationAnalysis | null>(null);
  const [mlModel, setMLModel] = useState<MLModel | null>(null);
  const [clusterAnalysis, setClusterAnalysis] = useState<ClusterAnalysis | null>(null);
  const [apiStatus, setApiStatus] = useState('disconnected');

  const tabs = [
    { id: 'analytics', name: 'Analytics', shortName: 'Analytics', icon: ChartBarIcon },
    { id: 'models', name: 'ML Models', shortName: 'Models', icon: CpuChipIcon },
    { id: 'clustering', name: 'Clustering', shortName: 'Clusters', icon: AcademicCapIcon },
    { id: 'association', name: 'Association Rules', shortName: 'Rules', icon: MapPinIcon },
    { id: 'reports', name: 'Reports', shortName: 'Reports', icon: DocumentChartBarIcon },
  ];

  useEffect(() => {
    checkAPIStatus();
    if (activeTab === 'analytics') {
      loadAnalyticsData();
    } else if (activeTab === 'models') {
      loadMLData();
    } else if (activeTab === 'clustering') {
      loadClusteringData();
    }
  }, [activeTab]);

  const checkAPIStatus = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      setApiStatus(response.data.status);
    } catch (error) {
      setApiStatus('disconnected');
      console.error('API connection failed:', error);
    }
  };

  const loadAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const [statsRes, timeRes, severityRes, locationRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/stats`),
        axios.get(`${API_BASE_URL}/time-analysis`),
        axios.get(`${API_BASE_URL}/severity-analysis`),
        axios.get(`${API_BASE_URL}/location-analysis`)
      ]);
      
      setBasicStats(statsRes.data);
      setTimeAnalysis(timeRes.data);
      setSeverityAnalysis(severityRes.data);
      setLocationAnalysis(locationRes.data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    }
    setLoadingAnalytics(false);
  };  const loadMLData = async () => {
    setLoadingML(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/ml-model`);
      setMLModel(response.data);
    } catch (error) {
      console.error('Failed to load ML data:', error);
    }
    setLoadingML(false);
  };

  const loadClusteringData = async () => {
    setLoadingClustering(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/clustering?clusters=5`);
      setClusterAnalysis(response.data);
    } catch (error) {
      console.error('Failed to load clustering data:', error);
    }
    setLoadingClustering(false);
  };

  const renderAnalytics = () => {
    if (!basicStats || !timeAnalysis || !severityAnalysis || !locationAnalysis) {
      return null; // Loading is handled at component level
    }

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Common chart colors for dark/light mode
    const textColor = isDarkMode ? '#e2e8f0' : '#334155'; // slate-200 / slate-700
    const gridColor = isDarkMode ? '#475569' : '#cbd5e1'; // slate-600 / slate-300

    // Common chart options
    const commonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor,
            borderColor: gridColor
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor,
            borderColor: gridColor
          }
        }
      }
    };

    // Prepare chart data
    const hourlyData = {
      labels: timeAnalysis.hourly_distribution.map(d => `${d.hour}:00`),
      datasets: [{
        label: 'Accidents by Hour',
        data: timeAnalysis.hourly_distribution.map(d => d.accidents),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    };

    const severityData = {
      labels: severityAnalysis.severity_distribution.map(d => d.severity),
      datasets: [{
        data: severityAnalysis.severity_distribution.map(d => d.count),
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // Fatal - Red
          'rgba(245, 101, 101, 0.8)',  // Serious - Orange-Red
          'rgba(251, 191, 36, 0.8)',   // Minor - Yellow
          'rgba(34, 197, 94, 0.8)'     // No Injury - Green
        ],
        borderWidth: 2,
        borderColor: '#fff'
      }]
    };

    const dailyData = {
      labels: timeAnalysis.daily_distribution.map(d => d.day),
      datasets: [{
        label: 'Accidents by Day',
        data: timeAnalysis.daily_distribution.map(d => d.accidents),
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderColor: 'rgb(168, 85, 247)',
        borderWidth: 1
      }]
    };

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Accidents</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">
                  {basicStats.total_accidents.toLocaleString()}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-orange-500" />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Fatal Accidents</p>
                <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {basicStats.fatal_accidents.toLocaleString()}
                </p>
              </div>
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Injury Accidents</p>
                <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {basicStats.injury_accidents.toLocaleString()}
                </p>
              </div>
              <ClockIcon className="w-12 h-12 text-yellow-500" />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Property Only</p>
                <p className="text-3xl font-bold text-green-600">
                  {basicStats.property_damage_only.toLocaleString()}
                </p>
              </div>
              <CheckCircleIcon className="w-12 h-12 text-green-500" />
            </div>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Accidents by Hour of Day
            </h3>
            <div className="h-64">
              <Bar data={hourlyData} options={{
                ...commonChartOptions,
                plugins: {
                  ...commonChartOptions.plugins,
                  legend: { display: false }
                }
              }} />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Accident Severity Distribution
            </h3>
            <div className="h-64">
              <Doughnut data={severityData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      color: textColor,
                      font: {
                        size: 12,
                        family: "'Inter', sans-serif"
                      },
                      padding: 20
                    }
                  }
                }
              }} />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Accidents by Day of Week
            </h3>
            <div className="h-72">
              <Bar data={dailyData} options={{
                ...commonChartOptions,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          </motion.div>

          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Key Insights
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Most Common Crash Type:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {basicStats.most_common_crash_type}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Most Common Weather:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {basicStats.most_common_weather}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Most Common Lighting:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {basicStats.most_common_lighting}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-400">Avg Injuries per Accident:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {basicStats.avg_injuries_per_accident.toFixed(2)}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderMLModels = () => {
    if (!mlModel) {
      return null; // Loading is handled at component level
    }

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    // Common chart colors for dark/light mode
    const textColor = isDarkMode ? '#e2e8f0' : '#334155'; // slate-200 / slate-700
    const gridColor = isDarkMode ? '#475569' : '#cbd5e1'; // slate-600 / slate-300

    // Common chart options
    const commonChartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
            font: {
              size: 12,
              family: "'Inter', sans-serif"
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            font: {
              size: 11
            }
          },
          grid: {
            color: gridColor
          }
        }
      }
    };

    const featureImportanceData = {
      labels: Object.keys(mlModel.feature_importance).slice(0, 10),
      datasets: [{
        label: 'Feature Importance',
        data: Object.values(mlModel.feature_importance).slice(0, 10),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }]
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Model Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
                <span className="text-2xl font-bold text-green-600">
                  {(mlModel.accuracy * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-blue-500 h-4 rounded-full"
                  style={{ width: `${mlModel.accuracy * 100}%` }}
                ></div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Random Forest model trained on {Math.round(209303 * 0.8)} samples
              </p>
            </div>
          </motion.div>

          <motion.div className="glass-card p-6">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              Top Feature Importance
            </h3>
            <div className="h-96">
              <Bar data={featureImportanceData} options={{
                ...commonChartOptions,
                indexAxis: 'y' as const,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  ...commonChartOptions.scales,
                  x: { 
                    beginAtZero: true,
                    grid: {
                      color: gridColor
                    },
                    ticks: {
                      color: textColor
                    }
                  }
                }
              }} />
            </div>
          </motion.div>
        </div>
      </div>
    );
  };

  const renderClustering = () => {
    if (!clusterAnalysis) {
      return null; // Loading is handled at component level
    }

    // Helper function to get cluster description
    const getClusterDescription = (cluster: any, index: number) => {
      const avgInjuries = cluster.avg_injuries;
      const hour = cluster.common_hour;
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cluster.common_day] || 'Unknown';
      
      let severityLevel = '';
      let severityColor = '';
      let riskIcon = '';
      
      if (avgInjuries >= 2) {
        severityLevel = 'High Risk';
        severityColor = 'text-red-600 dark:text-red-400';
        riskIcon = '🚨';
      } else if (avgInjuries >= 1) {
        severityLevel = 'Medium Risk';
        severityColor = 'text-yellow-600 dark:text-yellow-400';
        riskIcon = '⚠️';
      } else {
        severityLevel = 'Lower Risk';
        severityColor = 'text-green-600 dark:text-green-400';
        riskIcon = '✅';
      }

      let timeDescription = '';
      if (hour >= 6 && hour < 12) {
        timeDescription = 'Morning Rush Hours';
      } else if (hour >= 12 && hour < 18) {
        timeDescription = 'Afternoon Period';
      } else if (hour >= 18 && hour < 22) {
        timeDescription = 'Evening Rush Hours';
      } else {
        timeDescription = 'Night/Late Hours';
      }

      return {
        title: `Pattern ${index + 1}: ${riskIcon} ${severityLevel}`,
        description: `This accident pattern typically occurs during ${timeDescription.toLowerCase()} on ${dayName}s`,
        severityLevel,
        severityColor,
        timeDescription,
        dayName,
        riskIcon
      };
    };

    // Sort clusters by risk level (highest injuries first)
    const sortedClusters = Object.entries(clusterAnalysis.cluster_analysis)
      .sort(([,a], [,b]) => (b as any).avg_injuries - (a as any).avg_injuries);

    return (
      <div className="space-y-6">
        {/* Overview Card */}
        <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            📊 Accident Pattern Analysis
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Our AI has identified {Object.keys(clusterAnalysis.cluster_analysis).length} distinct accident patterns in Chicago traffic data. 
            Each pattern represents a group of similar accidents based on timing, location, and severity characteristics.
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              <div className="text-2xl mb-1">🚨</div>
              <div className="text-sm text-red-600 dark:text-red-400 font-medium">High Risk</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">2+ avg injuries</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <div className="text-2xl mb-1">⚠️</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Medium Risk</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">1-2 avg injuries</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="text-2xl mb-1">✅</div>
              <div className="text-sm text-green-600 dark:text-green-400 font-medium">Lower Risk</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">&lt;1 avg injury</div>
            </div>
          </div>
        </motion.div>

        {/* Cluster Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sortedClusters.map(([key, cluster], index) => {
            const description = getClusterDescription(cluster, index);
            const percentage = ((cluster.size / sortedClusters.reduce((sum, [,c]) => sum + (c as any).size, 0)) * 100);
            
            return (
              <motion.div 
                key={key} 
                className="glass-card p-6 bg-white/95 dark:bg-slate-800/95 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <h4 className={`text-lg font-semibold ${description.severityColor}`}>
                    {description.title}
                  </h4>
                  <div className="text-right">
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {percentage.toFixed(1)}% of accidents
                    </div>
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {cluster.size.toLocaleString()} cases
                    </div>
                  </div>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm leading-relaxed">
                  {description.description}
                </p>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">🕐</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Time</span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {cluster.common_hour}:00
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {description.timeDescription}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">📅</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Day</span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {description.dayName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Most common
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Average Injuries per Accident
                    </span>
                    <span className={`text-lg font-bold ${description.severityColor}`}>
                      {cluster.avg_injuries.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 bg-white dark:bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        cluster.avg_injuries >= 2 ? 'bg-red-500' :
                        cluster.avg_injuries >= 1 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(cluster.avg_injuries / 3 * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Insights Summary */}
        <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
          <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
            🔍 Key Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Most Dangerous Pattern</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getClusterDescription(sortedClusters[0][1], 0).title} shows the highest injury rate with {sortedClusters[0][1].avg_injuries.toFixed(2)} injuries per accident.
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Safest Pattern</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {getClusterDescription(sortedClusters[sortedClusters.length - 1][1], sortedClusters.length - 1).title} has the lowest injury rate with {sortedClusters[sortedClusters.length - 1][1].avg_injuries.toFixed(2)} injuries per accident.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-20">
      <div className="section-container">
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold gradient-text mb-4">
            Traffic Accident Analytics Dashboard
          </h2>
          <p className="text-lg lg:text-xl text-slate-600 dark:text-slate-400 max-w-4xl mx-auto leading-relaxed">
            Real-time analysis of Chicago traffic accident data with machine learning insights
          </p>
          <div className="mt-6 inline-flex items-center space-x-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            <div className={`w-3 h-3 rounded-full ${apiStatus === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              API Status: <span className={`font-semibold ${apiStatus === 'healthy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{apiStatus}</span>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center lg:justify-center mb-8 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 rounded-2xl p-2 lg:p-3 shadow-lg overflow-hidden">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 lg:px-6 py-2.5 lg:py-3 mx-0.5 lg:mx-1 my-1 rounded-xl font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 min-w-fit ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 border-2 border-blue-400 ring-2 ring-blue-300/50 transform scale-105'
                  : 'text-slate-700 dark:text-slate-200 bg-slate-50/80 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-slate-600/80 hover:text-blue-700 dark:hover:text-blue-300 border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-md'
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800`}
              aria-pressed={activeTab === tab.id}
              role="tab"
              tabIndex={0}
            >
              <tab.icon className={`w-5 h-5 flex-shrink-0 ${activeTab === tab.id ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="font-medium hidden sm:inline">{tab.name}</span>
              <span className="font-medium sm:hidden">{tab.shortName}</span>
            </motion.button>
          ))}
        </div>

        {/* Current Section Indicator */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-2 bg-slate-100/70 dark:bg-slate-700/50 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Currently viewing: <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {tabs.find(tab => tab.id === activeTab)?.name}
              </span>
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <>
            {activeTab === 'analytics' && (loadingAnalytics ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading analytics data...</p>
              </div>
            ) : renderAnalytics())}
            
            {activeTab === 'models' && (loadingML ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading ML model data...</p>
              </div>
            ) : renderMLModels())}
            
            {activeTab === 'clustering' && (loadingClustering ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-slate-600 dark:text-slate-400">Loading clustering data...</p>
              </div>
            ) : renderClustering())}
            
            {activeTab === 'association' && (
              <AssociationRules onBack={() => setActiveTab('analytics')} />
            )}
            
            {activeTab === 'reports' && (
              <div className="text-center py-12">
                <DocumentChartBarIcon className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Reports Coming Soon
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Detailed reports and exportable analytics will be available here.
                </p>
              </div>
            )}
          </>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;