import React from 'react';
import { NutritionAnalysis, Ingredient } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Info, AlertTriangle, Leaf, PieChart as PieIcon, Flame, Scale, ChevronRight } from 'lucide-react';

interface AnalysisResultProps {
  data: NutritionAnalysis;
  imagePreview: string | null;
}

// Updated color palette to match requirements
// Green (Healthy), Orange (Warm/Warning), Red (Accent)
const PIE_COLORS = ['#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data, imagePreview }) => {
  
  // Calculate max calorie contribution for relative bar sizing
  const maxCalorieItem = Math.max(...data.ingredients.map(i => i.calories));
  const totalCal = data.totalCalories;

  const getPercentage = (cals: number) => Math.round((cals / totalCal) * 100);

  const getBarColor = (cals: number) => {
    const pct = getPercentage(cals);
    if (pct > 40) return 'bg-orange-500'; // High density
    if (pct > 20) return 'bg-yellow-400'; // Medium
    return 'bg-green-500'; // Healthy range
  };

  return (
    <div className="w-full animate-fade-in space-y-8">
      
      {/* Top Hero Section: Split Layout */}
      <div className="grid md:grid-cols-12 gap-6 md:gap-8">
        
        {/* Left: Food Image */}
        {imagePreview && (
          <div className="md:col-span-4 lg:col-span-5 h-64 md:h-auto min-h-[300px] relative rounded-3xl overflow-hidden shadow-xl shadow-gray-200 group">
            <img 
              src={imagePreview} 
              alt="Analyzed Food" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
            <div className="absolute bottom-4 left-4 right-4">
               <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white text-xs font-medium mb-2">
                 Analyzed Image
               </span>
            </div>
          </div>
        )}

        {/* Right: Key Stats */}
        <div className="md:col-span-8 lg:col-span-7 flex flex-col gap-6">
            
            {/* Header Text */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 leading-tight">
                {data.foodName}
              </h2>
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wide">AI Estimate</span>
                <span>•</span>
                <span>{data.ingredients.length} Ingredients identified</span>
              </div>
            </div>

            {/* Main Metric Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* Total Calories - Green Gradient Card */}
              <div className="col-span-2 sm:col-span-1 p-6 rounded-3xl bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Flame size={80} />
                </div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Energy</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">{data.totalCalories}</span>
                  <span className="text-lg font-medium opacity-80">kcal</span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm">
                  <Info size={12} />
                  <span>Estimated Intake</span>
                </div>
              </div>

              {/* Portion Size - White Card */}
              <div className="col-span-2 sm:col-span-1 p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex flex-col justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                            <Scale size={18} />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">Portion Size</p>
                    </div>
                    <p className="text-xl font-bold text-gray-800 leading-snug">
                        {data.portionSize}
                    </p>
                </div>
                <div className="mt-3 text-xs text-gray-400 italic leading-relaxed">
                   Assumptions: {data.assumptions}
                </div>
              </div>
            </div>

            {/* Simple Explanation */}
            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 text-gray-600 text-sm leading-relaxed flex gap-3">
              <Info className="shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
              <p>{data.simpleExplanation}</p>
            </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Ingredient Breakdown List */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-green-500 rounded-full block"></span>
            Calorie Breakdown
          </h3>
          
          <div className="space-y-6">
            {data.ingredients.sort((a,b) => b.calories - a.calories).map((ing, idx) => (
              <div key={idx} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <p className="text-base font-semibold text-gray-900 capitalize">{ing.name}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">{ing.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">{ing.calories} <span className="text-xs font-normal text-gray-400">kcal</span></p>
                    <p className="text-xs font-semibold text-gray-400">{getPercentage(ing.calories)}%</p>
                  </div>
                </div>
                {/* Progress Bar Visual */}
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getBarColor(ing.calories)}`}
                    style={{ width: `${(ing.calories / totalCal) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total</span>
            <span className="text-2xl font-extrabold text-green-600">{data.totalCalories} kcal</span>
          </div>
        </div>

        {/* Charts & Health Tips */}
        <div className="space-y-6">
            
            {/* Chart Card */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-[400px]">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <PieIcon className="w-5 h-5 text-gray-400" />
                    Distribution
                </h3>
                <div className="flex-grow">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data.ingredients}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="calories"
                            stroke="none"
                        >
                        {data.ingredients.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => [`${value} kcal`, 'Energy']}
                            contentStyle={{ 
                                backgroundColor: '#fff', 
                                borderRadius: '12px', 
                                border: '1px solid #f3f4f6', 
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' 
                            }}
                            itemStyle={{ color: '#374151', fontWeight: 600 }}
                        />
                        <Legend 
                            verticalAlign="bottom" 
                            height={36} 
                            iconType="circle" 
                            iconSize={8}
                            formatter={(value) => <span className="text-xs text-gray-500 font-medium ml-1">{value}</span>}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Health Tips Card */}
            {data.healthyTips && data.healthyTips.length > 0 && (
                <div className="bg-green-50 p-6 md:p-8 rounded-3xl border border-green-100">
                    <div className="flex items-center gap-2 mb-4 text-green-700 font-bold text-lg">
                        <Leaf className="w-5 h-5" />
                        <span>Nutritionist Tips</span>
                    </div>
                    <ul className="space-y-3">
                        {data.healthyTips.map((tip, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-green-800 leading-relaxed">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-center justify-center gap-2 p-4 text-gray-400 text-xs text-center max-w-2xl mx-auto">
        <AlertTriangle className="w-4 h-4 shrink-0" />
        <p>{data.disclaimer}</p>
      </div>
    </div>
  );
};

export default AnalysisResult;