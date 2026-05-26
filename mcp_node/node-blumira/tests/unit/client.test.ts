import { describe, it, expect } from 'vitest';
import { BlumiraClient } from '../../src/index.js';

const client = new BlumiraClient({ jwtToken: 'test-jwt-token' });

describe('BlumiraClient', () => {
  describe('health', () => {
    it('should check API health', async () => {
      const res = await client.health.check();
      expect(res.status).toBe('OK');
      expect(res.data.api_name).toBe('Blumira Public API');
    });
  });

  describe('findings', () => {
    it('should list findings', async () => {
      const res = await client.findings.list();
      expect(res.status).toBe('OK');
      expect(res.data).toHaveLength(1);
      expect(res.data[0].name).toBe('Active Directory Domain Admin Created');
    });

    it('should get a finding by ID', async () => {
      const res = await client.findings.get('aaa-111');
      expect(res.status).toBe('OK');
      expect(res.data.finding_id).toBe('aaa-111');
    });

    it('should list comments', async () => {
      const comments = await client.findings.listComments('aaa-111');
      expect(comments).toHaveLength(1);
      expect(comments[0].body).toContain('Investigation');
    });

    it('should resolve a finding', async () => {
      const res = await client.findings.resolve('aaa-111', { resolution: 10 });
      expect(res).toBeDefined();
    });

    it('should assign owners', async () => {
      const res = await client.findings.assignOwners('aaa-111', {
        owner_type: 'responder',
        owners: ['user-001'],
      });
      expect(res).toBeDefined();
    });

    it('should add a comment', async () => {
      const comment = await client.findings.addComment('aaa-111', {
        body: '<p>New comment</p>',
        sender: 'user-001',
      });
      expect(comment.id).toBe('comm-002');
    });
  });

  describe('agents', () => {
    it('should list devices', async () => {
      const res = await client.agents.listDevices();
      expect(res.data).toHaveLength(1);
      expect(res.data[0].hostname).toBe('ws001');
    });

    it('should list keys', async () => {
      const res = await client.agents.listKeys();
      expect(res.data).toHaveLength(1);
      expect(res.data[0].key_id).toBe('key-001');
    });
  });

  describe('users', () => {
    it('should list users', async () => {
      const res = await client.users.list();
      expect(res.data).toHaveLength(1);
      expect(res.data[0].email).toBe('user@example.com');
    });
  });

  describe('resolutions', () => {
    it('should list resolutions', async () => {
      const resolutions = await client.resolutions.list();
      expect(resolutions).toHaveLength(4);
      expect(resolutions[0].name).toBe('Valid');
    });
  });

  describe('msp', () => {
    it('should list MSP accounts', async () => {
      const res = await client.msp.listAccounts();
      expect(res.data).toHaveLength(2);
      expect(res.data[0].name).toBe('Client Alpha');
    });

    it('should get MSP account detail', async () => {
      const res = await client.msp.getAccount('acct-001');
      expect(res.data.license).toBe('PRO');
    });

    it('should list all MSP findings', async () => {
      const res = await client.msp.listAllFindings();
      expect(res.data).toHaveLength(1);
    });
  });
});
