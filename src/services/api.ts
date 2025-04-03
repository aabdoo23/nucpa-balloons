import axios from 'axios';
import { 
  AdminSettings, 
  ProblemBalloonMap, 
  LoginRequest, 
  BalloonRequestDTO, 
  BalloonStatusUpdateRequest, 
  Room, 
  Team,
  ToiletRequestCreateDTO,
  ToiletRequestDTO,
  ToiletRequestStatusUpdateDTO
} from '../types';
import { API_BASE_URL } from '../config';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (credentials: LoginRequest) => {
  const response = await api.post('/admin/login', credentials);
  return response.data;
};

export const updateAdminSettings = async (settings: Partial<AdminSettings>) => {
  const response = await api.post('/admin/settings/update', settings);
  return response.data.$values ? response.data.$values as AdminSettings : response.data as AdminSettings;
};

export const getProblemBalloonMaps = async () => {
  const response = await api.get('/admin/settings/ProblemBalloonMap/getAll');
  return response.data.$values ? response.data.$values as ProblemBalloonMap[] : response.data as ProblemBalloonMap[];
};

export const createProblemBalloonMap = async (map: Omit<ProblemBalloonMap, 'id'> & { adminSettingsId: string }) => {
  const response = await api.post('/admin/settings/ProblemBalloonMap/create', map);
  return response.data.$values ? response.data.$values as ProblemBalloonMap : response.data as ProblemBalloonMap;
};

export const updateProblemBalloonMap = async (map: ProblemBalloonMap) => {
  const response = await api.post('/admin/settings/ProblemBalloonMap/update', map);
  return response.data.$values ? response.data.$values as ProblemBalloonMap : response.data as ProblemBalloonMap;
};

export const deleteProblemBalloonMap = async (id: string) => {
  await api.post('/admin/settings/ProblemBalloonMap/delete', null, {
    params: { id }
  });
};

export const getPendingBalloons = async () => {
  const response = await api.get('/balloon/pending');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getPickedUpBalloons = async () => {
  const response = await api.get('/balloon/picked-up');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getDeliveredBalloons = async () => {
  const response = await api.get('/balloon/delivered');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getReadyForPickupBalloons = async () => {
  const response = await api.get('/balloon/ready-for-pickup');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const updateBalloonStatus = async (id: string, request: BalloonStatusUpdateRequest) => {
  const response = await api.put('/balloon/status', {
    id,
    status: request.status === 'Pending' ? 0 : 
            request.status === 'ReadyForPickup' ? 1 :
            request.status === 'PickedUp' ? 2 : 3,
    deliveredBy: request.statusChangedBy
  });
  return response.data as BalloonRequestDTO;
};

export const getAllAdminSettings = async () => {
  const response = await api.get('/admin/settings/getAll');
  const data = response.data.$values ? response.data.$values : response.data;
  
  // Ensure we're working with an array
  const settingsArray = Array.isArray(data) ? data : [data];
  
  // Process each settings object
  const processedSettings = settingsArray.map((settings: any) => ({
    ...settings,
    teams: Array.isArray(settings.teams?.$values) ? settings.teams.$values : 
           Array.isArray(settings.teams) ? settings.teams : [],
    rooms: Array.isArray(settings.rooms?.$values) ? settings.rooms.$values : 
           Array.isArray(settings.rooms) ? settings.rooms : [],
    problemBalloonMaps: Array.isArray(settings.problemBalloonMaps?.$values) ? settings.problemBalloonMaps.$values : 
                       Array.isArray(settings.problemBalloonMaps) ? settings.problemBalloonMaps : []
  }));

  return processedSettings;
};

export const getActiveAdminSettings = async () => {
  const response = await api.get('/admin/settings/getActive');
  const data = response.data;
  return {
    ...data,
    teams: Array.isArray(data.teams?.$values) ? data.teams.$values : [],
    rooms: Array.isArray(data.rooms?.$values) ? data.rooms.$values : [],
    problemBalloonMaps: Array.isArray(data.problemBalloonMaps?.$values) ? data.problemBalloonMaps.$values : []
  } as AdminSettings;
};

export const createAdminSettings = async (settings: Omit<AdminSettings, 'id'>) => {
  const response = await api.post('/admin/settings/create', settings);
  return response.data as AdminSettings;
};

export const setActiveAdminSettings = async (id: string) => {
  await api.post('/admin/settings/enable', null, {
    params: { id }
  });
};

export const getAllRooms = async () => {
  const response = await api.get('/admin/settings/room/getAll');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const createRoom = async (room: Omit<Room, 'id'>): Promise<Room> => {
  const response = await api.post('/admin/settings/room/create', room);
  return response.data;
};

export const updateRoom = async (room: Room): Promise<Room> => {
  const response = await api.put('/admin/settings/room/update', room);
  return response.data;
};

// export const deleteRoom = async (roomId: string): Promise<void> => {
//   await api.delete('/admin/settings/room/delete', {
//     params: { RoomId: roomId }
//   });
// };

export const createTeam = async (team: { id: string; codeforcesHandle: string; roomId: string }) => {
  const response = await api.post('/admin/settings/team/createTeam', team);
  return response.data as Team;
};

export const deleteTeam = async (teamId: string) => {
  await api.post('/admin/settings/team/deleteTeam', null, {
    params: { teamId }
  });
};

export const updateTeamRoom = async (teamId: string, roomId: string) => {
  const response = await api.post('/admin/settings/team/updateTeamRoom', null, {
    params: { teamId, roomId }
  });
  return response.data as Team;
};

export const getTeamById = async (teamId: string) => {
  const response = await api.get('/admin/settings/team/getById', {
    params: { teamId }
  });
  return response.data as Team;
};

export const getAllToiletRequests = async () => {
  const response = await api.get('/toiletRequest/all');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getPendingToiletRequests = async () => {
  const response = await api.get('/toiletRequest/pending');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getInProgressToiletRequests = async () => {
  const response = await api.get('/toiletRequest/in-progress');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const getCompletedToiletRequests = async () => {
  const response = await api.get('/toiletRequest/completed');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
};

export const createToiletRequest = async (request: ToiletRequestCreateDTO): Promise<ToiletRequestDTO> => {
  const response = await api.post('/toiletRequest', request);
  return response.data;
};

export const updateToiletRequestStatus = async (request: ToiletRequestStatusUpdateDTO): Promise<ToiletRequestDTO> => {
  const response = await api.put('/toiletRequest/status', request);
  return response.data;
};

export const deleteToiletRequest = async (id: string): Promise<void> => {
  await api.delete(`/toiletRequest/${id}`);
};

export const getAllTeams = async () => {
  const response = await api.get('/admin/settings/team/getAll');
  return Array.isArray(response.data.$values) ? response.data.$values : response.data;
}; 