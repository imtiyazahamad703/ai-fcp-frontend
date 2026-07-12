import { useState, useEffect, useMemo, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react';
import { 
  Play, 
  MessageSquare, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Send, 
  PenTool, 
  Save, 
  Terminal, 
  AlertCircle,
  ArrowLeft,
  Lock
} from "lucide-react";
import { learnerService } from '../services/learner.service';
import { notesService } from '../services/notes.service';
import { editorThemes } from '../lib/themes';
import type { IQuestion, IStarterFile, ChatMessage } from '../types';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';

const handleEditorBeforeMount = (monaco: any) => {
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: 'React.createElement',
    reactNamespace: 'React',
    allowNonTsExtensions: true,
    allowJs: true,
    target: monaco.languages.typescript.ScriptTarget.Latest,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    experimentalDecorators: true,
    emitDecoratorMetadata: true,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
    diagnosticCodesToIgnore: [2307, 2792, 2303, 2459],
  });
};

const CodeWorkspace = () => {
  const { questionId } = useParams<{ questionId: string }>();
  const navigate = useNavigate();

  const [question, setQuestion] = useState<IQuestion | null>(null);
  const [files, setFiles] = useState<IStarterFile[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [actionType, setActionType] = useState<'idle' | 'run' | 'submit'>('idle');
  const [output, setOutput] = useState<{ status: string; message: string } | null>(null);
  const [evaluation, setEvaluation] = useState<{
    summary: { total: number; passed: number; failed: number };
    results: {
      index: number; description: string; passed: boolean;
      input?: any; expectedOutput?: any; actualOutput?: any;
      executionTimeMs: number; error?: string; visible: boolean;
    }[];
  } | null>(null);
  const [selectedTestCase, setSelectedTestCase] = useState<number>(0);

  // Layout Tab selection on the left
  const [leftTab, setLeftTab] = useState<'instructions' | 'scratchpad' | 'preview'>('instructions');

  // Mobile Tab State
  const [mobileTab, setMobileTab] = useState<'problem' | 'scratchpad' | 'preview' | 'editor' | 'console'>('problem');

  // Editor Themes state
  const [selectedEditorTheme, setSelectedEditorTheme] = useState(editorThemes[0]);

  // Scratchpad State
  const [scratchpadContent, setScratchpadContent] = useState("");
  const [isSavingScratchpad, setIsSavingScratchpad] = useState(false);

  // AI Chat Assistant State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (questionId) fetchQuestion(questionId);
  }, [questionId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiTyping]);

  const fetchQuestion = async (qId: string) => {
    try {
      const data = await learnerService.getQuestionById(qId);
      setQuestion(data);

      // Start with starter code as baseline
      let loadedFiles = data.starterCode || [];

      // Try to restore last submission
      try {
        const lastSubmission = await learnerService.getLastSubmission(qId);
        if (lastSubmission && lastSubmission.files.length > 0) {
          loadedFiles = loadedFiles.map((starterFile) => {
            const saved = lastSubmission.files.find(
              (sf) => sf.filename === starterFile.filename,
            );
            return saved && starterFile.editable
              ? { ...starterFile, content: saved.content }
              : starterFile;
          });
        }
      } catch {
        // Ignore
      }

      setFiles(loadedFiles);

      // Load Scratchpad
      try {
        const note = await notesService.getNoteByQuestion(qId);
        if (note && note.content) {
          setScratchpadContent(note.content);
        } else {
          setScratchpadContent("### My Scratchpad\nWrite your thoughts, ideas, or pseudocode here...");
        }
      } catch {
        setScratchpadContent("### My Scratchpad\nWrite your thoughts, ideas, or pseudocode here...");
      }

    } catch (err) {
      toast.error('Failed to load question');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveScratchpad = async () => {
    if (!questionId) return;
    setIsSavingScratchpad(true);
    try {
      await notesService.saveNote(questionId, scratchpadContent);
      toast.success("Scratchpad note saved to DB!");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setIsSavingScratchpad(false);
    }
  };

  const sendChatMessage = async () => {
    const text = chatInput.trim();
    if (!text || !question) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      role: 'user',
      text,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    try {
      const codeContext = JSON.stringify(files.map(f => ({ filename: f.filename, content: f.content })));
      const reply = await learnerService.askAiAssistant(text, {
        title: question.title,
        description: question.description,
        currentCode: codeContext
      });

      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        text: reply,
        timestamp: new Date().toISOString()
      };
      setChatHistory(prev => [...prev, assistantMsg]);
    } catch {
      toast.error("Assistant failed to reply");
    } finally {
      setIsAiTyping(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'AXIOS_REQUEST') {
        try {
          if (!questionId) throw new Error("Question ID is missing");
          const result = await learnerService.executeEndpoint(questionId, files, event.data.method, event.data.url, event.data.data);

          if (result.status === 'fail') {
            const errMsg = typeof result.output === 'string'
              ? result.output
              : (result.output?.error || result.output?.message || JSON.stringify(result.output));
            throw new Error(errMsg);
          }

          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.contentWindow?.postMessage({ type: 'AXIOS_RESPONSE', id: event.data.id, data: result.output }, '*');
          });
        } catch (e: any) {
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.contentWindow?.postMessage({ type: 'AXIOS_RESPONSE', id: event.data.id, error: e.message || 'Execution failed' }, '*');
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [files, questionId]);

  const handleEditorChange = (value: string | undefined, ev: any) => {
    if (value === undefined) return;
    if (ev.isFlush) return;

    const updated = [...files];
    updated[activeFileIndex] = { ...updated[activeFileIndex], content: value };
    setFiles(updated);
  };

  const handleSubmit = async (isSubmit: boolean = true) => {
    if (!questionId || !files.length) return;
    setActionType(isSubmit ? 'submit' : 'run');
    setOutput(null);
    setEvaluation(null);
    setSelectedTestCase(0);

    try {
      const result = await learnerService.submitExecution(questionId, files, isSubmit);

      if (result.evaluation) {
        setEvaluation(result.evaluation);
        setOutput({
          status: result.status,
          message: `${result.evaluation.summary.passed}/${result.evaluation.summary.total} test cases passed`,
        });
      } else {
        setOutput({
          status: result.status,
          message: result.output || 'No output',
        });
      }

      if (result.status === 'pass' && !isSubmit) {
        if (hasFrontendFiles) {
          setLeftTab('preview');
        }
      }
    } catch (err: any) {
      setOutput({
        status: 'fail',
        message: err.message || 'Execution failed',
      });
    } finally {
      setActionType('idle');
    }
  };

  const isReact = useMemo(() => {
    if (question?.type?.toLowerCase() === 'react') return true;
    const hasTsx = files.some(f => f.filename.endsWith('.tsx'));
    const hasFullstackPrefix = files.some(f => f.filename.startsWith('frontend/src/'));
    return hasTsx && !hasFullstackPrefix;
  }, [question, files]);

  const sandpackFiles = useMemo(() => {
    const spFiles: Record<string, string> = {};

    files.forEach(f => {
      let name = '';
      if (isReact) {
        name = f.filename.startsWith('/') ? f.filename : `/${f.filename}`;
        if (name.startsWith('/src/')) name = name.replace('/src', '');
      } else if (f.filename.startsWith('frontend/src/')) {
        name = f.filename.replace('frontend/src', '');
      }

      if (name) {
        spFiles[name] = f.content;
      }
    });

    const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sandbox React App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="bg-zinc-950 text-zinc-50 min-h-screen">
    <div id="root"></div>
  </body>
</html>`;

    if (!spFiles['/index.html']) {
      spFiles['/index.html'] = indexHtml;
    }

    if (!spFiles['/index.css']) {
      spFiles['/index.css'] = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\n/* Add your custom CSS here */\n`;
    }

    spFiles['/index.tsx'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Intercept axios fetch requests for Dynamic Rate limiting or backend services testing
const originalFetch = window.fetch;
window.fetch = async function(...args) {
  const [url, config] = args;
  
  if (typeof url === 'string' && (url.startsWith('/api/') || url.startsWith('api/'))) {
    return new Promise((resolve) => {
      const id = Math.random().toString();
      const method = config?.method?.toUpperCase() || 'GET';
      let data = undefined;
      
      if (config?.body) {
        try {
          data = typeof config.body === 'string' ? JSON.parse(config.body) : config.body;
        } catch (e) {
          data = config.body;
        }
      }
      
      window.parent.postMessage({ type: 'AXIOS_REQUEST', id, url, data, method }, '*');
      
      const timeout = setTimeout(() => {
         window.removeEventListener('message', listener);
         resolve({
            ok: false,
            status: 504,
            json: async () => ({ message: 'Request timed out after 10 seconds. Check your backend code for errors.' }),
            text: async () => 'Request timed out'
         });
      }, 10000);
      
      const listener = (event) => {
         if (event.data && event.data.type === 'AXIOS_RESPONSE' && event.data.id === id) {
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            if (event.data.error) {
               resolve({
                 ok: false,
                 status: 400,
                 json: async () => ({ message: event.data.error }),
                 text: async () => event.data.error
               });
            } else {
               resolve({
                 ok: true,
                 status: 200,
                 json: async () => event.data.data,
                 text: async () => JSON.stringify(event.data.data)
               });
            }
         }
      };
      window.addEventListener('message', listener);
    });
  }
  
  return originalFetch(...args);
};

import * as AppModule from './App';
const AppComp = AppModule.default || Object.values(AppModule)[0] || (() => <div>No valid component exported from App.tsx</div>);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppComp />
  </React.StrictMode>
);
    `;

    return spFiles;
  }, [files, question, isReact]);

  const hasFrontendFiles = useMemo(() => {
    return isReact || files.some(f => f.filename.startsWith('frontend/src/') && f.filename.endsWith('.tsx'));
  }, [isReact, files]);

  if (isLoading || !question) {
    return <div className="h-screen flex items-center justify-center bg-zinc-950"><Loader text="Loading Workspace..." /></div>;
  }

  const activeFile = files[activeFileIndex];

  // Helper to render markdown inside AI chat bubble
  const renderMarkdown = (text: string) => {
    return <ReactMarkdown>{text}</ReactMarkdown>;
  };

  return (
    <div className="dark h-screen flex flex-col bg-zinc-950 text-zinc-350 font-sans transition-colors duration-200 overflow-hidden">
      {/* Workspace Top Header Control Nav */}
      <div className="h-14 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg flex items-center justify-center"
            title="Back to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50 font-sans truncate max-w-xs md:max-w-md">
            {question.title}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border tracking-wider ${
            question.difficulty === "easy" ? "bg-green-50 text-green-600 border-green-200" :
            question.difficulty === "medium" ? "bg-amber-50 text-amber-600 border-amber-200" :
            "bg-red-50 text-red-600 border-red-200"
          }`}>
            {question.difficulty}
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Theme customizer drop down */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase hidden md:inline">Theme</span>
            <select
              value={selectedEditorTheme.id}
              onChange={(e) => {
                const found = editorThemes.find(t => t.id === e.target.value);
                if (found) setSelectedEditorTheme(found);
              }}
              className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 outline-none text-zinc-700 dark:text-zinc-300 font-medium"
            >
              {editorThemes.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

          {/* Action trigger buttons */}
          <Button variant="secondary" onClick={() => handleSubmit(false)} isLoading={actionType === 'run'} disabled={actionType !== 'idle'}>
            <Play size={12} className="inline mr-1" fill="currentColor" />
            {actionType === 'run' ? 'Running...' : 'Run Code'}
          </Button>

          <Button variant="primary" onClick={() => handleSubmit(true)} isLoading={actionType === 'submit'} disabled={actionType !== 'idle'}>
            <Sparkles size={12} className="inline mr-1" />
            {actionType === 'submit' ? 'Submitting...' : 'Submit Code'}
          </Button>
        </div>
      </div>

      {/* Main Split-Screen Panel Group */}
      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        
        {/* MOBILE TAB NAV (Visible only on md:hidden) */}
        <div className="md:hidden flex overflow-x-auto bg-zinc-900 border-b border-zinc-800 shrink-0 shadow-md z-10 hide-scrollbar">
          <button onClick={() => setMobileTab('problem')} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${mobileTab === 'problem' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>Problem</button>
          <button onClick={() => setMobileTab('scratchpad')} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${mobileTab === 'scratchpad' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>Scratchpad</button>
          {hasFrontendFiles && (
            <button onClick={() => setMobileTab('preview')} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${mobileTab === 'preview' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>Preview</button>
          )}
          <button onClick={() => setMobileTab('editor')} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${mobileTab === 'editor' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>Editor</button>
          <button onClick={() => setMobileTab('console')} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${mobileTab === 'console' ? 'text-indigo-400 border-b-2 border-indigo-500 bg-zinc-800/50' : 'text-zinc-500 hover:text-zinc-300'}`}>Console</button>
        </div>

        {/* DESKTOP PANEL GROUP (Hidden on mobile) */}
        <div className="hidden md:flex flex-1 h-full w-full">
          <PanelGroup orientation="horizontal" id="fcp-workspace-h-v3">
          
          {/* Left Section Panel (Instructions, Scratchpad, Live Sandbox Preview) */}
          <Panel defaultSize={40} minSize={20} className="flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            {/* Tab selector menu */}
            <div className="h-9 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 flex items-center px-2 justify-between shrink-0">
              <div className="flex space-x-1">
                <button
                  onClick={() => setLeftTab("instructions")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    leftTab === "instructions"
                      ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Instructions
                </button>
                <button
                  onClick={() => setLeftTab("scratchpad")}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                    leftTab === "scratchpad"
                      ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                      : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                  }`}
                >
                  Scratchpad
                </button>
                {hasFrontendFiles && (
                  <button
                    onClick={() => setLeftTab("preview")}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                      leftTab === "preview"
                        ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm border border-zinc-200/50 dark:border-zinc-800/50"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    Sandbox Preview
                  </button>
                )}
              </div>
            </div>

            {/* Tab contents viewport */}
            <div className="flex-1 overflow-y-auto min-h-0 relative">
              {leftTab === "instructions" && (
                <div className="p-6">
                  <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Problem Statement</h2>
                  <div className="prose prose-invert prose-sm max-w-none text-zinc-800 dark:text-zinc-300 leading-relaxed">
                    <ReactMarkdown>{question.description}</ReactMarkdown>
                  </div>

                  <h3 className="text-md font-bold text-zinc-900 dark:text-white mt-10 mb-4 border-b border-zinc-200 dark:border-zinc-800 pb-2">Test Cases</h3>
                  <ul className="space-y-3">
                    {question.testCases?.map((tc, idx) => (
                      <li key={idx} className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 leading-relaxed">{tc.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {leftTab === "scratchpad" && (
                <div className="p-5 flex flex-col h-full space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
                    <div>
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-200 flex items-center gap-1.5">
                        <PenTool size={12} className="text-indigo-500" />
                        <span>Interactive Scratchpad</span>
                      </h4>
                      <p className="text-[10px] text-zinc-400 mt-0.5">Write notes, draft solution structures, or paste helpers</p>
                    </div>

                    <button
                      onClick={handleSaveScratchpad}
                      disabled={isSavingScratchpad}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition cursor-pointer"
                    >
                      <Save size={12} />
                      <span>{isSavingScratchpad ? "Saving..." : "Save Notes"}</span>
                    </button>
                  </div>

                  <textarea
                    value={scratchpadContent}
                    onChange={(e) => setScratchpadContent(e.target.value)}
                    className="flex-1 w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-950 outline-none resize-none min-h-[300px] leading-relaxed"
                  />
                  <p className="text-[9px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-1 leading-none shrink-0">
                    <AlertCircle size={10} />
                    <span>Notes are saved instantly to the database and synced on reload.</span>
                  </p>
                </div>
              )}

              {leftTab === "preview" && hasFrontendFiles && (
                <div className="h-full flex flex-col bg-white">
                  <div className="bg-zinc-800 text-white text-[10px] font-bold uppercase px-3 py-1.5 flex items-center justify-between">
                    <span>Live Render Panel</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1 overflow-hidden relative flex flex-col">
                    <style>{`
                      .sp-wrapper, .sp-layout {
                        height: 100% !important;
                        min-height: 100% !important;
                        flex: 1 !important;
                        border-radius: 0 !important;
                        border: none !important;
                      }
                      .sp-preview-container, .sp-preview-iframe {
                        height: 100% !important;
                        min-height: 100% !important;
                        flex: 1 !important;
                      }
                    `}</style>
                    <SandpackProvider
                      template="react-ts"
                      files={sandpackFiles}
                      theme="light"
                      customSetup={{
                        dependencies: {
                          "axios": "^1.6.0"
                        }
                      }}
                    >
                      <SandpackLayout style={{ flex: 1, height: '100%', minHeight: '100%', width: '100%', borderRadius: 0, border: 'none' }}>
                        <SandpackPreview
                          showOpenInCodeSandbox={false}
                          showRefreshButton={true}
                          style={{ height: '100%', flex: 1 }}
                        />
                      </SandpackLayout>
                    </SandpackProvider>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#252526] border-x border-[#333] hover:bg-indigo-600 transition-colors cursor-col-resize z-50 flex items-center justify-center">
            <div className="h-8 w-0.5 bg-zinc-650 rounded" />
          </PanelResizeHandle>

          {/* Right Section Panel (Monaco Editor & Run Console Outputs) */}
          <Panel defaultSize={60} minSize={20} className="flex flex-col bg-[#1e1e1e] min-w-0">
            <PanelGroup orientation="vertical" id="fcp-workspace-v-v3">
              
              {/* Top part: Editor */}
              <Panel defaultSize={70} minSize={30} className="flex flex-col min-h-0 bg-zinc-950">
                {/* Editor File Tab Header list */}
                <div className="flex bg-[#252526] border-b border-[#333] justify-between items-end pr-2 shrink-0 min-w-0">
                  <div className="flex overflow-x-auto gap-2 px-2 pt-2 flex-1 min-w-0">
                    {files.map((file, idx) => (
                      <button
                        key={file.filename}
                        onClick={() => { setActiveFileIndex(idx); }}
                        title={file.filename}
                        className={`px-5 py-2 text-xs font-semibold border-t-2 border-x border-x-transparent shrink-0 transition-colors flex items-center gap-2 whitespace-nowrap rounded-t-md cursor-pointer ${idx === activeFileIndex
                          ? 'border-t-indigo-500 bg-[#1e1e1e] text-indigo-400 border-x-[#333]'
                          : 'border-t-transparent text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'
                          }`}
                      >
                        {file.filename.split('/').pop()}
                        {!file.editable && (
                          <Lock size={10} className="text-zinc-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Monaco Editor Container */}
                <div className="flex-1 flex flex-row min-h-0 overflow-hidden relative">
                  <div className={`flex-1 relative block ${selectedEditorTheme.bg}`}>
                    <Editor
                      height="100%"
                      language={activeFile?.language === 'tsx' ? 'typescript' : activeFile?.language || 'typescript'}
                      path={activeFile?.filename}
                      theme={selectedEditorTheme.id === 'github-light' ? 'light' : 'vs-dark'}
                      value={activeFile?.content || ''}
                      onChange={handleEditorChange}
                      beforeMount={handleEditorBeforeMount}
                      options={{
                        readOnly: !activeFile?.editable,
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        automaticLayout: true
                      }}
                    />
                  </div>
                </div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-[#252526] border-y border-[#333] hover:bg-indigo-600 transition-colors cursor-row-resize z-50 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-zinc-650 rounded" />
              </PanelResizeHandle>

              {/* Bottom part: Test Results Console */}
              <Panel defaultSize={30} minSize={10} className="bg-[#0d0d0d] flex flex-col">
                <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex justify-between items-center text-xs font-bold tracking-wider text-gray-400 uppercase shrink-0">
                  <span>{evaluation ? 'Test Results' : 'Execution Output'}</span>
                  {output && (
                    <div className="flex items-center gap-3">
                      {evaluation && (
                        <span className="font-mono normal-case text-gray-300">
                          {evaluation.summary.passed}/{evaluation.summary.total} cases passed
                        </span>
                      )}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${
                        output.status === 'pass' 
                          ? 'bg-green-500/10 text-green-400 border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}>
                        {output.status === 'pass' ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-grow overflow-y-auto p-4 font-mono text-xs min-h-0 bg-[#0d0d0d] text-zinc-350">
                  {!output && !evaluation && (
                    <div className="text-zinc-600 italic h-full flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider text-[10px]">
                      <Terminal size={14} />
                      <span>Console outputs will display here. Click Run/Submit to trigger tests.</span>
                    </div>
                  )}

                  {output && !evaluation && (
                    <pre className="whitespace-pre-wrap leading-relaxed text-zinc-300">{output.message}</pre>
                  )}

                  {evaluation && (
                    <div className="flex flex-col lg:flex-row gap-4 h-full min-h-0">
                      {/* Left: Test list */}
                      <div className="w-full lg:w-1/3 flex flex-col gap-1.5 overflow-y-auto pr-2 min-h-0">
                        {evaluation.results.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedTestCase(idx)}
                            className={`p-3 rounded-lg border text-left flex items-center justify-between cursor-pointer transition ${
                              selectedTestCase === idx
                                ? 'bg-zinc-900 border-indigo-500/40 text-indigo-400'
                                : 'bg-[#151515] border-zinc-800 text-zinc-400 hover:bg-[#1a1a1a]'
                            }`}
                          >
                            <span className="truncate pr-2 font-semibold">Test {idx + 1}: {result.description}</span>
                            {result.passed ? (
                              <CheckCircle2 size={13} className="text-green-500 shrink-0" />
                            ) : (
                              <XCircle size={13} className="text-red-500 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>

                      {/* Right: Detailed Test Case output */}
                      {(() => {
                        const tc = evaluation.results[selectedTestCase];
                        if (!tc) return null;

                        return (
                          <div className="flex-1 bg-[#121212] border border-zinc-800 rounded-xl p-4 overflow-y-auto min-h-0 space-y-4">
                            <div>
                              <h4 className="text-zinc-450 font-bold uppercase tracking-wider text-[10px] mb-1">Description</h4>
                              <p className="text-zinc-100 font-semibold">{tc.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-zinc-450 font-bold uppercase tracking-wider text-[10px] mb-1">Expected Output</h4>
                                <pre className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
                                  {tc.expectedOutput !== undefined ? JSON.stringify(tc.expectedOutput, null, 2) : 'N/A'}
                                </pre>
                              </div>
                              <div>
                                <h4 className="text-zinc-450 font-bold uppercase tracking-wider text-[10px] mb-1">Actual Output</h4>
                                <pre className={`p-2.5 rounded-lg border overflow-x-auto text-[11px] leading-relaxed ${
                                  tc.passed 
                                    ? 'bg-zinc-950 border-zinc-900 text-green-400' 
                                    : 'bg-red-950/20 border-red-900/20 text-red-400'
                                }`}>
                                  {tc.actualOutput !== undefined ? JSON.stringify(tc.actualOutput, null, 2) : 'N/A'}
                                </pre>
                              </div>
                            </div>

                            {tc.error && (
                              <div>
                                <h4 className="text-red-400 font-bold uppercase tracking-wider text-[10px] mb-1">Execution Error</h4>
                                <pre className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg text-red-400 overflow-x-auto text-[11px] leading-relaxed whitespace-pre-wrap font-mono">
                                  {tc.error}
                                </pre>
                              </div>
                            )}

                            <div className="flex justify-between items-center text-[10px] text-zinc-500 font-sans border-t border-zinc-800 pt-3">
                              <span>Execution time: {tc.executionTimeMs}ms</span>
                              <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                                tc.passed ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                              }`}>
                                {tc.passed ? 'Passed' : 'Failed'}
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
              </Panel>

            </PanelGroup>
          </Panel>

          </PanelGroup>
        </div>

        {/* MOBILE CONTENT VIEW (Visible only on md:hidden) */}
        <div className="flex-1 flex flex-col md:hidden overflow-hidden relative bg-zinc-950">
          {mobileTab === 'problem' && (
            <div className="p-5 overflow-y-auto h-full">
              <h2 className="text-xl font-bold text-white mb-4">Problem Statement</h2>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300">
                <ReactMarkdown>{question.description}</ReactMarkdown>
              </div>
              <h3 className="text-md font-bold text-white mt-8 mb-3 border-b border-zinc-800 pb-2">Test Cases</h3>
              <ul className="space-y-3">
                {question.testCases?.map((tc, idx) => (
                  <li key={idx} className="bg-zinc-900 p-4 rounded-xl border border-zinc-800">
                    <p className="text-xs font-semibold text-zinc-300 leading-relaxed">{tc.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mobileTab === 'scratchpad' && (
            <div className="p-5 flex flex-col h-full space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800 shrink-0">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <PenTool size={12} className="text-indigo-500" />
                    <span>Interactive Scratchpad</span>
                  </h4>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Write notes, draft solution structures, or paste helpers</p>
                </div>

                <button
                  onClick={handleSaveScratchpad}
                  disabled={isSavingScratchpad}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-[11px] font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-xl transition cursor-pointer"
                >
                  <Save size={12} />
                  <span>{isSavingScratchpad ? "Saving..." : "Save Notes"}</span>
                </button>
              </div>

              <textarea
                value={scratchpadContent}
                onChange={(e) => setScratchpadContent(e.target.value)}
                className="flex-1 w-full bg-zinc-950 text-zinc-100 border border-zinc-800 rounded-xl p-4 font-mono text-xs focus:ring-1 focus:ring-indigo-500 focus:bg-zinc-900 outline-none resize-none min-h-[300px] leading-relaxed"
              />
              <p className="text-[9px] text-zinc-500 flex items-center space-x-1 leading-none shrink-0">
                <AlertCircle size={10} />
                <span>Notes are saved instantly to the database and synced on reload.</span>
              </p>
            </div>
          )}

          {mobileTab === 'preview' && hasFrontendFiles && (
            <div className="h-full flex flex-col bg-white">
              <div className="bg-zinc-800 text-white text-[10px] font-bold uppercase px-3 py-1.5 flex items-center justify-between">
                <span>Live Render Panel</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="flex-1 overflow-hidden relative flex flex-col">
                <style>{`
                  .sp-wrapper, .sp-layout {
                    height: 100% !important;
                    min-height: 100% !important;
                    flex: 1 !important;
                    border-radius: 0 !important;
                    border: none !important;
                  }
                  .sp-preview-container, .sp-preview-iframe {
                    height: 100% !important;
                    min-height: 100% !important;
                    flex: 1 !important;
                  }
                `}</style>
                <SandpackProvider
                  template="react-ts"
                  files={sandpackFiles}
                  theme="light"
                  customSetup={{
                    dependencies: {
                      "axios": "^1.6.0"
                    }
                  }}
                >
                  <SandpackLayout style={{ flex: 1, height: '100%', minHeight: '100%', width: '100%', borderRadius: 0, border: 'none' }}>
                    <SandpackPreview
                      showOpenInCodeSandbox={false}
                      showRefreshButton={true}
                      style={{ height: '100%', flex: 1 }}
                    />
                  </SandpackLayout>
                </SandpackProvider>
              </div>
            </div>
          )}

          {mobileTab === 'editor' && (
            <div className="flex flex-col h-full">
              <div className="flex overflow-x-auto gap-2 bg-[#252526] p-2 shrink-0 border-b border-[#333]">
                {files.map((file, idx) => (
                  <button
                    key={file.filename}
                    onClick={() => setActiveFileIndex(idx)}
                    className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors ${idx === activeFileIndex ? 'bg-[#1e1e1e] text-indigo-400 shadow-sm border border-zinc-700' : 'text-zinc-400 hover:bg-[#2d2d2d]'}`}
                  >
                    {file.filename.split('/').pop()}
                    {!file.editable && <Lock size={10} className="inline ml-1 text-zinc-500" />}
                  </button>
                ))}
              </div>
              <div className={`flex-1 relative min-h-0 ${selectedEditorTheme.bg}`}>
                <Editor
                  height="100%"
                  language={activeFile?.language === 'tsx' ? 'typescript' : activeFile?.language || 'typescript'}
                  path={'mobile-' + activeFile?.filename}
                  theme={selectedEditorTheme.id === 'github-light' ? 'light' : 'vs-dark'}
                  value={activeFile?.content || ''}
                  onChange={handleEditorChange}
                  beforeMount={handleEditorBeforeMount}
                  options={{
                    readOnly: !activeFile?.editable,
                    minimap: { enabled: false },
                    fontSize: 14,
                    fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
                    padding: { top: 16 },
                    scrollBeyondLastLine: false,
                    automaticLayout: true
                  }}
                />
              </div>
            </div>
          )}

          {mobileTab === 'console' && (
            <div className="flex flex-col h-full bg-[#0d0d0d] p-4 overflow-y-auto">
              {!output && !evaluation && (
                <div className="text-zinc-600 italic h-full flex flex-col items-center justify-center gap-3">
                  <Terminal size={32} className="text-zinc-800" />
                  <span className="text-xs font-bold text-center tracking-wide">RUN OR SUBMIT CODE TO SEE OUTPUT</span>
                </div>
              )}
              {output && !evaluation && (
                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-zinc-300">{output.message}</pre>
              )}
              {evaluation && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800">
                     <span className="text-xs font-bold text-white bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">{evaluation.summary.passed}/{evaluation.summary.total} Cases Passed</span>
                  </div>
                  {evaluation.results.map((result, idx) => (
                    <div key={idx} className="bg-[#121212] border border-zinc-800 rounded-xl p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold text-white">Test Case {idx + 1}</span>
                        {result.passed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 mb-3">{result.description}</p>
                      {!result.passed && result.expectedOutput !== undefined && (
                        <div className="mt-3 space-y-3 pt-3 border-t border-zinc-800/50">
                           <div>
                             <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Expected</div>
                             <pre className="text-[10px] text-zinc-300 bg-zinc-900 p-2.5 rounded-lg overflow-x-auto">{JSON.stringify(result.expectedOutput)}</pre>
                           </div>
                           <div>
                             <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Actual</div>
                             <pre className="text-[10px] text-red-400 bg-red-950/20 border border-red-900/30 p-2.5 rounded-lg overflow-x-auto">{JSON.stringify(result.actualOutput)}</pre>
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Modal Overlay */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-[380px] h-[550px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl flex flex-col justify-between z-50 overflow-hidden transition-all duration-300">
          {/* Chat header */}
          <div className="h-12 border-b border-zinc-200 dark:border-zinc-800 px-4 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/40">
            <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <Sparkles size={13} className="text-indigo-500 animate-pulse" />
              <span>AI Workspace Buddy</span>
            </span>
            <button
              onClick={() => setIsChatOpen(false)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-lg font-bold leading-none transition"
            >
              &times;
            </button>
          </div>

          {/* Chat Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/50 dark:bg-zinc-950/20">
            {chatHistory.length === 0 ? (
              <div className="text-center py-12 px-6">
                <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="h-5 w-5 text-indigo-500" />
                </div>
                <h5 className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Stuck or Confused?</h5>
                <p className="text-[10px] text-zinc-400 max-w-[200px] mx-auto mt-1 leading-relaxed">
                  Ask me to explain code schemas, identify compiler bugs, or outline solutions!
                </p>
              </div>
            ) : (
              chatHistory.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-[85%] ${isUser ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isUser
                          ? "bg-indigo-600 text-white rounded-tr-none shadow-sm font-medium"
                          : "bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-250 rounded-tl-none border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm"
                      }`}
                    >
                      {renderMarkdown(msg.text)}
                    </div>
                    <span className="text-[8px] text-zinc-400 font-mono mt-1 px-1">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                );
              })
            )}

            {isAiTyping && (
              <div className="flex items-center space-x-1 mr-auto bg-white dark:bg-zinc-900 p-3 rounded-2xl rounded-tl-none text-zinc-400 border border-zinc-200/40 dark:border-zinc-800/40 shadow-sm">
                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" />
                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input message form */}
          <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChatMessage()}
              placeholder="Ask helper..."
              className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-105 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
            />
            <button
              onClick={sendChatMessage}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition shadow-sm active:scale-95 cursor-pointer"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Chatbot FAB Toggle */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center">
        {!isChatOpen && (
          <div className="mr-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-zinc-100 dark:text-zinc-900 text-[10px] font-bold rounded-lg shadow-xl font-sans animate-bounce whitespace-nowrap border border-zinc-800/20 dark:border-zinc-200/20">
            Need help? Ask AI! ✨
          </div>
        )}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`flex items-center justify-center h-14 w-14 rounded-full text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white dark:border-zinc-900 cursor-pointer ${
            isChatOpen
              ? "bg-rose-500 hover:bg-rose-600"
              : "bg-indigo-600 hover:bg-indigo-700"
          }`}
          title="Chat with AI Buddy"
        >
          {isChatOpen ? (
            <span className="text-2xl font-semibold leading-none">&times;</span>
          ) : (
            <MessageSquare size={20} className="animate-pulse" />
          )}
        </button>
      </div>

    </div>
  );
};

export default CodeWorkspace;
