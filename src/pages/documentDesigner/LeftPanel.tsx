import React, { useState } from 'react';
import {
  Type, Variable, AlignLeft, FileText, Image, Building, PenLine,
  Table, QrCode, Barcode, CheckSquare, Calendar, DollarSign,
  Mail, Phone, Hash, CircleDollarSign, Minus, GripVertical,
  Square, Circle, LayoutPanelLeft, Scissors, PanelTop, PanelBottom,
  Droplets, Search, ChevronDown, ChevronRight, GripHorizontal
} from 'lucide-react';
import { COMPONENT_LIBRARY, ComponentLibraryItem, MongoField } from './types';
import { documentLayoutService } from './documentLayoutService';

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Type, Variable, AlignLeft, FileText, Image, Building, PenLine,
  Table, QrCode, Barcode, CheckSquare, Calendar, DollarSign,
  Mail, Phone, Hash, CircleDollarSign, Minus, GripVertical,
  Square, Circle, LayoutPanel: LayoutPanelLeft, Scissors, PanelTop, PanelBottom,
  Droplets, GripHorizontal,
};

interface LeftPanelProps {
  mongoFields: MongoField[];
  selectedIds: string[];
  documentTree: TreeNode[];
  onSelectElement: (id: string) => void;
  onAddElement?: (el: any) => void;
}

export interface TreeNode {
  id: string;
  label: string;
  type: string;
  children?: TreeNode[];
}

const categories = [...new Set(COMPONENT_LIBRARY.map(c => c.category))];

function ComponentCard({ item }: { item: ComponentLibraryItem }) {
  const Icon = ICON_MAP[item.icon] || Type;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('elementType', item.type);
    if (item.label === 'Fields Table') {
      e.dataTransfer.setData('tableType', 'keyvalue');
    }
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      title={`Drag ${item.label} to canvas`}
      className="flex flex-col items-center gap-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-grab active:cursor-grabbing hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all select-none group"
    >
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
      <span className="text-[10px] text-slate-600 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 text-center leading-tight">{item.label}</span>
    </div>
  );
}

function TreeNodeItem({ node, depth, selectedIds, onSelect }: {
  node: TreeNode;
  depth: number;
  selectedIds: string[];
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedIds.includes(node.id);

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer text-xs transition-colors ${
          isSelected
            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <button onClick={e => { e.stopPropagation(); setExpanded(v => !v); }} className="text-slate-400">
            {expanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span className="truncate flex-1">{node.label}</span>
        <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">{node.type}</span>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children!.map(child => (
            <TreeNodeItem key={child.id} node={child} depth={depth + 1} selectedIds={selectedIds} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

const LeftPanel: React.FC<LeftPanelProps> = ({ mongoFields, selectedIds, documentTree, onSelectElement, onAddElement }) => {
  const [activeTab, setActiveTab] = useState<'components' | 'fields' | 'tree'>('components');
  const [search, setSearch] = useState('');
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>(
    Object.fromEntries(categories.map(c => [c, true]))
  );

  const filteredComponents = COMPONENT_LIBRARY.filter(c =>
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFields = mongoFields.filter(f =>
    f.label.toLowerCase().includes(search.toLowerCase()) ||
    f.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleFieldDragStart = (e: React.DragEvent, field: MongoField) => {
    e.dataTransfer.setData('elementType', 'dynamicfield');
    e.dataTransfer.setData('fieldBinding', field.id);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
        {(['components', 'fields', 'tree'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-[11px] font-semibold capitalize transition-all ${
              activeTab === tab
                ? 'text-blue-700 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-white dark:bg-slate-900'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="p-2 border-b border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 placeholder-slate-400 focus:outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'components' && (
          <div className="space-y-3">
            {categories.map(cat => {
              const items = filteredComponents.filter(c => c.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <button
                    onClick={() => setExpandedCats(prev => ({ ...prev, [cat]: !prev[cat] }))}
                    className="flex items-center gap-1.5 w-full text-left mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400"
                  >
                    {expandedCats[cat] ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    {cat}
                  </button>
                  {expandedCats[cat] && (
                    <div className="grid grid-cols-3 gap-1.5">
                      {items.map(item => <ComponentCard key={item.type} item={item} />)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'fields' && (
          <div className="space-y-1">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-2 px-1">
              Drag fields onto canvas to bind data
            </p>
            {onAddElement && (
              <button
                onClick={() => {
                  const newEl = {
                    ...documentLayoutService.createDefaultElement('table', 50, 100),
                    tableType: 'keyvalue' as const,
                    width: 500,
                  };
                  onAddElement(newEl);
                }}
                className="w-full mb-3 flex items-center justify-center gap-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm hover:shadow transition-all"
              >
                <Table className="h-3.5 w-3.5" />
                Add All Fields as Table
              </button>
            )}
            {filteredFields.map(field => (
              <div
                key={field.id}
                draggable
                onDragStart={e => handleFieldDragStart(e, field)}
                className="flex items-center gap-2 px-2 py-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 cursor-grab hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all select-none group"
              >
                <Variable className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{field.label}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">{`{{${field.id}}}`}</div>
                </div>
                <span className="text-[9px] text-slate-300 dark:text-slate-600 uppercase font-mono">{field.type}</span>
              </div>
            ))}
            {filteredFields.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">No fields found</p>
            )}
          </div>
        )}

        {activeTab === 'tree' && (
          <div>
            {documentTree.length === 0 ? (
              <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-4">
                No elements on canvas yet
              </p>
            ) : (
              documentTree.map(node => (
                <TreeNodeItem
                  key={node.id}
                  node={node}
                  depth={0}
                  selectedIds={selectedIds}
                  onSelect={onSelectElement}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;
