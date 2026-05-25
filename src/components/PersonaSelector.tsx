import React from "react";
import { 
  Users, Volume2, VolumeX, Mic, MicOff, Sliders, Info, ShieldCheck, HelpCircle
} from "lucide-react";
import { Persona, VoiceSettings } from "../types";

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona;
  settings: VoiceSettings;
  onSelectPersona: (p: Persona) => void;
  onUpdateSettings: (s: VoiceSettings) => void;
  speechVoices: SpeechSynthesisVoice[];
}

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({
  personas,
  selectedPersona,
  settings,
  onSelectPersona,
  onUpdateSettings,
  speechVoices,
}) => {

  const handleToggleMute = () => {
    onUpdateSettings({ ...settings, mute: !settings.mute });
  };

  const handleToggleAutoSpeak = () => {
    onUpdateSettings({ ...settings, autoSpeak: !settings.autoSpeak });
  };

  const handleToggleContinuous = () => {
    onUpdateSettings({ ...settings, continuousListening: !settings.continuousListening });
  };

  const handleChangeRate = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, rate: parseFloat(e.target.value) });
  };

  const handleChangePitch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ ...settings, pitch: parseFloat(e.target.value) });
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 shadow-xl flex flex-col h-full justify-between space-y-5">
      
      {/* Selector Grid */}
      <div>
        <div className="flex items-center space-x-2.5 mb-3">
          <Users className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-bold tracking-wider text-gray-100 uppercase font-sans">
            Assistant Persona Profile
          </h3>
        </div>

        <p className="text-xs text-gray-400 mb-4 leading-relaxed font-sans">
          Select your assistant identity. Changing identity dynamically adjusts the system brain prompts and speaking dialect.
        </p>

        <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
          {personas.map((persona) => {
            const isSelected = persona.id === selectedPersona.id;
            return (
              <button
                key={persona.id}
                id={`persona-card-${persona.id}`}
                onClick={() => onSelectPersona(persona)}
                className={`flex flex-col text-left p-3 rounded-xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-slate-950/80 border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/30"
                    : "bg-gray-950/45 border-gray-800 hover:bg-gray-950 hover:border-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-xl select-none">{persona.avatarEmoji}</span>
                  <div>
                    <h4 className="text-xs font-bold text-gray-100 font-sans">
                      {persona.name}
                    </h4>
                    <span className="text-[9px] text-gray-500 uppercase tracking-tight font-mono">
                      {persona.accent}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 line-clamp-2 leading-tight">
                  {persona.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Speech Voice Settings */}
      <div className="border-t border-gray-800 pt-4 space-y-4">
        <div className="flex items-center space-x-2 text-[10px] font-mono uppercase tracking-wider text-gray-500">
          <Sliders className="h-3.5 w-3.5 text-indigo-400" />
          <span>Vocal Synthesizer Tuning</span>
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>Speech Speed:</span>
              <span className="text-indigo-400 font-bold">{settings.rate.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={settings.rate}
              onChange={handleChangeRate}
              className="w-full accent-indigo-500 bg-gray-950 rounded-lg appearance-none h-1 cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>Vocal Pitch:</span>
              <span className="text-indigo-400 font-bold">{settings.pitch.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.1"
              value={settings.pitch}
              onChange={handleChangePitch}
              className="w-full accent-indigo-500 bg-gray-950 rounded-lg appearance-none h-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {/* Mute Button */}
          <button
            id="btn-toggle-mute"
            onClick={handleToggleMute}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
              settings.mute
                ? "bg-red-950/30 border-red-900/40 text-red-400"
                : "bg-gray-950 border-gray-850 text-gray-300 hover:text-white hover:bg-gray-900"
            }`}
          >
            {settings.mute ? <VolumeX className="h-4 w-4 mb-1" /> : <Volume2 className="h-4 w-4 mb-1" />}
            <span className="text-[9px] font-bold tracking-tight uppercase">Mute Audio</span>
          </button>

          {/* Autospeak */}
          <button
            id="btn-toggle-autospeak"
            onClick={handleToggleAutoSpeak}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
              settings.autoSpeak
                ? "bg-indigo-950/40 border-indigo-900/50 text-indigo-400"
                : "bg-gray-950 border-gray-850 text-gray-400 hover:text-white hover:bg-gray-900"
            }`}
          >
            <ShieldCheck className={`h-4 w-4 mb-1 ${settings.autoSpeak ? "text-indigo-400" : "text-gray-500"}`} />
            <span className="text-[9px] font-bold tracking-tight uppercase">Auto Read</span>
          </button>

          {/* Continuous Listening */}
          <button
            id="btn-toggle-continuous"
            onClick={handleToggleContinuous}
            className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition cursor-pointer ${
              settings.continuousListening
                ? "bg-teal-950/40 border-teal-900/50 text-teal-400"
                : "bg-gray-950 border-gray-850 text-gray-400 hover:text-white hover:bg-gray-900"
            }`}
          >
            {settings.continuousListening ? (
              <Mic className="h-4 w-4 mb-1 text-teal-400" />
            ) : (
              <MicOff className="h-4 w-4 mb-1 text-gray-500" />
            )}
            <span className="text-[9px] font-bold tracking-tight uppercase">Continuous</span>
          </button>
        </div>
      </div>
    </div>
  );
};
