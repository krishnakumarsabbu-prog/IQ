/**
 * services/componentLibraryService.ts
 * ─────────────────────────────────────
 * Backend service for the Content Builder component library.
 *
 * Follows the same dual-mode pattern as formBuilderService.ts:
 *   1. If the Spring backend is reachable → calls REST API
 *   2. Otherwise → falls back to localStorage
 *
 * localStorage key: alertsiq_component_library
 * REST base: http://localhost:8089/api/component-library
 */

import { COMPONENT_LIBRARY as BUILTIN_DEFS } from '../pages/messages/contentBuilder/constants';

const BASE_URL   = 'http://localhost:8089/api';
const LS_KEY     = 'alertsiq_component_library';
const ENDPOINT   = `${BASE_URL}/component-library`;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface StoredComponentDef {
  id: string;              // unique key (used as `kind` value)
  kind: string;
  label: string;
  description: string;
  category: 'text' | 'action' | 'media' | 'data' | 'layout' | 'advanced';
  icon: string;            // lucide icon name
  defaultText: string;
  defaultUrl?: string;
  isCustom: boolean;       // true = user-created; false = built-in (seeded)
  createdAt: string;       // ISO date string
  updatedAt: string;
}

// ── Backend check ─────────────────────────────────────────────────────────────

async function isBackendReachable(): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 800);
    const r = await fetch(`${BASE_URL}/templates`, { method: 'GET', signal: ctrl.signal });
    return r.ok;
  } catch {
    return false;
  }
}

// ── Seed logic ─────────────────────────────────────────────────────────────────

function getLocalDefs(): StoredComponentDef[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveLocalDefs(defs: StoredComponentDef[]): void {
  localStorage.setItem(LS_KEY, JSON.stringify(defs));
}

/**
 * Ensures the built-in component definitions from constants.ts
 * are always present in localStorage (seeded with isCustom=false).
 */
function ensureSeeded(): StoredComponentDef[] {
  const stored = getLocalDefs();
  const storedKinds = new Set(stored.map(d => d.kind));
  let dirty = false;

  for (const def of BUILTIN_DEFS) {
    if (!storedKinds.has(def.kind)) {
      const now = new Date().toISOString();
      stored.push({
        id:          def.kind,
        kind:        def.kind,
        label:       def.label,
        description: def.description,
        category:    def.category,
        icon:        def.icon,
        defaultText: def.defaultText,
        defaultUrl:  def.defaultUrl,
        isCustom:    false,
        createdAt:   now,
        updatedAt:   now,
      });
      dirty = true;
    }
  }
  if (dirty) saveLocalDefs(stored);
  return stored;
}

// ── Service API ───────────────────────────────────────────────────────────────

export const componentLibraryService = {

  /** Get all component definitions (built-in + custom) */
  async getAll(): Promise<StoredComponentDef[]> {
    if (await isBackendReachable()) {
      try {
        const r = await fetch(ENDPOINT);
        if (r.ok) {
          const data: StoredComponentDef[] = await r.json();
          if (data.length > 0) return data;
        }
      } catch { /* fall through */ }
    }
    return ensureSeeded();
  },

  /** Save (create or update) a single component definition */
  async save(def: StoredComponentDef): Promise<StoredComponentDef> {
    const now = new Date().toISOString();
    const saved = { ...def, updatedAt: now };

    if (await isBackendReachable()) {
      try {
        const url    = saved.id ? `${ENDPOINT}/${saved.id}` : ENDPOINT;
        const method = saved.id ? 'PUT' : 'POST';
        const r = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(saved),
        });
        if (r.ok) return r.json();
      } catch { /* fall through */ }
    }

    // localStorage fallback
    const all  = ensureSeeded();
    const idx  = all.findIndex(d => d.id === saved.id || d.kind === saved.kind);
    if (idx >= 0) {
      all[idx] = saved;
    } else {
      saved.id        = saved.kind || ('cmp_' + Math.random().toString(36).substring(2, 9));
      saved.createdAt = now;
      all.push(saved);
    }
    saveLocalDefs(all);
    return saved;
  },

  /** Delete a component definition by id */
  async delete(id: string): Promise<void> {
    if (await isBackendReachable()) {
      try {
        await fetch(`${ENDPOINT}/${id}`, { method: 'DELETE' });
        return;
      } catch { /* fall through */ }
    }
    const all      = ensureSeeded();
    const filtered = all.filter(d => d.id !== id && d.kind !== id);
    saveLocalDefs(filtered);
  },

  /** Get only user-created (custom) component definitions */
  async getCustom(): Promise<StoredComponentDef[]> {
    const all = await this.getAll();
    return all.filter(d => d.isCustom);
  },
};
