import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  ShieldCheckIcon, 
  ArrowRightIcon
} from '@heroicons/react/24/outline'

interface RealStats {
  total_accidents: number;
  fatal_accidents: number;
  injury_accidents: number;
  property_damage_only: number;
}

interface TimeData {
  hourly_distribution: { hour: number; accidents: number }[];
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production' ? 'https://your-backend-url.railway.app/api' : 'http://localhost:5000/api');

const Hero = () => {
  const [realStats, setRealStats] = useState<RealStats | null>(null);
  const [timeData, setTimeData] = useState<TimeData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRealData = async () => {
      try {
        setLoading(true);
        const [statsRes, timeRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/stats`),
          axios.get(`${API_BASE_URL}/time-analysis`)
        ]);
        
        setRealStats(statsRes.data);
        setTimeData(timeRes.data);
      } catch (error) {
        console.error('Failed to fetch real data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRealData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
    },
  }

  // Derive hourly data for chart
  const hourlyData = timeData?.hourly_distribution?.map(item => item.accidents) || [];

  // Real stats derived from API data
  const stats = realStats ? [
    { label: 'Total Records', value: (realStats.total_accidents || 0).toLocaleString() },
    { label: 'Fatal Accidents', value: (realStats.fatal_accidents || 0).toLocaleString() },
    { label: 'Injury Cases', value: (realStats.injury_accidents || 0).toLocaleString() },
    { label: 'Property Only', value: (realStats.property_damage_only || 0).toLocaleString() },
  ] : []

  return (
    <div className="relative pt-16 lg:pt-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-accent-400/20 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-accent-400/20 to-primary-400/20 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>
      </div>

      <div className="relative section-container">
        <div className="min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            {/* Content */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={itemVariants} className="space-y-4">
                <div className="inline-flex items-center px-4 py-2 bg-primary-50 text-primary-700 rounded-full text-sm font-medium border border-primary-200 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700">
                  <ShieldCheckIcon className="w-4 h-4 mr-2" />
                  Chicago Traffic Safety Analysis
                </div>
                
                <h1 className="text-4xl lg:text-6xl xl:text-7xl font-display font-bold leading-tight">
                  <span className="text-slate-900 dark:text-white">Making Roads</span>
                  <br />
                  <span className="gradient-text">Safer with Data</span>
                </h1>
                
                <p className="text-xl lg:text-2xl text-slate-700 dark:text-slate-200 leading-relaxed max-w-2xl">
                  Comprehensive analysis of Chicago traffic accidents using advanced 
                  machine learning and data mining techniques to improve road safety 
                  and prevent accidents.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/dashboard"
                  className="btn-primary inline-flex items-center justify-center group"
                >
                  Explore Dashboard
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-3 gap-6 pt-8">
                {loading ? (
                  // Loading skeleton
                  [1, 2, 3].map((i) => (
                    <div key={i} className="text-center group">
                      <div className="w-12 h-12 mx-auto mb-3 bg-slate-300 animate-pulse rounded-xl"></div>
                      <div className="h-8 bg-slate-300 animate-pulse rounded mb-2"></div>
                      <div className="h-4 bg-slate-300 animate-pulse rounded w-3/4 mx-auto"></div>
                    </div>
                  ))
                ) : (
                  stats.map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05, y: -5 }}
                      className="text-center group"
                    >
                      <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center group-hover:shadow-glow transition-all duration-300">
                        <ShieldCheckIcon className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">{stat.label}</div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            </motion.div>

            {/* Visual Element */}
            <motion.div
              variants={itemVariants}
              className="relative lg:h-[600px] flex items-center justify-center"
            >
              {/* Main Dashboard Preview */}
              <motion.div
                animate={{
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                }}
                className="relative z-10"
              >
                <div className="glass-card p-8 rounded-2xl shadow-2xl max-w-md w-full">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Analytics Overview</h3>
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>

                    {/* Real Chart - Hourly Distribution */}
                    <div className="space-y-4">
                      <div className="h-32 bg-gradient-to-r from-primary-100 to-accent-100 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-end justify-around p-4">
                          {loading ? (
                            [1, 2, 3, 4, 5, 6, 7].map((i) => (
                              <div
                                key={i}
                                className="bg-slate-300 animate-pulse rounded-sm"
                                style={{ width: '8px', height: `${Math.random() * 60 + 20}%` }}
                              />
                            ))
                          ) : hourlyData.length > 0 ? (
                            hourlyData.slice(0, 7).map((count: number, i: number) => {
                              const maxCount = Math.max(...hourlyData) || 1; // Prevent division by zero
                              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
                              return (
                                <motion.div
                                  key={i}
                                  className="bg-gradient-to-t from-primary-500 to-accent-500 rounded-sm"
                                  style={{ width: '8px' }}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${height}%` }}
                                  transition={{ delay: i * 0.1, duration: 0.8 }}
                                  title={`${i * 3}-${(i + 1) * 3}h: ${count} accidents`}
                                />
                              );
                            })
                          ) : (
                            // Show placeholder when no data
                            <div className="text-slate-400 text-sm">Loading chart data...</div>
                          )}
                        </div>
                      </div>

                      {/* Real Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        {loading ? (
                          [1, 2, 3, 4].map((i) => (
                            <div key={i} className="text-center p-3 bg-slate-50 rounded-lg">
                              <div className="h-6 bg-slate-300 animate-pulse rounded mb-2"></div>
                              <div className="h-3 bg-slate-300 animate-pulse rounded w-2/3 mx-auto"></div>
                            </div>
                          ))
                        ) : (
                          stats.map((stat) => (
                            <div key={stat.label} className="text-center p-3 bg-slate-50 rounded-lg">
                              <div className="text-lg font-semibold text-primary-600">
                                {stat.value}
                              </div>
                              <div className="text-xs text-slate-600">{stat.label}</div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating Elements */}
              <motion.div
                className="absolute top-16 right-16 w-20 h-20 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl opacity-80"
                animate={{
                  rotate: [0, 180, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              <motion.div
                className="absolute bottom-20 left-8 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full opacity-60"
                animate={{
                  y: [0, -30, 0],
                  x: [0, 20, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              <motion.div
                className="absolute top-32 left-20 w-12 h-12 bg-gradient-to-br from-accent-300 to-primary-400 rounded-lg opacity-70"
                animate={{
                  rotate: [0, -180, 0],
                  scale: [1, 0.8, 1],
                }}
                transition={{
                  duration: 10,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{
          y: [0, 10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </div>
  )
}

export default Hero