import { motion } from 'framer-motion'
import { 
  ChartBarIcon, 
  CpuChipIcon, 
  EyeIcon, 
  ShieldCheckIcon,
  MapPinIcon,
  ClockIcon 
} from '@heroicons/react/24/outline'

const Features = () => {
  const features = [
    {
      icon: ChartBarIcon,
      title: 'Advanced Analytics',
      description: 'Deep dive into traffic patterns with comprehensive data analysis and interactive visualizations.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: CpuChipIcon,
      title: 'Machine Learning',
      description: 'Predict accident severity using Decision Trees, Naive Bayes, and clustering algorithms.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: EyeIcon,
      title: 'Pattern Recognition',
      description: 'Discover hidden patterns in accident data using association rule mining and clustering.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety Insights',
      description: 'Generate actionable insights to improve road safety and prevent future accidents.',
      color: 'from-red-500 to-red-600'
    },
    {
      icon: MapPinIcon,
      title: 'Location Analysis',
      description: 'Identify high-risk areas and intersections for targeted safety improvements.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: ClockIcon,
      title: 'Real-time Processing',
      description: 'Process and analyze traffic data in real-time for immediate insights and alerts.',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-primary-200/30 to-accent-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-tl from-accent-200/30 to-primary-200/30 rounded-full blur-3xl"></div>
      </div>

      <div className="section-container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-display font-bold mb-6">
            <span className="text-slate-800 dark:text-slate-200">Powerful Features for</span>
            <br />
            <span className="gradient-text">Traffic Safety Analysis</span>
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Leverage cutting-edge technology to analyze traffic patterns, predict accidents, 
            and generate insights that make Chicago roads safer for everyone.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                y: -10,
                transition: { duration: 0.2 }
              }}
              className="glass-card p-8 rounded-2xl group cursor-pointer"
            >
              <div className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-lg transition-shadow duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4 group-hover:text-primary-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
              
              <motion.div
                className={`w-0 h-1 bg-gradient-to-r ${feature.color} rounded-full mt-6 group-hover:w-full transition-all duration-500`}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-20 lg:mt-32"
        >
          <div className="glass-card p-8 lg:p-12 rounded-3xl">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              {[
                { number: '209K+', label: 'Accidents Analyzed', suffix: 'records' },
                { number: '99.8%', label: 'ML Accuracy', suffix: 'Random Forest' },
                { number: '5', label: 'Risk Clusters', suffix: 'identified' },
                { number: '24/7', label: 'Real-time Analysis', suffix: 'continuous' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="space-y-2"
                >
                  <div className="text-3xl lg:text-4xl font-bold gradient-text">
                    {stat.number}
                  </div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {stat.label}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">
                    {stat.suffix}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default Features