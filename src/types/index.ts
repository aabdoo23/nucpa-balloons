export type UserRole = 'courier' | 'balloonPrep' | 'admin' | 'accompanier';

export interface BalloonRequestDTO {
  id: string;
  submissionId: number;
  teamId: string;
  teamName: string;
  problemIndex: string;
  balloonColor: string;
  status: 'Pending' | 'ReadyForPickup' | 'PickedUp' | 'Delivered';
  timestamp: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
  roomName: string;
}

export interface BalloonStatusUpdateRequest {
  id: string;
  status: 'Pending' | 'ReadyForPickup' | 'PickedUp' | 'Delivered';
  statusChangedBy?: string;
}

export interface BalloonUpdates {
  Pending: BalloonRequestDTO[];
  ReadyForPickup: BalloonRequestDTO[];
  PickedUp: BalloonRequestDTO[];
  Delivered: BalloonRequestDTO[];
}

export interface AdminSettingsResponse {
  $id: string;
  $values: AdminSettings[];
}

export interface AdminSettings {
  id: string;
  adminUsername: string;
  contestId: string;
  codeforcesApiKey?: string;
  codeforcesApiSecret?: string;
  isEnabled: boolean;
  teams: Team[];
  rooms: Room[];
  problemBalloonMaps: ProblemBalloonMap[];
}

export interface Room {
  id: string;
  name: string;
  capacity?: number;
  isAvailable?: boolean;
  adminSettingsId: string;
}

export interface Team {
  id: string;
  codeforcesHandle: string;
  roomId: string;
  adminSettingsId: string;
}

export interface ProblemBalloonMap {
  id: string;
  adminSettingsId: string;
  problemIndex: string;
  balloonColor: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export enum ToiletRequestStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2
}

export enum ToiletRequestStatusString {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed'
}

export interface ToiletRequestDTO {
  id: string;
  teamId: string;
  teamName: string;
  roomName: string;
  status: string;
  isMale: boolean;
  isUrgent: boolean;
  comment: string;
  timestamp: string;
  statusChangedAt?: string;
  statusChangedBy?: string;
}

export interface ToiletRequestStatusUpdateDTO {
  id: string;
  status: number;
  statusUpdatedBy: string;
  comment: string;
}

export interface ToiletRequestCreateDTO {
  teamId: string;
  isMale: boolean;
  isUrgent: boolean;
  comment: string;
  statusChangedBy: string;
}

export interface ToiletRequestUpdates {
  Pending: ToiletRequestDTO[];
  InProgress: ToiletRequestDTO[];
  Completed: ToiletRequestDTO[];
} 