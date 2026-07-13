import { type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// ============================
// Workspace Layout
// Split-screen: Description | Code Editor
// ============================

interface WorkspaceLayoutProps {
  descriptionPanel: ReactNode;
  editorPanel: ReactNode;
  outputPanel?: ReactNode;
}

export const WorkspaceLayout = ({
  descriptionPanel,
  editorPanel,
  outputPanel,
}: WorkspaceLayoutProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { questionId } = useParams();

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="workspace-layout">
      {/* Top Bar */}
      <header className="workspace-header glass">
        <div className="workspace-header-left">
          <button className="workspace-back-btn" onClick={handleBack}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <img src="/logos/fcp_logo.png" alt="Logo" className="w-6 h-6 rounded-full object-contain ml-3 mr-2 dark:mix-blend-screen" />
          <span className="workspace-brand gradient-text">FCP</span>
          {questionId && (
            <span className="workspace-question-id">#{questionId}</span>
          )}
        </div>

        <div className="workspace-header-right">
          <span className="workspace-user-name">{user?.name || 'Learner'}</span>
          <button className="workspace-logout-btn" onClick={handleLogout} title="Logout">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      {/* Split Panels */}
      <div className="workspace-panels">
        {/* Left: Description */}
        <div className="workspace-panel workspace-description">
          {descriptionPanel}
        </div>

        {/* Right: Editor + Output */}
        <div className="workspace-panel workspace-editor-area">
          <div className="workspace-editor">
            {editorPanel}
          </div>
          {outputPanel && (
            <div className="workspace-output">
              {outputPanel}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
