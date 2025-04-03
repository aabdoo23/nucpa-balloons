import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Grid,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import {
  getAllAdminSettings,
  getActiveAdminSettings,
  createAdminSettings,
  setActiveAdminSettings,
  updateAdminSettings,
  getAllRooms,
  createRoom,
  // deleteRoom,
  getProblemBalloonMaps,
  createProblemBalloonMap,
  updateProblemBalloonMap,
  deleteProblemBalloonMap,
  createTeam,
  deleteTeam,
  updateTeamRoom,
  updateRoom,
} from '../services/api';
import { AdminSettings, ProblemBalloonMap, Room, Team } from '../types';

interface NewRoom {
  name: string;
  capacity?: number;
  isAvailable?: boolean;
  adminSettingsId: string;
}

export default function AdminSettingsPage() {
  const [allSettings, setAllSettings] = useState<AdminSettings[]>([]);
  const [activeSettings, setActiveSettings] = useState<AdminSettings | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [maps, setMaps] = useState<ProblemBalloonMap[]>([]);
  const [openRoomDialog, setOpenRoomDialog] = useState(false);
  const [openTeamDialog, setOpenTeamDialog] = useState(false);
  const [openMapDialog, setOpenMapDialog] = useState(false);
  const [openSettingsDialog, setOpenSettingsDialog] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMap, setEditingMap] = useState<ProblemBalloonMap | null>(null);
  const [newRoom, setNewRoom] = useState<NewRoom>({
    name: '',
    capacity: undefined,
    isAvailable: true,
    adminSettingsId: '',
  });
  const [newTeam, setNewTeam] = useState<{ id: string; codeforcesHandle: string; roomId: string }>({
    id: '',
    codeforcesHandle: '',
    roomId: '',
  });
  const [newMap, setNewMap] = useState<Omit<ProblemBalloonMap, 'id'> & { adminSettingsId: string }>({
    problemIndex: '',
    balloonColor: '',
    adminSettingsId: '',
  });
  const [newSettings, setNewSettings] = useState<Omit<AdminSettings, 'id'> & { teams?: Team[]; rooms?: Room[]; problemBalloonMaps?: ProblemBalloonMap[] }>({
    adminUsername: '',
    contestId: '',
    codeforcesApiKey: '',
    codeforcesApiSecret: '',
    isEnabled: true,
    teams: [],
    rooms: [],
    problemBalloonMaps: [],
  });
  const [editingSettings, setEditingSettings] = useState<AdminSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, activeData, roomsData, mapsData] = await Promise.all([
        getAllAdminSettings(),
        getActiveAdminSettings(),
        getAllRooms(),
        getProblemBalloonMaps(),
      ]);

      const settingsArray = Array.isArray(settingsData) ? settingsData : [settingsData];
      setAllSettings(settingsArray);

      setActiveSettings(activeData);

      const roomsArray = Array.isArray(roomsData) ? roomsData : [];
      setRooms(roomsArray);

      const mapsArray = Array.isArray(mapsData) ? mapsData : [];
      setMaps(mapsArray);

      if (activeData && Array.isArray(activeData.teams)) {
        setTeams(activeData.teams);
      } else {
        setTeams([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAllSettings([]);
      setActiveSettings(null);
      setRooms([]);
      setMaps([]);
      setTeams([]);
    }
  };

  const handleSettingsChange = (settings: AdminSettings, field: keyof AdminSettings, value: any) => {
    setEditingSettings({
      ...settings,
      [field]: value
    });
  };

  const handleSaveSettings = async (settings: AdminSettings) => {
    try {
      setIsSaving(true);
      await updateAdminSettings(settings);
      await loadData();
      setEditingSettings(null);
    } catch (error) {
      console.error('Error saving settings:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSettingsDialog = () => {
    setNewSettings({
      adminUsername: '',
      contestId: '',
      codeforcesApiKey: '',
      codeforcesApiSecret: '',
      isEnabled: true,
      teams: [],
      rooms: [],
      problemBalloonMaps: [],
    });
    setOpenSettingsDialog(true);
  };

  const handleCloseSettingsDialog = () => {
    setOpenSettingsDialog(false);
    setNewSettings({
      adminUsername: '',
      contestId: '',
      codeforcesApiKey: '',
      codeforcesApiSecret: '',
      isEnabled: true,
      teams: [],
      rooms: [],
      problemBalloonMaps: [],
    });
  };

  const handleCreateSettings = async () => {
    try {
      await createAdminSettings(newSettings);
      handleCloseSettingsDialog();
      await loadData();
    } catch (error) {
      console.error('Error creating settings:', error);
    }
  };

  const handleSetActive = async (id: string) => {
    try {
      await setActiveAdminSettings(id);
      await loadData();
    } catch (error) {
      console.error('Error setting active settings:', error);
    }
  };

  const handleOpenRoomDialog = (room?: Room) => {
    if (room) {
      setEditingRoom(room);
      setNewRoom({
        name: room.name,
        capacity: room.capacity,
        isAvailable: room.isAvailable,
        adminSettingsId: room.adminSettingsId,
      });
    } else {
      setEditingRoom(null);
      setNewRoom({
        name: '',
        capacity: undefined,
        isAvailable: true,
        adminSettingsId: '',
      });
    }
    setOpenRoomDialog(true);
  };

  const handleCloseRoomDialog = () => {
    setOpenRoomDialog(false);
    setEditingRoom(null);
    setNewRoom({
      name: '',
      capacity: undefined,
      isAvailable: true,
      adminSettingsId: '',
    });
  };

  const handleAddRoom = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await createRoom({
        ...newRoom,
        adminSettingsId: activeSettings?.id || '',
      });
      setNewRoom({
        name: '',
        capacity: undefined,
        isAvailable: true,
        adminSettingsId: activeSettings?.id || '',
      });
      await loadData();
    } catch (error) {
      console.error('Failed to create room:', error);
      // Handle error appropriately
    }
  };

  const handleOpenTeamDialog = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setNewTeam({
        id: team.id,
        codeforcesHandle: team.codeforcesHandle,
        roomId: team.roomId,
      });
    } else {
      setEditingTeam(null);
      setNewTeam({
        id: '',
        codeforcesHandle: '',
        roomId: '',
      });
    }
    setOpenTeamDialog(true);
  };

  const handleCloseTeamDialog = () => {
    setOpenTeamDialog(false);
    setEditingTeam(null);
    setNewTeam({
      id: '',
      codeforcesHandle: '',
      roomId: '',
    });
  };

  const handleSaveTeam = async () => {
    try {
      if (editingTeam) {
        await updateTeamRoom(editingTeam.id, newTeam.roomId);
      } else {
        await createTeam(newTeam);
      }
      await loadData();
      handleCloseTeamDialog();
    } catch (error) {
      console.error('Error saving team:', error);
    }
  };

  const handleDeleteTeam = async (id: string) => {
    try {
      await deleteTeam(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting team:', error);
    }
  };

  const handleOpenMapDialog = (map?: ProblemBalloonMap) => {
    if (map) {
      setEditingMap(map);
      setNewMap({
        problemIndex: map.problemIndex,
        balloonColor: map.balloonColor,
        adminSettingsId: map.adminSettingsId,
      });
    } else {
      setEditingMap(null);
      setNewMap({
        problemIndex: '',
        balloonColor: '',
        adminSettingsId: activeSettings?.id || '',
      });
    }
    setOpenMapDialog(true);
  };

  const handleCloseMapDialog = () => {
    setOpenMapDialog(false);
    setEditingMap(null);
    setNewMap({
      problemIndex: '',
      balloonColor: '',
      adminSettingsId: activeSettings?.id || '',
    });
  };

  const handleSaveMap = async () => {
    try {
      if (editingMap) {
        await updateProblemBalloonMap({ ...newMap, id: editingMap.id });
      } else {
        await createProblemBalloonMap(newMap);
      }
      await loadData();
      handleCloseMapDialog();
    } catch (error) {
      console.error('Error saving map:', error);
    }
  };

  const handleDeleteMap = async (id: string) => {
    try {
      await deleteProblemBalloonMap(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting map:', error);
    }
  };

  const handleUpdateRoom = async (room: Room) => {
    try {
      await updateRoom(room);
      await loadData();
    } catch (error) {
      console.error('Failed to update room:', error);
    }
  };

  // const handleDeleteRoom = async (roomId: string) => {
  //   try {
  //     await deleteRoom(roomId);
  //     await loadData();
  //   } catch (error) {
  //     console.error('Failed to delete room:', error);
  //   }
  // };

  const renderSettingsForm = (settings: AdminSettings) => {
    if (!settings) {
      return (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            No Active Settings
          </Typography>
          <Typography color="text.secondary">
            Please create or select settings to manage.
          </Typography>
        </Paper>
      );
    }

    const isEditing = editingSettings?.id === settings.id;
    const currentSettings = isEditing ? editingSettings : settings;

    return (
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Basic Settings
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Admin Username"
              value={currentSettings.adminUsername || ''}
              onChange={(e) => handleSettingsChange(currentSettings, 'adminUsername', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contest ID"
              value={currentSettings.contestId || ''}
              onChange={(e) => handleSettingsChange(currentSettings, 'contestId', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Codeforces API Key"
              value={currentSettings.codeforcesApiKey || ''}
              onChange={(e) => handleSettingsChange(currentSettings, 'codeforcesApiKey', e.target.value)}
              disabled={!isEditing}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Codeforces API Secret"
              value={currentSettings.codeforcesApiSecret || ''}
              onChange={(e) => handleSettingsChange(currentSettings, 'codeforcesApiSecret', e.target.value)}
              disabled={!isEditing}
              type="password"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={currentSettings.isEnabled || false}
                  onChange={(e) => handleSettingsChange(currentSettings, 'isEnabled', e.target.checked)}
                  disabled={!isEditing}
                />
              }
              label="Enable System"
            />
          </Grid>
          {isEditing && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => setEditingSettings(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleSaveSettings(currentSettings)}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    );
  };

  const renderRoomsSection = () => (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Rooms</Typography>
        <Button
          variant="contained"
          onClick={() => handleOpenRoomDialog()}
          startIcon={<AddIcon />}
        >
          Add Room
        </Button>
      </Box>
      <List>
        {rooms.map((room) => (
          <ListItem
            key={room.id}
            secondaryAction={
              <Box>
                <IconButton 
                  edge="end" 
                  aria-label="edit"
                  onClick={() => handleUpdateRoom(room)}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={`Room ${room.name}`}
              secondary={
                <>
                  {room.id && `Id: ${room.id} - `}
                  {room.capacity && `Capacity: ${room.capacity}`}
                  {room.isAvailable !== undefined && 
                    ` • ${room.isAvailable ? 'Available' : 'Not Available'}`}
                </>
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Settings
      </Typography>

      {/* All Settings List */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">All Settings</Typography>
          <Button
            variant="contained"
            onClick={handleOpenSettingsDialog}
            startIcon={<AddIcon />}
          >
            Add New Settings
          </Button>
        </Box>
        <List>
          {allSettings.map((settings) => (
            <ListItem
              key={settings.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: settings.id === activeSettings?.id ? 'action.selected' : 'background.paper',
              }}
            >
              <ListItemText
                primary={`Contest: ${settings.contestId}`}
                secondary={`Admin: ${settings.adminUsername}`}
              />
              <Box sx={{ display: 'flex', gap: 1 }}>
                {settings.id === activeSettings?.id && (
                  <Chip label="Active" color="primary" size="small" />
                )}
                {settings.id !== activeSettings?.id && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSetActive(settings.id)}
                  >
                    Set Active
                  </Button>
                )}
                <IconButton
                  size="small"
                  onClick={() => setEditingSettings(settings)}
                  color={editingSettings?.id === settings.id ? 'primary' : 'default'}
                >
                  <EditIcon />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Active Settings Section */}
      {activeSettings && (
        <>
          <Typography variant="h5" gutterBottom>
            Active Settings
          </Typography>
          {renderSettingsForm(activeSettings)}

          {/* Rooms Section */}
          {renderRoomsSection()}

          {/* Teams Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Teams</Typography>
              <Button variant="contained" onClick={() => handleOpenTeamDialog()}>
                Add New Team
              </Button>
            </Box>
            <List>
              {teams.map((team) => {
                const teamRoom = rooms.find(room => room.id === team.roomId);
                return (
                  <ListItem key={team.id}>
                    <ListItemText
                      primary={team.codeforcesHandle}
                      secondary={`Room: ${teamRoom?.name || 'No Room Assigned'}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenTeamDialog(team)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </Paper>

          {/* Problem-Balloon Mapping Section */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h5">Problem-Balloon Mapping</Typography>
              <Button variant="contained" onClick={() => handleOpenMapDialog()}>
                Add New Mapping
              </Button>
            </Box>
            <List>
              {maps.map((map) => (
                <ListItem 
                  key={map.id}
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: map.balloonColor,
                        border: '1px solid',
                        borderColor: 'divider',
                        mr: 2,
                      }}
                    />
                    <ListItemText
                      primary={`Problem ${map.problemIndex}`}
                      secondary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Balloon Color:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: map.balloonColor,
                              fontWeight: 'bold',
                              textTransform: 'capitalize',
                            }}
                          >
                            {map.balloonColor}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleOpenMapDialog(map)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        onClick={() => handleDeleteMap(map.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </>
      )}

      {/* Room Dialog */}
      <Dialog open={openRoomDialog} onClose={handleCloseRoomDialog}>
        <DialogTitle>
          {editingRoom ? 'Edit Room' : 'Add Room'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleAddRoom} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Room Name"
              value={newRoom.name}
              onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="number"
              label="Capacity"
              value={newRoom.capacity || ''}
              onChange={(e) => setNewRoom({ ...newRoom, capacity: parseInt(e.target.value) || undefined })}
              sx={{ mb: 2 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRoom.isAvailable}
                  onChange={(e) => setNewRoom({ ...newRoom, isAvailable: e.target.checked })}
                />
              }
              label="Available"
              sx={{ mb: 2 }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
            >
              Add Room
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRoomDialog}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={openTeamDialog} onClose={handleCloseTeamDialog}>
        <DialogTitle>
          {editingTeam ? 'Edit Team' : 'Add New Team'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Team ID"
            value={newTeam.id}
            onChange={(e) => setNewTeam({ ...newTeam, id: e.target.value })}
            margin="normal"
            required
            disabled={!!editingTeam}
          />
          <TextField
            fullWidth
            label="Codeforces Handle"
            value={newTeam.codeforcesHandle}
            onChange={(e) => setNewTeam({ ...newTeam, codeforcesHandle: e.target.value })}
            margin="normal"
            required
            disabled={!!editingTeam}
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Room</InputLabel>
            <Select
              value={newTeam.roomId}
              label="Room"
              onChange={(e) => setNewTeam({ ...newTeam, roomId: e.target.value })}
            >
              {rooms.map((room) => (
                <MenuItem key={room.id} value={room.id}>
                  {room.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTeamDialog}>Cancel</Button>
          <Button onClick={handleSaveTeam} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={openMapDialog} onClose={handleCloseMapDialog}>
        <DialogTitle>
          {editingMap ? 'Edit Mapping' : 'Add New Mapping'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Problem Index"
            value={newMap.problemIndex}
            onChange={(e) => setNewMap({ ...newMap, problemIndex: e.target.value })}
            margin="normal"
            required
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Balloon Color"
              value={newMap.balloonColor}
              onChange={(e) => setNewMap({ ...newMap, balloonColor: e.target.value })}
              margin="normal"
              required
            />
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: newMap.balloonColor,
                border: '1px solid',
                borderColor: 'divider',
                mt: 1,
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMapDialog}>Cancel</Button>
          <Button onClick={handleSaveMap} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={openSettingsDialog} onClose={handleCloseSettingsDialog}>
        <DialogTitle>Add New Settings</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Admin Username"
            value={newSettings.adminUsername}
            onChange={(e) => setNewSettings({ ...newSettings, adminUsername: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Contest ID"
            value={newSettings.contestId}
            onChange={(e) => setNewSettings({ ...newSettings, contestId: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Codeforces API Key"
            value={newSettings.codeforcesApiKey}
            onChange={(e) => setNewSettings({ ...newSettings, codeforcesApiKey: e.target.value })}
            margin="normal"
            type="password"
          />
          <TextField
            fullWidth
            label="Codeforces API Secret"
            value={newSettings.codeforcesApiSecret}
            onChange={(e) => setNewSettings({ ...newSettings, codeforcesApiSecret: e.target.value })}
            margin="normal"
            type="password"
          />
          <FormControlLabel
            control={
              <Switch
                checked={newSettings.isEnabled}
                onChange={(e) => setNewSettings({ ...newSettings, isEnabled: e.target.checked })}
              />
            }
            label="Enable Contest"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSettingsDialog}>Cancel</Button>
          <Button onClick={handleCreateSettings} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 