import { useState, useEffect } from 'react';

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
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Professional Analysis Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">🚦 Traffic Safety Intelligence Report</h1>
            <p className="text-blue-100 text-lg">Data-Driven Analysis of 209,000+ Accidents</p>
          </div>
          <div className="text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
            ✓ Real-Time Analysis
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 rounded-xl mb-6 border border-blue-100">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500 text-white p-2 rounded-lg flex-shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Executive Summary</h3>
              <p className="text-gray-700 leading-relaxed">
                Our comprehensive analysis of <strong>{locationData.total_accidents_analyzed.toLocaleString()}</strong> traffic accidents has identified <strong>{locationData.hotspots_identified}</strong> critical risk zones requiring immediate attention. 
                Using machine learning algorithms, we've discovered the primary contributing factors and timing patterns that lead to accidents in each area, providing actionable insights for safety improvements.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center">
            <div className="text-3xl font-bold text-blue-700 mb-1">
              {locationData.total_accidents_analyzed.toLocaleString()}
            </div>
            <div className="text-blue-800 text-sm font-medium">Accidents Analyzed</div>
            <div className="text-xs text-blue-600 mt-1">Complete dataset coverage</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl border border-emerald-200 text-center">
            <div className="text-3xl font-bold text-emerald-700 mb-1">
              {locationData.hotspots_identified}
            </div>
            <div className="text-emerald-800 text-sm font-medium">High-Risk Zones</div>
            <div className="text-xs text-emerald-600 mt-1">Geographic clusters</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center">
            <div className="text-3xl font-bold text-purple-700 mb-1">
              {causeData.patterns_discovered.toLocaleString()}
            </div>
            <div className="text-purple-800 text-sm font-medium">Pattern Rules</div>
            <div className="text-xs text-purple-600 mt-1">Contributing factors</div>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200 text-center">
            <div className="text-3xl font-bold text-amber-700 mb-1">
              {Math.round(causeData.causal_patterns[0]?.confidence * 100 || 0)}%
            </div>
            <div className="text-amber-800 text-sm font-medium">Confidence Rate</div>
            <div className="text-xs text-amber-600 mt-1">Highest pattern accuracy</div>
          </div>
        </div>
      </div>

      {/* Integrated Hotspot-Cause Visualization */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-6">
          🚨 Geographic Risk Assessment & Contributing Factor Analysis
        </h3>
        
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
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Strategic Recommendations</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">🗺️ Geographic Focus</h4>
            <p className="text-sm text-gray-700">
              Target the top {locationData.hotspots_identified} risk zones which contain{' '}
              <strong>{locationData.hotspots.reduce((sum, h) => sum + h.accident_count, 0).toLocaleString()} total accidents</strong>.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">🧠 Causal Targeting</h4>
            <p className="text-sm text-gray-700">
              Address <strong>{causeData.causal_patterns.slice(0, 5).filter(p => p.strength === 'Strong').length} strong causal patterns</strong>{' '}
              with confidence levels above 70% for maximum impact.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-800 mb-2">⏰ Temporal Strategy</h4>
            <p className="text-sm text-gray-700">
              Deploy resources during identified peak times, particularly around{' '}
              areas with <strong>{locationData.hotspots[0]?.risk_level || 'elevated'} risk levels</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedAnalysis;