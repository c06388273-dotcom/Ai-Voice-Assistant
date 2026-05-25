import React, { useState } from "react";
import { Brain, Trash2, Edit2, Check, Plus, HelpCircle } from "lucide-react";
import { MemoryState } from "../types";

interface MemoryPanelProps {
  memory: MemoryState;
  onUpdateMemory: (newMemory: MemoryState) => void;
  onClearMemory: () => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memory,
  onUpdateMemory,
  onClearMemory,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempMemoryText, setTempMemoryText] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const handleStartEditing = () => {
    setTempMemoryText(JSON.stringify(memory, null, 2));
    setIsEditing(true);
  };

  const handleSaveRaw = () => {
    try {
      const parsed = JSON.parse(tempMemoryText);
      onUpdateMemory(parsed);
      setIsEditing(false);
    } catch (e) {
      alert("Invalid JSON format. Please check the structure and try again.");
    }
  };

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;

    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    
    // Support parsing comma-separated topics
    let parsedValue: any = newValue;
    if (key === "favorite_topics") {
      parsedValue = newValue.split(",").map((t) => t.trim()).filter(Boolean);
    }

    const updated = {
      ...memory,
      [key]: parsedValue,
    };

    onUpdateMemory(updated);
    setNewKey("");
    setNewValue("");
  };

  const handleDeleteItem = (keyToDelete: string) => {
    const updated = { ...memory };
    delete updated[keyToDelete];
    onUpdateMemory(updated);
  };

  const hasMemory = Object.keys(memory).length > 0;

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl relative overflow-hidden flex flex-col h-full">
      {/* Dynamic Wave Aura Header */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <Brain className="h-5 w-5 text-indigo-400 animate-pulse" />
          <h3 className="text-sm font-bold tracking-wider text-gray-100 uppercase font-sans">
            Cognitive Memory Store
          </h3>
        </div>
        <div className="flex space-x-2">
          <button
            id="btn-edit-memory"
            onClick={isEditing ? handleSaveRaw : handleStartEditing}
            className="p-1 px-2.5 rounded-md text-[11px] font-mono tracking-wider font-semibold bg-gray-950 border border-gray-800 hover:border-indigo-500/50 hover:text-indigo-400 text-gray-400 transition"
          >
            {isEditing ? (
              <span className="flex items-center space-x-1">
                <Check className="h-3 w-3" />
                <span>Save</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <Edit2 className="h-3 w-3" />
                <span>JSON</span>
              </span>
            )}
          </button>
          
          {hasMemory && (
            <button
              id="btn-clear-memory"
              onClick={onClearMemory}
              title="Wipe system memory"
              className="p-1 px-2 rounded-md bg-red-950/40 hover:bg-red-900/40 border border-red-900/50 hover:border-red-500 text-red-400 transition"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
        This is your assistant&apos;s active short-term mental model. When you say your name or talk about your plans, the AI adapts and automatically saves insights here.
      </p>

      {/* Editing State (JSON view) */}
      {isEditing ? (
        <div className="flex-1 flex flex-col space-y-2">
          <textarea
            className="flex-1 w-full p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-emerald-400 font-mono focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 min-h-[140px] resize-none"
            value={tempMemoryText}
            onChange={(e) => setTempMemoryText(e.target.value)}
          />
          <div className="flex justify-end space-x-1.5 pt-1">
            <button
              id="btn-cancel-memory-edit"
              onClick={() => setIsEditing(false)}
              className="px-2.5 py-1 text-xs rounded-md bg-transparent hover:bg-gray-800 border border-transparent text-gray-400 text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              id="btn-confirm-memory-edit"
              onClick={handleSaveRaw}
              className="px-3 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white transition"
            >
              Apply Changes
            </button>
          </div>
        </div>
      ) : (
        /* Regular State (Visual List/Tags) */
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            {hasMemory ? (
              Object.entries(memory).map(([key, value]) => {
                let displayValue = "";
                if (Array.isArray(value)) {
                  displayValue = value.join(", ");
                } else if (typeof value === "object" && value !== null) {
                  displayValue = JSON.stringify(value);
                } else {
                  displayValue = String(value);
                }

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-950/60 border border-gray-800/80 hover:bg-gray-950 transition"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400/95">
                        {key.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs text-gray-200 mt-0.5 truncate font-sans font-medium">
                        {displayValue}
                      </span>
                    </div>
                    <button
                      id={`btn-del-memory-${key}`}
                      onClick={() => handleDeleteItem(key)}
                      className="p-1 rounded-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition"
                    >
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-6 bg-gray-950/20 border border-dashed border-gray-800 rounded-xl text-center">
                <HelpCircle className="h-6 w-6 text-gray-700 mb-1" />
                <span className="text-xs font-mono text-gray-500">
                  Memory Database Empty
                </span>
                <p className="text-[10px] text-gray-600 mt-1 max-w-[200px]">
                  Say: &ldquo;Remember my favorite hobby is hacking&rdquo; to test it!
                </p>
              </div>
            )}
          </div>

          {/* Quick Manual Injector Form */}
          <form onSubmit={handleAddKey} className="border-t border-gray-800/60 pt-3">
            <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500 block mb-2">
              Inject Memory Node
            </span>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Key (e.g. user_name)"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="p-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-gray-200 font-mono placeholder-gray-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                placeholder="Value (e.g. Ayyan)"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                className="p-1.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-gray-200 font-sans placeholder-gray-600 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              id="submit-inject-memory"
              type="submit"
              className="mt-2 w-full flex items-center justify-center space-x-1 text-[11px] font-bold tracking-wide py-1.5 rounded-lg bg-gray-950 hover:bg-gray-800 text-indigo-400 border border-indigo-950 hover:border-indigo-650 transition cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Fact Memory</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
