import { useState, useEffect, type FormEvent } from 'react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { adminService } from '../../services/admin.service';
import { useAdminStore } from '../../store/useAdminStore';

// ============================
// Question Generator Feature
// ============================

export const QuestionGenerator = () => {
  const [userPrompt, setUserPrompt] = useState('');
  const [type, setType] = useState<'react' | 'fullstack'>('fullstack');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('leetcode 75 blind questions');
  const [newFolder, setNewFolder] = useState<string>('');

  useEffect(() => {
    adminService.getFolders().then(f => {
      setFolders(f);
      if (f.length > 0 && !f.includes('leetcode 75 blind questions')) setSelectedFolder(f[0]);
    }).catch(console.error);
  }, []);
  
  const { generatedQuestion, setGeneratedQuestion } = useAdminStore();

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!userPrompt.trim()) {
      setError('Please enter a prompt or topic before generating.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setGeneratedQuestion(null);

    try {
      const question = await adminService.generateQuestion(userPrompt, type);
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
      const finalFolder = selectedFolder === 'ADD_NEW' ? newFolder : selectedFolder;
      await adminService.saveQuestion({ 
        ...generatedQuestion, 
        folder: finalFolder || 'Uncategorized' 
      });
      setSuccess('Question saved successfully!');
      setGeneratedQuestion(null);
      setUserPrompt('');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error?.message || 'Failed to save question');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 shadow-sm">
      <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
        Generate AI Question
      </h3>
      
      <form onSubmit={handleGenerate} className="bg-[var(--color-bg-base)] p-5 rounded-[var(--radius-md)] border border-[var(--color-border)] mb-8">
        <div className="mb-4">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">Prompt / Topic</label>
          <textarea
            className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] p-4 text-[var(--color-text-primary)] placeholder-[var(--color-text-tertiary)] focus:outline-none focus:border-[var(--color-primary-400)] transition-colors min-h-[120px] resize-y"
            placeholder="e.g. Create a React coding challenge that requires the user to build a counter using the useState hook..."
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Target Stack</label>
            <select 
              value={type} 
              onChange={(e) => setType(e.target.value as 'react' | 'fullstack')}
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary-400)] transition-colors text-[var(--color-text-primary)]"
              disabled={isLoading}
            >
              <option value="react">React Frontend</option>
              <option value="fullstack">Full Stack (React + NestJS)</option>
            </select>
          </div>

          <div className="flex-1 flex justify-end w-full md:w-auto mt-2 md:mt-0">
            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full md:w-auto">
              Generate with AI
            </Button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-[var(--radius-md)] bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
          {success}
        </div>
      )}

      {generatedQuestion && (
        <div className="border border-[var(--color-border)] rounded-[var(--radius-md)] overflow-hidden">
          <div className="bg-[var(--color-bg-hover)] px-4 py-3 border-b border-[var(--color-border)] flex justify-between items-center">
            <h4 className="font-medium text-[var(--color-text-primary)]">Preview: {generatedQuestion.title}</h4>
          </div>
          
          <div className="p-4 bg-[var(--color-bg-base)] max-h-96 overflow-y-auto">
            <pre className="text-xs text-[var(--color-text-secondary)] whitespace-pre-wrap font-mono">
              {JSON.stringify(generatedQuestion, null, 2)}
            </pre>
          </div>

          <div className="p-4 bg-[var(--color-bg-hover)] border-t border-[var(--color-border)] flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <label className="text-sm font-medium text-[var(--color-text-secondary)] whitespace-nowrap">Folder:</label>
              <select 
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-primary-400)] transition-colors text-[var(--color-text-primary)] w-full sm:w-48"
              >
                {folders.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
                {folders.length === 0 && !folders.includes('leetcode 75 blind questions') && (
                  <option value="leetcode 75 blind questions">leetcode 75 blind questions</option>
                )}
                <option value="ADD_NEW">+ Add New Folder...</option>
              </select>
              
              {selectedFolder === 'ADD_NEW' && (
                <input 
                  type="text" 
                  value={newFolder}
                  onChange={(e) => setNewFolder(e.target.value)}
                  placeholder="New folder name"
                  className="bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] px-3 py-1.5 text-sm focus:outline-none focus:border-[var(--color-primary-400)] transition-colors text-[var(--color-text-primary)] w-full sm:w-48"
                />
              )}
            </div>

            <div className="flex gap-3 w-full md:w-auto justify-end">
              <Button variant="secondary" onClick={() => setGeneratedQuestion(null)} disabled={isLoading} className="flex-1 md:flex-none">
                Discard
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={isLoading} className="flex-1 md:flex-none">
                Save Question
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
