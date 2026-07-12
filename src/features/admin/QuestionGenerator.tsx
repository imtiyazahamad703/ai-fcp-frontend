import { useState, type FormEvent } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { adminService } from '../../services/admin.service';
import { useAdminStore } from '../../store/useAdminStore';

// ============================
// Question Generator Feature
// ============================

export const QuestionGenerator = () => {
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'react' | 'fullstack'>('react');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { generatedQuestion, setGeneratedQuestion } = useAdminStore();

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');
    setGeneratedQuestion(null);

    try {
      const question = await adminService.generateQuestion(topic, type);
      setGeneratedQuestion(question);
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || 'Failed to generate question');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedQuestion) return;
    
    setIsLoading(true);
    setError('');

    try {
      await adminService.saveQuestion(generatedQuestion);
      setSuccess('Question saved successfully!');
      setGeneratedQuestion(null);
      setTopic('');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#11111a]/60 backdrop-blur-lg border border-[#1e1e2d] rounded-2xl p-8 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-extrabold text-white">
          Generate AI Practice Question
        </h3>
        <p className="text-xs text-gray-500 mt-1">Provide a prompt topic and let our AI create the code workspace files, solution tests, and description.</p>
      </div>
      
      <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end mb-8">
        <div className="flex-1 w-full">
          <Input
            label="Practice Topic / Feature Title"
            type="text"
            placeholder="e.g. Build a counter component using React useState"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="w-full md:w-64">
          <label className="block text-sm font-semibold text-gray-400 mb-2">Workspace Type</label>
          <select 
            value={type} 
            onChange={(e) => setType(e.target.value as 'react' | 'fullstack')}
            className="w-full bg-[#1a1a24] border border-[#2a2a38] rounded-xl px-4 h-[46px] text-sm focus:outline-none focus:border-[#8342ff] transition-all text-white font-medium cursor-pointer"
            disabled={isLoading}
          >
            <option value="react">React Frontend Only</option>
            <option value="fullstack">Full Stack (React + NestJS)</option>
          </select>
        </div>

        <div className="w-full md:w-auto">
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!topic.trim()} className="w-full h-[46px] px-6">
            Generate with AI
          </Button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-fade-in">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium animate-fade-in">
          {success}
        </div>
      )}

      {generatedQuestion && (
        <div className="border border-[#1e1e2d] rounded-2xl overflow-hidden bg-[#0d0d12]/50 backdrop-blur-md animate-fade-in-up">
          <div className="bg-[#161622]/60 px-6 py-4 border-b border-[#1e1e2d] flex justify-between items-center">
            <div>
              <h4 className="font-extrabold text-white text-lg">AI Generated Question Preview</h4>
              <p className="text-xs text-gray-500 mt-0.5">Please review the details below before publishing.</p>
            </div>
            <div className="flex gap-2">
              <span className={`text-[10px] px-2.5 py-1 rounded-lg uppercase font-extrabold tracking-wider border ${
                generatedQuestion.type === 'react' ? 'bg-[#61dafb]/10 text-[#61dafb] border-[#61dafb]/20' : 'bg-[#8342ff]/10 text-[#a855f7] border-[#8342ff]/20'
              }`}>
                {generatedQuestion.type}
              </span>
              <span className={`text-[10px] px-2.5 py-1 rounded-full uppercase font-extrabold tracking-wider border ${
                generatedQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                generatedQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {generatedQuestion.difficulty}
              </span>
            </div>
          </div>
          
          <div className="p-6 space-y-6 max-h-[500px] overflow-y-auto">
            <div>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Title</span>
              <h3 className="text-2xl font-black text-white mt-1">{generatedQuestion.title}</h3>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">Problem Statement</span>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300 mt-2 bg-[#161622]/40 p-5 rounded-xl border border-[#1e1e2d]">
                <ReactMarkdown>{generatedQuestion.description}</ReactMarkdown>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2 block">Workspace Starter Files</span>
              <div className="grid gap-2">
                {generatedQuestion.starterCode?.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-[#161622]/30 border border-[#1e1e2d] text-xs font-mono">
                    <div className="flex items-center gap-2.5">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a0a0b8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                      <span className="text-gray-300 font-semibold">{file.filename}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      file.editable ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                    }`}>
                      {file.editable ? 'EDITABLE' : 'READONLY'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-[#161622]/40 border-t border-[#1e1e2d] flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setGeneratedQuestion(null)} disabled={isLoading} className="rounded-xl px-5">
              Discard
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isLoading} className="rounded-xl px-5">
              Save & Publish Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
