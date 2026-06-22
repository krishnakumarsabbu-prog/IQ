/**
 * NewMessageDynamic.tsx
 * ─────────────────────
 * Slim orchestrator — the only responsibility of this file is:
 *   1. Initialise the useMessageForm() custom hook
 *   2. Provide the MessageFormContext to all children
 *   3. Route between the list view and the wizard view
 *   4. Render the floating NotesModal
 *
 * All business logic lives in useMessageForm.ts
 * All UI lives in dedicated tab/view components.
 *
 * Architecture:
 *   NewMessageDynamic (orchestrator)
 *   ├── MessageListView        — search + table + CRUD
 *   ├── MessageWizard          — top nav + tab router
 *   │   ├── RequirementsTab    — template selector + sub-tabs + form
 *   │   │   └── DynamicFormRenderer — section/field rendering + rules
 *   │   ├── ContentTab         — live email preview
 *   │   ├── DeployTab          — pipeline stages
 *   │   ├── ProjectStatusTab   — compliance metrics
 *   │   └── DocumentationTab   — API docs
 *   └── NotesModal             — floating notes dialog
 */

import React from 'react';
import Layout from '../../components/Layout';
import { useMessageForm, MessageFormContext } from './useMessageForm';
import MessageListView from './MessageListView';
import MessageWizard from './MessageWizard';
import NotesModal from './NotesModal';

export default function NewMessageDynamic() {
  const formState = useMessageForm();

  return (
    <MessageFormContext.Provider value={formState}>
      <Layout>
        {formState.view === 'list' ? (
          <MessageListView />
        ) : (
          <MessageWizard />
        )}

        {/* Floating modal — renders on top of everything */}
        <NotesModal />
      </Layout>
    </MessageFormContext.Provider>
  );
}
