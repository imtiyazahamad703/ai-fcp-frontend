import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import type { IQuestion, IStarterFile } from '../../types';

// ============================
// Code Review Editor
// ============================

interface CodeReviewEditorProps {
  question: IQuestion;
  onChange: (updatedFiles: IStarterFile[]) => void;
}

export const CodeReviewEditor = ({ question, onChange }: CodeReviewEditorProps) => {
  const [files, setFiles] = useState<IStarterFile[]>(question.starterCode || []);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  // Sync files if parent updates them (e.g. data re-fetch)
  useEffect(() => {
    setFiles(question.starterCode || []);
  }, [question.starterCode]);

  const handleEditorChange = (value: string | undefined) => {
    if (value === undefined) return;
    
    const updatedFiles = [...files];
    updatedFiles[activeFileIndex] = {
      ...updatedFiles[activeFileIndex],
      content: value
    };
    
    setFiles(updatedFiles);
    onChange(updatedFiles);
  };

  const activeFile = files[activeFileIndex];

  if (!files.length) {
    return <div className="p-4 text-[var(--color-text-secondary)]">No files to display.</div>;
  }

  // Map file language to Monaco language
  const getMonacoLanguage = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'tsx' || l === 'react') return 'typescript';
    if (l === 'ts' || l === 'nestjs') return 'typescript';
    if (l === 'html') return 'html';
    if (l === 'css') return 'css';
    if (l === 'json') return 'json';
    return 'typescript'; // default fallback
  };

  return (
    <div className="flex h-[600px] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden bg-[#1e1e1e]">
      {/* Sidebar: File Explorer */}
      <div className="w-64 bg-[#252526] border-r border-[#333333] flex flex-col">
        <div className="p-3 uppercase text-xs font-bold tracking-wider text-gray-400 border-b border-[#333333]">
          Explorer
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {files.map((file, idx) => (
            <button
              key={file.filename}
              onClick={() => setActiveFileIndex(idx)}
              className={`w-full text-left px-4 py-2 flex items-center gap-2 text-sm transition-colors ${
                idx === activeFileIndex 
                  ? 'bg-[#37373d] text-white' 
                  : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-300'
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={file.editable ? 'text-blue-400' : 'text-gray-500'}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span className="truncate">{file.filename}</span>
              {!file.editable && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto opacity-50">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area: Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex px-4 bg-[#1e1e1e] border-b border-[#333333]">
          <div className="px-4 py-2 bg-[#1e1e1e] text-[#e7e7e7] text-sm border-t-2 border-blue-500 flex items-center gap-2">
            {activeFile.filename}
            {!activeFile.editable && <span className="text-xs text-gray-500">(Read-only mapping)</span>}
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Editor
            height="100%"
            language={getMonacoLanguage(activeFile.language)}
            theme="vs-dark"
            value={activeFile.content}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
              wordWrap: "on",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      </div>
    </div>
  );
};
