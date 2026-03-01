export interface List {
  id: string;
  title: string;
  titleColor: string | null;
  description: string;
  lists: List[];
  createdAt: number;
  updatedAt: number;
}

export interface Project {
  name: string;
  version: string;
  lists: List[];
  createdAt: number;
  updatedAt: number;
}

export interface Settings {
  language: 'es' | 'en';
  theme: 'light' | 'dark' | 'system';
  currentProjectPath: string | null;
  showDeleteWarning: boolean;
  windowWidth: number | null;
  windowHeight: number | null;
  isMaximized: boolean;
}

export interface HistoryEntry {
  value: string;
  timestamp: number;
}
