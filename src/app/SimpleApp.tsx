/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

// Types
import { SessionStatus } from "@/app/types";
import type { RealtimeAgent } from '@openai/agents/realtime';

// Context providers & hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import { createModerationGuardrail } from "@/app/agentConfigs/guardrails";

// Agent configs
import { allAgentSets, defaultAgentSetKey } from "@/app/agentConfigs";
import { generalAICompanyName } from "@/app/agentConfigs/generalAI";

// Components
import SimpleTranscript from "./components/SimpleTranscript";
import { useAudioDevices } from "./hooks/useAudioDevices";
import { FaArrowUp } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
// import QASection from "./components/QASection"; // Remove this line

// Map used by connect logic for scenarios defined via the SDK.
const sdkScenarioMap: Record<string, RealtimeAgent[]> = {
  generalAI: allAgentSets.generalAI,
};

function SimpleApp() {
  const searchParams = useSearchParams()!;

  const {
    addTranscriptMessage,
    addTranscriptBreadcrumb,
  } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<
    RealtimeAgent[] | null
  >(null);
  const [isListening, setIsListening] = useState(false);
  // Initialize customPrompt from localStorage if available
  const [customPrompt, setCustomPrompt] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('customPrompt') || '';
    }
    return '';
  });
  const [showQA, setShowQA] = useState(false);
  // Q&A state
  const [qaPairs, setQaPairs] = useState<{ question: string; answer: string }[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [loadingQA, setLoadingQA] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);

  const handoffTriggeredRef = useRef(false);

  const {
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    interrupt,
    mute,
  } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    onAgentHandoff: (agentName: string) => {
      handoffTriggeredRef.current = true;
      setSelectedAgentName(agentName);
    },
  });

  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isContentProtected, setIsContentProtected] = useState(true);

  // Initialize audio devices hook
  const {
    devices,
    selectedDeviceId,
    setSelectedDeviceId,
    isLoading: isMicLoading,
    error: micError,
    enumerateDevices,
  } = useAudioDevices();

  const sendClientEvent = (eventObj: any, eventNameSuffix = "") => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
  };

  // Initialize agent configuration
  useEffect(() => {
    let finalAgentConfig = searchParams.get("agentConfig");
    if (!finalAgentConfig || !allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set("agentConfig", finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || "";

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  // Handle session updates (only for handoffs, not auto-start)
  useEffect(() => {
    if (
      sessionStatus === "CONNECTED" &&
      selectedAgentConfigSet &&
      selectedAgentName &&
      handoffTriggeredRef.current
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");

    try {
      console.log("Attempting to fetch session token...");
      const tokenResponse = await fetch("/api/session");

      console.log("Token response received:", tokenResponse.status, tokenResponse.statusText);

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error(`Session API error: ${tokenResponse.status}`, errorText);
        logClientEvent({
          status: tokenResponse.status,
          error: errorText
        }, "error.session_api_failed");
        setSessionStatus("DISCONNECTED");
        return null;
      }

      const data = await tokenResponse.json();
      console.log("Session data received:", data);
      logServerEvent(data, "fetch_session_token_response");

      if (!data.client_secret?.value) {
        logClientEvent(data, "error.no_ephemeral_key");
        console.error("No ephemeral key provided by the server");
        setSessionStatus("DISCONNECTED");
        return null;
      }

      return data.client_secret.value;
    } catch (error) {
      console.error("Error fetching ephemeral key:", error);
      logClientEvent({
        error: error instanceof Error ? error.message : String(error)
      }, "error.fetch_ephemeral_key_failed");
      setSessionStatus("DISCONNECTED");
      return null;
    }
  };

  const connectToRealtime = async () => {
    const agentSetKey = searchParams.get("agentConfig") || "default";
    if (sdkScenarioMap[agentSetKey]) {
      if (sessionStatus !== "DISCONNECTED") return;
      setSessionStatus("CONNECTING");

      try {
        const EPHEMERAL_KEY = await fetchEphemeralKey();
        if (!EPHEMERAL_KEY) return;

        // Ensure the selectedAgentName is first so that it becomes the root
        const reorderedAgents = [...sdkScenarioMap[agentSetKey]];
        const idx = reorderedAgents.findIndex((a) => a.name === selectedAgentName);
        if (idx > 0) {
          const [agent] = reorderedAgents.splice(idx, 1);
          reorderedAgents.unshift(agent);
        }

        // If customPrompt is set, override the instructions for the main agent
        if (customPrompt && reorderedAgents.length > 0) {
          reorderedAgents[0] = new (Object.getPrototypeOf(reorderedAgents[0]).constructor)({
            ...reorderedAgents[0],
            instructions: customPrompt,
          });
        }

        const companyName = generalAICompanyName;
        const guardrail = createModerationGuardrail(companyName);

        await connect({
          getEphemeralKey: async () => EPHEMERAL_KEY,
          initialAgents: reorderedAgents,
          audioElement: undefined, // Disable audio output (no playback sound)
          outputGuardrails: [guardrail],
          extraContext: {
            addTranscriptBreadcrumb,
          },
          selectedDeviceId,
        });
      } catch (err) {
        console.error("Error connecting via SDK:", err);
        setSessionStatus("DISCONNECTED");
      }
    }
  };

  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsListening(false);
  };

  const updateSession = (shouldTriggerResponse: boolean = false) => {
    // Configure for continuous listening (not push-to-talk)
    const turnDetection = {
      type: 'server_vad',
      threshold: 0.9,
      prefix_padding_ms: 300,
      silence_duration_ms: 500,
      create_response: true,
    };

    sendEvent({
      type: 'session.update',
      session: {
        turn_detection: turnDetection,
      },
    });

    // Unmute the mic when we start listening
    mute(false);

    // Send an initial 'hi' message to trigger the agent to greet the user
    if (shouldTriggerResponse) {
      sendSimulatedUserMessage('hi');
    }
  };

  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);

    sendClientEvent({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sendClientEvent({ type: 'response.create' }, '(simulated user text message)');
  };

  // Listen button handlers
  const handleStartListening = () => {
    if (sessionStatus === "CONNECTED") {
      setIsListening(true);
      // Unmute mic and enable continuous listening
      mute(false);
      updateSession();
    } else {
      // Auto-connect and start listening
      connectToRealtime().then(() => {
        setIsListening(true);
        updateSession(true);
      });
    }
  };

  const handleStopListening = () => {
    setIsListening(false);
    // Mute the microphone so the session stays alive but no audio is sent
    // This keeps the WebRTC connection intact so we can resume later
    mute(true);
    // Also interrupt any in-progress response
    interrupt();
  };

  const handleToggleContentProtection = () => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const newState = !isContentProtected;
      setIsContentProtected(newState);
      (window as any).electronAPI.toggleContentProtection(newState);
    }
  };

  // Handle microphone device change
  const handleMicrophoneChange = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    // If connected, reconnect with the new device
    if (sessionStatus === "CONNECTED") {
      disconnectFromRealtime();
      // The effect watching selectedAgentName will trigger reconnection
    }
  };

  // Replace setCustomPrompt with a handler that also reconnects if needed and saves to localStorage
  const handleSetCustomPrompt = (prompt: string) => {
    setCustomPrompt(prompt);
    if (typeof window !== 'undefined') {
      localStorage.setItem('customPrompt', prompt);
    }
    // If session is active, disconnect and reconnect to apply new prompt
    if (sessionStatus === "CONNECTED") {
      disconnectFromRealtime();
      setTimeout(() => {
        connectToRealtime();
      }, 300);
    }
  };

  // Q&A submit handler
  const handleQASubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentQuestion.trim()) return;
    setLoadingQA(true);
    const question = currentQuestion.trim();
    setCurrentQuestion("");
    // Show the user's question immediately with empty answer
    setQaPairs((prev) => [...prev, { question, answer: "" }]);
    let answer = "No answer.";
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            {
              role: "user",
              content: question,
            },
          ],
        }),
      });
      const data = await res.json();
      if (data?.output && Array.isArray(data.output) && data.output[0]?.content) {
        const content = data.output[0].content;
        if (typeof content === 'string') {
          answer = content;
        } else if (Array.isArray(content) && content[0]?.text) {
          answer = content[0].text;
        } else if (content && typeof content === 'object' && content.text) {
          answer = content.text;
        }
      } else if (data?.choices && Array.isArray(data.choices) && data.choices[0]?.message?.content) {
        answer = data.choices[0].message.content;
      } else if (data?.answer) {
        answer = typeof data.answer === 'string' ? data.answer : (data.answer.text || 'No answer.');
      }
    } catch (err) {
      answer = "Error getting answer.";
    }
    // Animate the answer word by word
    const words = answer.split(/(\s+)/); // keep spaces
    let i = 0;
    function animate() {
      setQaPairs((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last) {
          last.answer = words.slice(0, i).join("");
        }
        return updated;
      });
      if (i < words.length) {
        i++;
        setTimeout(animate, 60); // 60ms per word
      } else {
        setLoadingQA(false);
      }
    }
    animate();
  };

  // Ref for Q&A chat container
  const qaChatEndRef = useRef<HTMLDivElement | null>(null);

  // Robust scroll to bottom: always scroll after qaPairs changes (question or answer)
  useEffect(() => {
    // Use setTimeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      if (qaChatEndRef.current) {
        qaChatEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 0);
  }, [qaPairs, showQA]);

  // Keyboard shortcut: Ctrl+Shift+Space to toggle Q&A window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === 'Space') {
        setShowQA((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcut: Ctrl+Alt+P to toggle prompt window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyP') {
        setShowPromptModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Keyboard shortcut: Ctrl+Alt+L to toggle listening
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.code === 'KeyL') {
        if (isListening) {
          handleStopListening();
        } else {
          handleStartListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isListening]);

  return (
    <div>
      <SimpleTranscript
        isListening={isListening}
        onStartListening={handleStartListening}
        onStopListening={handleStopListening}
        onToggleContentProtection={handleToggleContentProtection}
        isContentProtected={isContentProtected}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        isMicLoading={isMicLoading}
        micError={micError}
        onMicrophoneChange={handleMicrophoneChange}
        enumerateDevices={enumerateDevices}
        customPrompt={customPrompt}
        setCustomPrompt={handleSetCustomPrompt}
        onShowQASection={() => setShowQA((v) => !v)}
        showQA={showQA}
        qaBox={showQA ? (
          <div
            className="w-full max-w-2xl mb-6 mx-auto rounded-lg shadow-lg animate-subtle-glow flex flex-col justify-between"
            style={{
              background: 'rgba(20,20,20,0.72)',
              border: '1.5px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              minHeight: 340,
              maxHeight: 520,
              height: 'auto',
              position: 'relative',
            }}
          >
            {/* Shortcut display in top right */}
            <div style={{ position: 'absolute', top: 12, right: 20 }}>
              <span className="text-xs text-white/60 bg-black/40 px-2 py-1 rounded font-mono select-none" title="Keyboard shortcut to open/close Q&A">
                Ctrl + Shift + Space
              </span>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pt-6 pb-2 space-y-4 custom-scrollbar pt-16">
              {qaPairs.length === 0 && <div className="text-white/50 text-center">No questions yet.</div>}
              {qaPairs.map((pair, idx) => (
                <div key={idx} className="space-y-2">
                  {/* User bubble */}
                  <div className="flex justify-end">
                    <div className="bg-black/60 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-[80%] shadow-md font-medium">
                      {pair.question}
                    </div>
                  </div>
                  {/* AI bubble */}
                  <div className="flex justify-start">
                    <div
                      className="bg-neutral-800/90 text-gray-100 rounded-2xl rounded-bl-sm px-4 py-2 max-w-[80%] shadow font-normal"
                    >
                      <ReactMarkdown>{pair.answer}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {/* Ref for the last message to scroll to */}
              <div ref={qaChatEndRef} />
            </div>
            {/* Input area at bottom with loading overlay */}
            <div className="relative">
              <form onSubmit={handleQASubmit} className="flex items-center gap-2 px-4 py-3 border-t border-white/10 bg-black/10 rounded-b-lg">
                <input
                  type="text"
                  value={currentQuestion}
                  onChange={e => setCurrentQuestion(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-full px-4 py-2 bg-black/30 text-white border border-white/20 placeholder:text-white/50 shadow-inner transition-all duration-200"
                  disabled={loadingQA}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loadingQA || !currentQuestion.trim()}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-60 shadow"
                  style={{ fontSize: 18 }}
                  aria-label="Send"
                >
                  <FaArrowUp />
                </button>
              </form>
              {/* Loading overlay removed */}
            </div>
          </div>
        ) : null}
        showPromptModal={showPromptModal}
        setShowPromptModal={setShowPromptModal}
      />
      {/* Transcript history always below */}
      {/* The original code had historyItems and currentItem, but they were not defined.
          Assuming they are meant to be part of the SimpleTranscript component or are placeholders.
          For now, removing them as they are not defined in the provided context. */}
    </div>
  );
}

export default SimpleApp; 