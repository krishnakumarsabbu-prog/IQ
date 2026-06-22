/**
 * MessageListView.tsx
 * ───────────────────
 * The "Message Management" list view — search bar, data table,
 * create/edit/delete actions.
 */

import React from 'react';
import { Search, Plus, Bookmark, Trash2 } from 'lucide-react';
import { useMessageFormContext } from './useMessageForm';

export default function MessageListView() {
  const {
    searchQuery,
    setSearchQuery,
    filteredMessages,
    handleNewMessage,
    handleEditMessage,
    handleDeleteMessage,
  } = useMessageFormContext();

  return (
    <div className="w-full space-y-6 animate-fadeIn py-4 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            Message Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create and manage your messaging campaigns
          </p>
        </div>
        <button
          onClick={handleNewMessage}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-all duration-200"
        >
          <Plus className="h-4.5 w-4.5" strokeWidth={2.5} />
          Create New Message
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by message name or ID..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/15 focus:border-blue-500 outline-none text-slate-700 dark:text-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
        />
      </div>

      {/* Messages grid table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/75 dark:bg-slate-850 border-b border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">Message ID</th>
                <th className="py-4 px-6">Name</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Channels</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Last Modified</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {filteredMessages.length > 0 ? (
                filteredMessages.map(msg => (
                  <tr
                    key={msg.messageId}
                    onClick={() => handleEditMessage(msg)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors duration-150"
                  >
                    <td className="py-4.5 px-6 font-semibold text-slate-700 dark:text-slate-300">
                      {msg.messageId}
                    </td>
                    <td className="py-4.5 px-6 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{msg.messageName}</span>
                        {Object.values(msg.bookmarks || {}).some(Boolean) && (
                          <Bookmark className="h-3.5 w-3.5 text-blue-500 fill-current" />
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {msg.messageType}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5">
                        {msg.channels.map((chan, idx) => (
                          <span
                            key={idx}
                            className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold ${
                              chan === 'Email'
                                ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-350 border-sky-100 dark:border-sky-900/30'
                                : chan === 'SMS'
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-350 border-indigo-100 dark:border-indigo-900/30'
                                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-350 border-emerald-100 dark:border-emerald-900/30'
                            }`}
                          >
                            {chan}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                          msg.status === 'Active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/60 dark:border-slate-700'
                        }`}
                      >
                        {msg.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 font-medium">
                      {msg.lastModified}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={e => handleDeleteMessage(e, msg.messageId)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg text-red-500 hover:text-red-600 transition-colors"
                        title="Delete Message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                    No messages found matching search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
