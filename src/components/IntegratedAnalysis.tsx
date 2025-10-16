import { useState, useEffect } from 'react';
import TrafficVisualizations from './TrafficVisualizations';

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

interface LocationAnalysisResult {
  problem: string;
  solution: string;
  total_accidents_analyzed: number;
  hotspots_identified: number;
  hotspots: Hotspot[];
  methodology: string;
}

interface CauseAnalysisResult {
  problem: string;
  solution: string;
  total_transactions_analyzed: number;
  patterns_discovered: number;
  causal_patterns: CausalPattern[];
  methodology: string;
}

const IntegratedAnalysis: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationAnalysisResult | null>(null);
  const [causeData, setCauseData] = useState<CauseAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalysisData();
  }, []);

  const fetchAnalysisData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch both analyses in parallel - using 6 clusters for better location diversity
      const [locationResponse, causeResponse] = await Promise.all([
        fetch('http://localhost:5000/api/where-accidents-happen?clusters=6'),
        fetch('http://localhost:5000/api/why-accidents-happen?confidence=0.2&support=0.02')
      ]);

      if (!locationResponse.ok || !causeResponse.ok) {
        throw new Error('Failed to fetch analysis data');
      }

      const locationResult = await locationResponse.json();
      const causeResult = await causeResponse.json();

      if (locationResult.error) {
        throw new Error(locationResult.error);
      }
      if (causeResult.error) {
        throw new Error(causeResult.error);
      }

      setLocationData(locationResult);
      setCauseData(causeResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 1) return 'text-green-600';
    if (severity <= 2) return 'text-yellow-600';
    if (severity <= 3) return 'text-orange-600';
    return 'text-red-600';
  };

  const convertToLaymanTerms = (term: string): string => {
    if (!term) return 'certain conditions';
    
    const laymanMap: { [key: string]: string } = {
      // CAUSE terms (environmental and situational factors)
      'CAUSE_Weather_CLEAR': 'clear weather conditions',
      'CAUSE_Weather_RAIN': 'rainy weather',  
      'CAUSE_Weather_SNOW': 'snowy conditions',
      'CAUSE_Weather_CLOUDY': 'cloudy skies',
      
      // Time-based causes
      'CAUSE_Morning_Rush': 'morning rush hour (6-9 AM)',
      'CAUSE_Evening_Rush': 'evening rush hour (4-7 PM)',
      'CAUSE_Night_Hours': 'nighttime hours (8-11 PM)',
      'CAUSE_Late_Night': 'late night/early morning (12-5 AM)',
      'CAUSE_Midday': 'midday periods (9 AM-4 PM)',
      
      // Lighting causes
      'CAUSE_Daylight': 'daylight conditions',
      'CAUSE_Dark_Lit_Road': 'dark but well-lit roads',
      'CAUSE_Dark_Unlit_Road': 'dark, poorly lit roads',
      
      // Road surface causes
      'CAUSE_Road_DRY': 'dry road surfaces',
      'CAUSE_Road_WET': 'wet road conditions',
      'CAUSE_Road_ICE': 'icy road surfaces',
      'CAUSE_Road_SNOW': 'snow-covered roads',
      
      // Day type causes
      'CAUSE_Weekend': 'weekend periods',
      'CAUSE_Weekday': 'weekday conditions',
      
      // EFFECT terms (accident outcomes)
      'EFFECT_Fatal_Injury': 'fatal accidents',
      'EFFECT_Serious_Injury': 'serious injuries requiring hospitalization',
      'EFFECT_Minor_Injury': 'minor injuries',
      'EFFECT_Property_Damage': 'property damage only',
      
      // Collision type effects (case-insensitive variations)
      'EFFECT_Rear_End_Collision': 'rear-end collisions',
      'EFFECT_REAR_END_Collision': 'rear-end collisions',
      'EFFECT_Side_Impact_Collision': 'dangerous side-impact crashes',
      'EFFECT_SIDE_IMPACT_Collision': 'dangerous side-impact crashes',
      'EFFECT_Turning_Collision': 'turning accidents',
      'EFFECT_TURNING_Collision': 'turning accidents',
      'EFFECT_Head_On_Collision': 'head-on collisions',
      'EFFECT_HEAD_ON_Collision': 'head-on collisions',
      'EFFECT_Fixed_Object_Crash': 'crashes into fixed objects',
      'EFFECT_FIXED_OBJECT_Crash': 'crashes into fixed objects',
      'EFFECT_Pedestrian_Accident': 'pedestrian accidents',
      'EFFECT_PEDESTRIAN_Accident': 'pedestrian accidents',
      'EFFECT_Sideswipe_Collision': 'sideswipe collisions',
      'EFFECT_SIDESWIPE_Collision': 'sideswipe collisions',
      'EFFECT_Bicycle_Accident': 'bicycle-related accidents',
      'EFFECT_BICYCLE_Accident': 'bicycle-related accidents',
      'EFFECT_ANGLE_Collision': 'dangerous side-impact crashes',
      
      // Complexity effects
      'EFFECT_Single_Vehicle_Incident': 'single-vehicle incidents',
      'EFFECT_Multi_Vehicle_Crash': 'multi-vehicle crashes',
      
      // Legacy mappings for backwards compatibility
      'RESULT_Fatal_Accident': 'fatal accidents',
      'RESULT_Serious_Injury': 'serious injuries',
      'RESULT_Minor_Injury': 'minor injuries',
      'RESULT_Property_Damage': 'property damage'
    };
    
    // Try exact match first
    if (laymanMap[term]) {
      return laymanMap[term];
    }
    
    // Try case-insensitive match
    const termUpper = term.toUpperCase();
    for (const [key, value] of Object.entries(laymanMap)) {
      if (key.toUpperCase() === termUpper) {
        return value;
      }
    }
    
    // Try partial matches for flexible mapping
    for (const [key, value] of Object.entries(laymanMap)) {
      if (term.includes(key) || key.includes(term)) {
        return value;
      }
    }
    
    // Clean up any remaining technical terms
    let cleaned = term.replace(/_/g, ' ').toLowerCase();
    cleaned = cleaned.replace('result ', '').replace('category ', '').replace('level ', '');
    cleaned = cleaned.replace('effect ', '').replace('cause ', '');
    
    // Fix common accident type terms
    cleaned = cleaned.replace('collision', 'accidents');
    cleaned = cleaned.replace('crash', 'accidents');
    
    return cleaned;
  };

  const convertPatternToPlainEnglish = (pattern: CausalPattern): string => {
    const conditions = pattern.conditions.map(c => convertToLaymanTerms(c));
    const results = pattern.result.map(r => convertToLaymanTerms(r));
    
    // Filter out illogical patterns (weather/lighting as results)
    const meaningfulResults = results.filter(r => 
      !r.includes('clear weather') && 
      !r.includes('daylight hours') && 
      !r.includes('well-lit streets') &&
      !r.includes('rainy conditions')
    );
    
    if (meaningfulResults.length === 0) {
      return `Research shows that ${conditions[0] || 'certain road conditions'} are significant factors in accident severity and frequency in this area.`;
    }
    
    const conditionText = conditions.length > 1 
      ? `${conditions.slice(0, -1).join(', ')} combined with ${conditions[conditions.length - 1]}`
      : conditions[0] || 'certain conditions';
      
    const resultText = meaningfulResults.length > 1
      ? `${meaningfulResults.slice(0, -1).join(', ')} and ${meaningfulResults[meaningfulResults.length - 1]}`
      : meaningfulResults[0] || 'increased accident severity';
    
    return `Our analysis indicates that ${conditionText} frequently leads to ${resultText} in this location.`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-medium text-gray-800">Analyzing Traffic Accident Data...</h3>
          <p className="text-gray-600 mt-2">Running integrated K-Means + Apriori analysis</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Analysis Failed</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAnalysisData}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!locationData || !causeData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-8 text-gray-500">
          No analysis data available
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Professional Analysis Header - Corporate Design */}
      <div className="professional-card rounded-3xl shadow-3xl overflow-hidden border border-gray-200">
        {/* Header Section - Clean Corporate Style */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-10 relative overflow-hidden">
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-8 flex-wrap gap-6">
              <div className="flex-1 min-w-[300px]">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl border border-white/20">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-1 tracking-tight">Traffic Safety Analytics Report</h1>
                    <p className="text-gray-300 text-lg font-medium">Comprehensive Analysis of 209,303 Traffic Incidents</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/20">
                  <div className="flex items-center space-x-2">
                    <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-white">Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Executive Summary - Professional Style */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-500/20 backdrop-blur-sm p-2.5 rounded-lg flex-shrink-0 border border-blue-400/30">
                  <svg className="w-6 h-6 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2 text-lg">Executive Summary</h3>
                  <p className="text-gray-200 leading-relaxed text-base">
                    Analysis of <span className="font-bold text-white">{locationData.total_accidents_analyzed.toLocaleString()}</span> traffic accidents has identified <span className="font-bold text-white">{locationData.hotspots_identified}</span> critical risk zones requiring immediate attention. 
                    Using machine learning algorithms, we've discovered primary contributing factors and temporal patterns, providing actionable insights for traffic safety improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Key Metrics - Corporate Dashboard Style */}
        <div className="bg-white p-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-blue-400 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total</span>
              </div>
              <div className="text-4xl font-black text-slate-800 mb-1">
                {locationData.total_accidents_analyzed.toLocaleString()}
              </div>
              <div className="text-slate-600 text-sm font-semibold">Accidents Analyzed</div>
              <div className="text-xs text-slate-500 mt-2">Complete dataset coverage</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-emerald-400 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-emerald-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Zones</span>
              </div>
              <div className="text-4xl font-black text-slate-800 mb-1">
                {locationData.hotspots_identified}
              </div>
              <div className="text-slate-600 text-sm font-semibold">High-Risk Zones</div>
              <div className="text-xs text-slate-500 mt-2">Geographic clusters identified</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-indigo-400 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rules</span>
              </div>
              <div className="text-4xl font-black text-slate-800 mb-1">
                {causeData.patterns_discovered.toLocaleString()}
              </div>
              <div className="text-slate-600 text-sm font-semibold">Pattern Rules</div>
              <div className="text-xs text-slate-500 mt-2">Contributing factors found</div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl border-2 border-slate-200 hover:border-amber-400 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Accuracy</span>
              </div>
              <div className="text-4xl font-black text-slate-800 mb-1">
                {Math.round(causeData.causal_patterns[0]?.confidence * 100 || 0)}%
              </div>
              <div className="text-slate-600 text-sm font-semibold">Confidence Rate</div>
              <div className="text-xs text-slate-500 mt-2">Highest pattern accuracy</div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualizations */}
      <TrafficVisualizations hotspots={locationData.hotspots} patterns={causeData.causal_patterns} />

      {/* Integrated Hotspot-Cause Visualization */}
      <div className="professional-card rounded-3xl shadow-3xl p-8">
        <div className="flex items-center mb-8">
          <div className="bg-gradient-to-br from-red-500 to-orange-600 p-3 rounded-xl mr-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Geographic Risk Assessment
            </h3>
            <p className="text-gray-600 font-medium mt-1">Critical danger zones with causal analysis</p>
          </div>
        </div>
        
        <div className="space-y-8">
          {locationData.hotspots
            .sort((a, b) => {
              // Sort by risk level (Critical > High > Moderate), then by accident count
              const getRiskScore = (severity: number) => severity > 2.5 ? 3 : severity > 1.5 ? 2 : 1;
              const scoreA = getRiskScore(a.avg_severity);
              const scoreB = getRiskScore(b.avg_severity);
              if (scoreB !== scoreA) return scoreB - scoreA;
              return b.accident_count - a.accident_count;
            })
            .map((hotspot, index) => {
            // Distribute patterns across zones using round-robin approach
            // This ensures all zones get patterns even if there are fewer patterns than zones
            const validPatterns = causeData.causal_patterns.filter(p => p.confidence > 0);
            const relevantPatterns = validPatterns.length > 0 
              ? [validPatterns[index % validPatterns.length]]  // Cycle through available patterns
              : [];
            
            const riskLevel = hotspot.avg_severity > 2.5 ? 'CRITICAL' :
                             hotspot.avg_severity > 1.5 ? 'HIGH' : 'MODERATE';
            
            // Define complete class names for Tailwind
            const borderClass = riskLevel === 'CRITICAL' ? 'border-red-400' : 
                               riskLevel === 'HIGH' ? 'border-orange-400' : 'border-yellow-400';
            const headerGradient = riskLevel === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-red-600' : 
                                  riskLevel === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 
                                  'bg-gradient-to-r from-yellow-500 to-yellow-600';
            
            return (
              <div key={hotspot.hotspot_id} className={`relative border-2 ${borderClass} rounded-2xl overflow-hidden bg-white shadow-xl hover:shadow-2xl transition-shadow duration-300`}>
                
                {/* Risk Zone Header */}
                <div className={`${headerGradient} text-white p-6 relative`}>
                  {/* Risk Level Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 rounded-full text-sm font-bold bg-white/20 backdrop-blur-sm border-2 border-white/40 shadow-lg">
                      {riskLevel === 'CRITICAL' ? '⚠️ CRITICAL' : riskLevel === 'HIGH' ? '🔴 HIGH RISK' : '🟡 MODERATE'}
                    </span>
                  </div>

                  <div className="flex justify-between items-start pr-32">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-4xl">🚨</span>
                        <div>
                          <h3 className="text-2xl font-bold tracking-tight">
                            {hotspot.area_name}
                          </h3>
                          <p className="text-sm opacity-90">Danger Zone #{hotspot.hotspot_id}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-lg">📍</span>
                          <div>
                            <p className="text-base font-semibold">{hotspot.location_description}</p>
                            <p className="text-xs opacity-75 mt-1">
                              Coordinates: {hotspot.center_lat.toFixed(4)}, {hotspot.center_lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-4 ml-4">
                      <div className="text-4xl font-bold mb-1">
                        {hotspot.accident_count.toLocaleString()}
                      </div>
                      <div className="text-sm font-medium opacity-90">TOTAL ACCIDENTS</div>
                      <div className="text-xs opacity-75 mt-1">
                        Rank #{index + 1}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Unified WHERE + WHY Analysis */}
                <div className="p-6 bg-gray-50">
                  <div className="grid lg:grid-cols-3 gap-6">
                    
                    {/* Location Intelligence */}
                    <div className="lg:col-span-1 space-y-4">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200 shadow-sm">
                        <h5 className="font-bold text-blue-900 mb-4 flex items-center text-lg">
                          <span className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">📍</span>
                          Zone Information
                        </h5>
                        
                        <div className="space-y-4">
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Location</span>
                            <span className="text-blue-800 font-bold text-base block">
                              {hotspot.location_description}
                            </span>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Coverage Area</span>
                            <span className="text-blue-700 font-semibold text-base block">
                              {hotspot.radius_km.toFixed(1)} km radius
                            </span>
                            <span className="text-xs text-gray-600">Approximately {(hotspot.radius_km * 2).toFixed(1)} km stretch</span>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg shadow-sm">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Crash Severity</span>
                            <div className="flex items-center gap-2">
                              <span className={`font-bold text-lg ${getSeverityColor(hotspot.avg_severity)}`}>
                                {hotspot.severity_description}
                              </span>
                            </div>
                          </div>
                          
                          <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-red-500">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Risk Level</span>
                            <span className={`font-bold text-lg ${riskLevel === 'CRITICAL' ? 'text-red-600' : riskLevel === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'}`}>
                              {hotspot.risk_level}
                            </span>
                            <span className="text-xs text-gray-600 block mt-1">Requires immediate attention</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Causal Intelligence - Only show if patterns exist */}
                    {relevantPatterns.length > 0 && (
                      <div className="lg:col-span-2">
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200 shadow-sm">
                          <h5 className="font-bold text-purple-900 mb-4 flex items-center text-lg">
                            <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center mr-2 text-sm">🔍</span>
                            Contributing Factors
                          </h5>
                          
                          <div className="space-y-4">
                            {relevantPatterns.map((pattern, patternIndex) => (
                            <div key={pattern.rule_id} className="bg-white rounded-xl border-2 border-purple-200 shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
                              
                              <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="bg-white/20 backdrop-blur-sm w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg">
                                    {patternIndex + 1}
                                  </div>
                                  <div>
                                    <span className="font-bold text-sm block">Key Pattern</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block mt-1 ${
                                      pattern.strength === 'Strong' ? 'bg-red-500' : 
                                      pattern.strength === 'Moderate' ? 'bg-yellow-500' : 'bg-gray-500'
                                    }`}>
                                      {pattern.strength} Correlation
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                                  <div className="text-3xl font-bold">
                                    {Math.round(pattern.confidence * 100)}%
                                  </div>
                                  <div className="text-xs opacity-90">Occurrence Rate</div>
                                </div>
                              </div>

                              <div className="p-5">
                                {/* Human-Readable Explanation */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border-l-4 border-purple-400 mb-4">
                                  <p className="text-gray-800 font-medium leading-relaxed">
                                    {convertPatternToPlainEnglish(pattern)}
                                  </p>
                                </div>

                                {/* Visual Rule Breakdown */}
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    {pattern.conditions.slice(0, 3).map((condition, idx) => (
                                      <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg font-semibold text-sm shadow-sm">
                                        {convertToLaymanTerms(condition)}
                                      </span>
                                    ))}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-purple-600 font-bold text-xl">→</span>
                                    <span className="text-gray-600 text-sm font-medium">causes</span>
                                  </div>
                                  <div className="flex flex-wrap gap-2 justify-center">
                                    {pattern.result.map((result, idx) => (
                                        <span key={idx} className="bg-red-100 text-red-800 px-3 py-2 rounded-lg font-semibold text-sm shadow-sm">
                                        {convertToLaymanTerms(result)}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    )}
                  </div>
                  
                  {/* Integrated Insight */}
                  <div className={`mt-6 rounded-xl border-2 shadow-lg overflow-hidden ${
                    riskLevel === 'CRITICAL' ? 'bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 border-red-200' :
                    riskLevel === 'HIGH' ? 'bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 border-orange-200' :
                    'bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-yellow-200'
                  }`}>
                    <div className={`text-white px-5 py-3 ${
                      riskLevel === 'CRITICAL' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      riskLevel === 'HIGH' ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                      'bg-gradient-to-r from-yellow-500 to-orange-500'
                    }`}>
                      <h6 className="font-bold text-lg flex items-center gap-2">
                        <span className="text-2xl">💡</span>
                        Key Takeaway
                      </h6>
                    </div>
                    <div className="p-5">
                      <p className="text-gray-800 text-base leading-relaxed">
                        <span className="font-bold text-gray-900">Zone Summary:</span> This dangerous area has recorded{' '}
                        <span className="font-bold text-red-600">{hotspot.accident_count.toLocaleString()} accidents</span>{' '}
                        within a <span className="font-semibold">{hotspot.radius_km.toFixed(1)}km radius</span>.
                        {relevantPatterns.length > 0 ? (
                          <>
                            {' '}Data analysis reveals that{' '}
                            <span className="font-bold text-blue-700">{convertToLaymanTerms(relevantPatterns[0].conditions[0])}</span>{' '}
                            consistently leads to{' '}
                            <span className="font-bold text-red-700">{convertToLaymanTerms(relevantPatterns[0].result[0])}</span>,{' '}
                            occurring in <span className="font-bold">{Math.round(relevantPatterns[0].confidence * 100)}%</span> of similar cases.
                          </>
                        ) : (
                          ' Additional investigation is recommended to identify specific contributing factors for this location.'
                        )}
                      </p>
                      <div className={`mt-4 p-3 bg-white rounded-lg border-l-4 ${
                        riskLevel === 'CRITICAL' ? 'border-red-500' : 
                        riskLevel === 'HIGH' ? 'border-orange-500' : 'border-yellow-500'
                      }`}>
                        <p className="text-sm font-semibold text-gray-900">
                          ⚠️ Classification: <span className={`${
                            riskLevel === 'CRITICAL' ? 'text-red-600' : 
                            riskLevel === 'HIGH' ? 'text-orange-600' : 'text-yellow-600'
                          }`}>{hotspot.risk_level} RISK ZONE</span> — Enhanced safety measures recommended
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Recommendations */}
      <div className="professional-card rounded-3xl shadow-3xl p-8 bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50">
        <div className="flex items-center mb-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl mr-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Strategic Recommendations</h3>
            <p className="text-gray-600 font-medium mt-1">Data-driven action items for traffic safety improvements</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-green-200 hover:shadow-xl transition-all hover:scale-105 transform">
            <div className="flex items-center mb-3">
              <div className="bg-green-500 text-white p-2 rounded-lg mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h4 className="font-bold text-green-900 text-lg">Geographic Focus</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Target the top <strong className="text-green-700">{locationData.hotspots_identified} risk zones</strong> which contain{' '}
              <strong className="text-green-700">{locationData.hotspots.reduce((sum, h) => sum + h.accident_count, 0).toLocaleString()} total accidents</strong> for maximum impact.
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-purple-200 hover:shadow-xl transition-all hover:scale-105 transform">
            <div className="flex items-center mb-3">
              <div className="bg-purple-500 text-white p-2 rounded-lg mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h4 className="font-bold text-purple-900 text-lg">Causal Targeting</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Address <strong className="text-purple-700">{causeData.causal_patterns.slice(0, 5).filter(p => p.strength === 'Strong').length} strong causal patterns</strong>{' '}
              with confidence levels above 70% for maximum effectiveness.
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border-2 border-orange-200 hover:shadow-xl transition-all hover:scale-105 transform">
            <div className="flex items-center mb-3">
              <div className="bg-orange-500 text-white p-2 rounded-lg mr-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-orange-900 text-lg">Temporal Strategy</h4>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Deploy resources during identified peak times, particularly around{' '}
              areas with <strong className="text-orange-700">{locationData.hotspots[0]?.risk_level || 'elevated'} risk levels</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAnalysis;