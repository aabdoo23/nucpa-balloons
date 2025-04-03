import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Tooltip,
  Chip,
  Button,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton as MuiIconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { signalRService } from '../services/signalR';
import { 
  BalloonRequestDTO, 
  ToiletRequestDTO, 
  UserRole, 
  BalloonUpdates,
  ToiletRequestUpdates,
  Team,
  Room,
} from '../types';
import { 
  getPendingBalloons,
  getPickedUpBalloons,
  getDeliveredBalloons,
  getReadyForPickupBalloons,
  getPendingToiletRequests,
  getInProgressToiletRequests,
  getCompletedToiletRequests,
  getAllTeams,
  getAllRooms,
} from '../services/api';
import { SettingsDialog } from '../components/SettingsDialog';
import { EnvironmentSwitcher } from '../components/EnvironmentSwitcher';
import { lightTheme } from '../theme';

interface StatCardProps {
  title: string;
  value: number;
  color: string;
  subtitle?: string;
}

const StatCard = ({ title, value, color, subtitle }: StatCardProps) => {
  const theme = lightTheme;
  return (
    <Paper 
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Typography 
        variant="h4" 
        component="div" 
        sx={{ 
          color: color,
          fontWeight: 'bold',
          mb: 1,
        }}
      >
        {value}
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: theme.palette.text.secondary,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography 
          variant="body2" 
          sx={{ 
            color: theme.palette.text.secondary,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

export const AdminDashboardPage = () => {
  const theme = lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pendingBalloons, setPendingBalloons] = useState<BalloonRequestDTO[]>([]);
  const [readyForPickupBalloons, setReadyForPickupBalloons] = useState<BalloonRequestDTO[]>([]);
  const [pickedUpBalloons, setPickedUpBalloons] = useState<BalloonRequestDTO[]>([]);
  const [deliveredBalloons, setDeliveredBalloons] = useState<BalloonRequestDTO[]>([]);
  const [pendingRequests, setPendingRequests] = useState<ToiletRequestDTO[]>([]);
  const [inProgressRequests, setInProgressRequests] = useState<ToiletRequestDTO[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ToiletRequestDTO[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => localStorage.getItem('userRole') as UserRole || 'admin');

  useEffect(() => {
    if (!userName || !selectedRole) {
      setSettingsDialogOpen(true);
    }
  }, [userName, selectedRole]);

  useEffect(() => {
    let mounted = true;

    const handleBalloonUpdates = (updates: BalloonUpdates) => {
      if (!mounted) return;

      if (Array.isArray(updates.Pending)) setPendingBalloons(updates.Pending);
      if (Array.isArray(updates.ReadyForPickup)) setReadyForPickupBalloons(updates.ReadyForPickup);
      if (Array.isArray(updates.PickedUp)) setPickedUpBalloons(updates.PickedUp);
      if (Array.isArray(updates.Delivered)) setDeliveredBalloons(updates.Delivered);
    };

    const handleToiletRequestUpdates = (updates: ToiletRequestUpdates) => {
      if (!mounted) return;

      if (Array.isArray(updates.Pending)) setPendingRequests(updates.Pending);
      if (Array.isArray(updates.InProgress)) setInProgressRequests(updates.InProgress);
      if (Array.isArray(updates.Completed)) setCompletedRequests(updates.Completed);
    };

    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        if (mounted) {
          signalRService.onReceiveBalloonUpdates(handleBalloonUpdates);
          signalRService.onReceiveToiletRequestUpdates(handleToiletRequestUpdates);
        }
      } catch (error) {
        console.error('Failed to initialize SignalR:', error);
        if (mounted) {
          setError('Failed to establish real-time connection. Updates may be delayed.');
        }
      }
    };

    const loadInitialData = async () => {
      if (!mounted) return;
      setIsLoading(true);
      setError(null);
      try {
        const [
          pendingBalloons,
          readyForPickupBalloons,
          pickedUpBalloons,
          deliveredBalloons,
          pendingRequests,
          inProgressRequests,
          completedRequests,
          teamsData,
          roomsData,
        ] = await Promise.all([
          getPendingBalloons(),
          getReadyForPickupBalloons(),
          getPickedUpBalloons(),
          getDeliveredBalloons(),
          getPendingToiletRequests(),
          getInProgressToiletRequests(),
          getCompletedToiletRequests(),
          getAllTeams(),
          getAllRooms(),
        ]);

        if (!mounted) return;
        setPendingBalloons(Array.isArray(pendingBalloons) ? pendingBalloons : []);
        setReadyForPickupBalloons(Array.isArray(readyForPickupBalloons) ? readyForPickupBalloons : []);
        setPickedUpBalloons(Array.isArray(pickedUpBalloons) ? pickedUpBalloons : []);
        setDeliveredBalloons(Array.isArray(deliveredBalloons) ? deliveredBalloons : []);
        setPendingRequests(Array.isArray(pendingRequests) ? pendingRequests : []);
        setInProgressRequests(Array.isArray(inProgressRequests) ? inProgressRequests : []);
        setCompletedRequests(Array.isArray(completedRequests) ? completedRequests : []);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (mounted) {
          setError('Failed to load dashboard data. Please make sure the backend server is running.');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadInitialData();
    initializeSignalR();

    return () => {
      mounted = false;
      if (signalRService.isConnected()) {
        signalRService.offReceiveBalloonUpdates(handleBalloonUpdates);
        signalRService.offReceiveToiletRequestUpdates(handleToiletRequestUpdates);
        signalRService.stopConnection();
      }
    };
  }, []);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const [
        pendingBalloons,
        readyForPickupBalloons,
        pickedUpBalloons,
        deliveredBalloons,
        pendingRequests,
        inProgressRequests,
        completedRequests,
        teamsData,
        roomsData,
      ] = await Promise.all([
        getPendingBalloons(),
        getReadyForPickupBalloons(),
        getPickedUpBalloons(),
        getDeliveredBalloons(),
        getPendingToiletRequests(),
        getInProgressToiletRequests(),
        getCompletedToiletRequests(),
        getAllTeams(),
        getAllRooms(),
      ]);

      setPendingBalloons(Array.isArray(pendingBalloons) ? pendingBalloons : []);
      setReadyForPickupBalloons(Array.isArray(readyForPickupBalloons) ? readyForPickupBalloons : []);
      setPickedUpBalloons(Array.isArray(pickedUpBalloons) ? pickedUpBalloons : []);
      setDeliveredBalloons(Array.isArray(deliveredBalloons) ? deliveredBalloons : []);
      setPendingRequests(Array.isArray(pendingRequests) ? pendingRequests : []);
      setInProgressRequests(Array.isArray(inProgressRequests) ? inProgressRequests : []);
      setCompletedRequests(Array.isArray(completedRequests) ? completedRequests : []);
      setTeams(Array.isArray(teamsData) ? teamsData : []);
      setRooms(Array.isArray(roomsData) ? roomsData : []);
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh dashboard data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    if (userName && selectedRole) {
      setSettingsDialogOpen(false);
    }
  };

  const handleSaveSettings = () => {
    if (!userName || !selectedRole) {
      return;
    }
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', selectedRole);
    handleCloseSettingsDialog();
  };

  const getRoomUtilization = (room: Room) => {
    const teamsInRoom = teams.filter(team => team.roomId === room.id).length;
    const capacity = room.capacity || 0;
    return capacity > 0 ? Math.round((teamsInRoom / capacity) * 100) : 0;
  };

  const getTeamDistribution = () => {
    const distribution = rooms.map(room => ({
      roomName: room.name,
      teams: teams.filter(team => team.roomId === room.id).length,
      capacity: room.capacity || 0,
      utilization: getRoomUtilization(room),
    }));
    return distribution;
  };

  if (selectedRole !== 'admin') {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: theme.palette.background.default,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography color="text.secondary">
          This page is only accessible to administrators.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userName && (
              <Chip
                label={userName + ' (Admin)'}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            )}
            <Tooltip title="Refresh Data">
              <MuiIconButton onClick={refreshData} color="inherit">
                <RefreshIcon />
              </MuiIconButton>
            </Tooltip>
            <Tooltip title="Settings">
              <MuiIconButton onClick={handleOpenSettingsDialog} color="inherit">
                <SettingsIcon />
              </MuiIconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
            <Button 
              variant="contained" 
              onClick={refreshData}
              sx={{ mt: 2 }}
              fullWidth={isMobile}
            >
              Retry
            </Button>
          </Paper>
        ) : !userName || !selectedRole ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error" gutterBottom>
              Please set your name and role to continue
            </Typography>
            <Typography color="text.secondary">
              You need to set your name and role before you can access the dashboard.
            </Typography>
          </Paper>
        ) : (
          <>
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 'bold',
                color: theme.palette.text.primary,
              }}
            >
              System Overview
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Teams"
                  value={teams.length}
                  color={theme.palette.primary.main}
                  subtitle={`Across ${rooms.length} rooms`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Balloons"
                  value={pendingBalloons.length + readyForPickupBalloons.length + pickedUpBalloons.length}
                  color={theme.palette.warning.main}
                  subtitle={`${deliveredBalloons.length} delivered`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Toilet Requests"
                  value={pendingRequests.length + inProgressRequests.length}
                  color={theme.palette.info.main}
                  subtitle={`${completedRequests.length} completed`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Rooms"
                  value={rooms.length}
                  color={theme.palette.secondary.main}
                  subtitle={`${rooms.filter(r => r.isAvailable).length} available`}
                />
              </Grid>
            </Grid>

            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 'bold',
                color: theme.palette.text.primary,
              }}
            >
              Room Utilization
            </Typography>

            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Room</TableCell>
                    <TableCell align="right">Teams</TableCell>
                    <TableCell align="right">Capacity</TableCell>
                    <TableCell align="right">Utilization</TableCell>
                    <TableCell align="right">Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getTeamDistribution().map((room) => (
                    <TableRow key={room.roomName}>
                      <TableCell component="th" scope="row">
                        Room {room.roomName}
                      </TableCell>
                      <TableCell align="right">{room.teams}</TableCell>
                      <TableCell align="right">{room.capacity}</TableCell>
                      <TableCell align="right">
                        <Chip
                          label={`${room.utilization}%`}
                          color={room.utilization > 90 ? 'error' : room.utilization > 70 ? 'warning' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip
                          label={room.utilization === 100 ? 'Full' : 'Available'}
                          color={room.utilization === 100 ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                mb: 3,
                fontWeight: 'bold',
                color: theme.palette.text.primary,
              }}
            >
              Request Statistics
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Urgent Toilet Requests"
                  value={[...pendingRequests, ...inProgressRequests].filter(req => req.isUrgent).length}
                  color={theme.palette.error.main}
                  subtitle={`${Math.round(([...pendingRequests, ...inProgressRequests].filter(req => req.isUrgent).length / 
                    (pendingRequests.length + inProgressRequests.length)) * 100)}% of active requests`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Male Toilet Requests"
                  value={[...pendingRequests, ...inProgressRequests, ...completedRequests].filter(req => req.isMale).length}
                  color={theme.palette.primary.main}
                  subtitle={`${Math.round(([...pendingRequests, ...inProgressRequests, ...completedRequests].filter(req => req.isMale).length / 
                    (pendingRequests.length + inProgressRequests.length + completedRequests.length)) * 100)}% of total requests`}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <StatCard
                  title="Ready for Pickup"
                  value={readyForPickupBalloons.length}
                  color={theme.palette.warning.main}
                  subtitle={`${Math.round((readyForPickupBalloons.length / 
                    (pendingBalloons.length + readyForPickupBalloons.length + pickedUpBalloons.length)) * 100)}% of active balloons`}
                />
              </Grid>
            </Grid>
          </>
        )}
      </Container>

      <SettingsDialog
        open={settingsDialogOpen}
        userName={userName}
        userRole={selectedRole}
        onClose={handleCloseSettingsDialog}
        onSave={handleSaveSettings}
        onUserNameChange={setUserName}
      />

      <EnvironmentSwitcher />
    </Box>
  );
}; 