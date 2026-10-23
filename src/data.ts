export type Project = { id: string; name: string; budget: number; forecast: number; actual: number };
export const sampleProjects: Project[] = [
  { id: "P-101", name: "Alpha", budget: 3.2, forecast: 3.6, actual: 2.5 },
  { id: "P-102", name: "Beta", budget: 2.5, forecast: 3.3, actual: 2.1 },
  { id: "P-103", name: "Gamma", budget: 4.0, forecast: 3.7, actual: 3.1 },
  { id: "P-104", name: "Delta", budget: 2.8, forecast: 3.0, actual: 1.9 }
];
