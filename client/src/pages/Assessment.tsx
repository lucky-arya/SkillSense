import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, Button, ProgressBar, Badge } from '../components/ui';
import { assessmentService, Assessment as AssessmentType } from '../services/api/assessment.service';

type QuestionAnswer = {
  questionId: string;
  answer: string | number;
};

export default function Assessment() {
  const [assessments, setAssessments] = useState<AssessmentType[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<QuestionAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const data = await assessmentService.getAvailableAssessments();
      if (Array.isArray(data) && data.length > 0) {
        // Transform backend assessment format to frontend format
        const transformed: AssessmentType[] = data.map((a: any) => ({
          _id: a.id || a._id,
          title: a.title,
          description: a.description,
          estimatedTime: a.estimatedDuration || a.estimatedTime || 20,
          skillsAssessed: a.targetSkills?.map((s: any) => 
            typeof s === 'string' ? s : s.name || s
          ) || [],
          questions: (a.questions || []).map((q: any) => ({
            id: q.id || q._id,
            text: q.text,
            type: q.type === 'multiple_choice' ? 'multiple-choice' 
                : q.type === 'self_rating' ? 'rating' 
                : q.type === 'scenario_based' ? 'multiple-choice'
                : q.type,
            options: q.options?.map((o: any) => o.text || o) || [],
            skillId: q.skillId || '',
          })),
        }));
        setAssessments(transformed);
      } else {
        setAssessments([]);
      }
    } catch (error) {
      console.error('Failed to load assessments:', error);
      setAssessments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = (assessment: AssessmentType) => {
    setSelectedAssessment(assessment);
    setAssessmentStarted(true);
    setCurrentQuestionIndex(0);
    setAnswers([]);
  };

  const handleAnswer = (answer: string | number) => {
    if (!selectedAssessment) return;

    const question = selectedAssessment.questions[currentQuestionIndex];
    const existingIndex = answers.findIndex((a) => a.questionId === question.id);

    if (existingIndex >= 0) {
      const newAnswers = [...answers];
      newAnswers[existingIndex] = { questionId: question.id, answer };
      setAnswers(newAnswers);
    } else {
      setAnswers([...answers, { questionId: question.id, answer }]);
    }
  };

  const getCurrentAnswer = () => {
    if (!selectedAssessment) return null;
    const question = selectedAssessment.questions[currentQuestionIndex];
    return answers.find((a) => a.questionId === question.id)?.answer;
  };

  const goToNextQuestion = () => {
    if (selectedAssessment && currentQuestionIndex < selectedAssessment.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const submitAssessment = async () => {
    if (!selectedAssessment) return;

    setIsSubmitting(true);
    try {
      await assessmentService.submitAssessment(selectedAssessment._id, answers);
      navigate('/gap-analysis');
    } catch (error) {
      console.error('Failed to submit assessment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Assessment in progress
  if (assessmentStarted && selectedAssessment) {
    const question = selectedAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / selectedAssessment.questions.length) * 100;
    const currentAnswer = getCurrentAnswer();

    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        {/* Progress Header */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">{selectedAssessment.title}</h2>
            <Badge variant="primary">
              Question {currentQuestionIndex + 1} of {selectedAssessment.questions.length}
            </Badge>
          </div>
          <ProgressBar value={progress} color="gradient" showLabel />
        </Card>

        {/* Question Card */}
        <Card className="min-h-[300px]">
          <h3 className="text-xl font-medium text-gray-900 mb-6">{question.text}</h3>

          {question.type === 'multiple-choice' && question.options && (
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                    currentAnswer === option
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option}
                </button>
              ))}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="space-y-4">
              <p className="text-gray-600">Select your proficiency level:</p>
              <div className="flex justify-between gap-2">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleAnswer(level)}
                    className={`flex-1 py-4 px-2 rounded-lg border-2 transition-all ${
                      currentAnswer === level
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl font-bold">{level}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {level === 1
                        ? 'Beginner'
                        : level === 2
                        ? 'Basic'
                        : level === 3
                        ? 'Intermediate'
                        : level === 4
                        ? 'Advanced'
                        : 'Expert'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2" size={18} />
            Previous
          </Button>

          {currentQuestionIndex === selectedAssessment.questions.length - 1 ? (
            <Button
              onClick={submitAssessment}
              isLoading={isSubmitting}
              disabled={answers.length < selectedAssessment.questions.length}
            >
              Submit Assessment
              <CheckCircle className="ml-2" size={18} />
            </Button>
          ) : (
            <Button onClick={goToNextQuestion} disabled={!currentAnswer}>
              Next
              <ArrowRight className="ml-2" size={18} />
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Assessment selection
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Skill Assessments</h1>
        <p className="text-gray-600 mt-1">
          Take assessments to evaluate your current skill levels
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {assessments.map((assessment) => (
          <Card key={assessment._id} hover>
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{assessment.title}</h3>
              <div className="flex items-center text-gray-500 text-sm">
                <Clock size={16} className="mr-1" />
                {assessment.estimatedTime} min
              </div>
            </div>

            <p className="text-gray-600 mb-4">{assessment.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {assessment.skillsAssessed.map((skill) => (
                <Badge key={skill} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>

            <Button onClick={() => startAssessment(assessment)} className="w-full">
              Start Assessment
              <ArrowRight className="ml-2" size={18} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
