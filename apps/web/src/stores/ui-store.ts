import { create } from 'zustand';

type ActiveView = 'architect' | 'simulate' | 'metrics';

interface UIState {
  activeView: ActiveView;
  showConfigPanel: boolean;
  showAIPanel: boolean;
  setActiveView: (view: ActiveView) => void;
  toggleConfigPanel: () => void;
  toggleAIPanel: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeView: 'architect',
  showConfigPanel: true,
  showAIPanel: false,
  setActiveView: (view) => set({ activeView: view }),
  toggleConfigPanel: () => set((s) => ({ showConfigPanel: !s.showConfigPanel })),
  toggleAIPanel: () => set((s) => ({ showAIPanel: !s.showAIPanel })),
}));
