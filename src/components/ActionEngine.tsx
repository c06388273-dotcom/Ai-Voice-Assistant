import React, { useState } from "react";
import { 
  Calendar, CheckSquare, FileText, ChevronRight, Play, 
  Clock, Plus, Square, CheckCircle, Volume2
} from "lucide-react";
import { WorkspaceAction } from "../types";

interface ActionEngineProps {
  actions: WorkspaceAction[];
  onToggleAction: (id: string) => void;
  onAddAction: (type: "note" | "task" | "reminder", content: string, datetime?: string) => void;
  onClearActions: () => void;
  onSimulateCommand: (command: string) => void;
}

export const ActionEngine: React.FC<ActionEngineProps> = ({
  actions,
  onToggleAction,
  onAddAction,
  onClearActions,
  onSimulateCommand,
}) => {
  const [activeTab, setActiveTab] = useState<"actions" | "blueprints">("actions");
  const [quickInput, setQuickInput] = useState("");
  const [quickInputType, setQuickInputType] = useState<"task" | "note" | "reminder">("task");
  const [quickDatetime, setQuickDatetime] = useState("");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    onAddAction(quickInputType, quickInput.trim(), quickDatetime.trim() || undefined);
    setQuickInput("");
    setQuickDatetime("");
  };

  const sampleCommands = [
    { text: "Remember my name is Ayyan", intent: "Memory System", color: "indigo" },
    { text: "Set reminder for study session at 9 PM", intent: "Reminder", color: "emerald" },
    { text: "Take a note about the fullstack architecture", intent: "Note Saving", color: "blue" },
    { text: "What runs on port 3000?", intent: "Information", color: "amber" },
    { text: "Is Ayyan and Nova happy?", intent: "Emotional Tone", color: "pink" },
    { text: "Aalam-o-alaikum, speak in Hinglish design language", intent: "Bilingual Code", color: "violet" },
  ];

  const filteredTasks = actions.filter((a) => a.type === "task");
  const filteredNotes = actions.filter((a) => a.type === "note");
  const filteredReminders = actions.filter((a) => a.type === "reminder");

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-xl flex flex-col h-full overflow-hidden">
      {/* Tabs Header */}
      <div className="flex bg-gray-950/80 p-1.5 border-b border-gray-800/80">
        <button
          id="btn-tab-actions"
          onClick={() => setActiveTab("actions")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "actions"
              ? "bg-gray-900 text-indigo-400 font-semibold border border-gray-800/70 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <CheckSquare className="h-3.5 w-3.5" />
          <span>Active Actions ({actions.length})</span>
        </button>
        <button
          id="btn-tab-blueprints"
          onClick={() => setActiveTab("blueprints")}
          className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs font-bold tracking-wider uppercase transition cursor-pointer ${
            activeTab === "blueprints"
              ? "bg-gray-900 text-indigo-400 font-semibold border border-gray-800/70 shadow-sm"
              : "text-gray-400 hover:text-gray-200"
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Test Blueprints</span>
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
        {activeTab === "actions" ? (
          <div className="flex-1 flex flex-col justify-between space-y-4">
            
            {/* Visual Action Lists */}
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[200px] pr-1">
              {actions.length > 0 ? (
                <div className="space-y-1.5">
                  {actions.map((action) => {
                    return (
                      <div
                        key={action.id}
                        onClick={() => onToggleAction(action.id)}
                        className={`flex items-start space-x-3 p-3 rounded-xl border transition cursor-pointer ${
                          action.completed
                            ? "bg-gray-950/30 border-gray-900 text-gray-500 line-through"
                            : "bg-gray-950/80 border-gray-800/60 hover:bg-gray-950 hover:border-indigo-900/40 text-gray-200"
                        }`}
                      >
                        <button
                          id={`toggle-item-${action.id}`}
                          className="mt-0.5 rounded-md focus:outline-hidden text-gray-400"
                        >
                          {action.completed ? (
                            <CheckCircle className="h-4 w-4 text-emerald-500 fill-emerald-950/20" />
                          ) : (
                            <Square className="h-4 w-4 border-gray-700 text-gray-500 hover:text-indigo-400" />
                          )}
                        </button>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium font-sans leading-tight">
                            {action.content}
                          </p>
                          <div className="flex items-center space-x-2.5 mt-1.5 font-mono text-[9px] text-gray-500">
                            <span className="uppercase tracking-widest font-bold px-1 rounded-sm bg-gray-900 border border-gray-800 text-[8px] text-indigo-400">
                              {action.type}
                            </span>
                            {action.datetime && (
                              <span className="flex items-center space-x-1">
                                <Clock className="h-2.5 w-2.5" />
                                <span>{action.datetime}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 bg-gray-950/10 border border-dashed border-gray-800 rounded-xl text-center">
                  <FileText className="h-8 w-8 text-gray-700 mb-1.5" />
                  <span className="text-xs font-mono text-gray-500">Workspace is empty</span>
                  <p className="text-[10px] text-gray-600 max-w-[220px] mt-1 font-sans">
                    Ask your vocal assistant to take reminders, write tasks, or add notes dynamically!
                  </p>
                </div>
              )}
            </div>

            {/* Manual Form Injector */}
            <form onSubmit={handleAdd} className="border-t border-gray-800/60 pt-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-2">
                Quick Action Injector
              </span>
              <div className="flex items-center space-x-1.5 mb-2">
                {(["task", "note", "reminder"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setQuickInputType(type)}
                    className={`px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-md transition border ${
                      quickInputType === type
                        ? "bg-indigo-950/50 text-indigo-400 border-indigo-700/60"
                        : "bg-gray-950 text-gray-400 border-gray-800 hover:text-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Write your ${quickInputType}...`}
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  className="flex-1 p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 font-sans focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-gray-600"
                />
                <input
                  type="text"
                  placeholder="Time/Date (Optional)"
                  value={quickDatetime}
                  onChange={(e) => setQuickDatetime(e.target.value)}
                  className="w-32 p-2.5 rounded-xl bg-gray-950 border border-gray-800 text-xs text-gray-200 font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500 placeholder-gray-700"
                />
                <button
                  id="submit-action-add"
                  type="submit"
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* Blueprints Test Tab */
          <div className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="space-y-2">
              <p className="text-xs text-gray-400 leading-normal font-sans">
                Click any of these pre-configured phrases to automatically trigger conversational intents. The voice assistant will listen, understand emotions, adjust memory registers, or set agenda items.
              </p>
              
              <div className="grid grid-cols-1 gap-2 overflow-y-auto max-h-[220px] pr-1 pt-1">
                {sampleCommands.map((command, idx) => (
                  <button
                    key={idx}
                    id={`simulate-btn-${idx}`}
                    onClick={() => onSimulateCommand(command.text)}
                    className="flex items-center justify-between text-left p-2.5 rounded-xl bg-gray-950 hover:bg-gray-900 border border-gray-850 hover:border-indigo-500/40 text-gray-200 transition text-xs transform hover:scale-[1.01] cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0 mr-3">
                      <span className="text-[9px] font-mono uppercase tracking-wider text-indigo-400 mb-0.5">
                        {command.intent}
                      </span>
                      <span className="font-sans font-medium line-clamp-1 text-gray-300">
                        &ldquo;{command.text}&rdquo;
                      </span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-indigo-950 border border-indigo-900 text-indigo-400">
                      <Play className="h-2.5 w-2.5 fill-indigo-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-950 rounded-xl border border-gray-850/60">
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block mb-1">
                Interactive Wake-Word Flow:
              </span>
              <p className="text-[11px] text-gray-400 font-sans leading-relaxed">
                Unlock continuous detection or say <code className="text-white font-mono bg-gray-900 px-1 py-0.5 rounded border border-gray-800">&ldquo;Hey Nova&rdquo;</code> aloud while running to auto-activate handsfree transcription.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
