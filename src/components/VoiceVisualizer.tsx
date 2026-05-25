import React from "react";
import { Mic, Sparkles, Volume2, Moon, Activity } from "lucide-react";
import { AssistantState, Persona } from "../types";

interface VoiceVisualizerProps {
  state: AssistantState;
  persona: Persona;
  onCircleClick: () => void;
  transcript: string;
}

export const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  state,
  persona,
  onCircleClick,
  transcript,
}) => {
  // Determine state styling and ring animations
  const getStateColor = () => {
    switch (state) {
      case "listening":
        return "bg-red-500 shadow-[0_0_35px_rgba(239,68,68,0.6)]";
      case "processing":
        return "bg-amber-500 shadow-[0_0_35px_rgba(245,158,11,0.6)]";
      case "speaking":
        return "bg-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.6)]";
      default:
        return `${persona.color} shadow-[0_0_30px_rgba(99,102,241,0.4)]`;
    }
  };

  const getRingClassName = (index: number) => {
    let animationClass = "";
    if (state === "listening") {
      animationClass = index === 1 ? "animate-ping speed-slow opacity-45" : "animate-ping speed-normal opacity-25";
    } else if (state === "processing") {
      animationClass = index === 1 ? "animate-spin speed-slow" : "animate-pulse";
    } else if (state === "speaking") {
      animationClass = index === 1 ? "animate-pulse scale-110" : "animate-ping speed-slow opacity-15";
    } else {
      // dormant
      animationClass = index === 1 ? "animate-pulse" : "";
    }
    return `absolute inset-0 rounded-full border-2 border-dashed opacity-30 ${animationClass}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 bg-gray-900 border border-gray-800 rounded-2xl shadow-xl overflow-hidden relative min-h-[300px]">
      {/* Background Ambience Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Voice Status Indicator Badge */}
      <div className="absolute top-4 right-4 flex items-center space-x-2 bg-gray-950/80 px-3 py-1.5 rounded-full border border-gray-800 shadow-inner">
        <span className={`h-2.5 w-2.5 rounded-full ${
          state === "listening" ? "bg-red-500 animate-pulse" :
          state === "processing" ? "bg-amber-500 animate-bounce" :
          state === "speaking" ? "bg-emerald-500 animate-pulse" :
          "bg-gray-500"
        }`} />
        <span className="text-xs font-mono font-medium uppercase tracking-wider text-gray-400">
          {state}
        </span>
      </div>

      <div className="relative flex items-center justify-center w-52 h-52">
        {/* Expanding Ring 1 */}
        <div 
          className={`${getRingClassName(1)}`}
          style={{ borderColor: state === "dormant" ? "rgb(129,140,248)" : undefined }}
        />
        {/* Expanding Ring 2 */}
        <div 
          className={`${getRingClassName(2)}`}
          style={{ borderColor: state === "dormant" ? "rgb(129,140,248)" : undefined }}
        />

        {/* Orbit Block for Processing */}
        {state === "processing" && (
          <div className="absolute inset-4 rounded-full border border-dotted border-amber-400/40 animate-spin" />
        )}

        {/* Central Core Button */}
        <button
          id="btn-voice-sphere"
          onClick={onCircleClick}
          className={`relative z-10 w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-500 cursor-pointer transform hover:scale-105 active:scale-95 ${getStateColor()}`}
        >
          {/* Internal Glow Glassmorphism Layer */}
          <div className="absolute inset-1.5 rounded-full bg-black/10 backdrop-blur-xs flex items-center justify-center" />
          
          <div className="relative z-10 flex flex-col items-center text-white">
            {state === "dormant" && (
              <>
                <Mic className="h-10 w-10 mb-1 drop-shadow-md text-white/90" />
                <span className="text-xs font-bold tracking-widest uppercase">Tap Mic</span>
              </>
            )}

            {state === "listening" && (
              <>
                <Activity className="h-12 w-12 mb-1 animate-pulse text-white drop-shadow-lg" />
                <span className="text-xs font-bold tracking-wider animate-bounce">Listening</span>
              </>
            )}

            {state === "processing" && (
              <>
                <Sparkles className="h-10 w-10 mb-1 animate-spin text-white drop-shadow-md" />
                <span className="text-xs font-bold tracking-widest uppercase animate-pulse">Thinking</span>
              </>
            )}

            {state === "speaking" && (
              <>
                <Volume2 className="h-10 w-10 mb-1 text-white animate-bounce drop-shadow-md" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/90">Speaking</span>
              </>
            )}
          </div>

          {/* Sound Wave bars on Speak */}
          {state === "speaking" && (
            <div className="absolute bottom-6 flex justify-center space-x-1.5 w-full z-10 px-6">
              <span className="w-1 bg-white rounded-full animate-bounce h-3 duration-100" />
              <span className="w-1 bg-white rounded-full animate-bounce h-5 duration-300" />
              <span className="w-1 bg-white rounded-full animate-bounce h-4 duration-150" />
              <span className="w-1 bg-white rounded-full animate-bounce h-5 duration-200" />
              <span className="w-1 bg-white rounded-full animate-bounce h-3 duration-300" />
            </div>
          )}

          {state === "listening" && (
            <div className="absolute bottom-6 flex justify-center space-x-1 w-full z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40 animate-ping delay-75" />
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-60 animate-ping delay-150" />
              <span className="w-1.5 h-1.5 rounded-full bg-white opacity-40 animate-ping delay-300" />
            </div>
          )}
        </button>
      </div>

      {/* Transcription Overlay Footer wrapper */}
      <div className="w-full mt-6 text-center px-4 max-w-sm h-12 flex items-center justify-center">
        {state === "listening" ? (
          <p className="text-sm font-medium text-red-400 italic font-sans truncate duration-200 animate-pulse">
            {transcript || "Speak now..."}
          </p>
        ) : state === "processing" ? (
          <p className="text-xs font-mono text-amber-400 animate-pulse uppercase tracking-widest">
            Processing Speech Core...
          </p>
        ) : state === "speaking" ? (
          <p className="text-sm text-emerald-400 truncate max-w-xs block select-none mb-1 text-center font-sans">
             Assistant playing verbal audio output...
          </p>
        ) : (
          <p className="text-xs text-gray-500 font-mono tracking-tight text-center select-none">
            Say/Type something or try clicking the mic/chips below!
          </p>
        )}
      </div>

      {/* Companion Mini Avatar Badge */}
      <div className="mt-2 flex items-center space-x-2 bg-gray-950 px-3 py-1 rounded-full border border-gray-800">
        <span className="text-base select-none">{persona.avatarEmoji}</span>
        <span className="text-xs font-medium text-gray-300">{persona.name} Agent Active</span>
      </div>
    </div>
  );
};
