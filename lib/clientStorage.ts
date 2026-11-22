import { Analysis, Roadmap, ResumeRevision } from './types';

const STORAGE_KEY = 'skillbridge_analyses_v1';

interface StoredItem {
  analysis: Analysis;
  roadmap?: Roadmap | null;
  revision?: ResumeRevision | null;
}

function getStore(): Record<string, StoredItem> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setStore(store: Record<string, StoredItem>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

export function saveLocalAnalysis(
  analysis: Analysis,
  roadmap?: Roadmap | null,
  revision?: ResumeRevision | null
): void {
  const store = getStore();
  store[analysis.id] = {
    analysis,
    roadmap: roadmap ?? store[analysis.id]?.roadmap,
    revision: revision ?? store[analysis.id]?.revision
  };
  setStore(store);
}

export function getLocalAnalysis(id: string): StoredItem | null {
  const store = getStore();
  return store[id] || null;
}

export function getAllLocalAnalyses(): Analysis[] {
  const store = getStore();
  return Object.values(store).map(item => item.analysis);
}

export function getAllLocalRoadmaps(): Roadmap[] {
  const store = getStore();
  return Object.values(store)
    .map(item => item.roadmap)
    .filter((r): r is Roadmap => Boolean(r));
}

export function updateLocalRoadmapTask(
  roadmapId: string,
  taskId: string,
  updates: Partial<Roadmap['milestones'][0]['tasks'][0]>
): Roadmap | null {
  const store = getStore();
  for (const key of Object.keys(store)) {
    const r = store[key].roadmap;
    if (r && (r.id === roadmapId || r.analysis_id === roadmapId)) {
      for (const m of r.milestones) {
        const tIndex = m.tasks.findIndex(t => t.id === taskId);
        if (tIndex !== -1) {
          m.tasks[tIndex] = { ...m.tasks[tIndex], ...updates };
          setStore(store);
          return r;
        }
      }
    }
  }
  return null;
}

export function updateLocalRevision(
  analysisId: string,
  suggestionId: string,
  status: 'pending' | 'accepted' | 'rejected',
  userEditedText?: string
): ResumeRevision | null {
  const store = getStore();
  const rev = store[analysisId]?.revision;
  if (!rev) return null;

  const idx = rev.suggestions.findIndex(s => s.id === suggestionId);
  if (idx !== -1) {
    rev.suggestions[idx].status = status;
    if (userEditedText !== undefined) {
      rev.suggestions[idx].user_edited_text = userEditedText;
    }
    rev.updated_at = new Date().toISOString();
    setStore(store);
    return rev;
  }
  return null;
}

export function deleteLocalAnalysis(id: string): void {
  const store = getStore();
  delete store[id];
  setStore(store);
}

