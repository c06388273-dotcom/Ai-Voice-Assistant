/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SearchSource {
  title: string;
  url: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  extendedText?: string;
  timestamp: string;
  intent?: string;
  emotion?: string;
  searchSources?: SearchSource[];
}

export interface MemoryState {
  user_name?: string;
  favorite_topics?: string[];
  last_conversation?: string;
  language_preferences?: string;
  [key: string]: any;
}

export interface WorkspaceAction {
  id: string;
  type: "note" | "task" | "reminder";
  content: string;
  datetime?: string;
  completed: boolean;
  createdAt: string;
}

export type AssistantState = "dormant" | "listening" | "processing" | "speaking";

export interface Persona {
  id: string;
  name: string;
  gender: "male" | "female" | "assistant";
  accent: string;
  tagline: string;
  color: string;
  avatarEmoji: string;
  description: string;
  samplePhrase: string;
}

export interface VoiceSettings {
  persona: string;
  rate: number;
  pitch: number;
  mute: boolean;
  autoSpeak: boolean;
  continuousListening: boolean;
}
