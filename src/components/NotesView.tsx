import React, { useState, useEffect } from "react";
import { 
  Search, 
  FileText, 
  Edit2, 
  Eye, 
  Save, 
  Check, 
  ChevronRight, 
  ExternalLink, 
  AlertCircle
} from "lucide-react";
import type { IQuestion } from "../types";
import { notesService } from "../services/notes.service";

interface NotesViewProps {
  challenges: IQuestion[];
  onSelectChallenge: (challenge: IQuestion) => void;
}

export const NotesView = ({
  challenges,
  onSelectChallenge
}: NotesViewProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "has_notes">("has_notes");
  const [selectedChallengeId, setSelectedChallengeId] = useState<string>("");
  const [noteContent, setNoteContent] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [notesMap, setNotesMap] = useState<Record<string, string>>({});
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Load all notes from database on mount
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const myNotes = await notesService.getMyNotes();
        const map: Record<string, string> = {};
        myNotes.forEach(note => {
          const qId = typeof note.questionId === 'object' ? note.questionId._id : note.questionId;
          if (qId) {
            map[qId] = note.content;
          }
        });
        setNotesMap(map);
      } catch (e) {
        console.error("Error loading notes from DB:", e);
      } finally {
        setIsLoadingNotes(false);
      }
    };
    fetchNotes();
  }, []);

  // Helper to check if a note is modified from the default
  const hasCustomNote = (challengeId: string) => {
    const raw = notesMap[challengeId];
    if (!raw) return false;
    if (!raw.trim()) return false;
    if (raw.includes("### My Scratchpad\nWrite your thoughts")) return false;
    return true;
  };

  // Filter challenges based on search and selected filter mode
  const filteredChallenges = challenges.filter((c) => {
    const challengeId = c._id || '';
    const matchesSearch = 
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const hasNotes = hasCustomNote(challengeId);
    const matchesFilter = filterMode === "all" || (filterMode === "has_notes" && hasNotes);
    
    return matchesSearch && matchesFilter;
  });

  // Set initial selected challenge on mount or filter change
  useEffect(() => {
    if (filteredChallenges.length > 0) {
      const stillExists = filteredChallenges.some(c => c._id === selectedChallengeId);
      if (!stillExists) {
        setSelectedChallengeId(filteredChallenges[0]._id || "");
      }
    } else {
      setSelectedChallengeId("");
    }
  }, [searchTerm, filterMode, challenges]);

  // Load selected challenge's note content
  useEffect(() => {
    if (selectedChallengeId) {
      const content = notesMap[selectedChallengeId] || "### My Scratchpad\nWrite your thoughts, ideas, or pseudocode here...";
      setNoteContent(content);
      setIsEditMode(false); // Default to preview mode for clean reading
    } else {
      setNoteContent("");
    }
  }, [selectedChallengeId, notesMap]);

  const handleSave = async () => {
    if (!selectedChallengeId) return;
    setIsSaving(true);
    try {
      await notesService.saveNote(selectedChallengeId, noteContent);
      setNotesMap(prev => ({
        ...prev,
        [selectedChallengeId]: noteContent,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setIsEditMode(false);
    } catch (err) {
      console.error("Error saving notes to DB:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const activeChallenge = challenges.find(c => c._id === selectedChallengeId);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "easy":
        return "text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400 border border-green-200/50 dark:border-green-800/30";
      case "medium":
        return "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30";
      case "hard":
        return "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 border border-red-200/50 dark:border-red-800/30";
      default:
        return "text-zinc-600 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200";
    }
  };

  // Simple and robust client-side custom renderer to avoid installing extra dependencies
  const renderSimpleMarkdown = (text: string) => {
    if (!text) return <p className="text-zinc-400 dark:text-zinc-500 italic">No content available.</p>;

    const lines = text.split("\n");
    return lines.map((line, index) => {
      const trimmed = line.trim();

      // Heading 1, 2, 3
      if (trimmed.startsWith("### ")) {
        return (
          <h4 key={index} className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-4 mb-2 first:mt-0 font-sans border-b border-zinc-100 dark:border-zinc-800/50 pb-1">
            {trimmed.slice(4)}
          </h4>
        );
      }
      if (trimmed.startsWith("## ")) {
        return (
          <h3 key={index} className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-5 mb-2 first:mt-0 font-sans">
            {trimmed.slice(3)}
          </h3>
        );
      }
      if (trimmed.startsWith("# ")) {
        return (
          <h2 key={index} className="text-lg font-bold text-zinc-900 dark:text-zinc-550 mt-6 mb-3 first:mt-0 font-sans border-b border-zinc-200 dark:border-zinc-800 pb-1.5">
            {trimmed.slice(2)}
          </h2>
        );
      }

      // Blockquotes
      if (trimmed.startsWith("> ")) {
        return (
          <blockquote key={index} className="border-l-4 border-indigo-500/50 pl-3 py-1 my-2 bg-indigo-50/20 dark:bg-indigo-950/10 text-xs text-zinc-600 dark:text-zinc-400 italic rounded-r-lg">
            {trimmed.slice(2)}
          </blockquote>
        );
      }

      // Bullet Lists
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        const itemText = trimmed.slice(2);
        return (
          <ul key={index} className="list-disc list-inside pl-2 space-y-1 my-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>{renderInlineStyles(itemText)}</li>
          </ul>
        );
      }

      // Numbered Lists
      const numMatch = trimmed.match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <ol key={index} className="list-decimal list-inside pl-2 space-y-1 my-1 text-xs text-zinc-600 dark:text-zinc-400">
            <li>{renderInlineStyles(numMatch[2])}</li>
          </ol>
        );
      }

      // Code block start/end boundaries (simplified rendering helper)
      if (trimmed.startsWith("```")) {
        return null; // hide triple backticks
      }

      // Blank line
      if (trimmed === "") {
        return <div key={index} className="h-2" />;
      }

      // Standard Paragraph
      return (
        <p key={index} className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed my-2">
          {renderInlineStyles(line)}
        </p>
      );
    });
  };

  // Parse bold and inline code styling markers
  const renderInlineStyles = (text: string) => {
    const parts: React.ReactNode[] = [];
    let currentText = text;
    let keyIdx = 0;

    while (currentText.length > 0) {
      const boldIdx = currentText.indexOf("**");
      const codeIdx = currentText.indexOf("`");

      if (boldIdx === -1 && codeIdx === -1) {
        parts.push(currentText);
        break;
      }

      // Handle bold which appears first
      if (boldIdx !== -1 && (codeIdx === -1 || boldIdx < codeIdx)) {
        if (boldIdx > 0) {
          parts.push(currentText.substring(0, boldIdx));
        }
        const nextBoldIdx = currentText.indexOf("**", boldIdx + 2);
        if (nextBoldIdx !== -1) {
          parts.push(
            <strong key={keyIdx++} className="font-bold text-zinc-900 dark:text-white">
              {currentText.substring(boldIdx + 2, nextBoldIdx)}
            </strong>
          );
          currentText = currentText.substring(nextBoldIdx + 2);
        } else {
          parts.push(currentText.substring(boldIdx));
          break;
        }
      } 
      // Handle inline code block
      else {
        if (codeIdx > 0) {
          parts.push(currentText.substring(0, codeIdx));
        }
        const nextCodeIdx = currentText.indexOf("`", codeIdx + 1);
        if (nextCodeIdx !== -1) {
          parts.push(
            <code key={keyIdx++} className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-pink-600 dark:text-pink-400 font-mono text-[11px] rounded border border-zinc-200/50 dark:border-zinc-800">
              {currentText.substring(codeIdx + 1, nextCodeIdx)}
            </code>
          );
          currentText = currentText.substring(nextCodeIdx + 1);
        } else {
          parts.push(currentText.substring(codeIdx));
          break;
        }
      }
    }

    return parts;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[22px] pb-8 animate-fade-in">
      {/* Hero Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-950 dark:text-zinc-50 font-sans tracking-tight flex items-center space-x-2">
          <FileText className="text-indigo-600 dark:text-indigo-400 h-6 w-6 animate-pulse" />
          <span>My Notes & Scratchpad Hub</span>
        </h1>
        <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Access all your solution strategies, checklists, formulas, and draft thoughts written inside the workspace editor, completely unified across all challenges.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Challenge Index Sidebar */}
        <div className="lg:col-span-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 space-y-4 shadow-sm">
          
          {/* Header & Mode filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Challenges</h3>
            
            <div className="flex space-x-1 p-0.5 bg-zinc-100 dark:bg-zinc-900 rounded-lg">
              <button
                onClick={() => setFilterMode("has_notes")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  filterMode === "has_notes"
                    ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                Saved Notes
              </button>
              <button
                onClick={() => setFilterMode("all")}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition ${
                  filterMode === "all"
                    ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm"
                    : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
              >
                All
              </button>
            </div>
          </div>

          {/* Search Inputs */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search challenges..."
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white dark:focus:bg-zinc-950 transition"
            />
          </div>

          {/* List of Challenges with Indicators */}
          <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
            {isLoadingNotes ? (
              <div className="text-center py-12 text-xs text-zinc-400">Loading notes state...</div>
            ) : filteredChallenges.length > 0 ? (
              filteredChallenges.map((c) => {
                const challengeId = c._id || "";
                const isSelected = challengeId === selectedChallengeId;
                const hasNotes = hasCustomNote(challengeId);
                const category = c.type === 'react' ? 'Frontend' : 'Fullstack';

                return (
                  <button
                    key={challengeId}
                    onClick={() => setSelectedChallengeId(challengeId)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50 dark:bg-indigo-950/30 border-indigo-100 dark:border-indigo-900/50 shadow-sm"
                        : "bg-white dark:bg-zinc-950 border-zinc-100/50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center space-x-1.5 mb-1 flex-wrap gap-y-1">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getDifficultyColor(c.difficulty)} uppercase tracking-wider`}>
                          {c.difficulty}
                        </span>
                        {hasNotes && (
                          <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-100/30 dark:border-indigo-900/20 flex items-center space-x-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span>Has Note</span>
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-bold truncate ${
                        isSelected ? "text-indigo-600 dark:text-indigo-400" : "text-zinc-800 dark:text-zinc-200"
                      }`}>
                        {c.title}
                      </h4>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                        {category} • {c.testCases?.length || 0} tasks
                      </p>
                    </div>
                    <ChevronRight size={14} className={isSelected ? "text-indigo-500" : "text-zinc-300 dark:text-zinc-700"} />
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center">
                <AlertCircle className="h-6 w-6 text-zinc-300 dark:text-zinc-700 mb-2" />
                <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400">
                  {filterMode === "has_notes" ? "No notes saved yet" : "No challenges found"}
                </p>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-1 max-w-xs leading-relaxed">
                  {filterMode === "has_notes" 
                    ? "Go to any coding challenge, write in the Scratchpad tab inside workspace, and it will appear here instantly!"
                    : "Try adjusting your search terms or filters."}
                </p>
                {filterMode === "has_notes" && (
                  <button
                    onClick={() => setFilterMode("all")}
                    className="mt-3 text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
                  >
                    View All Challenges
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Active Scratchpad Editor/Viewer */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 min-h-[480px] flex flex-col justify-between shadow-sm">
          
          {activeChallenge ? (
            <div className="flex-1 flex flex-col justify-between h-full space-y-4">
              
              {/* Header Details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 uppercase">
                      {activeChallenge.type === 'react' ? 'Frontend' : 'Fullstack'}
                    </span>
                    <span className="text-[10px] font-medium text-zinc-400 dark:text-zinc-500 font-mono">
                      ID: {activeChallenge._id}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {activeChallenge.title}
                  </h2>
                </div>

                {/* Header Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onSelectChallenge(activeChallenge)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 transition cursor-pointer"
                  >
                    <span>Solve Workspace</span>
                    <ExternalLink size={12} />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex space-x-1">
                  <button
                    onClick={() => setIsEditMode(false)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      !isEditMode
                        ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Eye size={12} />
                    <span>Live Preview</span>
                  </button>
                  <button
                    onClick={() => setIsEditMode(true)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                      isEditMode
                        ? "bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                    }`}
                  >
                    <Edit2 size={12} />
                    <span>Edit Note</span>
                  </button>
                </div>

                {isEditMode && (
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition cursor-pointer"
                  >
                    {saveSuccess ? (
                      <>
                        <Check size={12} />
                        <span>Saved!</span>
                      </>
                    ) : (
                      <>
                        <Save size={12} />
                        <span>{isSaving ? "Saving..." : "Save"}</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Editor Workspace Content */}
              <div className="flex-1 pt-1 min-h-[300px] flex flex-col">
                {isEditMode ? (
                  <div className="flex-1 flex flex-col space-y-1.5">
                    <textarea
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      placeholder="Write markdown style notes here..."
                      className="flex-1 w-full text-xs font-mono bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-800 dark:text-zinc-100 resize-none min-h-[280px]"
                    />
                    <p className="text-[10px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-1">
                      <AlertCircle size={10} />
                      <span>Supports standard markdown syntax: # Header, - Bullets, **Bold**, and `Code`.</span>
                    </p>
                  </div>
                ) : (
                  <div className="flex-1 bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-100 dark:border-zinc-800 rounded-xl p-4 sm:p-5 max-h-[360px] overflow-y-auto">
                    {renderSimpleMarkdown(noteContent)}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
              <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3 animate-bounce" />
              <h3 className="text-sm font-bold text-zinc-600 dark:text-zinc-400">No Scratchpad Selected</h3>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 max-w-sm leading-relaxed">
                Select a challenge from the list on the left to read or compose notes for that question without opening the live editor.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
