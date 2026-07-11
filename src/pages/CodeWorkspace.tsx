import { WorkspaceLayout } from '../layouts/WorkspaceLayout';

// ============================
// Code Workspace Page
// ============================

const CodeWorkspace = () => {
  return (
    <WorkspaceLayout
      descriptionPanel={
        <div className="description-panel">
          <div className="description-header">
            <span className="badge badge-easy">Easy</span>
            <h2 className="description-title">Question Title</h2>
          </div>
          <div className="description-body">
            <p>
              Question description will appear here. This is a placeholder that will be
              replaced with actual question data in Sprint 6.
            </p>

            <h3>Requirements</h3>
            <ul>
              <li>Requirement 1</li>
              <li>Requirement 2</li>
              <li>Requirement 3</li>
            </ul>

            <h3>Visible Test Cases</h3>
            <div className="test-case-preview glass-subtle">
              <code>Test cases will be displayed here</code>
            </div>
          </div>
        </div>
      }
      editorPanel={
        <div className="editor-placeholder">
          <div className="editor-tabs glass-subtle">
            <button className="editor-tab active">App.tsx</button>
            <button className="editor-tab">api.ts</button>
          </div>
          <div className="editor-body">
            <div className="editor-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              <p>Monaco Editor will be integrated in Sprint 7</p>
            </div>
          </div>
        </div>
      }
      outputPanel={
        <div className="output-panel glass-subtle">
          <div className="output-header">
            <span className="output-title">Output</span>
          </div>
          <div className="output-body">
            <p className="output-placeholder">Run your code to see results here...</p>
          </div>
        </div>
      }
    />
  );
};

export default CodeWorkspace;
