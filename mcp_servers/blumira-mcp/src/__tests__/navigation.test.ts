import { describe, it, expect } from 'vitest';
import { getState, getNavigationTools, getBackTool, DOMAINS } from '../domains/navigation.js';

describe('Navigation', () => {
  it('should return null domain initially', () => {
    const state = getState('test-1');
    expect(state.currentDomain).toBeNull();
  });

  it('should track domain state', () => {
    const state = getState('test-2');
    state.currentDomain = 'findings';
    expect(getState('test-2').currentDomain).toBe('findings');
  });

  it('should isolate sessions', () => {
    const s1 = getState('test-3');
    const s2 = getState('test-4');
    s1.currentDomain = 'agents';
    expect(s2.currentDomain).toBeNull();
  });

  it('should have all domains', () => {
    expect(DOMAINS).toContain('findings');
    expect(DOMAINS).toContain('agents');
    expect(DOMAINS).toContain('users');
    expect(DOMAINS).toContain('msp');
    expect(DOMAINS).toContain('resolutions');
  });

  it('should return navigation tools', () => {
    const tools = getNavigationTools();
    expect(tools).toHaveLength(2);
    expect(tools[0].name).toBe('blumira_navigate');
    expect(tools[1].name).toBe('blumira_status');
  });

  it('should return back tool', () => {
    const tool = getBackTool();
    expect(tool.name).toBe('blumira_back');
  });

  it('should list correct domain descriptions in navigate tool', () => {
    const tools = getNavigationTools();
    const nav = tools[0];
    expect(nav.description).toContain('findings');
    expect(nav.description).toContain('agents');
    expect(nav.description).toContain('msp');
    expect(nav.description).toContain('resolutions');
  });
});
