/**
 * NotesModal.tsx
 * ──────────────
 * Floating dialog for viewing / adding / deleting collaborative notes
 * on a specific form field. Consumed via MessageFormContext.
 */

import React from 'react';
import { Send, Trash2 } from 'lucide-react';
import { useMessageFormContext } from './useMessageForm';

export default function NotesModal() {
  const {
    isNotesModalOpen,
    setIsNotesModalOpen,
    notesModalFieldKey,
    notesModalFieldLabel,
    notes,
    newNoteAuthor,
    setNewNoteAuthor,
    newNoteText,
    setNewNoteText,
    handleAddNote,
    handleDeleteNote,
  } = useMessageFormContext();

  if (!isNotesModalOpen) return null;

  const fieldNotes = notes[notesModalFieldKey] || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5 transform transition-all">

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
            Notes — {notesModalFieldLabel}
          </h3>
          <button
            onClick={() => setIsNotesModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 text-base font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Previous Notes */}
        <div className="space-y-3">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
            Previous Notes
          </span>

          <div className="max-h-52 overflow-y-auto space-y-2.5 pr-1.5 scrollbar-thin">
            {fieldNotes.length > 0 ? (
              fieldNotes.map(note => (
                <div
                  key={note.id}
                  className="bg-slate-50/50 dark:bg-slate-950/20 border border-slate-150/60 dark:border-slate-800/80 p-3.5 rounded-xl relative group"
                >
                  <div className="flex items-center justify-between text-[11px] font-semibold">
                    <span className="text-blue-600 dark:text-blue-400">{note.author}</span>
                    <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium">
                      <span>{note.timestamp}</span>
                      <button
                        onClick={() => handleDeleteNote(notesModalFieldKey, note.id)}
                        className="text-red-400 hover:text-red-500 ml-1 p-0.5 rounded hover:bg-red-50 dark:hover:bg-red-950/20 transition-all opacity-0 group-hover:opacity-100"
                        title="Delete note"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-medium">
                    {note.text}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-slate-400 dark:text-slate-500 italic text-xs font-semibold">
                No notes yet. Add one below.
              </div>
            )}
          </div>
        </div>

        {/* Note editor */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-850">
          <span className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider block">
            Write New Note
          </span>

          <div className="space-y-2">
            <input
              type="text"
              placeholder="Your Name"
              value={newNoteAuthor}
              onChange={e => setNewNoteAuthor(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              placeholder="Type your note here... (Ctrl+Enter to save)"
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              onKeyDown={e => {
                if (e.ctrlKey && e.key === 'Enter') handleAddNote();
              }}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-850/80">
          <button
            type="button"
            onClick={() => setIsNotesModalOpen(false)}
            className="border border-slate-250 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 px-4 py-2 rounded-xl text-xs font-bold transition-all"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleAddNote}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Send className="h-3.5 w-3.5" />
            Add Note
          </button>
        </div>
      </div>
    </div>
  );
}
