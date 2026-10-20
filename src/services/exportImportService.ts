import { taskRepository } from '@/repositories/taskRepository';
import { projectRepository } from '@/repositories/projectRepository';
import { settingsRepository } from '@/repositories/settingsRepository';
import { Task, Project } from '@/types';

export interface ExportData {
  version: string;
  exportedAt: string;
  tasks: Task[];
  projects: Project[];
}

export const exportImportService = {
  async exportData(): Promise<string> {
    const tasks = await taskRepository.getTasks({ includeArchived: true });
    const projects = await projectRepository.getProjects(true);

    const data: ExportData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      projects,
    };

    return JSON.stringify(data, null, 2);
  },

  async importData(jsonString: string): Promise<{ taskCount: number; projectCount: number }> {
    const parsed = JSON.parse(jsonString) as ExportData;

    if (!parsed || !Array.isArray(parsed.tasks) || !Array.isArray(parsed.projects)) {
      throw new Error('Invalid TaskFlow backup file format.');
    }

    let projectCount = 0;
    for (const proj of parsed.projects) {
      const exists = await projectRepository.getProjectById(proj.id);
      if (!exists) {
        await projectRepository.createProject(proj);
        projectCount++;
      }
    }

    let taskCount = 0;
    for (const task of parsed.tasks) {
      const exists = await taskRepository.getTaskById(task.id);
      if (!exists) {
        await taskRepository.createTask(task);
        taskCount++;
      }
    }

    return { taskCount, projectCount };
  },

  async clearAllUserData(): Promise<void> {
    await settingsRepository.clearAllData();
  },
};
