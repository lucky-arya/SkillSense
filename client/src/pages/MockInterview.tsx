import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, Bot, User, Play, Square, Loader2,
  Award, Target, MessageSquare, BarChart3, RotateCcw
} from 'lucide-react';
import { aiService, InterviewQuestion, InterviewEvaluation } from '../services/api/ai.service';

type Stage = 'setup' | 'interview' | 'evaluating' | 'results';

interface Message {
  role: 'interviewer' | 'candidate';
  content: string;
}

export default function MockInterview() {
  const [stage, setStage] = useState<Stage>('setup');
  const [targetRole, setTargetRole] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'intermediate' | 'hard'>('intermediate');
  const [focusArea, setFocusArea] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [error, setError] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Web Speech API setup
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition not supported in this browser. Use Chrome for voice.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setUserInput(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = async () => {
    if (!targetRole) {
      setError('Please enter a target role');
      return;
    }
    setError('');
    setIsProcessing(true);
    try {
      const qs = await aiService.startInterview({ targetRole, difficulty, focusArea });
      setQuestions(qs);
      const firstQ = qs[0];
      setMessages([{ role: 'interviewer', content: firstQ.question }]);
      speakText(firstQ.question);
      setStage('interview');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to start interview');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = async () => {
    if (!userInput.trim() || isProcessing) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    const answer = userInput.trim();
    setUserInput('');
    setMessages((prev) => [...prev, { role: 'candidate', content: answer }]);
    setIsProcessing(true);

    try {
      const history = [...messages, { role: 'candidate' as const, content: answer }]
        .map((m) => ({ role: m.role === 'interviewer' ? 'assistant' : 'user', content: m.content }));

      // Are we done?
      if (currentQIndex >= questions.length - 1) {
        // Final evaluation
        setStage('evaluating');
        const evalResult = await aiService.evaluateInterview({
          targetRole,
          conversationHistory: history,
        });
        setEvaluation(evalResult);
        setStage('results');
        return;
      }

      // Evaluate current answer and get response
      const evalResp = await aiService.evaluateAnswer({
        question: questions[currentQIndex].question,
        answer,
        targetRole,
        conversationHistory: history,
      });

      // Move to next question
      const nextIdx = currentQIndex + 1;
      const nextQ = evalResp.followUp || questions[nextIdx]?.question || 'Thank you for your answer.';
      
      setMessages((prev) => [...prev, { role: 'interviewer', content: nextQ }]);
      speakText(nextQ);
      
      if (!evalResp.followUp) {
        setCurrentQIndex(nextIdx);
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterviewEarly = async () => {
    setStage('evaluating');
    try {
      const history = messages.map((m) => ({
        role: m.role === 'interviewer' ? 'assistant' : 'user',
        content: m.content,
      }));
      const evalResult = await aiService.evaluateInterview({
        targetRole,
        conversationHistory: history,
      });
      setEvaluation(evalResult);
      setStage('results');
    } catch {
      setError('Failed to evaluate interview');
      setStage('interview');
    }
  };

  const resetInterview = () => {
    setStage('setup');
    setMessages([]);
    setQuestions([]);
    setCurrentQIndex(0);
    setEvaluation(null);
    setUserInput('');
    setError('');
    window.speechSynthesis.cancel();
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-green-600';
    if (s >= 60) return 'text-yellow-600';
    if (s >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
            <p className="text-sm text-gray-500">Voice-enabled • Powered by Gemini AI</p>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* ===== SETUP ===== */}
        {stage === 'setup' && (
          <motion.div key="setup" initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Interview Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="label">Target Role *</label>
                    <input className="input" placeholder="e.g., Full Stack Developer"
                           value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Difficulty</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['easy', 'intermediate', 'hard'] as const).map((d) => (
                        <button key={d} onClick={() => setDifficulty(d)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium border transition-all ${
                            difficulty === d
                              ? 'bg-primary-50 border-primary-300 text-primary-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}>
                          {d.charAt(0).toUpperCase() + d.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Focus Area (optional)</label>
                    <input className="input" placeholder="e.g., System Design, React, DSA"
                           value={focusArea} onChange={(e) => setFocusArea(e.target.value)} />
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                  )}

                  <button onClick={startInterview} disabled={isProcessing}
                    className="w-full btn-primary flex items-center justify-center space-x-2 disabled:opacity-50">
                    {isProcessing ? (
                      <><Loader2 size={18} className="animate-spin" /><span>Preparing Interview...</span></>
                    ) : (
                      <><Play size={18} /><span>Start Interview</span></>
                    )}
                  </button>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <h3 className="text-lg font-semibold text-purple-900 mb-3">🎙️ How It Works</h3>
                <ul className="space-y-3 text-sm text-purple-800">
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                    <span>AI generates interview questions tailored to your role and difficulty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                    <span>Answer via text or click the microphone for voice input</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                    <span>Questions are read aloud by AI (Text-to-Speech)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="bg-purple-200 text-purple-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shrink-0">4</span>
                    <span>Get a detailed evaluation with scores and feedback</span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== INTERVIEW ===== */}
        {stage === 'interview' && (
          <motion.div key="interview" initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
            <div className="card">
              {/* Progress */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BarChart3 size={16} />
                  Question {Math.min(currentQIndex + 1, questions.length)} of {questions.length}
                </div>
                <button onClick={endInterviewEarly}
                  className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1">
                  <Square size={14} /> End Interview
                </button>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1.5 mb-6">
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                     style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }} />
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pb-4 pr-2">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${msg.role === 'candidate' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === 'interviewer' ? 'bg-purple-100' : 'bg-blue-100'
                    }`}>
                      {msg.role === 'interviewer' ? <Bot size={18} className="text-purple-600" /> : <User size={18} className="text-blue-600" />}
                    </div>
                    <div className={`max-w-[75%] p-3 rounded-xl text-sm ${
                      msg.role === 'interviewer'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-primary-600 text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                {isProcessing && (
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center">
                      <Bot size={18} className="text-purple-600" />
                    </div>
                    <div className="bg-gray-100 p-3 rounded-xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <button onClick={toggleListening}
                  className={`p-3 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-100 text-red-600 animate-pulse'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <input
                  className="flex-1 input"
                  placeholder={isListening ? '🎙️ Listening...' : 'Type your answer...'}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  disabled={isProcessing}
                />
                <button onClick={handleSend} disabled={isProcessing || !userInput.trim()}
                  className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 transition-all">
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ===== EVALUATING ===== */}
        {stage === 'evaluating' && (
          <motion.div key="evaluating" initial="hidden" animate="visible" variants={fadeIn}
            className="card flex flex-col items-center justify-center py-20">
            <Loader2 size={48} className="animate-spin text-purple-500 mb-4" />
            <p className="font-semibold text-lg">Evaluating Your Interview...</p>
            <p className="text-sm text-gray-500 mt-1">AI is analyzing your answers</p>
          </motion.div>
        )}

        {/* ===== RESULTS ===== */}
        {stage === 'results' && evaluation && (
          <motion.div key="results" initial="hidden" animate="visible" variants={fadeIn} className="space-y-4">
            {/* Score Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Overall', score: evaluation.overallScore, icon: Award },
                { label: 'Technical', score: evaluation.technicalScore, icon: Target },
                { label: 'Communication', score: evaluation.communicationScore, icon: MessageSquare },
                { label: 'Soft Skills', score: evaluation.softSkillScore, icon: BarChart3 },
              ].map(({ label, score, icon: Icon }) => (
                <motion.div key={label} variants={fadeIn} className="card text-center">
                  <Icon size={20} className="mx-auto text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500 uppercase">{label}</p>
                  <p className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</p>
                </motion.div>
              ))}
            </div>

            {/* Feedback */}
            <motion.div variants={fadeIn} className="card">
              <h3 className="font-semibold text-gray-900 mb-2">Overall Feedback</h3>
              <p className="text-sm text-gray-700">{evaluation.feedback}</p>
            </motion.div>

            {/* Question-by-Question */}
            <motion.div variants={fadeIn} className="card">
              <h3 className="font-semibold text-gray-900 mb-4">Question Breakdown</h3>
              <div className="space-y-4">
                {evaluation.questionEvaluations.map((qe, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium text-sm text-gray-800 flex-1">{qe.question}</p>
                      <span className={`text-lg font-bold ml-3 ${getScoreColor(qe.score * 10)}`}>
                        {qe.score}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{qe.evaluation}</p>
                    <details className="text-sm">
                      <summary className="text-primary-600 cursor-pointer font-medium">View ideal answer & tips</summary>
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary-200">
                        <div>
                          <span className="font-medium text-green-700">Ideal Answer:</span>
                          <p className="text-gray-600">{qe.idealAnswer}</p>
                        </div>
                        <div>
                          <span className="font-medium text-amber-700">Areas to Improve:</span>
                          <p className="text-gray-600">{qe.areasToImprove}</p>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="text-center">
              <button onClick={resetInterview} className="btn-primary inline-flex items-center gap-2">
                <RotateCcw size={18} /> Try Another Interview
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
