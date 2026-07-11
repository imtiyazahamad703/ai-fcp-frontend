import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { adminService } from '../services/admin.service';
import { CodeReviewEditor } from '../features/admin/CodeReviewEditor';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';
import type { IQuestion, IStarterFile } from '../types';

// ============================
// Admin Question Review Editor Page
// ============================

const AdminQuestionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchQuestion(id);
    }
  }, [id]);

  const fetchQuestion = async (questionId: string) => {
    setIsLoading(true);
    try {
      const data = await adminService.getQuestionById(questionId);
      setQuestion(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch question details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilesChange = (updatedFiles: IStarterFile[]) => {
    if (question) {
      setQuestion({ ...question, starterCode: updatedFiles });
    }
  };

  const handleSave = async (publish: boolean) => {
    if (!question || !id) return;
    
    setIsSaving(true);
    try {
      const statusToSet = publish ? 'published' : question.status;
      await adminService.updateQuestion(id, { 
        starterCode: question.starterCode,
        status: statusToSet 
      });
      
      alert(publish ? 'Question published successfully!' : 'Changes saved as draft');
      if (publish) {
        navigate('/admin/questions');
      }
    } catch (err: any) {
      alert('Failed to save changes: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-64 flex justify-center items-center">
          <Loader text="Loading question data..." />
        </div>
      </AdminLayout>
    );
  }

  if (error || !question) {
    return (
      <AdminLayout>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[var(--radius-md)] mb-4">
          {error || 'Question not found'}
        </div>
        <Button variant="secondary" onClick={() => navigate('/admin/questions')}>Back to List</Button>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <button 
              onClick={() => navigate('/admin/questions')}
              className="p-1 rounded-full hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Review Question</h1>
            <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${
              question.status === 'published' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'
            }`}>
              {question.status}
            </span>
          </div>
          <p className="text-xl text-[var(--color-text-secondary)] ml-10">
            {question.title}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => handleSave(false)} isLoading={isSaving}>
            Save Draft
          </Button>
          {question.status !== 'published' && (
            <Button variant="primary" onClick={() => handleSave(true)} isLoading={isSaving}>
              Publish Question
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 space-y-6">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 border-b border-[var(--color-border)] pb-2">Problem Description</h3>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--color-text-secondary)]">
              {/* In a real app we would use react-markdown here */}
              <pre className="whitespace-pre-wrap font-sans">{question.description}</pre>
            </div>
          </div>
          
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5">
            <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 border-b border-[var(--color-border)] pb-2">Test Cases</h3>
            <ul className="space-y-3">
              {question.testCases?.map((tc, idx) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${tc.type === 'visible' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <div>
                    <p className="text-[var(--color-text-primary)]">{tc.description}</p>
                    <p className="text-xs text-[var(--color-text-tertiary)] uppercase">{tc.type}</p>
                  </div>
                </li>
              ))}
              {(!question.testCases || question.testCases.length === 0) && (
                <p className="text-sm text-[var(--color-text-tertiary)]">No test cases defined.</p>
              )}
            </ul>
          </div>
        </div>

        <div className="col-span-2">
          <CodeReviewEditor 
            question={question} 
            onChange={handleFilesChange} 
          />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQuestionEditor;
