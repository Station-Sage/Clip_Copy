// src/bridge/bridgeProtocol.ts

/** 브라우저 → VS Code 메시지 */
export type BrowserToVSCodeMessage =
  | { type: 'ping' }
  | { type: 'codeBlocks'; blocks: BridgeCodeBlock[]; source: string; msgId?: string }
  | { type: 'ai_response'; payload: string; source: string; msgId?: string }
  | { type: 'send_to_ai'; payload: string }
  | { type: 'ack'; msgId: string }
  | { type: 'getStatus' };

/** VS Code → 브라우저 메시지 */
export type VSCodeToBrowserMessage =
  | { type: 'pong' }
  | { type: 'status'; watching: boolean; port: number }
  | { type: 'applyResult'; applied: number; results: unknown[] }
  | { type: 'clipboardReady'; count: number }
  | { type: 'send_to_ai'; payload: string; msgId?: string; autoSend?: boolean }
  | { type: 'error_context'; payload: string }
  | { type: 'ack'; msgId: string }
  | { type: 'agent_loop_status'; iteration: number; maxIterations: number; status: string };

export interface BridgeCodeBlock {
  language?: string;
  filePath?: string;
  content: string;
}

export const DEFAULT_AGENT_LOOP_MAX_ITERATIONS = 5;

/** Agent Loop phase identifiers */
export type AgentLoopPhase = 'analyze' | 'request' | 'waiting' | 'apply' | 'verify' | 'complete';

/** Agent Loop auto-apply mode */
export type AgentLoopAutoApplyMode = 'preview' | 'auto' | 'safe';
