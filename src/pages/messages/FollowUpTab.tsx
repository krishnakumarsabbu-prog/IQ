import React from 'react';
import { Bookmark, MessageSquare, ExternalLink } from 'lucide-react';
import { FormField, MessageNote as Note } from '../../types/formBuilder';

interface FollowUpField {
  field: FormField;
  tabId: string;
  tabName: string;
}

interface FollowUpTabProps {
  bookmarks: Record<string, boolean>;
  notes: Record<string, Note[]>;
  formValues: Record<string, any>;
  currentTemplateFields: FollowUpField[];
  onToggleBookmark: (fieldKey: string) => void;
  onOpenNotes: (fieldKey: string, fieldLabel: string) => void;
  onGoToField: (tabId: string) => void;
}

export default function FollowUpTab({
  bookmarks,
  notes,
  formValues,
  currentTemplateFields,
  onToggleBookmark,
  onOpenNotes,
  onGoToField,
}: FollowUpTabProps) {
  const bookmarkCount = Object.values(bookmarks).filter(Boolean).length;

  const allBookmarked = currentTemplateFields
    .filter(({ field }) => bookmarks[field.fieldKey])
    .sort((a, b) => (a.field.label || '').localeCompare(b.field.label || ''));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">

      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-50/60 to-orange-50/30 dark:from-amber-950/20 dark:to-slate-900">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-amber-500 fill-amber-500" />
            Follow Up Items
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All bookmarked fields sorted alphabetically. Click the note icon to view or add notes,
            or go directly to the original field.
          </p>
        </div>
        <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 text-xs px-3 py-1 rounded-full font-bold border border-amber-200 dark:border-amber-900/40">
          {bookmarkCount} Bookmarked
        </span>
      </div>

      {/* Field list */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
        {allBookmarked.length === 0 ? (
          <div className="py-20 text-center text-slate-400 dark:text-slate-500">
            <Bookmark className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-semibold">No bookmarked fields yet.</p>
            <p className="text-xs mt-1">
              Go to the Requirements tab and click the bookmark icon on any field.
            </p>
          </div>
        ) : (
          allBookmarked.map(({ field: fld, tabId, tabName }) => {
            const fieldNotes = notes[fld.fieldKey] || [];
            const currentVal = formValues[fld.fieldKey];

            return (
              <div key={fld.fieldKey} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors">

                {/* Row header */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Bookmark className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-sm font-bold text-slate-800 dark:text-white">{fld.label}</span>
                    {fld.required && <span className="text-red-400 text-xs">*</span>}
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded font-semibold">
                      {tabName}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Remove bookmark */}
                    <button
                      type="button"
                      onClick={() => onToggleBookmark(fld.fieldKey)}
                      title="Remove bookmark"
                      className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-lg text-amber-500 transition-colors"
                    >
                      <Bookmark className="h-4 w-4 fill-current" />
                    </button>

                    {/* Open notes modal */}
                    <button
                      type="button"
                      onClick={() => onOpenNotes(fld.fieldKey, fld.label)}
                      title="View / add notes"
                      className={`p-1.5 rounded-lg transition-colors relative ${
                        fieldNotes.length > 0
                          ? 'text-blue-600 bg-blue-50 dark:bg-blue-950/30'
                          : 'text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {fieldNotes.length > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] px-1 rounded-full font-black">
                          {fieldNotes.length}
                        </span>
                      )}
                    </button>

                    {/* Go to field */}
                    <button
                      type="button"
                      onClick={() => onGoToField(tabId)}
                      title="Go to field in form"
                      className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-semibold">Go to Field</span>
                    </button>
                  </div>
                </div>

                {/* Value display */}
                <div className="mb-3">
                  <div className="bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium min-h-[38px] flex items-center">
                    {currentVal !== undefined && currentVal !== null && currentVal !== '' ? (
                      String(currentVal)
                    ) : (
                      <span className="text-slate-400 italic">No value entered yet</span>
                    )}
                  </div>
                </div>

                {/* Inline notes preview (most recent 2) */}
                {fieldNotes.length > 0 && (
                  <div className="space-y-1.5">
                    {fieldNotes.slice(-2).map(note => (
                      <div
                        key={note.id}
                        className="flex items-start gap-2.5 bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl px-3 py-2"
                      >
                        <MessageSquare className="h-3 w-3 text-blue-400 shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">{note.author}</span>
                            <span className="text-[10px] text-slate-400">{note.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">{note.text}</p>
                        </div>
                      </div>
                    ))}
                    {fieldNotes.length > 2 && (
                      <button
                        type="button"
                        onClick={() => onOpenNotes(fld.fieldKey, fld.label)}
                        className="text-[10px] text-blue-500 hover:text-blue-600 font-semibold pl-1"
                      >
                        +{fieldNotes.length - 2} more note{fieldNotes.length - 2 !== 1 ? 's' : ''}...
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
