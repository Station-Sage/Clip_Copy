import * as assert from 'assert';
import { DEFAULT_AGENT_LOOP_MAX_ITERATIONS, AgentLoopPhase, AgentLoopAutoApplyMode } from '../../src/bridge/bridgeProtocol';

suite('bridgeProtocol Phase 7-9 Types', () => {
  test('DEFAULT_AGENT_LOOP_MAX_ITERATIONS is 5', () => {
    assert.strictEqual(DEFAULT_AGENT_LOOP_MAX_ITERATIONS, 5);
  });

  test('AgentLoopPhase type covers all phases', () => {
    const phases: AgentLoopPhase[] = ['analyze', 'request', 'waiting', 'apply', 'verify', 'complete'];
    assert.strictEqual(phases.length, 6);
  });

  test('AgentLoopAutoApplyMode type covers all modes', () => {
    const modes: AgentLoopAutoApplyMode[] = ['preview', 'auto', 'safe'];
    assert.strictEqual(modes.length, 3);
  });
});
