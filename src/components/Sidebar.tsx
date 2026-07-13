import React, { useState, useEffect } from "react";
import { 
  Code, 
  BarChart2, 
  Moon, 
  Sun, 
  User, 
  Edit3, 
  X, 
  Plus, 
  Check, 
  ChevronRight, 
  FileText,
  LogOut,
  Menu
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import type { UserProfile } from "../types";

// Helper keys for localstorage
const STORAGE_PROFILE_KEY = "fcp_profile_";

interface SidebarProps {
  activeTab: "challenges" | "dashboard" | "notes";
  setActiveTab: (tab: "challenges" | "dashboard" | "notes") => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
}

export const Sidebar = ({
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
}: SidebarProps) => {
  const { user, logout } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Profile Edit State
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editRole, setEditRole] = useState("");
  const [editSeed, setEditSeed] = useState("");
  const [skillInput, setSkillInput] = useState("");
  const [editSkills, setEditSkills] = useState<string[]>([]);

  const userEmail = user?.email || "learner@example.com";
  const userId = userEmail.replace(/\./g, "_");

  // Load profile on mount or when userEmail changes
  useEffect(() => {
    if (userEmail) {
      const key = `${STORAGE_PROFILE_KEY}${userId}`;
      const saved = localStorage.getItem(key);
      let uProf: UserProfile;
      
      if (saved) {
        try {
          uProf = JSON.parse(saved);
        } catch (e) {
          uProf = getDefaultProfile();
        }
      } else {
        uProf = getDefaultProfile();
      }

      setProfile(uProf);
      setEditName(uProf.name);
      setEditBio(uProf.bio);
      setEditRole(uProf.role);
      setEditSkills(uProf.skills || []);
      const match = uProf.avatarUrl?.match(/seed=(.*)/);
      setEditSeed(match ? decodeURIComponent(match[1]) : user?.name || userEmail.split("@")[0]);
    }
  }, [userEmail, user]);

  const getDefaultProfile = (): UserProfile => ({
    userId: userEmail,
    name: user?.name || userEmail.split("@")[0],
    bio: "Passionate software engineer studying fullstack coding.",
    avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=" + encodeURIComponent(user?.name || userEmail.split("@")[0]),
    role: "Fullstack Engineer",
    skills: ["React", "TypeScript", "Node.js", "NestJS"]
  });

  const handleOpenEditModal = () => {
    if (profile) {
      setEditName(profile.name);
      setEditBio(profile.bio);
      setEditRole(profile.role);
      setEditSkills([...(profile.skills || [])]);
      const match = profile.avatarUrl?.match(/seed=(.*)/);
      setEditSeed(match ? decodeURIComponent(match[1]) : user?.name || userEmail.split("@")[0]);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updatedProfile: UserProfile = {
      ...profile,
      name: editName.trim() || user?.name || userEmail.split("@")[0],
      bio: editBio.trim() || "Passionate software engineer",
      role: editRole,
      skills: editSkills,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editSeed.trim() || editName)}`
    };

    localStorage.setItem(`${STORAGE_PROFILE_KEY}${userId}`, JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !editSkills.includes(trimmed)) {
      setEditSkills([...editSkills, trimmed]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setEditSkills(editSkills.filter(s => s !== skill));
  };

  return (
    <>
      {/* Mobile Top Header (only visible on small screen layouts when workspace is not open) */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-4 h-14 w-full">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Code size={18} />
          </div>
          <span className="text-sm font-bold tracking-tight text-zinc-900 dark:text-zinc-50 font-mono">
            AI-FCP <span className="text-zinc-400 font-normal">Platform</span>
          </span>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-800"
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Main Container */}
      <aside 
        className={`fixed md:sticky top-0 left-0 z-40 h-[100dvh] md:h-screen w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col flex-1 p-5 overflow-y-auto">
          {/* Brand & Logo */}
          <div className="flex items-center space-x-2.5 mb-6">
            <div className="p-2 bg-gradient-to-tr from-indigo-500 to-indigo-700 rounded-xl text-white shadow-md shadow-indigo-500/10">
              <Code size={20} className="animate-pulse" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white">
                AI-FCP <span className="text-zinc-400 font-medium">Platform</span>
              </span>
            </div>
          </div>

          {/* User Profile Card Section - Moved to Top */}
          <div className="mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-5">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase mb-2 px-2.5">
              My Profile
            </div>
            {profile ? (
              <div 
                onClick={handleOpenEditModal}
                className="group flex items-center space-x-3 p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900/60 border border-transparent hover:border-zinc-200/50 dark:hover:border-zinc-800/50 cursor-pointer transition"
                title="Click to Edit Profile"
              >
                <div className="relative flex-shrink-0 h-10 w-10 bg-zinc-100 dark:bg-zinc-850 rounded-lg border border-zinc-200 dark:border-zinc-700 p-0.5 overflow-hidden">
                  <img 
                    src={profile.avatarUrl} 
                    alt="avatar" 
                    className="h-full w-full object-cover animate-fade-in"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-150">
                    <Edit3 size={12} className="text-white" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate font-medium">
                    {profile.role}
                  </p>
                </div>
                <div className="text-zinc-400 hover:text-zinc-600 p-1 rounded-md">
                  <Edit3 size={13} />
                </div>
              </div>
            ) : (
              <div className="animate-pulse flex items-center space-x-3 p-2">
                <div className="h-10 w-10 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                  <div className="h-2.5 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tab list */}
          <div className="space-y-1.5 flex-1">
            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold tracking-wider uppercase mb-2 px-2.5">
              Navigation
            </div>
            <button
              onClick={() => {
                setActiveTab("challenges");
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "challenges"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <Code size={16} />
                <span>Coding Challenges</span>
              </div>
              <ChevronRight size={12} className={activeTab === "challenges" ? "opacity-100" : "opacity-0"} />
            </button>

            <button
              onClick={() => {
                setActiveTab("dashboard");
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "dashboard"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <BarChart2 size={16} />
                <span>My Analytics</span>
              </div>
              <ChevronRight size={12} className={activeTab === "dashboard" ? "opacity-100" : "opacity-0"} />
            </button>

            <button
              onClick={() => {
                setActiveTab("notes");
                setIsMobileOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === "notes"
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100/30 dark:border-indigo-900/20"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <FileText size={16} />
                <span>Notes & Scratchpad</span>
              </div>
              <ChevronRight size={12} className={activeTab === "notes" ? "opacity-100" : "opacity-0"} />
            </button>

            {/* Quick Elegant Theme Toggle directly below navigation */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 mt-4 px-1">
              <button
                type="button"
                onClick={toggleTheme}
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent transition duration-150 group"
              >
                <div className="flex items-center space-x-2.5">
                  {theme === "light" ? (
                    <Sun size={16} className="text-amber-500" />
                  ) : (
                    <Moon size={16} className="text-indigo-400" />
                  )}
                  <span>Theme</span>
                </div>
                <span className="text-[10px] font-mono font-bold uppercase bg-zinc-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-md text-zinc-600 dark:text-zinc-400 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-700 transition">
                  {theme === "light" ? "Light" : "Dark"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Logout Section at the Bottom */}
        <div className="p-4 border-t border-zinc-150 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-xs font-semibold"
          >
            <LogOut size={14} />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Profile Editor Dialog Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-zinc-900/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-2xl shadow-2xl p-6 transition-all">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-5">
              <div className="flex items-center space-x-2.5">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <User size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Edit Developer Profile</h3>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500">Personalize your developer details and portfolio</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-500 dark:hover:text-zinc-300 p-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              {/* Profile Avatar Generator section */}
              <div className="flex items-center space-x-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/40 dark:border-zinc-800/40 p-3.5 rounded-xl mb-4">
                <div className="flex-shrink-0 h-14 w-14 bg-white dark:bg-zinc-850 rounded-xl border border-zinc-200 dark:border-zinc-700 p-1 flex items-center justify-center">
                  <img 
                    src={`https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(editSeed.trim() || "DefaultSeed")}`} 
                    alt="seed preview" 
                    className="h-full w-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Avatar Seed Key</label>
                  <div className="flex space-x-1.5">
                    <input 
                      type="text"
                      value={editSeed}
                      onChange={(e) => setEditSeed(e.target.value)}
                      placeholder="Type any word..."
                      className="flex-1 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-800 dark:text-zinc-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setEditSeed(Math.random().toString(36).substring(7))}
                      className="px-2.5 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 dark:hover:bg-indigo-900 rounded-lg font-medium transition"
                    >
                      Randomize
                    </button>
                  </div>
                </div>
              </div>

              {/* Full Name & Role inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Display Name</label>
                  <input 
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-800 dark:text-zinc-100 font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Target / Job Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 outline-none text-zinc-800 dark:text-zinc-200 font-medium"
                  >
                    <option value="Fullstack Engineer">Fullstack Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="QA / Tester">QA / Tester</option>
                    <option value="DevOps Specialist">DevOps Specialist</option>
                    <option value="UI/UX Engineer">UI/UX Engineer</option>
                  </select>
                </div>
              </div>

              {/* Bio Description */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Developer Bio</label>
                <textarea 
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Tell others about yourself..."
                  className="w-full text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-zinc-800 dark:text-zinc-100 resize-none font-medium"
                />
              </div>

              {/* Interactive Skills Chips input */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Tech Stack & Skills</label>
                <div className="flex space-x-2">
                  <input 
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    placeholder="Type skill (e.g. Node.js) and press Enter"
                    className="flex-1 text-xs bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 focus:bg-white dark:focus:bg-zinc-950 focus:border-indigo-500 outline-none text-zinc-800 dark:text-zinc-100 font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Chips Container */}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {editSkills.map((skill) => (
                    <span 
                      key={skill}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200/50 dark:border-zinc-800"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {editSkills.length === 0 && (
                    <span className="text-[11px] text-zinc-400 italic">No skills added yet. Type above to add some!</span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/10 transition"
                >
                  <Check size={14} />
                  <span>Save Changes</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </>
  );
};
