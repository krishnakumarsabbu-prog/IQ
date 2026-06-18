import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Loader, CheckCircle, Plus, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Variable, ConditionDefinition, ConditionClause, ConditionOperator } from '../types/template';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  isStreaming?: boolean;
}

interface DynamicFieldChatPanelProps {
  variable: Variable;
  existingVariables: Variable[];
  onConditionGenerated: (condition: ConditionDefinition, businessRequirement: string) => void;
  businessRequirement?: string;
}

type ConversationPhase =
  | 'intro'
  | 'ask_possible_values'
  | 'collecting_value_outputs'
  | 'ask_fallback'
  | 'ask_confirm'
  | 'done';

interface ValueOutputPair {
  inputValue: string;
  outputValue: string;
}

function buildConditionFromPairs(
  variableName: string,
  driverVariable: string,
  pairs: ValueOutputPair[],
  fallback: string
): ConditionDefinition {
  const clauses: ConditionClause[] = pairs.map((pair) => ({
    variable: driverVariable,
    operator: '==' as ConditionOperator,
    value: pair.inputValue,
    valueType: 'literal' as const,
  }));

  const ifBlocks = pairs.map((pair) =>
    `{{#ifEquals ${driverVariable} "${pair.inputValue}"}}${pair.outputValue}{{/ifEquals}}`
  ).join('');

  const content = fallback
    ? `${ifBlocks}{{#unless _matched}}${fallback}{{/unless}}`
    : ifBlocks;

  return {
    id: Date.now().toString() + Math.random(),
    name: variableName + '_condition',
    description: `Dynamic condition for ${variableName} based on ${driverVariable}`,
    clauses: clauses.length > 0 ? [clauses[0]] : [],
    logicOperator: 'OR',
    content,
    hasElse: !!fallback,
    elseContent: fallback || '',
  };
}

function buildBusinessRequirement(
  variableName: string,
  driverVariable: string,
  pairs: ValueOutputPair[],
  fallbackType: 'null' | 'blank'
): string {
  const lines = [`<${variableName}> looks at the <${driverVariable}> input field.`];
  for (const pair of pairs) {
    lines.push(`If <${driverVariable}> = ${pair.inputValue}, <${variableName}> returns the ${pair.inputValue} ${variableName} text.`);
  }
  lines.push(`If <${driverVariable}> is missing, blank, or any value other than ${pairs.map(p => p.inputValue).join('/')}, <${variableName}> returns ${fallbackType} (so nothing is displayed).`);
  return lines.join('\n');
}

export default function DynamicFieldChatPanel({
  variable,
  existingVariables,
  onConditionGenerated,
  businessRequirement: initialBR,
}: DynamicFieldChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<ConversationPhase>('intro');
  const [driverVariable, setDriverVariable] = useState('');
  const [pairs, setPairs] = useState<ValueOutputPair[]>([]);
  const [pendingInputValue, setPendingInputValue] = useState('');
  const [fallbackType, setFallbackType] = useState<'null' | 'blank'>('null');
  const [businessRequirement, setBusinessRequirement] = useState(initialBR || '');
  const [confirmed, setConfirmed] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const intro: ChatMessage = {
      id: 'intro',
      role: 'assistant',
      content: `Tell me about **<${variable.name}>**.\n\nIn 1–2 sentences, please describe:\n- **What it should output** (the value), and\n- **What it's used for** (where it shows up / why it matters).`,
    };
    setMessages([intro]);
    setPhase('intro');
  }, [variable.name]);

  const addMessage = (role: 'assistant' | 'user', content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString() + Math.random(), role, content },
    ]);
  };

  const simulateTyping = async (content: string) => {
    const msgId = Date.now().toString() + Math.random();
    setMessages((prev) => [...prev, { id: msgId, role: 'assistant', content: '', isStreaming: true }]);
    await new Promise((r) => setTimeout(r, 300));
    setMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, content, isStreaming: false } : m))
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userText = input.trim();
    setInput('');
    addMessage('user', userText);
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    if (phase === 'intro') {
      await simulateTyping(
        `You mentioned the field will dynamically compute its value.\n\nWhat **variable (field)** drives the logic? For example, if it depends on a "brand" field, tell me which variable that is.\n\n**Available variables:** ${existingVariables.map(v => `\`${v.name}\``).join(', ')}`
      );
      setPhase('ask_possible_values');
    } else if (phase === 'ask_possible_values') {
      const found = existingVariables.find((v) =>
        userText.toLowerCase().includes(v.name.toLowerCase())
      );
      const driver = found?.name || userText.split(/[\s,]+/)[0];
      setDriverVariable(driver);
      await simulateTyping(
        `You mentioned the **\`${driver}\`** field as the driver.\n\nWhat are the **possible values** that can appear in the \`${driver}\` field?\n\n*(You can paste a comma-separated list, e.g. "VW, Audi, BMW")*`
      );
      setPhase('collecting_value_outputs');
    } else if (phase === 'collecting_value_outputs') {
      const rawValues = userText.split(/[,\n]+/).map((v) => v.trim()).filter(Boolean);
      if (rawValues.length > 0 && pairs.length === 0) {
        setPendingInputValue(rawValues[0]);
        const remaining = rawValues.slice(1);
        setPairs(remaining.map((v) => ({ inputValue: v, outputValue: '' })));
        await simulateTyping(
          `What **${variable.name} text** should \`<${variable.name}>\` output for **\`${driverVariable}\` = ${rawValues[0]}**?`
        );
      } else {
        const currentPair = pairs.find((p) => !p.outputValue);
        if (currentPair) {
          const updatedPairs = pairs.map((p) =>
            p.inputValue === currentPair.inputValue ? { ...p, outputValue: userText } : p
          );
          if (pendingInputValue && !pairs.find(p => p.inputValue === pendingInputValue)) {
            const completedPair = { inputValue: pendingInputValue, outputValue: userText };
            const allPairs = [completedPair, ...updatedPairs];
            setPairs(allPairs);
            setPendingInputValue('');

            const nextEmpty = updatedPairs.find((p) => !p.outputValue);
            if (nextEmpty) {
              setPendingInputValue(nextEmpty.inputValue);
              await simulateTyping(
                `What **${variable.name} text** should \`<${variable.name}>\` output for **\`${driverVariable}\` = ${nextEmpty.inputValue}**?`
              );
            } else {
              await simulateTyping(
                `When you say "should not display," should \`<${variable.name}>\` output:\n\n1. **Blank / empty string**, or\n2. A **null / no value** (so the template omits the entire block)?\n\n*(Answer with 1 or 2.)*`
              );
              setPhase('ask_fallback');
            }
          } else {
            const allPairs = [...pairs.map(p => p.inputValue === currentPair.inputValue ? { ...p, outputValue: userText } : p)];
            setPairs(allPairs);

            const nextEmpty = allPairs.find((p) => !p.outputValue);
            if (nextEmpty) {
              setPendingInputValue(nextEmpty.inputValue);
              await simulateTyping(
                `What **${variable.name} text** should \`<${variable.name}>\` output for **\`${driverVariable}\` = ${nextEmpty.inputValue}**?`
              );
            } else {
              await simulateTyping(
                `When you say "should not display," should \`<${variable.name}>\` output:\n\n1. **Blank / empty string**, or\n2. A **null / no value** (so the template omits the entire block)?\n\n*(Answer with 1 or 2.)*`
              );
              setPhase('ask_fallback');
            }
          }
        } else if (pendingInputValue) {
          const newPair = { inputValue: pendingInputValue, outputValue: userText };
          const allPairs = [...pairs, newPair];
          setPairs(allPairs);
          setPendingInputValue('');

          const nextEmpty = allPairs.find((p) => !p.outputValue);
          if (nextEmpty) {
            setPendingInputValue(nextEmpty.inputValue);
            await simulateTyping(
              `What **${variable.name} text** should \`<${variable.name}>\` output for **\`${driverVariable}\` = ${nextEmpty.inputValue}**?`
            );
          } else {
            await simulateTyping(
              `When you say "should not display," should \`<${variable.name}>\` output:\n\n1. **Blank / empty string**, or\n2. A **null / no value** (so the template omits the entire block)?\n\n*(Answer with 1 or 2.)*`
            );
            setPhase('ask_fallback');
          }
        }
      }
    } else if (phase === 'ask_fallback') {
      const isNull = userText.includes('2') || userText.toLowerCase().includes('null');
      setFallbackType(isNull ? 'null' : 'blank');
      const allCompletePairs = pairs.filter((p) => p.outputValue);
      const br = buildBusinessRequirement(variable.name, driverVariable, allCompletePairs, isNull ? 'null' : 'blank');
      setBusinessRequirement(br);

      const tableRows = allCompletePairs.map((p) => `| ${p.inputValue} | *${p.outputValue.slice(0, 60)}${p.outputValue.length > 60 ? '...' : ''}* |`).join('\n');
      const summaryMsg = `Accepted — for any missing/blank/unknown input, **\`<${variable.name}>\`** outputs ${isNull ? 'null' : 'blank'}.\n\n**Business logic (plain language)**\n- \`<${variable.name}>\` looks at the **\`${driverVariable}\`** input field.\n${allCompletePairs.map(p => `- If \`${driverVariable}\` = **${p.inputValue}**, \`<${variable.name}>\` returns the **${p.inputValue} ${variable.name} text**.`).join('\n')}\n- If \`${driverVariable}\` is missing, blank, or any value other than ${allCompletePairs.map(p => p.inputValue).join('/')}, \`<${variable.name}>\` returns **${isNull ? 'null' : 'blank'}** (so nothing is displayed).\n\n**Example Input / Output table**\n| \`${driverVariable}\` (input) | \`<${variable.name}>\` (output) |\n|---|---|\n${tableRows}\n| *(missing)* | ${isNull ? 'null' : 'blank'} |\n| "" (blank) | ${isNull ? 'null' : 'blank'} |\n| BMW (any other value) | ${isNull ? 'null' : 'blank'} |\n\n**Does this look correct, or should we revise it?**`;

      await simulateTyping(summaryMsg);
      setPhase('ask_confirm');
    } else if (phase === 'ask_confirm') {
      const isConfirmed =
        userText.toLowerCase().includes('looks good') ||
        userText.toLowerCase().includes('correct') ||
        userText.toLowerCase().includes('yes') ||
        userText.toLowerCase().includes('good') ||
        userText.toLowerCase().includes('ok');

      if (isConfirmed) {
        const allCompletePairs = pairs.filter((p) => p.outputValue);
        const condition = buildConditionFromPairs(variable.name, driverVariable, allCompletePairs, fallbackType === 'null' ? '' : '');
        const br = buildBusinessRequirement(variable.name, driverVariable, allCompletePairs, fallbackType);
        setBusinessRequirement(br);
        setConfirmed(true);
        await simulateTyping(`Business requirement captured and condition generated for **\`${variable.name}\`**.\n\nThe condition has been added to your template's condition set.`);
        setPhase('done');
        onConditionGenerated(condition, br);
      } else {
        await simulateTyping(
          `No problem! What would you like to revise? You can:\n- Change the driver variable\n- Update output text for a specific value\n- Add or remove input values`
        );
      }
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot size={14} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-800">GenAI Conversation</span>
        {confirmed && <CheckCircle size={14} className="text-emerald-500 ml-auto" />}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 ${
              msg.role === 'assistant' ? 'bg-blue-600' : 'bg-wf-red'
            }`}>
              {msg.role === 'assistant' ? (
                <Bot size={14} className="text-white" />
              ) : (
                <User size={14} className="text-white" />
              )}
            </div>
            <div className={`max-w-[85%] text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white px-3.5 py-2.5 rounded-2xl rounded-tr-sm'
                : 'text-gray-800'
            }`}>
              {msg.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-strong:text-gray-900 prose-code:text-blue-700 prose-code:bg-blue-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-table:text-xs">
                  <ReactMarkdown>{msg.content || (msg.isStreaming ? '...' : '')}</ReactMarkdown>
                  {msg.isStreaming && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-blue-500 animate-pulse rounded" />
                  )}
                </div>
              ) : (
                <span>{msg.content}</span>
              )}
            </div>
          </div>
        ))}

        {isLoading && !messages[messages.length - 1]?.isStreaming && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <Bot size={14} className="text-white" />
            </div>
            <Loader size={16} className="animate-spin text-blue-500" />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {phase !== 'done' && (
        <div className="bg-white border-t border-gray-200 p-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Type your response..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
              style={{ minHeight: '40px', maxHeight: '120px' }}
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      {phase === 'done' && businessRequirement && (
        <div className="bg-emerald-50 border-t border-emerald-200 px-4 py-3">
          <p className="text-xs font-semibold text-emerald-700 mb-1.5">Business Requirement Captured</p>
          <p className="text-xs text-emerald-800 whitespace-pre-line leading-relaxed">{businessRequirement}</p>
        </div>
      )}
    </div>
  );
}
