/* eslint-disable @typescript-eslint/no-unused-vars */
"use-client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { TranscriptItem } from "@/app/types";
import { useTranscript } from "@/app/contexts/TranscriptContext";
import type { AudioDevice } from "../hooks/useAudioDevices";
import { v4 as uuidv4 } from "uuid";
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { FiCamera, FiPlay, FiPause, FiEye, FiEyeOff } from 'react-icons/fi';
import { FiMessageCircle } from 'react-icons/fi';
import { BsMic } from 'react-icons/bs';

// Add type for electronAPI on window
declare global {
  interface Window {
    electronAPI?: {
      captureScreenshot?: () => Promise<string | null>;
      getDesktopSources?: (options: { types: string[] }) => Promise<any[]>;
      getWindowHeight?: () => Promise<number>;
    };
    require?: any;
  }
}

// Enhanced Waveform component with color prop and conditional animation
const Waveform = ({ levels, color, animate }: { levels: number[]; color: string; animate: boolean }) => (
  <div className="flex items-center space-x-0.5">
    {levels.map((height, i) => (
      <div
        key={i}
        className={`w-0.5 rounded-full${animate ? ' animate-fluid-wave' : ''}`}
        style={{
          height: animate ? `${height}px` : '8px',
          background: color,
          animationDelay: animate ? `${i * 0.08}s` : undefined,
          animationDuration: animate ? '1.2s' : undefined,
          animationTimingFunction: animate ? 'cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
        }}
      />
    ))}
  </div>
);

// Enhanced Eye Icon with morphing animation
const EyeIcon = ({ isProtected }: { isProtected: boolean }) => {
  return (
    <div className="relative w-6 h-6 group">
      <svg 
        className={`w-6 h-6 transition-all duration-500 ease-out ${
          isProtected ? 'text-white' : 'text-red-300'
        } group-hover:scale-110`}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        {isProtected ? (
          <>
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              className="transition-all duration-300"
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              className="transition-all duration-300"
            />
          </>
        ) : (
          <>
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
              className="transition-all duration-300"
            />
          </>
        )}
      </svg>
      
      {/* Enhanced pulsing ring effect */}
      <div 
        className={`absolute inset-0 rounded-full border-2 transition-all duration-500 ease-out ${
          isProtected 
            ? 'border-white/40 animate-glow-pulse' 
            : 'border-red-300/40 animate-glow-pulse'
        }`}
        style={{
          animationDuration: '2.5s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Inner glow effect */}
      <div 
        className={`absolute inset-1 rounded-full transition-all duration-500 ease-out ${
          isProtected 
            ? 'bg-white/5' 
            : 'bg-red-300/5'
        }`}
      />
    </div>
  );
};

// Animated Waveform SVG Icon for Idle State
const AnimatedWaveformIcon = ({ active }: { active: boolean }) => (
  <svg
    className={`w-8 h-8 ${active ? 'text-primary' : 'text-white/90'}`}
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <rect x="4" y={active ? 10 : 13} width="2.5" height={active ? 12 : 6} rx="1.2" className={active ? 'animate-wave-bar' : 'animate-wave-bar-idle'} fill="currentColor" />
    <rect x="9" y={active ? 7 : 14} width="2.5" height={active ? 18 : 4} rx="1.2" className={active ? 'animate-wave-bar-delay1' : 'animate-wave-bar-idle'} fill="currentColor" />
    <rect x="14" y={active ? 5 : 15} width="2.5" height={active ? 22 : 2} rx="1.2" className={active ? 'animate-wave-bar-delay2' : 'animate-wave-bar-idle'} fill="currentColor" />
    <rect x="19" y={active ? 7 : 14} width="2.5" height={active ? 18 : 4} rx="1.2" className={active ? 'animate-wave-bar-delay1' : 'animate-wave-bar-idle'} fill="currentColor" />
    <rect x="24" y={active ? 10 : 13} width="2.5" height={active ? 12 : 6} rx="1.2" className={active ? 'animate-wave-bar' : 'animate-wave-bar-idle'} fill="currentColor" />
  </svg>
);

// Add camera SVG icon
const CameraIcon = () => (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 7h2l2-3h10l2 3h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export interface SimpleTranscriptProps {
  isListening: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
  onToggleContentProtection?: () => void;
  isContentProtected?: boolean;
  devices: AudioDevice[];
  selectedDeviceId: string;
  isMicLoading: boolean;
  micError: string | null;
  onMicrophoneChange: (deviceId: string) => void;
  enumerateDevices: () => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

// Utility to split answer into code and explanation
function splitAnswer(answer: string) {
  const codeBlockMatch = answer.match(/```[a-zA-Z]*\n?([\s\S]*?)```/);
  let code = '';
  let explanation = answer;
  if (codeBlockMatch) {
    code = codeBlockMatch[1].trim();
    explanation = answer.replace(codeBlockMatch[0], '').trim();
  }
  return { code, explanation };
}

function SimpleTranscript({
  isListening,
  onStartListening,
  onStopListening,
  onToggleContentProtection,
  isContentProtected = true,
  devices,
  selectedDeviceId,
  isMicLoading,
  micError,
  onMicrophoneChange,
  enumerateDevices,
  customPrompt,
  setCustomPrompt,
  onShowQASection, // <-- add this prop
  showQA, // new prop
  qaBox, // new prop (JSX)
  showPromptModal,
  setShowPromptModal,
}: SimpleTranscriptProps & { onShowQASection?: () => void; showQA?: boolean; qaBox?: React.ReactNode; showPromptModal?: boolean; setShowPromptModal?: (v: boolean) => void }) {
  const { transcriptItems, addTranscriptMessage, updateTranscriptMessage } = useTranscript();
  const [showHistory, setShowHistory] = useState(false);
  const [qaPairs, setQaPairs] = useState<QAPair[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [micDropdownOpen, setMicDropdownOpen] = useState(false);
  const micDropdownRef = useRef<HTMLDivElement>(null);
  // const [showPromptModal, setShowPromptModal] = useState(false); // Removed
  const [tempPrompt, setTempPrompt] = useState<string>("");
  // Store previous window height for modal restore
  // const prevWindowHeightRef = useRef<number | null>(null); // Removed

  // Waveform state and audio analyser logic
  const [waveformLevels, setWaveformLevels] = useState<number[]>(Array(7).fill(12));
  const [voiceLevel, setVoiceLevel] = useState(0); // 0-1 normalized
  const voiceLevelRef = useRef(0); // for smoothing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isVisionLoading, setIsVisionLoading] = useState(false);

  // When customPrompt changes from parent, update tempPrompt if modal is not open
  React.useEffect(() => {
    if (!showPromptModal) setTempPrompt(customPrompt);
  }, [customPrompt, showPromptModal]);

  useEffect(() => {
    async function setupAnalyser() {
      if (!isListening || !selectedDeviceId) return;
      try {
        // Get mic stream
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: { exact: selectedDeviceId } },
        });
        streamRef.current = stream;
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64; // Low FFT for fast, smooth bars
        analyserRef.current = analyser;
        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const numBars = 7;
        function animate() {
          analyser.getByteFrequencyData(dataArray);
          // Group frequency bins into numBars
          const barSize = Math.floor(dataArray.length / numBars);
          const levels = Array(numBars).fill(0).map((_, i) => {
            const start = i * barSize;
            const end = start + barSize;
            const avg = dataArray.slice(start, end).reduce((a, b) => a + b, 0) / barSize;
            // Map 0-255 to 8-32px
            return 8 + (avg / 255) * 24;
          });
          setWaveformLevels(levels);

          // Calculate average volume (voice level)
          const avgVolume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          // Normalize to 0-1, clamp
          let normLevel = Math.min(1, Math.max(0, avgVolume / 120));
          // Apply minimum threshold
          if (normLevel < 0.08) normLevel = 0;
          // Smoothing (simple moving average)
          const prev = voiceLevelRef.current;
          const smooth = prev * 0.7 + normLevel * 0.3;
          voiceLevelRef.current = smooth;
          setVoiceLevel(smooth);

          animationFrameRef.current = requestAnimationFrame(animate);
        }
        animate();
      } catch (err) {
        // Fallback: animate randomly if mic fails
        function animateRandom() {
          setWaveformLevels(Array(7).fill(0).map(() => Math.random() * 24 + 8));
          setVoiceLevel(Math.random() * 0.3); // random low level
          animationFrameRef.current = requestAnimationFrame(animateRandom);
        }
        animateRandom();
      }
    }
    if (isListening) {
      setupAnalyser();
    }
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (analyserRef.current) analyserRef.current.disconnect();
      if (sourceRef.current) sourceRef.current.disconnect();
      if (audioContextRef.current) audioContextRef.current.close();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      analyserRef.current = null;
      sourceRef.current = null;
      audioContextRef.current = null;
      voiceLevelRef.current = 0;
    };
  }, [isListening, selectedDeviceId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (micDropdownRef.current && !micDropdownRef.current.contains(event.target as Node)) {
        setMicDropdownOpen(false);
      }
    }
    if (micDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [micDropdownOpen]);

  const handleMicSelect = (deviceId: string) => {
    onMicrophoneChange(deviceId);
    setMicDropdownOpen(false);
  };

  const handleMicRefresh = (e: React.MouseEvent) => {
    e.stopPropagation();
    enumerateDevices();
  };

  // Convert transcript items to Q&A pairs
  useEffect(() => {
    const pairs: QAPair[] = [];
    let currentQuestion = "";
    let currentAnswer = "";
    let currentTimestamp = "";

    transcriptItems.forEach((item) => {
      if (item.type === "MESSAGE") {
        if (item.role === "user") {
          // If we have a previous Q&A pair, save it
          if (currentQuestion && currentAnswer) {
            pairs.push({
              id: `qa-${pairs.length}`,
              question: currentQuestion,
              answer: currentAnswer,
              timestamp: currentTimestamp,
            });
          }
          // Start new question
          currentQuestion = item.title || "";
          currentTimestamp = item.timestamp || "";
          currentAnswer = "";
        } else if (item.role === "assistant") {
          // Add to current answer
          currentAnswer += (currentAnswer ? " " : "") + (item.title || "");
        }
      }
    });

    // Add the last Q&A pair if it exists
    if (currentQuestion && currentAnswer) {
      pairs.push({
        id: `qa-${pairs.length}`,
        question: currentQuestion,
        answer: currentAnswer,
        timestamp: currentTimestamp,
      });
    }

    setQaPairs(pairs);
  }, [transcriptItems]);

  const latestQA = qaPairs[qaPairs.length - 1];
  const historyQAs = qaPairs.slice(0, -1).reverse(); // All except latest, reversed

  // Update window height when content changes
  useEffect(() => {
    if (containerRef.current && typeof window !== 'undefined' && (window as any).electronAPI) {
      const height = containerRef.current.scrollHeight;
      // (window as any).electronAPI.updateWindowHeight(height); // Removed
    }
  }, [qaPairs, showHistory, latestQA]);

  // Utility: map voiceLevel (0-1) to a color (green → yellow → red)
  function getVoiceColor(level: number) {
    // 0 = green (120deg), 0.5 = yellow (60deg), 1 = red (0deg)
    const hue = 120 - 120 * Math.min(1, Math.max(0, level));
    return `hsl(${hue}, 95%, 55%)`;
  }
  const voiceColor = getVoiceColor(voiceLevel);

  // Helper: mic button style (matches Eye button)
  const micButtonClass = `
    relative overflow-hidden p-4 text-lg font-semibold transition-all duration-500 ease-out
    bg-white/25 hover:bg-white/35 text-white border border-white/60 rounded-2xl
    backdrop-blur-dynamic shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95
    before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/10 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300
    focus:outline-none focus:ring-2 focus:ring-white/40
  `;

  const morphClass = isListening ? 'animate-morph-shape' : '';

  // Add Vision API helper
  async function sendToVisionAPI(base64Image: string): Promise<string> {
    const response = await fetch('/api/vision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });
    if (!response.ok) throw new Error('Vision API error');
    const data = await response.json();
    return data.answer || 'No answer from Vision API.';
  }

  // Use getDisplayMedia for full desktop capture (enabled by main process handler)
  const handleScreenshot = useCallback(async () => {
    setIsVisionLoading(true);
    const questionId = uuidv4();
    const answerId = uuidv4();
    try {
      // Add placeholder Q&A to transcript
      addTranscriptMessage(questionId, "user", "Analyzing your screen");
      addTranscriptMessage(answerId, "assistant", "Analyzing image…");

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });
      // Draw video to canvas
      const video = document.createElement('video');
      video.srcObject = stream;
      await new Promise((resolve) => (video.onloadedmetadata = resolve));
      video.play();
      await new Promise((resolve) => setTimeout(resolve, 200));
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((t) => t.stop());
      const base64Image = canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
      // Send to Vision API
      const visionAnswer = await sendToVisionAPI(base64Image);
      // Update the placeholder with the real answer
      updateTranscriptMessage(answerId, visionAnswer, false);
    } catch (err) {
      updateTranscriptMessage(answerId, "Vision API failed: " + (err instanceof Error ? err.message : err), false);
      alert('Screenshot or Vision API failed: ' + (err instanceof Error ? err.message : err));
    } finally {
      setIsVisionLoading(false);
    }
  }, [addTranscriptMessage, updateTranscriptMessage]);

  const autoResizeRef = useRef<HTMLTextAreaElement | null>(null);
  const autoResizeTextarea = useCallback(() => {
    const textarea = autoResizeRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
      // Removed window height update logic to prevent shrinking
    }
  }, [showPromptModal]);

  useEffect(() => {
    if (showPromptModal) autoResizeTextarea();
  }, [tempPrompt, showPromptModal, autoResizeTextarea]);

  // Define a shared button class for all three buttons
  const sharedButtonClass = "flex items-center justify-center w-12 h-12 p-0 rounded-full text-white bg-black/40 border border-white/10 hover:bg-white/10 transition-all duration-200 shadow-lg";

  return (
    <div ref={containerRef} className="flex flex-col items-center p-6 pt-3">
      {/* Dynamic Island Button Group - Enhanced */}
      <div
        className="mb-6 flex items-center justify-center w-full max-w-lg min-w-[360px] relative min-h-[54px] px-4"
        style={{
          minHeight: `${54 + voiceLevel * 16}px`,
          paddingTop: `${voiceLevel * 6}px`,
          paddingBottom: `${voiceLevel * 6}px`,
          transition: 'min-height 0.18s cubic-bezier(0.4,0,0.2,1), padding 0.18s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Q&A Button */}
        <div className="relative z-10 flex-shrink-0 group mr-2">
          <button
            className={sharedButtonClass}
            onClick={onShowQASection}
            aria-label="Show Q&A"
            tabIndex={0}
            style={{ overflow: 'visible' }}
          >
            <FiMessageCircle className="w-6 h-6" />
          </button>
        </div>
        {/* Custom Prompt Button */}
        <div className="relative z-10 flex-shrink-0 group mr-2">
          <button
            className={sharedButtonClass}
            onClick={async () => {
              setTempPrompt(customPrompt);
              // Store current window height before opening modal
              if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.getWindowHeight) {
                const height = await window.electronAPI.getWindowHeight();
                // prevWindowHeightRef.current = height; // Removed
              }
              setShowPromptModal?.(true);
            }}
            aria-label="Set custom AI prompt"
            tabIndex={0}
            style={{ overflow: 'visible' }}
          >
            <FaWandMagicSparkles className="w-6 h-6" />
          </button>
        </div>
        {/* Modern Black Glass Dynamic Island container with shimmer */}
        <div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            transition: 'height 0.18s cubic-bezier(0.4,0,0.2,1), background 0.18s cubic-bezier(0.4,0,0.2,1), box-shadow 0.18s cubic-bezier(0.4,0,0.2,1)',
            height: `calc(100% - ${voiceLevel * 0.5}px)`,
            background: 'rgba(20,20,20,0.72)',
            boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
            borderRadius: '24px',
            border: '1.5px solid rgba(255,255,255,0.18)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          }}
        >
          {/* Removed inner border and animated border ring for a single clean outline */}
        </div>
        {/* Mic button */}
        <div className="relative z-10 flex-shrink-0 group" ref={micDropdownRef}>
          <button
            className={sharedButtonClass}
            onClick={() => !isMicLoading && setMicDropdownOpen((v) => !v)}
            disabled={isMicLoading}
            aria-label="Select microphone"
            tabIndex={0}
            style={{ overflow: 'visible' }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            {/* Ripple effect on click */}
            <span className="absolute inset-0 rounded-full pointer-events-none group-active:animate-ripple-mic" />
            {/* Mic icon changed to BsMic */}
            <BsMic className="w-6 h-6 text-white" />
          </button>
          {micDropdownOpen && (
            <div 
              className="absolute left-1/2 -translate-x-1/2 mt-6 w-56 border border-white/20 rounded-2xl shadow-lg z-50 backdrop-blur-xl animate-fade-in"
              style={{
                background: 'rgba(20,20,20,0.85)',
                boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
                border: '1.5px solid rgba(255,255,255,0.18)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-white/30">
                <span className="text-sm text-white/80 tracking-wide font-semibold">Select Microphone</span>
                <button
                  onClick={handleMicRefresh}
                  className="p-1 rounded-full hover:bg-white/10 text-white focus:outline-none"
                  title="Refresh list"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.5 19A9 9 0 0021 12.5M18.5 5A9 9 0 003 11.5" /></svg>
                </button>
              </div>
              {isMicLoading ? (
                <div className="px-4 py-6 text-center text-sm text-white/80">Loading...</div>
              ) : micError ? (
                <div className="px-4 py-6 text-center text-sm text-red-300">{micError}</div>
              ) : devices.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-white/80">No microphones found</div>
              ) : (
                <ul className="max-h-64 overflow-y-auto divide-y divide-white/20">
                  {devices.map((device) => (
                    <li key={device.deviceId}>
                      <button
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors duration-150 rounded-xl
                          ${device.deviceId === selectedDeviceId
                            ? 'bg-white/20 text-white font-semibold'
                            : 'hover:bg-white/10 text-white/90'}
                        `}
                        onClick={() => handleMicSelect(device.deviceId)}
                      >
                        {/* Selected indicator */}
                        {device.deviceId === selectedDeviceId ? (
                          <span className="inline-flex items-center justify-center w-3 h-3">
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          </span>
                        ) : (
                          <span className="inline-block w-3 h-3" />
                        )}
                        <span className="flex-1 truncate text-left">{device.label}</span>
                        {device.deviceId === selectedDeviceId && (
                          <span className="ml-2 w-1.5 h-1.5 rounded-full bg-white inline-block" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* Listen button - enhanced */}
        <div className="relative z-10 flex-1 flex justify-center group">
          <button
            onClick={isListening ? onStopListening : onStartListening}
            className={
              `
              group relative flex items-center justify-center px-8 py-3 text-base font-semibold rounded-full text-white transition-all duration-300 active:scale-97
              `
            }
            style={{
              minWidth: 0,
              minHeight: 64,
              height: 64,
              background: 'transparent',
              boxShadow: '0 2px 16px 0 #0002',
              transform: 'scale(1)',
              transition: 'none',
            }}
            aria-label={isListening ? 'Stop Listening' : 'Start Listening'}
            tabIndex={0}
          >
            {/* Pulsing colored glow when listening */}
            {isListening && (
              <span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  zIndex: 0,
                  boxShadow: `0 0 ${32 + voiceLevel * 48}px ${12 + voiceLevel * 24}px ${voiceColor}55`,
                  opacity: 0.7 + voiceLevel * 0.3,
                  filter: 'blur(2px)',
                  transition: 'box-shadow 0.18s cubic-bezier(0.4,0,0.2,1), opacity 0.18s cubic-bezier(0.4,0,0.2,1)',
                }}
              />
            )}
            {/* Morphing blob background when listening (subtle) */}
            {isListening && (
              null
            )}
            {/* Listening text and waveform */}
            <span className="relative z-10 flex items-center space-x-2">
              {isListening ? (
                <>
                  <Waveform levels={waveformLevels} color={voiceColor} animate={voiceLevel > 0.01} />
                  <span className="relative font-medium text-sm" style={{zIndex: 20}}>
                    {/* Shield background for sharp text */}
                    <span style={{
                      position: 'absolute',
                      inset: 0,
                      zIndex: -1,
                      background: 'rgba(24,24,24,0.10)',
                      borderRadius: 6,
                      pointerEvents: 'none',
                    }} />
                    <span style={{position: 'relative', zIndex: 1}}>Listening...</span>
                  </span>
                </>
              ) : (
                <span className="font-medium text-sm">Listen</span>
              )}
            </span>
          </button>
        </div>
        {/* Camera button - moved to the right of Listen */}
        <div className="relative z-10 flex-shrink-0 group ml-2">
          <button
            className={sharedButtonClass}
            onClick={handleScreenshot}
            aria-label="Send screenshot to Vision"
            tabIndex={0}
            style={{ overflow: 'visible' }}
            disabled={isVisionLoading}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <FiCamera className="w-6 h-6" />
            {isVisionLoading && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
              </span>
            )}
          </button>
        </div>
        {/* Eye button - enhanced */}
        <div className="relative z-10 flex-shrink-0 group ml-4">
          {onToggleContentProtection && (
            <button
              className={sharedButtonClass}
              onClick={onToggleContentProtection}
              aria-label={isContentProtected ? 'Screen capture protection ON' : 'Screen capture protection OFF'}
              tabIndex={0}
              style={{ overflow: 'visible' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
              }}
            >
              {/* Removed status indicator dot */}
              {/* Animated eye icon (blink on hover) */}
              <span className="relative z-10 group-hover:animate-eye-blink">
                {isContentProtected ? <FiEyeOff className="w-6 h-6" /> : <FiEye className="w-6 h-6" />}
              </span>
            </button>
          )}
        </div>
      </div>
      {/* Q&A window rendered immediately after button group */}
      {showQA && qaBox}

      {/* Latest Q&A Summary */}
      {latestQA && (
        <div className="w-full max-w-2xl mb-6">
          <div className="rounded-lg p-6 shadow-lg animate-subtle-glow"
            style={{
              background: 'rgba(20,20,20,0.72)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  <div className="font-semibold text-white">
                    {latestQA.question}
                  </div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-1">
                  {(() => {
                    const { code, explanation } = splitAnswer(latestQA.answer);
                    return (
                      <div className="text-white/90 space-y-4">
                        {explanation && <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{explanation}</div>}
                        {code && (
                          <div>
                            <div className="font-semibold mb-1">Code Solution:</div>
                            <pre className="bg-black/80 text-green-200 rounded p-3 overflow-x-auto max-h-64 custom-scrollbar" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', scrollbarColor: '#444 #222', scrollbarWidth: 'thin' }}><code>{code}</code></pre>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Show History Toggle */}
      {qaPairs.length > 1 && (
        <div className="w-full max-w-2xl mb-4">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full rounded-lg px-4 py-2 text-white font-medium transition-all duration-200"
            style={{
              background: 'rgba(20,20,20,0.72)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            }}
          >
            {showHistory ? 'Hide History' : 'Show History'}
          </button>
        </div>
      )}

      {/* Only this wrapper is scrollable when history is shown */}
      {showHistory && historyQAs.length > 0 && (
        <div className="relative w-full max-w-2xl flex-1 flex flex-col min-h-0">
          <div 
            className="space-y-4 max-h-[800px] overflow-y-scroll scrollbar-hide flex-1"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {historyQAs.map((qa) => (
              <div key={qa.id} className="rounded-lg p-6 shadow-lg animate-subtle-glow"
                style={{
                  background: 'rgba(20,20,20,0.72)',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                }}>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {qa.question}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="flex-1">
                      {(() => {
                        const { code, explanation } = splitAnswer(qa.answer);
                        return (
                          <div className="text-white/90 space-y-4">
                            {explanation && <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{explanation}</div>}
                            {code && (
                              <div>
                                <div className="font-semibold mb-1">Code Solution:</div>
                                <pre className="bg-black/80 text-green-200 rounded p-3 overflow-x-auto max-h-64 custom-scrollbar" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', scrollbarColor: '#444 #222', scrollbarWidth: 'thin' }}><code>{code}</code></pre>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Fade effect at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/30 via-black/15 to-transparent pointer-events-none"></div>
        </div>
      )}

      {/* Custom Prompt Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-transparent" style={{paddingTop: '32px'}}>
          <div
            className="rounded-2xl shadow-lg p-6 w-full max-w-lg relative border border-white/20 animate-subtle-glow animate-fade-in"
            style={{
                background: 'rgba(20,20,20,0.72)',
                color: 'white',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                boxShadow: '0 4px 32px 0 rgba(0,0,0,0.25)',
                borderRadius: 16,
                padding: 24,
            }}
          >
            {/* Shortcut display in top right */}
            <div style={{ position: 'absolute', top: 12, right: 20 }}>
              <span className="text-xs text-white/60 bg-black/40 px-2 py-1 rounded font-mono select-none" title="Keyboard shortcut to open prompt">
                Ctrl + Alt + P
              </span>
            </div>
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-white/80 tracking-wide">Custom AI Instructions</h2>
            </div>
            {/* Only textarea is scrollable */}
            <textarea
              ref={autoResizeRef}
              rows={2}
              className="w-full resize-none border border-white/20 rounded-xl p-3 text-base text-white bg-black/20 focus:outline-none placeholder:text-white/50 shadow-inner transition-all duration-200 textarea-hide-scrollbar"
              value={tempPrompt}
              onChange={e => {
                setTempPrompt(e.target.value);
              }}
              onInput={autoResizeTextarea}
              placeholder="Enter how you want the AI to act (system prompt)..."
              autoFocus
              style={{
                background: 'rgba(30,30,30,0.18)',
                color: 'white',
                border: '1.5px solid rgba(255,255,255,0.18)',
                minHeight: '80px',
                maxHeight: '180px',
                overflowY: 'auto',
              }}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 font-medium border border-white/20 shadow"
                onClick={async () => {
                  setShowPromptModal?.(false);
                  // Restore previous window height
                  // if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.updateWindowHeight && prevWindowHeightRef.current) { // Removed
                  //   window.electronAPI.updateWindowHeight(prevWindowHeightRef.current); // Removed
                  // }
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-black/60 text-white hover:bg-white/10 font-semibold border border-white/20 shadow"
                onClick={async () => {
                  setCustomPrompt(tempPrompt);
                  setShowPromptModal?.(false);
                  // Restore previous window height
                  // if (typeof window !== 'undefined' && window.electronAPI && window.electronAPI.updateWindowHeight && prevWindowHeightRef.current) { // Removed
                  //   window.electronAPI.updateWindowHeight(prevWindowHeightRef.current); // Removed
                  // }
                }}
                disabled={tempPrompt.trim() === customPrompt.trim()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

export default SimpleTranscript; 