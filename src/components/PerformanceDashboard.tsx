import { useState, useRef, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import { PERFORMANCE_DATA, AGE_GROUP_BENCHMARKS, performanceStats } from '../data';
import { usePerformance } from '../PerformanceContext';
import { motion, AnimatePresence } from 'motion/react';
import { Info, User, Users, Download, Loader2, Save, MessageSquare, Target, Trophy } from 'lucide-react';
import jsPDF from 'jspdf';
import { domToCanvas } from 'modern-screenshot';

export default function PerformanceDashboard() {
  const { stats } = usePerformance();
  const [selectedCategory, setSelectedCategory] = useState<'5-10' | '11-14' | '15-18'>('11-14');
  const [isGenerating, setIsGenerating] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);

  // Load feedback from session storage on mount
  useEffect(() => {
    const savedFeedback = localStorage.getItem('athlete_feedback');
    if (savedFeedback) setFeedback(savedFeedback);
  }, []);

  const saveFeedback = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      localStorage.setItem('athlete_feedback', feedback);
      setIsSaving(false);
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 3000);
    }, 800);
  };
  
  const activeStats = (stats && stats[selectedCategory]) || (stats && stats['11-14']) || performanceStats['11-14'];
  const latestHistory = activeStats?.history?.[activeStats.history.length - 1] || { month: 'Jun', value: 80 };
  const benchmark = AGE_GROUP_BENCHMARKS.find(b => b.category === selectedCategory) || AGE_GROUP_BENCHMARKS[1];

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await domToCanvas(dashboardRef.current, {
        scale: 2, // Higher resolution
        backgroundColor: '#FBF9F6' // Match the bg-ivory color
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2] // Scale back down for correct proportions
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`Athlete_Performance_Summary_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Map athletic metrics to radar subjects
  const comparisonData = activeStats.athletic.map(metric => ({
    subject: metric.label,
    player: metric.value,
    average: benchmark[metric.label.toLowerCase().includes('vertical') ? 'vertical' : 
                     metric.label.toLowerCase().includes('speed') ? 'speed' : 'accuracy'] || 70,
    fullMark: 100
  }));

  return (
    <div className="space-y-12">
      {/* Header with Download Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 bg-white p-4 sm:p-8 lg:p-10 rounded-[1.5rem] lg:rounded-[3rem] border border-espresso/5 shadow-xl" role="banner" aria-label="Performance Dashboard Header">
        <div>
          <h2 className="text-2xl sm:text-4xl font-condensed font-black text-espresso uppercase tracking-tight leading-none mb-2 sm:mb-4">Athlete Analytics</h2>
          <p className="text-espresso/60 text-xs font-bold uppercase tracking-[0.2em]">High-performance tracking portal</p>
        </div>
        <button
          onClick={downloadPDF}
          disabled={isGenerating}
          aria-label="Download performance report as PDF"
          className="w-full sm:w-auto flex items-center justify-center gap-3 bg-espresso text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-orange transition-all hover:shadow-xl disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" aria-hidden="true" />
              Export Report
            </>
          )}
        </button>
      </div>

      <div ref={dashboardRef} className="space-y-12">
        {/* Benchmark Comparison Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-5 sm:p-8 lg:p-16 rounded-[2rem] lg:rounded-[4rem] border border-espresso/5 shadow-2xl overflow-hidden"
        role="region"
        aria-labelledby="comparison-heading"
      >
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 items-start">
          <div className="lg:w-1/3 space-y-6 lg:space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-8 h-px bg-orange" />
                <div className="text-orange font-black text-[10px] tracking-[0.4em] uppercase">Metric Benchmark</div>
              </div>
              <h3 id="comparison-heading" className="text-2xl sm:text-4xl lg:text-5xl font-condensed font-black text-espresso uppercase tracking-tighter leading-none mb-4 sm:mb-8">Performance Radar.</h3>
              <p className="text-espresso/60 text-sm font-medium leading-relaxed mb-6 sm:mb-10">
                Strategic comparison against elite standards in your age bracket. Precision metrics derived from active coaching evaluations.
              </p>
            </div>

            <div className="space-y-5">
              <label id="age-group-label" className="text-[10px] font-black uppercase tracking-[0.3em] text-espresso/40 block">Select Competitive Bracket</label>
              <div className="flex flex-wrap gap-3" role="group" aria-labelledby="age-group-label">
                {AGE_GROUP_BENCHMARKS.map((b) => (
                  <button
                    key={b.category}
                    onClick={() => setSelectedCategory(b.category)}
                    aria-pressed={selectedCategory === b.category}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      selectedCategory === b.category 
                        ? 'bg-espresso text-white shadow-xl scale-105' 
                        : 'bg-ivory text-espresso/40 hover:text-espresso border border-espresso/5'
                    }`}
                  >
                    U-{b.category.split('-')[1]}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-10 border-t border-espresso/5">
              <div className="flex flex-col gap-4 text-[10px] font-black uppercase tracking-widest text-espresso/60">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  <span>Your Current Rating</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-espresso/10" />
                  <span>GCP Benchmark</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-2/3">
            {/* Mobile swipe hint */}
            <div className="flex items-center justify-between sm:hidden mb-2 text-espresso/50 text-[10px] font-black uppercase tracking-wider px-1">
              <span>Radar Benchmark</span>
              <span className="text-orange">Swipe sideways ↔</span>
            </div>

            <div className="overflow-x-auto pb-2 -mx-2 px-2 sm:overflow-x-visible sm:pb-0 sm:mx-0 sm:px-0">
              <div className="min-w-[420px] sm:min-w-0 w-full h-[320px] sm:h-[400px] lg:h-[500px] bg-ivory rounded-[2rem] lg:rounded-[3rem] p-4 sm:p-8 lg:p-12 relative border border-espresso/5" role="img" aria-label="Performance Radar Chart">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={comparisonData}>
                    <PolarGrid stroke="rgba(0,0,0,0.05)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#1d1d1b', fontSize: 10, fontWeight: 900, textAnchor: 'middle' }}
                    />
                    <Radar
                      name="Peer Average"
                      dataKey="average"
                      stroke="#1d1d1b"
                      fill="#1d1d1b"
                      fillOpacity={0.05}
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                    <Radar
                      name="Your Performance"
                      dataKey="player"
                      stroke="#D62828"
                      fill="#D62828"
                      fillOpacity={0.3}
                      strokeWidth={4}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
                
                {/* Elite Badge — hidden on small screens where it overflows the card */}
                <div className="hidden sm:block absolute top-6 right-6 lg:top-10 lg:right-10">
                  <div className="bg-espresso text-white px-4 sm:px-6 py-2 sm:py-3 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange rounded-xl flex items-center justify-center text-white" aria-hidden="true">
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <div className="text-[8px] font-black uppercase tracking-[0.3em] text-white/40">Elite Status</div>
                      <div className="text-sm font-black tracking-widest">TOP 15%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-8" role="list" aria-label="Performance highlights">
        {[
          { label: 'Vertical Mastery', value: `+${activeStats.athletic[0].value}"`, color: 'text-orange', suffix: 'current' },
          { label: 'Skill Precision', value: `${activeStats.skills[0].value}%`, color: 'text-orange', suffix: 'accuracy' },
          { label: 'Success Rating', value: `${latestHistory.value}%`, color: 'text-orange', suffix: 'progression' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 sm:p-8 lg:p-10 rounded-[1.5rem] lg:rounded-[3rem] border border-espresso/5 shadow-xl group hover:border-orange/20 transition-all"
            role="listitem"
          >
            <p className="text-espresso/40 text-[10px] font-black uppercase tracking-[0.3em] mb-2 sm:mb-4">{item.label}</p>
            <div className="flex items-baseline gap-2 sm:gap-3">
              <p className={`text-3xl sm:text-5xl font-condensed font-black ${item.color}`}>{item.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-espresso/20 group-hover:text-orange/40 transition-colors">{item.suffix}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Skill Progression Line Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-ivory/10 overflow-hidden"
          role="region"
          aria-labelledby="skill-growth-heading"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 id="skill-growth-heading" className="text-xl font-serif text-espresso">Skill Growth</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Past 6 Months</span>
          </div>
          <div className="overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0">
            <div className="h-[260px] sm:h-[300px] min-w-[320px] sm:min-w-0 w-full" role="img" aria-label="Line chart showing skill growth in vertical jump and accuracy over the past 6 months.">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeStats.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8c8581', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8c8581', fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                    itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                  />
                  <Legend iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#f97316" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                    name="Avg Performance (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        {/* Milestones Area Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 sm:p-8 rounded-3xl shadow-sm border border-ivory/10 overflow-hidden"
          role="region"
          aria-labelledby="wins-heading"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 id="wins-heading" className="text-xl font-serif text-espresso">Your Wins</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-espresso/70">Total Progress</span>
          </div>
          <div className="overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0">
            <div className="h-[260px] sm:h-[300px] min-w-[320px] sm:min-w-0 w-full" role="img" aria-label="Area chart showing total milestones reached over time.">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activeStats.history}>
                  <defs>
                    <linearGradient id="colorMilestone" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8c8581', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#8c8581', fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#fbbf24" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorMilestone)" 
                    name="Progress Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Speed Metrics Bar Chart */}
        <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-espresso p-5 sm:p-8 lg:p-10 rounded-[1.5rem] lg:rounded-[3rem] text-white overflow-hidden relative"
        role="region"
        aria-labelledby="speed-heading"
      >
        <div className="relative z-10">
          <div className="mb-6 sm:mb-12">
            <h3 id="speed-heading" className="text-xl sm:text-2xl font-serif mb-2 text-yellow">Speed & Quickness</h3>
            <p className="text-white/70 text-sm font-medium uppercase tracking-[0.2em]">How fast you move on court</p>
          </div>
          <div className="overflow-x-auto pb-1 sm:overflow-x-visible sm:pb-0">
            <div className="h-[240px] sm:h-[350px] min-w-[320px] sm:min-w-0 w-full" role="img" aria-label="Bar chart showing speed rating over the past few months.">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeStats.history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#1a1a1a', borderRadius: '16px', border: 'rgba(255,255,255,0.1) 1px solid' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#F9BC00" 
                    radius={[10, 10, 0, 0]} 
                    barSize={40}
                    name="Speed Rating"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Abstract Decor */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange/10 rounded-full blur-[100px] -mr-48 -mt-48" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-yellow/5 rounded-full blur-[80px] -ml-32 -mb-32" aria-hidden="true" />
      </motion.div>

      {/* Coach's Feedback & Personalized Drills */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-ivory p-5 sm:p-8 lg:p-12 rounded-[1.5rem] lg:rounded-[3rem] border border-espresso/5 shadow-sm overflow-hidden relative"
        role="region"
        aria-labelledby="coach-feedback-heading"
      >
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 relative z-10">
          <div className="lg:w-1/3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange/10 rounded-full flex items-center justify-center text-orange" aria-hidden="true">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 id="coach-feedback-heading" className="text-2xl font-serif text-espresso">Coach's Corner</h3>
            </div>
            <p className="text-espresso/70 text-sm leading-relaxed mb-6">
              Personalized feedback, areas for improvement, and specific drills to focus on this week. 
              These notes will be included in your downloadable report.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-xs font-black text-espresso/40 uppercase tracking-widest">
                <Target className="w-4 h-4" aria-hidden="true" />
                Weekly Focus
              </div>
              <ul className="space-y-2" aria-label="Specific areas for weekly focus">
                <li className="flex items-center gap-2 text-xs font-bold text-espresso/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange" aria-hidden="true" />
                  Reactive Agility Drills
                </li>
                <li className="flex items-center gap-2 text-xs font-bold text-espresso/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-crimson" aria-hidden="true" />
                  Second-step Explosiveness
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:w-2/3">
            <div className="relative">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Enter athlete feedback and training drills here..."
                aria-label="Athlete feedback and training drills"
                className="w-full h-64 bg-white p-8 rounded-[2rem] border border-espresso/10 focus:border-orange focus:ring-4 focus:ring-orange/5 transition-all outline-none text-espresso font-medium leading-relaxed resize-none shadow-inner"
              />
              
              <div className="absolute bottom-6 right-6 flex items-center gap-4">
                <AnimatePresence>
                  {showSaveToast && (
                    <motion.span
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-[10px] font-black text-green-600 uppercase tracking-widest bg-green-50 px-4 py-2 rounded-full border border-green-100"
                      role="status"
                    >
                      Saved to session
                    </motion.span>
                  )}
                </AnimatePresence>
                
                <button
                  onClick={saveFeedback}
                  disabled={isSaving}
                  aria-label="Save current feedback notes"
                  className="flex items-center gap-3 bg-espresso text-white px-8 py-3 rounded-full font-bold text-xs hover:bg-orange transition-all hover:scale-105 shadow-xl disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Save className="w-3 h-3" aria-hidden="true" />
                  )}
                  Save Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange/5 rounded-full -mr-16 -mt-16 blur-3xl" aria-hidden="true" />
      </motion.div>
    </div>
    </div>
  );
}
