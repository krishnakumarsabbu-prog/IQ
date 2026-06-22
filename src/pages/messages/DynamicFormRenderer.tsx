/**
 * DynamicFormRenderer.tsx
 * ───────────────────────
 * Renders the form canvas for a single template sub-tab.
 * Iterates sections → fields, applies the rule engine, and delegates
 * each field to a composable rendering pipeline.
 */

import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Bookmark, MessageSquare, HelpCircle, AlertCircle,
  Info, User, Users, ExternalLink,
} from 'lucide-react';
import { FormSection } from '../../types/formBuilder';
import { useMessageFormContext } from './useMessageForm';

interface DynamicFormRendererProps {
  sections: FormSection[];
}

export default function DynamicFormRenderer({ sections }: DynamicFormRendererProps) {
  const {
    register, control, formValues, errors,
    bookmarks, notes, activeHelp,
    handleToggleBookmark, handleOpenNotes, handleToggleHelp,
    getFieldState, getValidationRules,
  } = useMessageFormContext();

  return (
    <div className="space-y-8 animate-fadeIn">
      {sections.map(sec => {
        const visibleFields = sec.fields.filter(f => !getFieldState(f).isHidden);
        if (visibleFields.length === 0) return null;

        return (
          <div key={sec.sectionId} className="space-y-5">
            {/* Section header */}
            <div className="pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {sec.sectionName}
              </h3>
              {sec.description && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {sec.description}
                </p>
              )}
            </div>

            {/* Fields grid */}
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${sec.columns}, minmax(0, 1fr))` }}
            >
              {sec.fields.map(fld => {
                const { isHidden, isReadOnly, isRequired } = getFieldState(fld);
                if (isHidden) return null;

                const isBookmarked = !!bookmarks[fld.fieldKey];
                const fieldNotes = notes[fld.fieldKey] || [];
                const notesCount = fieldNotes.length;

                return (
                  <div
                    key={fld.fieldId}
                    className={`space-y-1.5 transition-all p-2 rounded-xl ${
                      isBookmarked
                        ? 'bg-blue-50/10 dark:bg-blue-950/5 ring-1 ring-blue-500/20'
                        : ''
                    }`}
                  >
                    {/* ── Field header: Label + Actions ── */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {fld.label} {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        {isBookmarked && (
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/40 font-bold whitespace-nowrap">
                            • Bookmarked
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={() => handleToggleBookmark(fld.fieldKey)}
                          title="Bookmark field"
                          className={`p-1 hover:text-blue-600 transition-colors rounded ${
                            isBookmarked ? 'text-blue-600' : 'text-slate-350 dark:text-slate-600'
                          }`}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenNotes(fld.fieldKey, fld.label)}
                          title="Add a note"
                          className={`p-1 hover:text-blue-600 transition-colors rounded relative ${
                            notesCount > 0 ? 'text-blue-600 font-bold' : 'text-slate-350 dark:text-slate-600'
                          }`}
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          {notesCount > 0 && (
                            <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[8px] px-1 rounded-full min-w-3 h-3 flex items-center justify-center font-black">
                              {notesCount}
                            </span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleHelp(fld.fieldKey)}
                          title="Show help"
                          className={`p-1 hover:text-blue-600 transition-colors rounded ${
                            activeHelp[fld.fieldKey] ? 'text-blue-600' : 'text-slate-350 dark:text-slate-600'
                          }`}
                        >
                          <HelpCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* ── Field input (type switch) ── */}
                    {['TextBox', 'Email', 'Phone', 'Number', 'Currency'].includes(fld.fieldType) && (
                      <input
                        type={fld.fieldType === 'Number' ? 'number' : 'text'}
                        disabled={isReadOnly}
                        placeholder={fld.placeholder || 'Type here...'}
                        defaultValue={fld.defaultValue}
                        {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                          isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    )}

                    {fld.fieldType === 'TextArea' && (
                      <textarea
                        disabled={isReadOnly}
                        placeholder={fld.placeholder}
                        defaultValue={fld.defaultValue}
                        rows={3}
                        {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none ${
                          isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    )}

                    {fld.fieldType === 'Dropdown' && (
                      <select
                        disabled={isReadOnly}
                        defaultValue={fld.defaultValue || ''}
                        {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                          isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <option value="">{fld.placeholder || 'Select option...'}</option>
                        {fld.validation?.allowedValues?.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {fld.fieldType === 'Toggle' && (
                      <Controller
                        name={fld.fieldKey}
                        control={control}
                        defaultValue={fld.defaultValue === 'true'}
                        render={({ field: { value, onChange } }) => (
                          <div className="flex items-center gap-3 pt-1">
                            <button
                              type="button"
                              disabled={isReadOnly}
                              onClick={() => onChange(!value)}
                              className={`w-11 h-6 bg-slate-250 dark:bg-slate-800 rounded-full relative transition-colors duration-200 border ${
                                value
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <div
                                className={`w-4 h-4 bg-white rounded-full absolute top-1 left-1 transition-transform duration-200 shadow-sm ${
                                  value ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                              {value ? 'Yes' : 'No'}
                            </span>
                          </div>
                        )}
                      />
                    )}

                    {fld.fieldType === 'Checkbox' && (
                      <label className="flex items-center gap-2 pt-1">
                        <input
                          type="checkbox"
                          disabled={isReadOnly}
                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                          className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-blue-500 text-blue-600"
                        />
                        <span className="text-xs text-slate-500 dark:text-slate-400">Enabled</span>
                      </label>
                    )}

                    {['Date', 'DateTime'].includes(fld.fieldType) && (
                      <input
                        type={fld.fieldType === 'Date' ? 'date' : 'datetime-local'}
                        disabled={isReadOnly}
                        defaultValue={fld.defaultValue}
                        {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                        className={`w-full bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-850 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                          isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                        }`}
                      />
                    )}

                    {fld.fieldType === 'UserPicker' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="WF LAN ID (e.g. S123456)"
                          defaultValue={fld.defaultValue}
                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                          className={`flex-1 bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                            isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                          }`}
                        />
                        <button type="button" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                          <User className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {fld.fieldType === 'GroupPicker' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={isReadOnly}
                          placeholder="WF AD Group (e.g. WF_IT_ADMINS)"
                          defaultValue={fld.defaultValue}
                          {...register(fld.fieldKey, getValidationRules(fld, isRequired))}
                          className={`flex-1 bg-white dark:bg-slate-900 border rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all ${
                            isBookmarked ? 'border-blue-300 dark:border-blue-800' : 'border-slate-200 dark:border-slate-800'
                          }`}
                        />
                        <button type="button" className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                          <Users className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    {/* ── Inline help ── */}
                    {fld.helpText && activeHelp[fld.fieldKey] && (
                      <div className="mt-2 text-xs bg-blue-50/50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-r-xl p-4 text-slate-600 dark:text-slate-350 space-y-2.5 animate-fadeIn">
                        <div className="flex items-start gap-2.5">
                          <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            {fld.helpText.split('\n\n').map((para, idx) => (
                              <p key={idx} className="leading-relaxed text-[11px]">
                                {para.includes('Confluence') ? (
                                  <span>
                                    Share this page with the tech team who will be creating the message request:{' '}
                                    <a href="#" onClick={e => e.preventDefault()} className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 inline-flex">
                                      Modernized Shell Alert - Digital Notification Platform - Enterprise Confluence <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </span>
                                ) : (
                                  para
                                )}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* ── Validation error ── */}
                    {errors[fld.fieldKey] && (
                      <p className="text-red-500 text-[10px] mt-1.5 flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5" />
                        <span>{errors[fld.fieldKey]?.message as string}</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
