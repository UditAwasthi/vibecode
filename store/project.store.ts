import {create} from "zustand";

type Project = {
    id:string,
    title:string,
    template:string,
    createdAt:string
}
type ProjectStore = {
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
};
export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({
      projects: [project, ...state.projects],
    })),
}));