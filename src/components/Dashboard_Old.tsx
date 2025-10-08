import { motion } from 'framer-motion'
import { useState } from 'react'
import { 
  ChartBarIcon, 
  CubeTransparentIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics')

  const tabs = [
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'models', name: 'ML Models', icon: CubeTransparentIcon },
    { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon },
    { id: 'settings', name: 'Settings', icon: Cog6ToothIcon },
  ]

  return (
    <div className="min-h-screen pt-16 lg:pt-20">
      <div className="section-container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl lg:text-4xl font-display font-bold mb-4">
            <span className="gradient-text">Traffic Analysis Dashboard</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Comprehensive insights into Chicago traffic safety patterns and predictions.
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <div className="glass-card rounded-xl p-2 mb-8">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.name}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Dashboard Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-8"
        >
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'models' && <ModelsView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'settings' && <SettingsView />}
        </motion.div>
      </div>
    </div>
  )
}

const AnalyticsView = () => (
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Key Metrics */}
    <div className="lg:col-span-2 space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { title: 'Total Accidents', value: '125,847', change: '+2.4%', color: 'text-blue-600' },
          { title: 'High Risk Areas', value: '23', change: '-8.1%', color: 'text-red-600' },
          { title: 'Safety Score', value: '94.2%', change: '+5.2%', color: 'text-green-600' },
        ].map((metric) => (
          <motion.div
            key={metric.title}
            whileHover={{ scale: 1.02, y: -2 }}
            className="stat-card"
          >
            <div className="text-2xl font-bold text-slate-800 mb-1">
              {metric.value}
            </div>
            <div className="text-slate-600 text-sm mb-2">{metric.title}</div>
            <div className={`text-sm font-medium ${metric.color}`}>
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Chart Area */}
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Accident Trends Over Time
        </h3>
        <div className="h-64 bg-gradient-to-r from-primary-50 to-accent-50 rounded-lg flex items-center justify-center">
          <div className="text-slate-500">Interactive Chart Component</div>
        </div>
      </div>
    </div>

    {/* Side Panel */}
    <div className="space-y-6">
      <div className="chart-container">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Risk Factors
        </h3>
        <div className="space-y-3">
          {[
            { factor: 'Weather Conditions', impact: 85 },
            { factor: 'Time of Day', impact: 72 },
            { factor: 'Road Type', impact: 68 },
            { factor: 'Traffic Density', impact: 55 },
          ].map((item) => (
            <div key={item.factor} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">{item.factor}</span>
                <span className="font-medium">{item.impact}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${item.impact}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

const ModelsView = () => (
  <div className="grid lg:grid-cols-2 gap-8">
    {[
      {
        name: 'Decision Tree Classifier',
        accuracy: '94.2%',
        status: 'Active',
        description: 'Predicts accident severity with high interpretability'
      },
      {
        name: 'Naive Bayes Classifier',
        accuracy: '89.7%',
        status: 'Active',
        description: 'Fast probabilistic classification model'
      },
      {
        name: 'K-Means Clustering',
        clusters: '7 clusters',
        status: 'Training',
        description: 'Groups accidents by similar characteristics'
      },
      {
        name: 'Association Rules',
        rules: '156 rules',
        status: 'Active',
        description: 'Discovers patterns in accident conditions'
      },
    ].map((model) => (
      <motion.div
        key={model.name}
        whileHover={{ scale: 1.02 }}
        className="chart-container"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">{model.name}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            model.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {model.status}
          </span>
        </div>
        <p className="text-slate-600 mb-4">{model.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary-600">
            {model.accuracy || model.clusters || model.rules}
          </span>
          <button className="btn-primary text-sm py-2">
            View Details
          </button>
        </div>
      </motion.div>
    ))}
  </div>
)

const ReportsView = () => (
  <div className="space-y-8">
    <div className="chart-container">
      <h3 className="text-lg font-semibold text-slate-800 mb-6">
        Generated Reports
      </h3>
      <div className="space-y-4">
        {[
          { title: 'Monthly Safety Report', date: '2025-10-01', type: 'PDF' },
          { title: 'High-Risk Areas Analysis', date: '2025-09-28', type: 'Excel' },
          { title: 'ML Model Performance', date: '2025-09-25', type: 'PDF' },
        ].map((report) => (
          <motion.div
            key={report.title}
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
          >
            <div>
              <div className="font-medium text-slate-800">{report.title}</div>
              <div className="text-sm text-slate-600">{report.date}</div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded">
                {report.type}
              </span>
              <button className="text-primary-600 hover:text-primary-700">
                Download
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
)

const SettingsView = () => (
  <div className="chart-container">
    <h3 className="text-lg font-semibold text-slate-800 mb-6">
      Dashboard Settings
    </h3>
    <div className="space-y-6">
      <div className="text-center text-slate-500">
        Settings panel coming soon...
      </div>
    </div>
  </div>
)

export default Dashboard