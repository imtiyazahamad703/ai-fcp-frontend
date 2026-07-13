import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { AdminLayout } from '../layouts/AdminLayout';
import { adminService } from '../services/admin.service';
import { useAdminStore } from '../store/useAdminStore';
import { Loader } from '../components/common/Loader';
import { Button } from '../components/common/Button';

// ============================
// Admin Questions List Page
// ============================

const AdminQuestions = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [folders, setFolders] = useState<string[]>([]);
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [isManageFoldersModalOpen, setIsManageFoldersModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'folder' | 'question', idOrName: string } | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [questionToMove, setQuestionToMove] = useState<string | null>(null);
  const { questions, setQuestions } = useAdminStore();
  const navigate = useNavigate();

  const [selectedFolderFilter, setSelectedFolderFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const [qData, fData] = await Promise.all([
        adminService.getQuestions(),
        adminService.getFolders()
      ]);
      setQuestions(qData);
      setFolders(fData);
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch questions');
      setError(err.message || 'Failed to fetch questions');
    } finally {
      setIsLoading(false);
    }
  };

  const executeDeleteQuestion = async (id: string) => {
    try {
      await adminService.deleteQuestion(id);
      setQuestions(questions.filter(q => q._id !== id));
      toast.success('Question deleted');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete question');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteTarget({ type: 'question', idOrName: id });
  };

  const handleFolderChange = async (id: string, newFolder: string) => {
    if (newFolder === 'ADD_NEW') {
      setQuestionToMove(id);
      setNewFolderName('');
      setIsFolderModalOpen(true);
      return;
    }

    try {
      await adminService.updateQuestion(id, { folder: newFolder });
      setQuestions(questions.map(q => q._id === id ? { ...q, folder: newFolder } : q));
      toast.success('Question moved to ' + newFolder);
    } catch (err: any) {
      toast.error('Failed to move question');
    }
  };

  const handleCreateAndMoveFolder = async () => {
    if (!newFolderName.trim()) return;
    try {
      const finalFolder = await adminService.createFolder(newFolderName.trim());
      setFolders(prev => {
        if (!prev.includes(finalFolder)) return [...prev, finalFolder];
        return prev;
      });

      if (questionToMove) {
        await adminService.updateQuestion(questionToMove, { folder: finalFolder });
        setQuestions(questions.map(q => q._id === questionToMove ? { ...q, folder: finalFolder } : q));
        toast.success('Question moved to ' + finalFolder);
      } else {
        toast.success('Folder created successfully');
      }
    } catch (err: any) {
      toast.error('Failed to create/move folder');
    } finally {
      setIsFolderModalOpen(false);
      setQuestionToMove(null);
    }
  };

  const executeDeleteFolder = async (folderName: string) => {
    try {
      await adminService.deleteFolder(folderName);
      setFolders(folders.filter(f => f !== folderName));
      const data = await adminService.getQuestions();
      setQuestions(data);
      toast.success('Folder deleted');
    } catch (err: any) {
      toast.error('Failed to delete folder');
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDeleteFolder = (folderName: string) => {
    setDeleteTarget({ type: 'folder', idOrName: folderName });
  };

  const filteredQuestions = useMemo(() => {
    if (selectedFolderFilter === 'All') return questions;
    return questions.filter(q => (q.folder || 'Practice Coding Challenges') === selectedFolderFilter);
  }, [questions, selectedFolderFilter]);

  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, currentPage]);

  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);

  return (
    <AdminLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-text-primary)]">Manage Questions</h1>
          <p className="text-[var(--color-text-secondary)] mt-2">
            Review, edit, and publish generated questions
          </p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => setIsManageFoldersModalOpen(true)} className="flex-1 sm:flex-none">
            Manage Folders
          </Button>
          <Button variant="primary" onClick={() => navigate('/admin')} className="flex-1 sm:flex-none">
            Generate New
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex justify-center items-center">
          <Loader text="Loading questions..." />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-[var(--radius-md)]">
          {error}
        </div>
      ) : questions.length === 0 ? (
        <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-12 flex flex-col items-center justify-center text-center">
          <p className="text-[var(--color-text-secondary)] mb-4">No questions found.</p>
          <Button variant="secondary" onClick={() => navigate('/admin')}>
            Generate your first question
          </Button>
        </div>
      ) : (
        <>
          {/* Filters Bar */}
          <div className="flex justify-end mb-4">
            <select
              value={selectedFolderFilter}
              onChange={(e) => {
                setSelectedFolderFilter(e.target.value);
                setCurrentPage(1); // Reset to page 1 on filter change
              }}
              className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-input)] rounded-md px-4 py-2 text-sm font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors cursor-pointer shadow-sm w-full sm:w-auto"
            >
              <option value="All" className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] py-1">All Folders</option>
              {folders.map(f => (
                <option key={f} value={f} className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] py-1">{f}</option>
              ))}
            </select>
          </div>

          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] overflow-hidden shadow-sm">
          <div className="w-full">
            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-[var(--color-border)]">
              {paginatedQuestions.map((question) => (
                <div key={question._id} className="p-4 flex flex-col gap-3 hover:bg-[var(--color-bg-hover)] transition-colors">
                  <div>
                    <div className="font-medium text-[var(--color-text-primary)] mb-1">{question.title}</div>
                    <div className="text-xs text-[var(--color-text-tertiary)] line-clamp-2">{question.userPrompt}</div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-xs text-[var(--color-text-secondary)] capitalize">{question.type}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wider ${question.status === 'published' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'
                      }`}>
                      {question.status}
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-[var(--color-border)]">
                    <button
                      onClick={() => navigate(`/admin/questions/${question._id}`)}
                      className="text-xs px-3 py-1.5 rounded bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] hover:bg-[var(--color-primary-500)]/20 transition-colors flex-1 font-semibold"
                    >
                      Review
                    </button>
                    <button
                      onClick={() => handleDelete(question._id!)}
                      className="text-xs px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex-1 font-semibold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-[var(--color-bg-hover)] border-b border-[var(--color-border)]">
                    <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)]">Title</th>
                    <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)] text-center">Folder</th>
                    <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)] text-center">Type</th>
                    <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)] text-center">Status</th>
                    <th className="py-3 px-4 text-xs uppercase font-semibold text-[var(--color-text-secondary)] text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {paginatedQuestions.map((question) => (
                    <tr key={question._id} className="hover:bg-[var(--color-bg-hover)] transition-colors group">
                      <td className="py-4 px-4">
                        <div className="font-medium text-[var(--color-text-primary)]">{question.title}</div>
                        <div className="text-xs text-[var(--color-text-tertiary)] truncate w-64">{question.userPrompt}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <select
                          value={question.folder || 'Practice Coding Challenges'}
                          onChange={(e) => handleFolderChange(question._id!, e.target.value)}
                          className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-hover)] border border-[var(--color-border-input)] rounded-md pl-2 pr-6 py-1.5 text-xs font-medium text-[var(--color-text-primary)] outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)] transition-colors cursor-pointer shadow-sm w-full max-w-[160px] mx-auto block"
                        >
                          {folders.map(f => (
                            <option key={f} value={f} className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] py-1">{f}</option>
                          ))}
                          <option value="ADD_NEW" className="bg-[var(--color-bg-base)] text-[var(--color-text-primary)] font-bold border-t border-[var(--color-border)]">+ Add New Folder...</option>
                        </select>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm text-[var(--color-text-secondary)] capitalize">{question.type}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider ${question.status === 'published' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                          {question.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center gap-2 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin/questions/${question._id}`)}
                            className="text-sm px-3 py-1.5 rounded bg-[var(--color-primary-500)]/10 text-[var(--color-primary-400)] hover:bg-[var(--color-primary-500)]/20 transition-colors"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleDelete(question._id!)}
                            className="text-sm px-3 py-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
              <span className="text-xs sm:text-sm text-[var(--color-text-secondary)] text-center sm:text-left">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredQuestions.length)} of {filteredQuestions.length} entries
              </span>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
        </>
      )}

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">Create New Folder</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border-input)] rounded-[var(--radius-md)] px-4 py-2 mb-6 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-primary-500)] focus:ring-1 focus:ring-[var(--color-primary-500)]"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateAndMoveFolder();
                if (e.key === 'Escape') { setIsFolderModalOpen(false); setQuestionToMove(null); }
              }}
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => { setIsFolderModalOpen(false); setQuestionToMove(null); }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreateAndMoveFolder} disabled={!newFolderName.trim()}>
                {questionToMove ? 'Create & Move' : 'Create Folder'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Folders Modal */}
      {isManageFoldersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">Manage Folders</h3>
              <button onClick={() => setIsManageFoldersModalOpen(false)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]">
                ✕
              </button>
            </div>

            {folders.length === 0 ? (
              <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">No folders created yet.</p>
            ) : (
              <div className="overflow-y-auto flex-1 pr-2 space-y-2">
                {folders.map(folder => (
                  <div key={folder} className="flex justify-between items-center bg-[var(--color-bg-hover)] px-4 py-3 rounded-lg border border-[var(--color-border)]">
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{folder}</span>
                    <button
                      onClick={() => handleDeleteFolder(folder)}
                      className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-between items-center">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsManageFoldersModalOpen(false);
                  setQuestionToMove(null);
                  setNewFolderName('');
                  setIsFolderModalOpen(true);
                }}
                className="px-3 py-1.5 text-sm"
              >
                + Add New Folder
              </Button>
              <Button variant="secondary" onClick={() => setIsManageFoldersModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-5 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] mb-2">
              Delete {deleteTarget.type === 'folder' ? 'Folder' : 'Question'}?
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-6">
              {deleteTarget.type === 'folder'
                ? `"${deleteTarget.idOrName}" will be removed. Questions move to Practice Coding Challenges.`
                : "This action cannot be undone."}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <button
                onClick={() => deleteTarget.type === 'folder' ? executeDeleteFolder(deleteTarget.idOrName) : executeDeleteQuestion(deleteTarget.idOrName)}
                className="px-4 py-1.5 text-sm bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminQuestions;
