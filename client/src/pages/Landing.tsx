import { Link } from 'react-router-dom';
import { ArrowRight, Brain, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '../components/ui';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-primary-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SS</span>
              </div>
              <span className="text-xl font-bold text-gray-900">SkillSense</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-primary-50 text-primary-700 px-4 py-2 rounded-full mb-8">
            <Sparkles size={16} />
            <span className="text-sm font-medium">AI-Powered Skill Intelligence</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Your
            <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              {' '}
              Skill Gaps
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            SkillSense AI analyzes your current abilities, compares them against your dream role,
            and creates a personalized roadmap to bridge the gap. Start your journey to excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Start Free Assessment
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                I Already Have an Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How SkillSense Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our intelligent system guides you from self-assessment to skill mastery
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="relative group">
              <div className="card hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary-200 transition-colors">
                  <Brain className="text-primary-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Self-Assessment</h3>
                <p className="text-gray-600">
                  Take intelligent assessments that adapt to your responses. Our ML algorithms
                  accurately predict your proficiency levels across multiple skills.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative group">
              <div className="card hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-secondary-200 transition-colors">
                  <Target className="text-secondary-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Gap Analysis</h3>
                <p className="text-gray-600">
                  Select your target role and instantly see where you stand. Visual dashboards
                  show exactly which skills need attention and their priority.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative group">
              <div className="card hover:shadow-lg transition-shadow duration-300">
                <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-green-200 transition-colors">
                  <TrendingUp className="text-green-600" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Smart Recommendations</h3>
                <p className="text-gray-600">
                  Get personalized learning paths with curated resources. Track your progress
                  and watch your skill gaps close over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-primary-600 to-secondary-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to Level Up Your Skills?
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              Join thousands of students who are actively bridging their skill gaps
            </p>
            <Link to="/register">
              <Button
                variant="outline"
                size="lg"
                className="bg-white text-primary-600 border-white hover:bg-primary-50"
              >
                Get Started for Free
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} SkillSense AI. Built for learners everywhere.</p>
        </div>
      </footer>
    </div>
  );
}
