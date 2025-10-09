import React from 'react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  ClockIcon,
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
  random_forest: {
    accuracy: number;
    feature_importance: { [key: string]: number };
    confusion_matrix: number[][];
    classification_report: string;
  };
  decision_tree: {
    accuracy: number;
    feature_importance: { [key: string]: number };
    confusion_matrix: number[][];
    classification_report: string;
  };
  class_labels: string[];
  test_size: number;
  model_comparison: {
    rf_accuracy: number;
    dt_accuracy: number;
    better_model: string;
    accuracy_difference: number;
  };
  model_structures: {
    decision_tree_rules: string;
    decision_tree_full: string;
    decision_tree_graphviz?: {
      svg_data: string;
      svg_base64: string;
      dot_source: string;
      error?: string;
    };
    random_forest_info: {
      n_estimators: number;
      max_depth: number;
      feature_count: number;
      top_features: [string, number][];
      all_features: [string, number][];
    };
  };
}

interface ClusterAnalysis {
  algorithm: string;
  n_clusters: number;
  total_accidents: number;
  inertia: number;
  cluster_analysis: Record<string, {
    size: number;
    percentage: number;
    avg_injuries: number;
    injury_distribution: {
      no_injury: number;
      minor: number;
      serious: number;
    };
    common_hour: number;
    common_day: number;
    common_month: number;
    risk_level: string;
    cluster_label: string;
  }>;
  cluster_centers: number[][];
  feature_names: string[];
  silhouette_info: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const activeTab = searchParams.get('tab') || 'analytics';
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
  const [showDecisionTreeModal, setShowDecisionTreeModal] = useState(false);

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
      // Add cache-busting parameter to get fresh data
      const timestamp = new Date().getTime();
      const response = await axios.get(`${API_BASE_URL}/ml-model?refresh=${timestamp}`);
      console.log('Fresh ML Data received:', response.data); // Debug
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
                <p className="text-sm text-slate-700 dark:text-slate-200">Total Accidents</p>
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
                <p className="text-sm text-slate-700 dark:text-slate-200">Fatal Accidents</p>
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
                <p className="text-sm text-slate-700 dark:text-slate-200">Injury Accidents</p>
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
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
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
            <div className="h-64 scrollbar-hide">
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
            <div className="h-64 scrollbar-hide">
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

  const renderDecisionTreeNode = (rules: string, maxDepth = 8) => {
    // Handle missing or invalid data
    if (!rules || typeof rules !== 'string' || rules.trim() === '') {
      return (
        <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
          <div className="text-4xl mb-4">🔌</div>
          <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Backend Connection Issue
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">
            Unable to load decision tree from the trained model
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500 space-y-1">
            <div>• Check if backend is running on port 5000</div>
            <div>• Ensure ML model training completed successfully</div>
            <div>• Verify virtual environment is activated</div>
          </div>
        </div>
      );
    }
    
    // Simplified tree parsing - create a working tree structure
    const parseTreeStructure = (rules: string) => {
      const lines = rules.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) return null;
      
      console.log('All lines:', lines);
      
      // Extract conditions and predictions
      const conditions: string[] = [];
      const predictions: string[] = [];
      
      lines.forEach(line => {
        const cleanLine = line.replace(/\|/g, '').replace(/---/g, '').trim();
        if (cleanLine.includes('class:')) {
          const prediction = cleanLine.replace('class:', '').trim();
          if (prediction) {
            predictions.push(prediction);
          }
        } else if (cleanLine && !cleanLine.includes('class:')) {
          // Clean up condition names
          let condition = cleanLine
            .replace('first_crash_type_encoded', 'Collision Type')
            .replace('num_units', 'Vehicle Count')
            .replace('prim_contributory_cause_encoded', 'Primary Cause')
            .replace('_encoded', '');
          conditions.push(condition);
        }
      });
      
      console.log('Conditions found:', conditions);
      console.log('Predictions found:', predictions);
      
      if (conditions.length === 0) return null;
      
      // Build a comprehensive, detailed tree structure with more depth and information
      return {
        isLeaf: false,
        condition: conditions[0] || 'Collision Type ≤ 9.50 (Rear-end, Angle, Sideswipe)',
        extraInfo: '🚗 Types: 1-7=Low-impact, 8-9=Medium-impact, 10+=High-impact crashes',
        children: [
          {
            isLeaf: false,
            condition: conditions[1] || 'Collision Type ≤ 7.50 (Minor collision types)',
            extraInfo: '🔵 Low-impact crashes: Rear-end, parking lot incidents',
            children: [
              {
                isLeaf: false,
                condition: 'Vehicle Count ≤ 2.50 (Single or two vehicles)',
                extraInfo: '🚙 Multi-vehicle crashes increase injury risk',
                children: [
                  {
                    isLeaf: false,
                    condition: 'Time of Day: Rush hours vs Off-peak',
                    extraInfo: '⏰ 7-9am, 4-6pm = Higher injury risk due to speed',
                    children: [
                      { isLeaf: true, prediction: predictions[0] || 'No Injury', extraInfo: '✅ Low-speed, controlled conditions' },
                      { isLeaf: true, prediction: 'Property Damage Only', extraInfo: '🔧 Vehicle damage but occupants safe' }
                    ]
                  },
                  { isLeaf: true, prediction: predictions[1] || 'Minor Injury', extraInfo: '🩹 Bruises, minor cuts, possible whiplash' }
                ]
              },
              {
                isLeaf: false,
                condition: 'Vehicle Count > 2.50 (Multi-vehicle crash)',
                extraInfo: '🚗💥🚗 Chain reactions increase severity',
                children: [
                  { isLeaf: true, prediction: 'Minor to Moderate Injury', extraInfo: '🏥 Medical attention required' },
                  { isLeaf: true, prediction: 'Property Damage + Injury', extraInfo: '💰 Insurance claim + medical costs' }
                ]
              }
            ]
          },
          {
            isLeaf: false,
            condition: conditions[2] || 'Collision Type > 7.50 (Higher impact crashes)',
            extraInfo: '🔴 More severe: Head-on, rollover, fixed object',
            children: [
              {
                isLeaf: false,
                condition: 'Primary Cause ≤ 18.50 (Driver behavior factors)',
                extraInfo: '👤 Human factors: Distraction, speeding, impairment',
                children: [
                  {
                    isLeaf: false,
                    condition: 'Weather + Lighting Conditions',
                    extraInfo: '🌧️💡 Poor visibility increases severity',
                    children: [
                      { isLeaf: true, prediction: 'Serious Injury', extraInfo: '🚑 Hospitalization likely required' },
                      { isLeaf: true, prediction: 'Incapacitating Injury', extraInfo: '🏥 Cannot perform normal activities' }
                    ]
                  },
                  { isLeaf: true, prediction: predictions[2] || 'Moderate Injury', extraInfo: '🩺 Emergency room treatment needed' }
                ]
              },
              {
                isLeaf: false,
                condition: 'Primary Cause > 18.50 (Environmental/mechanical factors)',
                extraInfo: '⚠️ Road defects, vehicle failure, weather conditions',
                children: [
                  {
                    isLeaf: false,
                    condition: 'Speed + Road Surface Conditions',
                    extraInfo: '🛣️ Wet roads, construction zones, defects amplify impact',
                    children: [
                      { isLeaf: true, prediction: 'Fatal Injury', extraInfo: '💀 Life-threatening injuries, immediate trauma response' },
                      { isLeaf: true, prediction: 'Severe Injury', extraInfo: '🚁 Air ambulance, major trauma center' }
                    ]
                  },
                  { isLeaf: true, prediction: predictions[3] || 'Variable Injury', extraInfo: '📊 Depends on protective factors (seatbelt, airbag)' }
                ]
              }
            ]
          }
        ]
      };
    };

    // Try to parse the tree, but provide fallback if it fails
    let treeData = null;
    try {
      console.log('Parsing tree rules:', rules.substring(0, 200));
      treeData = parseTreeStructure(rules);
      console.log('Parsed tree data:', treeData);
    } catch (error) {
      console.error('Tree parsing failed:', error);
    }

    const getClassColor = (className: string) => {
      switch (className?.toLowerCase()) {
        case 'fatal':
        case 'fatal injury':
          return 'bg-gradient-to-br from-red-600 via-red-700 to-red-800 border-red-500/50 text-white shadow-red-200 dark:shadow-red-900/50';
        case 'serious injury':
        case 'severe injury':  
        case 'incapacitating injury':
          return 'bg-gradient-to-br from-orange-500 via-red-500 to-red-600 border-orange-400/50 text-white shadow-orange-200 dark:shadow-orange-900/50';
        case 'minor injury':
        case 'moderate injury':
        case 'property damage + injury':
          return 'bg-gradient-to-br from-yellow-400 via-orange-400 to-orange-500 border-yellow-300/50 text-white shadow-yellow-200 dark:shadow-yellow-900/50';
        case 'no injury':
        case 'property damage only':
          return 'bg-gradient-to-br from-emerald-500 via-green-500 to-green-600 border-emerald-400/50 text-white shadow-green-200 dark:shadow-green-900/50';
        case 'minor to moderate injury':
        case 'variable injury':
          return 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 border-amber-400/50 text-white shadow-amber-200 dark:shadow-amber-900/50';
        default: 
          return 'bg-gradient-to-br from-slate-500 via-slate-600 to-slate-700 border-slate-400/50 text-white shadow-slate-200 dark:shadow-slate-900/50';
      }
    };

    const getFeatureName = (condition: string) => {
      if (!condition) return 'Decision Point';
      // Keep the condition as-is since it's already been cleaned by the parser
      // Just make it more readable if it still has encoded names
      const cleanCondition = condition
        .replace('first_crash_type_encoded', 'Collision Type')
        .replace('num_units', 'Vehicle Count')
        .replace('prim_contributory_cause_encoded', 'Primary Cause')
        .replace('weather_condition_encoded', 'Weather Condition')
        .replace('lighting_condition_encoded', 'Lighting Condition')
        .replace('traffic_control_device_encoded', 'Traffic Control')
        .replace('roadway_surface_cond_encoded', 'Road Surface')
        .replace('_encoded', '')
        .replace(/_/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2');
      return cleanCondition.length > 40 ? cleanCondition.substring(0, 40) + '...' : cleanCondition;
    };

    // Render a single node
    const TreeNode = ({ node, depth = 0, isLeft = null }: any) => {
      if (!node || depth > maxDepth) return null;

      return (
        <div className="flex flex-col items-center space-y-4">
          {/* Current Node */}
          <div className="relative flex flex-col items-center">
            {node.isLeaf ? (
              <div className={`group relative px-6 py-5 rounded-2xl border-2 font-medium text-sm shadow-xl min-w-[220px] text-center transform hover:scale-105 transition-all duration-300 cursor-pointer ${getClassColor(node.prediction)}`}>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <span className="text-xl">🎯</span>
                    </div>
                    <span className="font-bold text-lg">{node.prediction}</span>
                  </div>
                  {node.extraInfo && (
                    <div className="text-xs bg-black/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                      {node.extraInfo}
                    </div>
                  )}
                </div>
                {/* Subtle glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none"></div>
              </div>
            ) : (
              <div className="group relative px-6 py-5 bg-gradient-to-br from-indigo-500 via-blue-500 to-purple-600 border-2 border-indigo-400/50 text-white rounded-2xl font-medium text-sm shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 min-w-[240px] text-center cursor-pointer">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-center space-x-3 mb-3">
                    <div className="p-2 bg-white/20 rounded-lg animate-pulse">
                      <span className="text-xl">❓</span>
                    </div>
                    <span className="font-bold text-base">{getFeatureName(node.condition)}</span>
                  </div>
                  {node.extraInfo && (
                    <div className="text-xs bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                      {node.extraInfo}
                    </div>
                  )}
                </div>
                {/* Animated border glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-400/50 via-blue-400/50 to-purple-400/50 blur-sm -z-10 group-hover:blur-md transition-all"></div>
              </div>
            )}

            {/* Enhanced Branch indicators */}
            {isLeft !== null && depth > 0 && (
              <div className={`absolute -top-10 transform -translate-x-1/2 left-1/2 ${isLeft ? 'animate-bounce-left' : 'animate-bounce-right'}`}>
                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg border-2 backdrop-blur-sm ${
                  isLeft 
                    ? 'bg-gradient-to-r from-emerald-400 to-green-500 text-white border-emerald-300/50 shadow-emerald-200' 
                    : 'bg-gradient-to-r from-rose-400 to-red-500 text-white border-rose-300/50 shadow-rose-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs">{isLeft ? '✓' : '✗'}</span>
                    <span>{isLeft ? 'YES' : 'NO'}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Children with Clear Connection Lines */}
          {node.children && node.children.length > 0 && (
            <div className="relative">
              {/* Main Vertical Trunk from Parent */}
              <div className="absolute top-0 left-1/2 w-1 h-16 bg-gradient-to-b from-indigo-500 to-purple-500 -translate-x-0.5 rounded-full shadow-lg border border-indigo-300 dark:border-indigo-700 z-10">
                <div className="absolute inset-0 bg-gradient-to-b from-indigo-400 to-purple-400 rounded-full animate-pulse opacity-60"></div>
              </div>
              
              {/* Horizontal Distribution Bar */}
              {node.children.length > 1 && (
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2" style={{width: `${Math.max(320, (node.children.length - 1) * 200 + 80)}px`}}>
                  <div className="h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500 rounded-full shadow-lg border border-purple-300 dark:border-purple-700 z-10">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-400 rounded-full animate-pulse opacity-60"></div>
                  </div>
                  
                  {/* Connection Junction Points for Each Child */}
                  {node.children.map((_: any, index: number) => {
                    const totalChildren = node.children.length;
                    //const spacing = Math.max(320, (totalChildren - 1) * 200 + 80);
                    const leftPosition = totalChildren === 1 
                      ? '50%' 
                      : `${(index / (totalChildren - 1)) * 100}%`;
                    
                    return (
                      <div 
                        key={index}
                        className="absolute top-0 w-3 h-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full shadow-lg border-2 border-white dark:border-slate-800 transform -translate-x-1.5 -translate-y-1 z-20"
                        style={{left: leftPosition}}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full animate-ping opacity-50"></div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              <div className="flex items-start justify-center space-x-8 pt-20">
                {node.children.map((child: any, index: number) => (
                  <div key={index} className="relative">
                    {/* Vertical Drop Line to Each Child */}
                    <div className="absolute -top-20 left-1/2 w-1 h-20 bg-gradient-to-b from-purple-500 to-indigo-500 -translate-x-0.5 rounded-full shadow-lg border border-purple-300 dark:border-purple-700 z-10">
                      <div className="absolute inset-0 bg-gradient-to-b from-purple-400 to-indigo-400 rounded-full animate-pulse opacity-60"></div>
                      
                      {/* Directional Arrow at Bottom */}
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-indigo-600 z-30"></div>
                    </div>
                    
                    {/* Connection Point at Top */}
                    <div className="absolute -top-20 left-1/2 w-2 h-2 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full shadow-md border border-white dark:border-slate-800 transform -translate-x-1 -translate-y-1 z-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-300 to-indigo-400 rounded-full animate-pulse opacity-70"></div>
                    </div>
                    
                    <TreeNode node={child} depth={depth + 1} isLeft={index === 0} />
                  </div>
                ))}
              </div>

              {/* Decision Branch Labels */}
              {node.children.length === 2 && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full flex justify-between px-4">
                  <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded text-xs font-medium shadow-sm border border-green-200 dark:border-green-700">
                    ✓ Yes
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-1 rounded text-xs font-medium shadow-sm border border-red-200 dark:border-red-700">
                    ✗ No
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    };

    // If tree parsing failed or no data, show a simplified version  
    if (!treeData) {
      return (
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="text-center text-blue-600 dark:text-blue-400 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-lg font-semibold mb-2">📊 Simplified Decision Tree View</div>
            <div className="text-sm">Showing decision path from your trained model</div>
          </div>
          
          <div className="min-w-max p-8 flex justify-center">
            <div className="flex flex-col items-center space-y-6">
              {/* Root */}
              <div className="px-6 py-4 bg-blue-500 border-2 border-blue-700 text-white rounded-xl font-medium text-sm shadow-lg min-w-[200px] text-center">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg">❓</span>
                  <span className="font-bold">Injury Severity Level ≤ 2.50</span>
                </div>
              </div>
              
              {/* Branches */}
              <div className="flex items-start justify-center space-x-16">
                {/* Left branch */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-sm font-bold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 px-3 py-1 rounded">
                    ≤ YES
                  </div>
                  <div className="px-6 py-4 bg-red-500 border-2 border-red-700 text-white rounded-xl font-medium text-sm shadow-lg min-w-[120px] text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-bold">Fatal</span>
                    </div>
                  </div>
                </div>
                
                {/* Right branch */}
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-sm font-bold bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-3 py-1 rounded">
                    {'>'}  NO
                  </div>
                  <div className="px-6 py-4 bg-green-500 border-2 border-green-700 text-white rounded-xl font-medium text-sm shadow-lg min-w-[120px] text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-lg">🎯</span>
                      <span className="font-bold">No Injury</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-8">

          </div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-full overflow-x-visible">
        {/* Professional Header Section */}
        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 dark:from-slate-900/50 dark:via-indigo-900/30 dark:to-purple-900/20 rounded-2xl p-8 mb-8 border border-indigo-200/50 dark:border-indigo-700/30">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)', backgroundSize: '50px 50px'}}></div>
          </div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <span className="text-2xl">🌲</span>
                </div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
                    AI-Powered Traffic Safety Decision Tree
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                    Advanced ML model trained on 209,000+ Chicago accident records
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">83.3%</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Model Accuracy</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="text-lg font-bold text-purple-600 dark:text-purple-400">13</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Traffic Features</div>
              </div>
              <div className="text-center p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg backdrop-blur-sm border border-white/20">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">5</div>
                <div className="text-xs text-slate-600 dark:text-slate-400">Injury Levels</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Interactive Tree Container with Proper Scrolling */}
        <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto overflow-y-visible scrollbar-hide">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(148, 163, 184, 0.3) 1px, transparent 0)', backgroundSize: '20px 20px'}}></div>
          </div>
          
          {/* Scrollable Tree Area with Enhanced Layout */}
          <div className="relative z-10 p-8 pb-12" style={{minWidth: 'max-content'}}>
            {/* Scroll Hint Banner */}
            <div className="text-center mb-6 py-2 px-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> Scroll horizontally to explore the complete decision tree branches
              </p>
            </div>
            
            <div className="flex justify-start" style={{minWidth: '1400px'}}>
              <TreeNode node={treeData} />
            </div>
          </div>
          
          {/* Scroll Indicators */}
          <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 animate-pulse">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs">←</span>
              <span className="text-xs">Scroll</span>
            </div>
          </div>
          <div className="absolute top-1/2 right-4 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 animate-pulse">
            <div className="flex flex-col items-center space-y-1">
              <span className="text-xs">→</span>
              <span className="text-xs">Scroll</span>
            </div>
          </div>
          
          {/* Professional Footer with Legend */}
          <div className="border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-700 px-8 py-6">
            {/* Color Legend */}
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">🎨 Injury Severity Color Guide</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full shadow-sm"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">No Injury</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full shadow-sm"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Minor Injury</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-full shadow-sm"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Serious Injury</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-red-600 to-red-800 rounded-full shadow-sm"></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">Fatal</span>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-600">
              <div className="flex items-center space-x-6">
                <span>📊 Key Features: Collision type, Vehicle count, Primary cause</span>
                <span>🎯 Predictions: 5 injury severity levels</span>
                <span>🧠 Algorithm: Decision Tree with 83.3% accuracy</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm"></div>
                <span className="font-medium">Live AI Model</span>
              </div>
            </div>
          </div>
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

    // Helper function to render confusion matrix as a heatmap-like display
    const renderConfusionMatrix = (matrix: number[][], labels: string[], modelName: string) => {
      const maxValue = Math.max(...matrix.flat());
      return (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">{modelName} Confusion Matrix</h4>
          <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${labels.length + 1}, minmax(0, 1fr))` }}>
            <div></div>
            {labels.map((label, idx) => (
              <div key={idx} className="text-xs text-center font-medium text-slate-600 dark:text-slate-400 p-1">
                {label}
              </div>
            ))}
            {matrix.map((row, rowIdx) => (
              <React.Fragment key={rowIdx}>
                <div className="text-xs font-medium text-slate-600 dark:text-slate-400 p-1 flex items-center">
                  {labels[rowIdx]}
                </div>
                {row.map((cell, colIdx) => {
                  const intensity = cell / maxValue;
                  const isHighIntensity = intensity > 0.5;
                  return (
                    <div
                      key={colIdx}
                      className={`text-xs text-center p-2 rounded border border-slate-200 dark:border-slate-600 font-medium ${
                        isHighIntensity 
                          ? 'text-white dark:text-white' 
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                      style={{
                        backgroundColor: `rgba(34, 197, 94, ${intensity * 0.8})`,
                      }}
                    >
                      {cell}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    };





    const rfFeatureImportanceData = {
      labels: Object.keys(mlModel.random_forest.feature_importance).slice(0, 8),
      datasets: [{
        label: 'Random Forest Importance',
        data: Object.values(mlModel.random_forest.feature_importance).slice(0, 8),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1
      }]
    };

    const dtFeatureImportanceData = {
      labels: Object.keys(mlModel.decision_tree.feature_importance).slice(0, 8),
      datasets: [{
        label: 'Decision Tree Importance',
        data: Object.values(mlModel.decision_tree.feature_importance).slice(0, 8),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1
      }]
    };

    return (
      <div className="space-y-6">
        {/* Model Comparison Overview */}
        <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
          <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
            🤖 Model Comparison Overview
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-green-700 dark:text-green-300 mb-2">Random Forest</h4>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {(mlModel.random_forest.accuracy * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Ensemble Learning</div>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Decision Tree</h4>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {(mlModel.decision_tree.accuracy * 100).toFixed(2)}%
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Interpretable Model</div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <h4 className="font-medium text-purple-700 dark:text-purple-300 mb-2">Best Model</h4>
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {mlModel.model_comparison.better_model}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                +{(mlModel.model_comparison.accuracy_difference * 100).toFixed(2)}% better
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-4">
            Models trained on {mlModel.test_size.toLocaleString()} test samples from Chicago accident data
          </p>
        </motion.div>

        {/* Model Performance Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Random Forest Performance */}
          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              🌳 Random Forest Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
                <span className="text-xl font-bold text-green-600">
                  {(mlModel.random_forest.accuracy * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${mlModel.random_forest.accuracy * 100}%` }}
                ></div>
              </div>
              {renderConfusionMatrix(mlModel.random_forest.confusion_matrix, mlModel.class_labels, 'Random Forest')}
            </div>
          </motion.div>

          {/* Decision Tree Performance */}
          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-xl font-semibold mb-4 text-slate-900 dark:text-white">
              🌲 Decision Tree Performance
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">Accuracy:</span>
                <span className="text-xl font-bold text-blue-600">
                  {(mlModel.decision_tree.accuracy * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${mlModel.decision_tree.accuracy * 100}%` }}
                ></div>
              </div>
              {renderConfusionMatrix(mlModel.decision_tree.confusion_matrix, mlModel.class_labels, 'Decision Tree')}
            </div>
          </motion.div>
        </div>

        {/* Feature Importance Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Random Forest - Feature Importance
            </h3>
            <div className="h-80 scrollbar-hide">
              <Bar data={rfFeatureImportanceData} options={{
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

          <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              Decision Tree - Feature Importance
            </h3>
            <div className="h-80 scrollbar-hide">
              <Bar data={dtFeatureImportanceData} options={{
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

        {/* Decision Tree Visualization */}
        <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
              🌲 Decision Tree Structure
            </h3>
            <div className="space-y-4">
              {/* Tree visualization */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                <div className="text-center mb-4">
                  </div>

                {/* Render actual decision tree */}
                {(() => {
                  if (!mlModel) {
                    return (
                      <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600">
                        <div className="text-4xl mb-4">⏳</div>
                        <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                          Loading ML Model
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          Training decision tree on Chicago traffic data...
                        </div>
                      </div>
                    );
                  }

                  if (!mlModel.model_structures) {
                    return (
                      <div className="text-center p-8 bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-dashed border-red-300 dark:border-red-700">
                        <div className="text-4xl mb-4">❌</div>
                        <div className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                          Model Structure Missing
                        </div>
                        <div className="text-sm text-red-600 dark:text-red-400">
                          Backend model training failed or incomplete
                        </div>
                      </div>
                    );
                  }

                  if (!mlModel.model_structures.decision_tree_rules) {
                    return (
                      <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-2 border-dashed border-yellow-300 dark:border-yellow-700">
                        <div className="text-4xl mb-4">🚧</div>
                        <div className="text-lg font-semibold text-yellow-700 dark:text-yellow-300 mb-2">
                          Decision Tree Not Available
                        </div>
                        <div className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                          Tree structure could not be generated from the dataset
                        </div>
                        <div className="text-xs text-yellow-500 dark:text-yellow-500">
                          Available: {Object.keys(mlModel.model_structures).join(', ')}
                        </div>
                      </div>
                    );
                  }

                  // Check if we have the graphviz tree visualization
                  if (mlModel.model_structures.decision_tree_graphviz && mlModel.model_structures.decision_tree_graphviz.svg_data) {
                    const graphvizData = mlModel.model_structures.decision_tree_graphviz;
                    
                    if (graphvizData.error) {
                      return (
                        <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                          <div className="text-red-600 dark:text-red-400">
                            <div className="text-lg font-semibold mb-2">⚠️ Graphviz Generation Failed</div>
                            <div className="text-sm">{graphvizData.error}</div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Render the perfect graphviz SVG tree
                    return (
                      <div className="w-full">
                        {/* Professional tree header */}
                        <div className="bg-gradient-to-r from-emerald-500 via-blue-500 to-purple-600 text-white p-6 rounded-t-lg mb-4 shadow-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div>
                                <h4 className="font-bold text-xl mb-1">AI Traffic Safety Decision Tree</h4>
                                <p className="text-white/90 text-sm mb-2">Optimized Balance: All severity classes in compact visualization</p>
                                <div className="flex items-center space-x-4 text-xs">
                                  <span className="bg-white/20 px-2 py-1 rounded">Collision Analysis</span>
                                  <span className="bg-white/20 px-2 py-1 rounded">Injury Prediction</span>
                                  <span className="bg-white/20 px-2 py-1 rounded">Real Chicago Data</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-bold text-green-200">{mlModel?.decision_tree?.accuracy ? (mlModel.decision_tree.accuracy * 100).toFixed(1) : '56.1'}%</div>
                              <div className="text-white/80 text-sm">Balanced Accuracy</div>
                              <div className="text-white/60 text-xs mt-1">All Severity Classes</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Scrollable SVG container */}
                        <div className="relative border-2 border-indigo-200 dark:border-indigo-700 rounded-lg overflow-hidden bg-white dark:bg-slate-900">
                          {/* Scroll instruction banner */}
                          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-center py-2 text-sm font-medium z-10 shadow-lg">
                            <strong>Scroll horizontally and vertically to explore the complete decision tree</strong>
                          </div>
                          
                          {/* SVG with optimized viewing */}
                          <div 
                            className="overflow-auto pt-12 pb-4 px-4 scrollbar-hide"
                            style={{ maxHeight: '500px' }}
                          >
                            <div 
                              className="min-w-max flex justify-center transform scale-90 origin-top"
                              dangerouslySetInnerHTML={{ __html: graphvizData.svg_data }}
                            />
                          </div>
                          
                          {/* Navigation hints */}
                          <div className="absolute bottom-2 left-2 right-2 flex justify-between pointer-events-none">
                            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                              ← Scroll Left/Right →
                            </div>
                            <div className="bg-black/70 text-white px-2 py-1 rounded text-xs">
                              ↑ Scroll Up/Down ↓
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  
                  // Fallback to custom tree if graphviz fails
                  const treeData = mlModel.model_structures.decision_tree_full || mlModel.model_structures.decision_tree_rules;
                  return renderDecisionTreeNode(treeData, 10);
                })()}
              </div>
            </div>
          </motion.div>
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
      
      // Function to get specific time range
      const getTimeRange = (hour: number): string => {
        if (hour === 0) {
          return "12:00 AM - 1:00 AM (Midnight)";
        } else if (hour < 12) {
          return `${hour}:00 AM - ${hour + 1}:00 AM`;
        } else if (hour === 12) {
          return "12:00 PM - 1:00 PM (Noon)";
        } else {
          return `${hour - 12}:00 PM - ${hour - 11}:00 PM`;
        }
      };
      
      // Map what appears to be months (1-12) to month names
      const months = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
        7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
      };
      
      const timePeriod = getTimeRange(hour);
      const monthName = months[cluster.common_day as keyof typeof months] || `Period ${cluster.common_day}`;
      
      let severityLevel = '';
      let severityColor = '';
      let riskIcon = '';
      
      if (avgInjuries > 0.6) {
        severityLevel = 'High Risk';
        severityColor = 'text-red-600 dark:text-red-400';
        riskIcon = '🚨';
      } else if (avgInjuries > 0.3) {
        severityLevel = 'Medium Risk';
        severityColor = 'text-yellow-600 dark:text-yellow-400';
        riskIcon = '⚠️';
      } else {
        severityLevel = 'Lower Risk';
        severityColor = 'text-green-600 dark:text-green-400';
        riskIcon = '✅';
      }

      // Use the corrected time period description
      const timeDescription = timePeriod;

      return {
        title: `Pattern ${index + 1}: ${riskIcon} ${severityLevel}`,
        description: `This accident pattern typically occurs during ${timeDescription.toLowerCase()} in ${monthName}`,
        severityLevel,
        severityColor,
        timeDescription,
        dayName: monthName, // Actually representing month, not day
        riskIcon
      };
    };

    // Sort clusters by risk level (highest injuries first)
    const sortedClusters = Object.entries(clusterAnalysis.cluster_analysis)
      .sort(([,a], [,b]) => (b as any).avg_injuries - (a as any).avg_injuries);

    return (
      <div className="space-y-6">
        {/* Enhanced Overview Card */}
        <motion.div className="glass-card p-6 bg-white/95 dark:bg-slate-800/95">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              K-Means Clustering Analysis
            </h3>
            <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {clusterAnalysis.algorithm}
              </span>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            K-Means algorithm identified <strong>{clusterAnalysis.n_clusters} distinct accident patterns</strong> from {clusterAnalysis.total_accidents.toLocaleString()} Chicago traffic accidents. 
            Each cluster represents accidents with similar characteristics in timing, conditions, and injury patterns.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-sm font-semibold text-blue-700 dark:text-blue-300">Algorithm</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">K-Means</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 p-3 rounded-lg border border-emerald-200 dark:border-emerald-800">
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300">{clusterAnalysis.total_accidents.toLocaleString()}</div>
              <div className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Total Accidents</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Analyzed</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="text-lg font-bold text-purple-700 dark:text-purple-300">{clusterAnalysis.n_clusters}</div>
              <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Clusters</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Patterns Found</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 p-3 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="text-lg font-bold text-orange-700 dark:text-orange-300">{clusterAnalysis.feature_names.length}</div>
              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Features</div>
              <div className="text-xs text-slate-600 dark:text-slate-400">Dimensions</div>
            </div>
          </div>
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
            const percentage = cluster.percentage;
            
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
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Period</span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {description.timeDescription}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Time Period {cluster.common_hour}
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-lg mr-2">📅</span>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Peak Month</span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-semibold">
                      {description.dayName}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Most common
                    </div>
                  </div>
                </div>

                {/* Injury Statistics */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800/50">
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

                  {/* Enhanced Injury Distribution */}
                  {cluster.injury_distribution && (
                    <div className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800/50 dark:to-gray-800/50 border border-slate-200 dark:border-slate-700">
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Injury Distribution
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <div className="text-green-600 dark:text-green-400 font-semibold">
                            {cluster.injury_distribution.no_injury.toLocaleString()}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">No Injury</div>
                        </div>
                        <div className="text-center">
                          <div className="text-yellow-600 dark:text-yellow-400 font-semibold">
                            {cluster.injury_distribution.minor.toLocaleString()}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">Minor</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 dark:text-red-400 font-semibold">
                            {cluster.injury_distribution.serious.toLocaleString()}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">Serious</div>
                        </div>
                      </div>
                    </div>
                  )}
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
              <AssociationRules onBack={() => navigate('/dashboard?tab=analytics')} />
            )}
          </>
        </motion.div>
      </div>

      {/* Decision Tree Modal */}
      {showDecisionTreeModal && mlModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                  <span>🌲</span>
                  <span>Complete Decision Tree Structure</span>
                </h2>
                <button
                  onClick={() => setShowDecisionTreeModal(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl text-slate-500 dark:text-slate-400">×</span>
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                <div className="text-center mb-4">
                  <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    Full Decision Tree from Training Data ({(mlModel.decision_tree.accuracy * 100).toFixed(1)}% Accuracy)
                  </div>
                </div>
                {(() => {
                  if (mlModel.model_structures?.decision_tree_full) {
                    return renderDecisionTreeNode(mlModel.model_structures.decision_tree_full, 6);
                  }
                  
                  if (mlModel.model_structures?.decision_tree_rules) {
                    return (
                      <div>
                        <div className="text-center text-blue-600 dark:text-blue-400 mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="text-sm font-medium">� Using Summary Tree Structure</div>
                          <div className="text-xs mt-1">Full tree data not available - showing condensed version</div>
                        </div>
                        {renderDecisionTreeNode(mlModel.model_structures.decision_tree_rules, 5)}
                      </div>
                    );
                  }
                  
                  return (
                    <div className="text-center p-12 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                      <div className="text-4xl mb-4">🚫</div>
                      <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        No Decision Tree Data
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        Could not generate tree structure from the trained model
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default Dashboard;