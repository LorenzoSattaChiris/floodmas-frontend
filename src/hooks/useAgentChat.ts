// ─── FloodMAS — useAgentChat Hook ────────────────────────────────────
// Manages SSE connection and dispatches events to the agent chat store.

import { useCallback, useEffect, useRef } from 'react';
import { startChat, chatEventStreamUrl } from '../services/api';
import { useAgentChatStore, type AgentEvent } from '../stores/agentChatStore';

export function useAgentChat() {
  const addMessage = useAgentChatStore((s) => s.addMessage);
  const addEvent = useAgentChatStore((s) => s.addEvent);
  const setStreaming = useAgentChatStore((s) => s.setStreaming);
  const setSessionId = useAgentChatStore((s) => s.setSessionId);
  const eventSourceRef = useRef<EventSource | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
    };
  }, []);

  const sendMessage = useCallback(async (message: string) => {
    // Close any existing connection
    eventSourceRef.current?.close();

    // Add user message
    addMessage({
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    });

    setStreaming(true);

    try {
      const { sessionId } = await startChat(message);
      setSessionId(sessionId);

      // Connect to SSE stream
      const es = new EventSource(chatEventStreamUrl(sessionId));
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        if (e.data === '[DONE]') {
          es.close();
          eventSourceRef.current = null;
          setStreaming(false);
          return;
        }

        try {
          const event = JSON.parse(e.data) as AgentEvent;
          addEvent(event);

          // When we get the final response, add it as an agent message
          if (event.type === 'final_response' && event.content) {
            addMessage({
              id: crypto.randomUUID(),
              role: 'agent',
              content: event.content,
              timestamp: event.timestamp ?? new Date().toISOString(),
            });
          }
        } catch {
          // Ignore parse errors on non-JSON lines
        }
      };

      es.onerror = () => {
        es.close();
        eventSourceRef.current = null;
        setStreaming(false);
      };
    } catch (err) {
      setStreaming(false);
      addMessage({
        id: crypto.randomUUID(),
        role: 'agent',
        content: `Error: ${err instanceof Error ? err.message : 'Failed to connect to chat service'}`,
        timestamp: new Date().toISOString(),
      });
    }
  }, [addMessage, addEvent, setStreaming, setSessionId]);

  const disconnect = useCallback(() => {
    eventSourceRef.current?.close();
    eventSourceRef.current = null;
    setStreaming(false);
  }, [setStreaming]);

  return { sendMessage, disconnect };
}
