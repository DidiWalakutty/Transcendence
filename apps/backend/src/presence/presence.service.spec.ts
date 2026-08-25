import { describe, expect, it } from 'vitest';

import { PresenceService } from './presence.service';

describe('PresenceService', () => {
  it('reports a user online only once, on their first connection', () => {
    const service = new PresenceService();

    const first = service.connect('user-1');
    expect(first.wasOffline).toBe(true);

    const second = service.connect('user-1');
    expect(second.wasOffline).toBe(false);

    expect(service.getOnlineUserIds(['user-1'])).toEqual(['user-1']);
  });

  it('only reports offline once the last connection for a user closes', () => {
    const service = new PresenceService();
    const first = service.connect('user-1');
    const second = service.connect('user-1');

    expect(service.disconnect('user-1', first.connectionId).becameOffline).toBe(false);
    expect(service.getOnlineUserIds(['user-1'])).toEqual(['user-1']);

    expect(service.disconnect('user-1', second.connectionId).becameOffline).toBe(true);
    expect(service.getOnlineUserIds(['user-1'])).toEqual([]);
  });

  it('ignores disconnects for unknown users or connections', () => {
    const service = new PresenceService();

    expect(service.disconnect('unknown-user', 'unknown-connection').becameOffline).toBe(false);

    const { connectionId } = service.connect('user-1');
    service.disconnect('user-1', connectionId);

    expect(service.disconnect('user-1', connectionId).becameOffline).toBe(false);
  });

  it('filters requested ids down to those currently online', () => {
    const service = new PresenceService();
    service.connect('user-1');

    expect(service.getOnlineUserIds(['user-1', 'user-2'])).toEqual(['user-1']);
  });
});
