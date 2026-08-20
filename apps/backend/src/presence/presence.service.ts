import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PresenceService {
  private readonly connections = new Map<string, Set<string>>();

  connect(userId: string): { connectionId: string; wasOffline: boolean } {
    const connectionId = randomUUID();
    const connections = this.connections.get(userId);

    if (!connections) {
      this.connections.set(userId, new Set([connectionId]));
      return { connectionId, wasOffline: true };
    }

    connections.add(connectionId);
    return { connectionId, wasOffline: false };
  }

  disconnect(userId: string, connectionId: string): { becameOffline: boolean } {
    const connections = this.connections.get(userId);

    if (!connections) {
      return { becameOffline: false };
    }

    connections.delete(connectionId);

    if (connections.size === 0) {
      this.connections.delete(userId);
      return { becameOffline: true };
    }

    return { becameOffline: false };
  }

  getOnlineUserIds(userIds: string[]): string[] {
    return userIds.filter((userId) => this.connections.has(userId));
  }
}
