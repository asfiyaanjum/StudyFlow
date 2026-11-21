/**
 * Milestone persistence helper for Plan and Goal sub-milestones.
 *
 * Persists structured sub-milestones into the existing `plans.content: TEXT` column
 * without requiring any Supabase schema changes or breaking existing plain-text content.
 */

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: string;
  order?: number;
}

export interface PlanContentData {
  notes: string;
  milestones: Milestone[];
}

/**
 * Safely parse `plans.content` string.
 * - If content contains JSON with `{ notes, milestones }`, extracts both.
 * - If content is legacy markdown/plain text, returns `{ notes: content, milestones: [] }`.
 * - If content is null or empty, returns `{ notes: '', milestones: [] }`.
 */
export function parsePlanMilestones(content: string | null | undefined): PlanContentData {
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return { notes: '', milestones: [] };
  }

  const trimmed = content.trim();

  // Try parsing JSON if content starts with '{'
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && typeof parsed === 'object') {
        const milestones = Array.isArray(parsed.milestones)
          ? parsed.milestones.map((m: any, index: number) => ({
              id: String(m.id || `m-${index}-${Date.now()}`),
              title: String(m.title || ''),
              completed: Boolean(m.completed),
              dueDate: m.dueDate ? String(m.dueDate) : undefined,
              order: typeof m.order === 'number' ? m.order : index,
            }))
          : [];

        const notes = typeof parsed.notes === 'string' ? parsed.notes : '';
        return { notes, milestones };
      }
    } catch {
      // Fallback to raw content if JSON parsing fails
    }
  }

  // Legacy plain text/markdown content
  return { notes: content, milestones: [] };
}

/**
 * Serialize notes and milestones into a string suitable for `plans.content`.
 * If there are no milestones, stores notes as plain text to maintain maximum backward compatibility.
 * If milestones exist, stores as formatted JSON.
 */
export function serializePlanMilestones(milestones: Milestone[], notes: string = ''): string {
  if (!milestones || milestones.length === 0) {
    return notes;
  }

  const data: PlanContentData = {
    notes: notes || '',
    milestones: milestones.map((m, idx) => ({
      id: m.id,
      title: m.title.trim(),
      completed: Boolean(m.completed),
      dueDate: m.dueDate,
      order: typeof m.order === 'number' ? m.order : idx,
    })),
  };

  return JSON.stringify(data);
}

/**
 * Toggle completion status of a specific milestone.
 */
export function toggleMilestone(milestones: Milestone[], milestoneId: string): Milestone[] {
  return milestones.map((m) =>
    m.id === milestoneId ? { ...m, completed: !m.completed } : m
  );
}

/**
 * Add a new milestone.
 */
export function addMilestone(
  milestones: Milestone[],
  title: string,
  dueDate?: string
): Milestone[] {
  const newMilestone: Milestone = {
    id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: title.trim(),
    completed: false,
    dueDate,
    order: milestones.length,
  };
  return [...milestones, newMilestone];
}

/**
 * Remove a milestone by ID.
 */
export function removeMilestone(milestones: Milestone[], milestoneId: string): Milestone[] {
  return milestones.filter((m) => m.id !== milestoneId);
}

/**
 * Calculate completion percentage of milestone list (0 to 100).
 */
export function calculateMilestoneProgress(milestones: Milestone[]): number {
  if (!milestones || milestones.length === 0) return 0;
  const completed = milestones.filter((m) => m.completed).length;
  return Math.round((completed / milestones.length) * 100);
}
