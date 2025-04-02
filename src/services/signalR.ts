import { HubConnectionBuilder, HubConnection, HttpTransportType } from '@microsoft/signalr';
import { BalloonRequestDTO, BalloonUpdates } from '../types';
import { API_BASE_URL } from '../config';

interface RawBalloonUpdates {
  pending: BalloonRequestDTO[];
  readyForPickup: BalloonRequestDTO[];
  pickedUp: BalloonRequestDTO[];
  delivered: BalloonRequestDTO[];
}

class SignalRService {
  private connection: HubConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  private normalizeUpdates(updates: RawBalloonUpdates): BalloonUpdates {
    return {
      Pending: updates.pending || [],
      ReadyForPickup: updates.readyForPickup || [],
      PickedUp: updates.pickedUp || [],
      Delivered: updates.delivered || []
    };
  }

  public async startConnection() {
    if (this.connection) {
      console.log('SignalR connection already exists');
      console.log(this.connection);
      return;
    }

    try {
      console.log('Starting SignalR connection...');
      this.connection = new HubConnectionBuilder()
        .withUrl(`${API_BASE_URL}/api/balloonHub`, {
          withCredentials: true,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      this.connection.onreconnecting((error?: Error) => {
        console.log('SignalR reconnecting...', error);
        this.reconnectAttempts++;
      });

      this.connection.onreconnected((connectionId?: string) => {
        console.log('SignalR reconnected with connection ID:', connectionId);
        this.reconnectAttempts = 0;
      });

      this.connection.onclose((error?: Error) => {
        console.log('SignalR connection closed:', error);
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          console.log('Max reconnection attempts reached. Stopping reconnection.');
          this.stopConnection();
        }
      });

      await this.connection.start();
      console.log('SignalR connection started successfully with ID:', this.connection.connectionId);
    } catch (error) {
      console.error('Error starting SignalR connection:', error);
      this.stopConnection();
    }
  }

  public async stopConnection() {
    if (this.connection) {
      try {
        await this.connection.stop();
        this.connection = null;
        this.reconnectAttempts = 0;
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  public onReceiveBalloonUpdates(callback: (updates: BalloonUpdates) => void) {
    if (!this.connection) {
      console.error('Cannot register callback: SignalR connection not established');
      return;
    }

    console.log('Registering ReceiveBalloonUpdates callback...');
    this.connection.on('ReceiveBalloonUpdates', (rawUpdates: any) => {
      console.log('Raw balloon updates received:', rawUpdates);
      
      let updates: RawBalloonUpdates;
      
      // Handle different data formats
      if (rawUpdates.$values) {
        // If we receive a single array of balloons
        const balloons = rawUpdates.$values;
        console.log('Received balloons array:', balloons);
        updates = {
          pending: balloons.filter((b: any) => b.status === 'Pending' || b.status === 0),
          readyForPickup: balloons.filter((b: any) => b.status === 'ReadyForPickup' || b.status === 1),
          pickedUp: balloons.filter((b: any) => b.status === 'PickedUp' || b.status === 2),
          delivered: balloons.filter((b: any) => b.status === 'Delivered' || b.status === 3)
        };
      } else if (Array.isArray(rawUpdates)) {
        // If we receive just an array
        console.log('Received direct array:', rawUpdates);
        updates = {
          pending: rawUpdates.filter((b: any) => b.status === 'Pending' || b.status === 0),
          readyForPickup: rawUpdates.filter((b: any) => b.status === 'ReadyForPickup' || b.status === 1),
          pickedUp: rawUpdates.filter((b: any) => b.status === 'PickedUp' || b.status === 2),
          delivered: rawUpdates.filter((b: any) => b.status === 'Delivered' || b.status === 3)
        };
      } else {
        // If we receive already categorized data
        console.log('Received categorized data:', rawUpdates);
        updates = rawUpdates;
      }

      console.log('Processed updates before normalization:', updates);
      const normalizedUpdates = this.normalizeUpdates(updates);
      console.log('Normalized updates:', normalizedUpdates);
      callback(normalizedUpdates);
    });
    console.log('ReceiveBalloonUpdates callback registered');
  }

  public onBalloonStatusChanged(callback: (updates: BalloonUpdates) => void) {
    if (!this.connection) {
      console.error('Cannot register callback: SignalR connection not established');
      return;
    }

    console.log('Registering BalloonStatusChanged callback...');
    this.connection.on('BalloonStatusChanged', (rawUpdates: RawBalloonUpdates) => {
      console.log('Raw balloon status change received:', rawUpdates);
      const normalizedUpdates = this.normalizeUpdates(rawUpdates);
      console.log('Normalized status updates:', normalizedUpdates);
      callback(normalizedUpdates);
    });
    console.log('BalloonStatusChanged callback registered');
  }

  public offBalloonStatusChanged(callback: (updates: BalloonUpdates) => void) {
    if (!this.connection) {
      console.error('Cannot unregister callback: SignalR connection not established');
      return;
    }

    this.connection.off('BalloonStatusChanged', callback);
    console.log('Unregistered BalloonStatusChanged callback');
  }

  public offReceiveBalloonUpdates(callback: (updates: BalloonUpdates) => void) {
    if (!this.connection) {
      console.error('Cannot unregister callback: SignalR connection not established');
      return;
    }

    this.connection.off('ReceiveBalloonUpdates', callback);
    console.log('Unregistered ReceiveBalloonUpdates callback');
  }

  public isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }
}

export const signalRService = new SignalRService();