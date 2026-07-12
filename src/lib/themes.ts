import type { EditorTheme } from "../types";

export const editorThemes: EditorTheme[] = [
  {
    name: "VS Code Dark",
    id: "vs-dark",
    bg: "bg-[#1e1e1e]",
    text: "text-[#d4d4d4]",
    accent: "text-[#569cd6]",
    sidebarBg: "bg-[#252526]",
    activeLineBg: "bg-[#2d2d30]",
    commentColor: "text-[#6a9955]",
    keywordColor: "text-[#569cd6]"
  },
  {
    name: "Dracula",
    id: "dracula",
    bg: "bg-[#282a36]",
    text: "text-[#f8f8f2]",
    accent: "text-[#bd93f9]",
    sidebarBg: "bg-[#191a21]",
    activeLineBg: "bg-[#343746]",
    commentColor: "text-[#6272a4]",
    keywordColor: "text-[#ff79c6]"
  },
  {
    name: "One Dark Pro",
    id: "one-dark",
    bg: "bg-[#282c34]",
    text: "text-[#abb2bf]",
    accent: "text-[#61afef]",
    sidebarBg: "bg-[#21252b]",
    activeLineBg: "bg-[#2c313c]",
    commentColor: "text-[#5c6370]",
    keywordColor: "text-[#c678dd]"
  },
  {
    name: "GitHub Light",
    id: "github-light",
    bg: "bg-[#ffffff]",
    text: "text-[#24292e]",
    accent: "text-[#005cc5]",
    sidebarBg: "bg-[#f6f8fa]",
    activeLineBg: "bg-[#eaecef]",
    commentColor: "text-[#6a737d]",
    keywordColor: "text-[#d73a49]"
  }
];
