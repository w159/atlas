/**
 * Tickets integration tests
 */

import { describe, it, expect } from 'vitest';
import { NinjaOneClient } from '../../src/client.js';
import { NinjaOneNotFoundError } from '../../src/errors.js';

describe('TicketsResource', () => {
  const client = new NinjaOneClient({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    region: 'us',
  });

  describe('list', () => {
    it('should list tickets', async () => {
      const result = await client.tickets.list();

      expect(result.tickets).toHaveLength(2);
      expect(result.totalCount).toBe(2);
    });
  });

  describe('get', () => {
    it('should get a single ticket', async () => {
      const ticket = await client.tickets.get(3001);

      expect(ticket.id).toBe(3001);
      expect(ticket.subject).toBe('Server maintenance request');
    });

    it('should throw NotFoundError for non-existent ticket', async () => {
      await expect(client.tickets.get(999)).rejects.toThrow(NinjaOneNotFoundError);
    });
  });

  describe('create', () => {
    it('should create a ticket', async () => {
      const ticket = await client.tickets.create({
        subject: 'New ticket',
        priority: 'LOW',
        organizationId: 1,
      });

      expect(ticket.id).toBe(3003);
      expect(ticket.subject).toBe('New ticket');
    });
  });

  describe('update', () => {
    it('should update a ticket', async () => {
      const ticket = await client.tickets.update(3001, {
        subject: 'Updated ticket subject',
        status: 'IN_PROGRESS',
      });

      expect(ticket.subject).toBe('Updated ticket subject');
      expect(ticket.status).toBe('IN_PROGRESS');
    });
  });

  describe('delete', () => {
    it('should delete a ticket', async () => {
      await expect(client.tickets.delete(3001)).resolves.toBeUndefined();
    });
  });

  describe('getComments', () => {
    it('should get ticket comments', async () => {
      const comments = await client.tickets.getComments(3001);

      expect(comments).toHaveLength(1);
      expect(comments[0]?.body).toBe('Working on this issue.');
    });
  });

  describe('addComment', () => {
    it('should add a comment to a ticket', async () => {
      const comment = await client.tickets.addComment(3001, {
        body: 'New comment added.',
      });

      expect(comment.id).toBe(4002);
      expect(comment.body).toBe('New comment added.');
    });
  });

  describe('listForms', () => {
    it('should list ticket forms', async () => {
      const forms = await client.tickets.listForms();

      expect(forms).toHaveLength(1);
      expect(forms[0]?.name).toBe('Default Form');
    });
  });
});
