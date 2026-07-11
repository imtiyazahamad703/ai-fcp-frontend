import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { learnerService } from '../services/learner.service';
import type { IQuestion, IStarterFile } from '../types';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';

// ============================
// Code Workspace Page
// ============================

const CodeWorkspace = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();
  
  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [files, setFiles] = useState<IStarterFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    if (questionId) fetchQuestion(questionId);
  }, [questionId]);

  const fetchQuestion = async (qId: string) => {
    try {
      const data = await learnerService.getQuestionById(qId);
      setQuestion(data);
      setFiles(data.starterCode || []);
    } catch (err) {
      toast.error('Failed to load question');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    const updated = [...files];
    updated[activeFileIndex] = { ...updated[activeFileIndex], content: value };
    setFiles(updated);
  };

  const handleSubmit = async () => {
    if (!questionId || !files.length) return;
    setIsSubmitting(true);
    setOutput(null);

    try {
      const result = await learnerService.submitExecution(questionId, files);
      setOutput({
        status: result.status,
        message: result.output,
      });
    } catch (err: any) {
      setOutput({
        status: 'fail',
        message: err.message || 'Execution failed',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !question) {
    return <div className="h-screen flex items-center justify-center bg-[#1e1e1e]"><Loader text="Loading Workspace..." /></div>;
  }

  const activeFile = files[activeFileIndex];

  return (
    <div className="h-screen flex flex-col bg-[#1e1e1e] text-gray-300 font-sans">
      {/* Top Navbar */}
      <div className="h-14 border-b border-[#333] flex items-center justify-between px-6 bg-[#252526]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')} className="hover:text-white transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          </button>
          <span className="font-bold text-white">{question.title}</span>
          <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
            question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
            question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
            'bg-red-500/10 text-red-400'
          }`}>{question.difficulty}</span>
        </div>
        <div>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            {isSubmitting ? 'Running...' : 'Submit Code'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Description */}
        <div className="w-1/3 border-r border-[#333] flex flex-col bg-[#1e1e1e] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Problem Statement</h2>
            <div className="prose prose-invert prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-300">{question.description}</pre>
            </div>
            
            <h3 className="text-lg font-bold text-white mt-10 mb-4 border-b border-[#333] pb-2">Test Cases</h3>
            <ul className="space-y-4">
              {question.testCases?.map((tc, idx) => (
                <li key={idx} className="bg-[#252526] p-4 rounded-lg border border-[#333]">
                  <p className="text-sm font-medium text-gray-200">{tc.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Panel: Editor + Output */}
        <div className="w-2/3 flex flex-col bg-[#1e1e1e]">
          {/* File Tabs */}
          <div className="flex bg-[#252526] border-b border-[#333] overflow-x-auto">
            {files.map((file, idx) => (
              <button
                key={file.filename}
                onClick={() => setActiveFileIndex(idx)}
                className={`px-4 py-2.5 text-sm font-medium border-t-2 transition-colors flex items-center gap-2 ${
                  idx === activeFileIndex 
                    ? 'border-blue-500 bg-[#1e1e1e] text-blue-400' 
                    : 'border-transparent text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'
                }`}
              >
                {file.filename}
                {!file.editable && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                )}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={activeFile?.language === 'tsx' ? 'typescript' : activeFile?.language || 'typescript'}
              theme="vs-dark"
              value={activeFile?.content || ''}
              onChange={handleEditorChange}
              options={{
                readOnly: !activeFile?.editable,
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          {/* Output Terminal */}
          <div className="h-64 border-t border-[#333] bg-[#0d0d0d] flex flex-col">
            <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex justify-between items-center text-xs font-bold tracking-wider text-gray-400 uppercase">
              <span>Execution Output</span>
              {output && (
                <span className={`px-2 py-0.5 rounded ${output.status === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {output.status === 'pass' ? 'Passed' : 'Failed'}
                </span>
              )}
            </div>
            <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
              {!output ? (
                <span className="text-gray-600">Click 'Submit Code' to run your solution against the test cases...</span>
              ) : (
                <pre className={`whitespace-pre-wrap ${output.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                  {output.message}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeWorkspace;
