import { create } from 'zustand';
import { Project } from '@/types';
import { projectRepository } from '@/repositories/projectRepository';
import { hapticService } from '@/services/hapticService';

interface ProjectState {
  projects: Project[];
  activeProject: Project | null;
  isLoading: boolean;
  error: string | null;

  loadProjects: () => Promise<void>;
  createProject: (data: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string, archive?: boolean) => Promise<void>;
  setActiveProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectRepository.getProjects();
      set({ projects, isLoading: false });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load projects';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createProject: async (data) => {
    try {
      hapticService.light();
      const proj = await projectRepository.createProject(data);
      await get().loadProjects();
      return proj;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      set({ error: errorMessage });
      throw err;
    }
  },

  updateProject: async (id, updates) => {
    try {
      const updated = await projectRepository.updateProject(id, updates);
      await get().loadProjects();
      return updated;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      set({ error: errorMessage });
      return null;
    }
  },

  deleteProject: async (id) => {
    try {
      hapticService.medium();
      await projectRepository.deleteProject(id);
      await get().loadProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      set({ error: errorMessage });
    }
  },

  archiveProject: async (id, archive = true) => {
    try {
      await projectRepository.archiveProject(id, archive);
      await get().loadProjects();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive project';
      set({ error: errorMessage });
    }
  },

  setActiveProject: (project) => {
    set({ activeProject: project });
  },
}));
