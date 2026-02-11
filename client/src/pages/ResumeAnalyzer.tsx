import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, X, Flame, Target, Award, AlertTriangle,
  CheckCircle, Loader2, Sparkles, TrendingUp, Search
} from 'lucide-react';
import { aiService, ResumeAnalysisResult, ResumeRoastResult } from '../services/api/ai.service';

type Mode = 'idle' | 'analyzing' | 'roasting' | 'done';
type Tab = 'rank' | 'roast';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetField, setTargetField] = useState('Technology');
  const [mode, setMode] = useState<Mode>('idle');
  const [activeTab, setActiveTab] = useState<Tab>('rank');
  const [analysis, setAnalysis] = useState<ResumeAnalysisResult | null>(null);
  const [roast, setRoast] = useState<ResumeRoastResult | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf' && f.type !== 'text/plain') {
      setError('Please upload a PDF or TXT file');
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB');
      return;
    }
    setFile(f);
    setError('');
    setAnalysis(null);
    setRoast(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const createFormData = () => {
    const fd = new FormData();
    if (file) fd.append('resume', file);
    fd.append('targetRole', targetRole);
    fd.append('targetField', targetField);
    return fd;
  };

  const handleAnalyze = async () => {
    if (!file || !targetRole) {
      setError('Please upload a resume and enter a target role');
      return;
    }
    setMode('analyzing');
    setError('');
    try {
      const result = await aiService.analyzeResume(createFormData());
      setAnalysis(result);
      setActiveTab('rank');
      setMode('done');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Resume analysis failed. The AI service may be temporarily unavailable — please try again shortly.');
      setMode('idle');
    }
  };

  const handleRoast = async () => {
    if (!file || !targetRole) {
      setError('Please upload a resume and enter a target role');
      return;
    }
    setMode('roasting');
    setError('');
    try {
      const result = await aiService.roastResume(createFormData());
      setRoast(result);
      setActiveTab('roast');
      setMode('done');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Resume roast failed. The AI service may be temporarily unavailable — please try again shortly.');
      setMode('idle');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    if (score >= 40) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-600';
    if (score >= 60) return 'from-yellow-500 to-amber-600';
    if (score >= 40) return 'from-orange-500 to-red-500';
    return 'from-red-500 to-red-700';
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const stagger = {
    visible: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
            <FileText className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-100">AI Resume Analyzer</h1>
            <p className="text-sm text-gray-500">Powered by Groq AI</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Upload & Config */}
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="lg:col-span-1 space-y-4">
          <div className="card">
            <h3 className="font-semibold text-gray-100 mb-4">Setup</h3>

            {/* File Upload */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                file ? 'border-green-500/50 bg-green-500/10' : 'border-slate-600 hover:border-primary-400 hover:bg-primary-500/10'
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
              {file ? (
                <div className="flex items-center justify-center space-x-2">
                  <FileText size={20} className="text-green-600" />
                  <span className="text-sm font-medium text-green-400 truncate max-w-[180px]">{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setAnalysis(null); setRoast(null); }}>
                    <X size={16} className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Drop your resume (PDF/TXT)</p>
                  <p className="text-xs text-gray-400 mt-1">Max 5MB</p>
                </>
              )}
            </div>

            {/* Target Role */}
            <div className="mt-4">
              <label className="label">Target Role *</label>
              <input
                type="text"
                className="input"
                placeholder="e.g., Frontend Developer"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              />
            </div>

            {/* Target Field */}
            <div className="mt-3">
              <label className="label">Industry / Field</label>
              <select className="input" value={targetField} onChange={(e) => setTargetField(e.target.value)}>
                <option>Technology</option>
                <option>Finance</option>
                <option>Healthcare</option>
                <option>Marketing</option>
                <option>Data Science</option>
                <option>Product Management</option>
                <option>Consulting</option>
              </select>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              <button
                onClick={handleAnalyze}
                disabled={mode === 'analyzing' || mode === 'roasting'}
                className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {mode === 'analyzing' ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Analyzing...</span></>
                ) : (
                  <><Target size={18} /><span>Rank Resume (ATS Score)</span></>
                )}
              </button>
              <button
                onClick={handleRoast}
                disabled={mode === 'analyzing' || mode === 'roasting'}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {mode === 'roasting' ? (
                  <><Loader2 size={18} className="animate-spin" /><span>Roasting...</span></>
                ) : (
                  <><Flame size={18} /><span>Roast My Resume 🔥</span></>
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Results */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {mode === 'idle' && !analysis && !roast && (
              <motion.div
                key="placeholder"
                initial="hidden" animate="visible" exit="hidden" variants={fadeIn}
                className="card flex flex-col items-center justify-center py-20 text-center"
              >
                <Sparkles size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold text-gray-400">Awaiting Your Resume</h3>
                <p className="text-sm text-gray-400 mt-1">Upload a resume and click an action to get started</p>
              </motion.div>
            )}

            {(mode === 'analyzing' || mode === 'roasting') && (
              <motion.div
                key="loading"
                initial="hidden" animate="visible" exit="hidden" variants={fadeIn}
                className="card flex flex-col items-center justify-center py-20"
              >
                <Loader2 size={48} className="animate-spin text-primary-500 mb-4" />
                <p className="font-semibold text-lg">
                  {mode === 'analyzing' ? 'Analyzing Your Resume...' : 'Roasting Your Resume...'}
                </p>
                <p className="text-sm text-gray-500 mt-1">AI is processing. This may take a moment.</p>
              </motion.div>
            )}

            {mode === 'done' && (analysis || roast) && (
              <motion.div key="results" initial="hidden" animate="visible" variants={fadeIn}>
                {/* Tabs */}
                <div className="flex space-x-1 mb-4 bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('rank')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'rank' ? 'bg-slate-700 shadow-sm text-primary-400' : 'text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    <Target size={16} className="inline mr-1" /> Rank Analysis
                  </button>
                  <button
                    onClick={() => setActiveTab('roast')}
                    className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                      activeTab === 'roast' ? 'bg-slate-700 shadow-sm text-orange-400' : 'text-gray-400 hover:text-gray-100'
                    }`}
                  >
                    <Flame size={16} className="inline mr-1" /> Roast
                  </button>
                </div>

                {activeTab === 'rank' && analysis && (
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                    {/* Score Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div variants={fadeIn} className="card text-center">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Overall Score</p>
                        <div className={`text-4xl font-bold ${getScoreColor(analysis.overallScore)}`}>
                          {analysis.overallScore}
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${getScoreBg(analysis.overallScore)}`}
                               style={{ width: `${analysis.overallScore}%` }} />
                        </div>
                      </motion.div>
                      <motion.div variants={fadeIn} className="card text-center">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">ATS Score</p>
                        <div className={`text-4xl font-bold ${getScoreColor(analysis.atsScore)}`}>
                          {analysis.atsScore}
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                          <div className={`h-2 rounded-full bg-gradient-to-r ${getScoreBg(analysis.atsScore)}`}
                               style={{ width: `${analysis.atsScore}%` }} />
                        </div>
                      </motion.div>
                    </div>

                    {/* Summary */}
                    <motion.div variants={fadeIn} className="card">
                      <p className="text-sm text-gray-300">{analysis.summary}</p>
                      <span className="inline-block mt-2 text-xs font-medium bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                        {analysis.experienceLevel} level
                      </span>
                    </motion.div>

                    {/* Strengths */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-3">
                        <CheckCircle size={18} /> Strengths
                      </h4>
                      <ul className="space-y-2">
                        {analysis.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-0.5">✓</span> {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Weaknesses */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-red-400 flex items-center gap-2 mb-3">
                        <AlertTriangle size={18} /> Weaknesses
                      </h4>
                      <ul className="space-y-2">
                        {analysis.weaknesses.map((w, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-red-500 mt-0.5">✗</span> {w}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Missing Keywords */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-amber-400 flex items-center gap-2 mb-3">
                        <Search size={18} /> Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.missingKeywords.map((k, i) => (
                          <span key={i} className="px-3 py-1 bg-amber-500/10 text-amber-400 rounded-full text-sm border border-amber-500/30">
                            {k}
                          </span>
                        ))}
                      </div>
                    </motion.div>

                    {/* Suggestions */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-blue-400 flex items-center gap-2 mb-3">
                        <TrendingUp size={18} /> Suggestions
                      </h4>
                      <ul className="space-y-2">
                        {analysis.suggestions.map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-500 mt-0.5 font-bold">{i + 1}.</span> {s}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                )}

                {activeTab === 'roast' && roast && (
                  <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
                    {/* Verdict */}
                    <motion.div variants={fadeIn} className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
                      <div className="text-center">
                        <Flame size={32} className="mx-auto text-orange-500 mb-2" />
                        <p className="text-lg font-bold text-orange-300 italic">"{roast.memeVerdict}"</p>
                      </div>
                    </motion.div>

                    {/* Roast Comments */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-orange-400 flex items-center gap-2 mb-3">
                        <Flame size={18} /> The Roast
                      </h4>
                      <ul className="space-y-3">
                        {roast.roastComments.map((c, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm bg-orange-500/10 p-3 rounded-lg">
                            <span className="text-xl">🔥</span> {c}
                          </li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Tips */}
                    <motion.div variants={fadeIn} className="card">
                      <h4 className="font-semibold text-green-400 flex items-center gap-2 mb-3">
                        <Award size={18} /> Actually Useful Tips
                      </h4>
                      <ul className="space-y-2">
                        {roast.improvementTips.map((t, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 mt-0.5">💡</span> {t}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
