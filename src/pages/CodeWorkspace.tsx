import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { SandpackProvider, SandpackPreview, SandpackLayout } from '@codesandbox/sandpack-react';
import { learnerService } from '../services/learner.service';
import type { IQuestion, IStarterFile } from '../types';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';

// ============================
// Code Workspace Page
// ============================

// ---- main workspace component ----

const handleEditorBeforeMount = (monaco: any) => {
  // 1. Configure compiler options for React/JSX and Node module resolution
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

  // 2. Ignore missing module errors (e.g. Cannot find module '@nestjs/common')
  // Code 2307: Cannot find module '...'
  // Code 2792: Cannot find module '...'. Did you mean to set the 'moduleResolution' option to 'nodenext'...
  // Code 2303: Circular definition of import alias
  // Code 2459: Module declares 'X' locally, but it is not exported
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
  const [activeView, setActiveView] = useState<'code' | 'preview'>('code');

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

  useEffect(() => {
    if (questionId) fetchQuestion(questionId);
  }, [questionId]);

  const fetchQuestion = async (qId: string) => {
    try {
      const data = await learnerService.getQuestionById(qId);
      setQuestion(data);

      // Start with starter code as baseline
      let loadedFiles = data.starterCode || [];

      // Try to restore last submission — overlays saved content into editable files
      try {
        const lastSubmission = await learnerService.getLastSubmission(qId);
        if (lastSubmission && lastSubmission.files.length > 0) {
          loadedFiles = loadedFiles.map((starterFile) => {
            const saved = lastSubmission.files.find(
              (sf) => sf.filename === starterFile.filename,
            );
            // Only restore if the file is editable and we have saved content
            return saved && starterFile.editable
              ? { ...starterFile, content: saved.content }
              : starterFile;
          });
        }
      } catch {
        // Silently ignore — just use starter code if submission fetch fails
      }

      setFiles(loadedFiles);
    } catch (err) {
      toast.error('Failed to load question');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'AXIOS_REQUEST') {
        try {
          if (!questionId) throw new Error("Question ID is missing");
          const result = await learnerService.executeEndpoint(questionId, files, event.data.method, event.data.url, event.data.data);

          if (result.status === 'fail') {
            // Bug fix #1: Handle output being string or object
            const errMsg = typeof result.output === 'string'
              ? result.output
              : (result.output?.error || result.output?.message || JSON.stringify(result.output));
            throw new Error(errMsg);
          }

          // Send response back to the Sandpack iframe
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.contentWindow?.postMessage({ type: 'AXIOS_RESPONSE', id: event.data.id, data: result.output }, '*');
          });
        } catch (e: any) {
          // Send error back to the Sandpack iframe
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
    // Bug fix: Ignore onChange events that are triggered by Monaco's internal model switching
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
        // New structured evaluation response
        setEvaluation(result.evaluation);
        setOutput({
          status: result.status,
          message: `${result.evaluation.summary.passed}/${result.evaluation.summary.total} test cases passed`,
        });
      } else {
        // Legacy single-output response
        setOutput({
          status: result.status,
          message: result.output || 'No output',
        });
      }

      // Auto-open preview on successful run
      if (result.status === 'pass' && !isSubmit) {
        if (hasFrontendFiles) {
          setActiveView('preview');
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

  // Map files for Sandpack
  // Identify if it's explicitly or implicitly a React-only question (legacy support)
  const isReact = useMemo(() => {
    if (question?.type?.toLowerCase() === 'react') return true;
    const hasTsx = files.some(f => f.filename.endsWith('.tsx'));
    const hasFullstackPrefix = files.some(f => f.filename.startsWith('frontend/src/'));
    return hasTsx && !hasFullstackPrefix;
  }, [question, files]);

  const sandpackFiles = useMemo(() => {
    const spFiles: Record<string, string> = {};
    let mainComponentName = 'App';
    let mainComponentFile = '';

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

        if (!mainComponentFile && f.filename.endsWith('.tsx') && name !== '/App.tsx' && name !== '/index.tsx') {
          mainComponentFile = name;
          const match = f.content.match(/export (?:const|function|class) (\w+)/);
          if (match) mainComponentName = match[1];
        }
      }
    });

    if (!spFiles['/App.tsx'] && mainComponentFile) {
      const isDefault = !spFiles[mainComponentFile].includes(`export const ${mainComponentName}`);
      const importStatement = isDefault
        ? `import ${mainComponentName} from '.${mainComponentFile.replace('.tsx', '')}';`
        : `import { ${mainComponentName} } from '.${mainComponentFile.replace('.tsx', '')}';`;

      spFiles['/App.tsx'] = `
        import React from 'react';
        ${importStatement}
        
        export default function App() {
          return (
            <div style={{ padding: 20 }}>
              <${mainComponentName} />
            </div>
          );
        }
      `;
    }

    if (!spFiles['/styles.css']) {
      spFiles['/styles.css'] = `body { font-family: sans-serif; background: #fff; margin: 0; color: #000; }`;
    }

    spFiles['/index.tsx'] = `
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

// --- INJECT AXIOS MOCK FOR FULLSTACK DSA ---
import axios from 'axios';

const createMockMethod = (method) => async (url, configOrData, config) => {
   return new Promise((resolve, reject) => {
      const id = Math.random().toString();
      let data = configOrData;
      
      // Handle axios.get(url, config) vs axios.post(url, data, config)
      if (method === 'GET' || method === 'DELETE') {
         data = configOrData?.params || configOrData;
      }
      
      window.parent.postMessage({ type: 'AXIOS_REQUEST', id, url, data, method }, '*');
      
      // Bug fix #6: Timeout to prevent infinite hang
      const timeout = setTimeout(() => {
         window.removeEventListener('message', listener);
         reject(new Error('Request timed out after 10 seconds. Check your backend code for errors.'));
      }, 10000);
      
      const listener = (event) => {
         if (event.data && event.data.type === 'AXIOS_RESPONSE' && event.data.id === id) {
            clearTimeout(timeout);
            window.removeEventListener('message', listener);
            if (event.data.error) reject(new Error(event.data.error));
            else resolve({ data: event.data.data, status: 200 });
         }
      };
      window.addEventListener('message', listener);
   });
};

axios.post = createMockMethod('POST');
axios.get = createMockMethod('GET');
axios.put = createMockMethod('PUT');
axios.delete = createMockMethod('DELETE');

// --- INJECT FETCH MOCK FOR FULLSTACK DSA ---
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const [resource, config] = args;
  const url = typeof resource === 'string' ? resource : resource.url;
  
  // Intercept relative paths and /api/ paths
  if (url.startsWith('/api/') || url.startsWith('http://localhost') || url.startsWith('/')) {
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
// ---------------------------------------------

import * as AppModule from './App';
const AppComp = AppModule.default || Object.values(AppModule)[0] || (() => <div>No valid component exported from App.tsx</div>);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <AppComp />
  </React.StrictMode>
);
    `;

    console.log("Sandpack Files Generated:", spFiles);
    return spFiles;
  }, [files, question]);

  // Bug fix #7: Show Sandpack preview when question is react or has frontend files
  const hasFrontendFiles = useMemo(() => {
    return isReact || files.some(f => f.filename.startsWith('frontend/src/') && f.filename.endsWith('.tsx'));
  }, [isReact, files]);

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
          <span className={`text-xs px-2 py-0.5 rounded font-bold uppercase tracking-wider ${question.difficulty === 'easy' ? 'bg-green-500/10 text-green-400' :
            question.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400' :
              'bg-red-500/10 text-red-400'
            }`}>{question.difficulty}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => handleSubmit(false)} isLoading={actionType === 'run'} disabled={actionType !== 'idle'}>
            {actionType === 'run' ? 'Running...' : 'Run Code'}
          </Button>
          <Button variant="primary" onClick={() => handleSubmit(true)} isLoading={actionType === 'submit'} disabled={actionType !== 'idle'}>
            {actionType === 'submit' ? 'Submitting...' : 'Submit Code'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <PanelGroup orientation="horizontal" id="fcp-workspace-h-v3">
          {/* Left Panel: Description */}
          <Panel defaultSize={40} minSize={20} className="flex flex-col bg-[#1e1e1e] overflow-y-auto">
            <div style={{ padding: '10px 10px' }}>
              <h2 className="text-2xl font-bold text-white mb-6">Problem Statement</h2>
              <div className="prose prose-invert prose-sm max-w-none text-gray-300">
                <ReactMarkdown>{question.description}</ReactMarkdown>
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
          </Panel>

          <PanelResizeHandle className="w-1.5 bg-[#252526] border-x border-[#333] hover:bg-blue-500 transition-colors cursor-col-resize z-50 flex items-center justify-center">
            <div className="h-8 w-0.5 bg-gray-500 rounded" />
          </PanelResizeHandle>

          {/* Right Panel: Editor + Output */}
          <Panel defaultSize={60} minSize={20} className="flex flex-col bg-[#1e1e1e] min-w-0">
            <PanelGroup orientation="vertical" id="fcp-workspace-v-v3">
              <Panel defaultSize={70} minSize={30} className="flex flex-col min-h-0">
                {/* File Tabs & View Toggle */}
                <div className="flex bg-[#252526] border-b border-[#333] justify-between items-end pr-2 shrink-0 min-w-0">
                  <div className="flex overflow-x-auto gap-2 px-2 pt-2 flex-1 min-w-0">
                    {files.map((file, idx) => (
                      <button
                        key={file.filename}
                        onClick={() => { setActiveFileIndex(idx); setActiveView('code'); }}
                        title={file.filename}
                        className={`px-5 py-2.5 text-sm font-medium border-t-2 border-x border-x-transparent shrink-0 transition-colors flex items-center gap-2 whitespace-nowrap rounded-t-md ${idx === activeFileIndex
                          ? 'border-t-blue-500 bg-[#1e1e1e] text-blue-400 border-x-[#333]'
                          : 'border-t-transparent text-gray-500 hover:text-gray-300 hover:bg-[#2d2d2d]'
                          }`}
                      >
                        {file.filename.split('/').pop()}
                        {!file.editable && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        )}
                      </button>
                    ))}
                  </div>

                  {hasFrontendFiles && (
                    <div className="flex bg-[#1e1e1e] p-1 rounded-md border border-[#333] shrink-0 mb-1.5 ml-2">
                      <button
                        onClick={() => setActiveView('code')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeView === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Code
                      </button>
                      <button
                        onClick={() => setActiveView('preview')}
                        className={`px-3 py-1 text-xs font-medium rounded transition-colors ${activeView === 'preview' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                      >
                        Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Editor + Live Preview Viewport */}
                <div className="flex-1 flex flex-row min-h-0 overflow-hidden">
                  <div className={`flex-1 relative ${activeView === 'code' ? 'block' : 'hidden'}`}>
                    <Editor
                      height="100%"
                      language={activeFile?.language === 'tsx' ? 'typescript' : activeFile?.language || 'typescript'}
                      path={activeFile?.filename}
                      theme="vs-dark"
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
                      }}
                    />
                  </div>

                  {hasFrontendFiles && (
                    <div className={`flex-col flex-1 h-full bg-white ${activeView === 'preview' ? 'flex' : 'hidden'}`}>
                      <div className="bg-gray-800 text-white text-xs px-2 py-1 uppercase">
                        <span>Live Preview</span>
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

              <PanelResizeHandle className="h-1.5 bg-[#252526] border-y border-[#333] hover:bg-blue-500 transition-colors cursor-row-resize z-50 flex items-center justify-center">
                <div className="w-8 h-0.5 bg-gray-500 rounded" />
              </PanelResizeHandle>

              {/* Output / Test Results Panel */}
              <Panel defaultSize={30} minSize={10} className="bg-[#0d0d0d] flex flex-col">
                <div className="px-4 py-2 bg-[#252526] border-b border-[#333] flex justify-between items-center text-xs font-bold tracking-wider text-gray-400 uppercase shrink-0">
                  <span>{evaluation ? 'Test Results' : 'Execution Output'}</span>
                  {output && (
                    <div className="flex items-center gap-3">
                      {evaluation && (
                        <span className="font-mono normal-case text-gray-300">
                          {evaluation.summary.passed}/{evaluation.summary.total} passed
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded ${output.status === 'pass' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {output.status === 'pass' ? 'Accepted' : 'Failed'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 flex overflow-hidden">
                  {!output ? (
                    <div className="flex-1 flex items-center justify-center">
                      <span className="text-gray-600 text-sm">Click 'Submit Code' to run your solution against the test cases...</span>
                    </div>
                  ) : evaluation ? (
                    /* ---- LeetCode-style Test Case Results ---- */
                    <>
                      {/* Left: Test case tabs */}
                      <div className="w-48 border-r border-[#333] overflow-y-auto bg-[#1a1a1a]">
                        {evaluation.results.map((tc, idx) => (
                          <button
                            key={tc.index}
                            onClick={() => setSelectedTestCase(idx)}
                            className={`w-full px-3 py-2.5 text-left text-xs flex items-center gap-2 border-b border-[#222] transition-colors ${idx === selectedTestCase
                              ? 'bg-[#2d2d2d] text-white'
                              : 'text-gray-500 hover:bg-[#252526] hover:text-gray-300'
                              }`}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 ${tc.passed ? 'bg-green-500' : 'bg-red-500'}`} />
                            <span className="truncate">Case {tc.index}</span>
                            <span className="ml-auto text-[10px] text-gray-600">{tc.executionTimeMs}ms</span>
                          </button>
                        ))}
                      </div>

                      {/* Right: Selected test case details */}
                      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-3">
                        {(() => {
                          const tc = evaluation.results[selectedTestCase];
                          if (!tc) return null;
                          return (
                            <>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-sm font-bold ${tc.passed ? 'text-green-400' : 'text-red-400'}`}>
                                  {tc.passed ? '✓ Passed' : '✗ Failed'}
                                </span>
                                <span className="text-gray-600">— {tc.description}</span>
                              </div>

                              {tc.error && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400">
                                  <div className="text-[10px] uppercase tracking-wider text-red-500 mb-1 font-bold">Runtime Error</div>
                                  {tc.error}
                                </div>
                              )}

                              {tc.visible ? (
                                <>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Input</div>
                                    <div className="bg-[#1e1e1e] border border-[#333] rounded p-2.5 text-gray-300">
                                      <pre className="whitespace-pre-wrap">{typeof tc.input === 'object' ? JSON.stringify(tc.input, null, 2) : String(tc.input)}</pre>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Expected Output</div>
                                    <div className="bg-[#1e1e1e] border border-[#333] rounded p-2.5 text-green-400">
                                      <pre className="whitespace-pre-wrap">{typeof tc.expectedOutput === 'object' ? JSON.stringify(tc.expectedOutput, null, 2) : String(tc.expectedOutput)}</pre>
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-bold">Actual Output</div>
                                    <div className={`bg-[#1e1e1e] border rounded p-2.5 ${tc.passed ? 'border-green-500/30 text-green-400' : 'border-red-500/30 text-red-400'}`}>
                                      <pre className="whitespace-pre-wrap">{tc.actualOutput !== undefined ? (typeof tc.actualOutput === 'object' ? JSON.stringify(tc.actualOutput, null, 2) : String(tc.actualOutput)) : 'No output'}</pre>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <div className="text-gray-600 italic">Hidden test case — details not shown.</div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </>
                  ) : (
                    /* ---- Legacy single output ---- */
                    <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
                      <pre className={`whitespace-pre-wrap ${output.status === 'pass' ? 'text-green-400' : 'text-red-400'}`}>
                        {output.message}
                      </pre>
                    </div>
                  )}
                </div>
              </Panel>
            </PanelGroup>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

export default CodeWorkspace;
