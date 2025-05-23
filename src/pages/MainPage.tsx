import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Chip,
  Button,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  AppBar,
  Toolbar,
  IconButton as MuiIconButton,
  Menu,
  List,
  ListItem,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  AccountCircle as AccountCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { signalRService } from '../services/signalR';
import { BalloonRequestDTO, UserRole, BalloonUpdates } from '../types';
import { 
  getPendingBalloons, 
  getPickedUpBalloons, 
  getDeliveredBalloons, 
  getReadyForPickupBalloons,
  updateBalloonStatus,
  getAllRooms,
} from '../services/api';
import { BalloonList } from '../components/BalloonList';
import { SettingsDialog } from '../components/SettingsDialog';
import { EnvironmentSwitcher } from '../components/EnvironmentSwitcher';
import { Statistics } from '../components/Statistics';
import { lightTheme } from '../theme';
import { getRoomFromTeamName } from '../config/roomMapping';
import { ColorBalloonList } from '../components/ColorBalloonList';
import { AnnouncementDialog } from '../components/AnnouncementDialog';
import { AnnouncementSender } from '../components/AnnouncementSender';

interface TeamBalloonStats {
  teamName: string;
  total: number;
  pending: number;
  readyForPickup: number;
  pickedUp: number;
  delivered: number;
}

const TeamStatistics = ({ balloons }: { balloons: BalloonRequestDTO[] }) => {
  const [expanded, setExpanded] = useState(false);

  const teamStats = balloons.reduce((acc, balloon) => {
    const teamName = balloon.teamName || 'Unknown Team';
    if (!acc[teamName]) {
      acc[teamName] = {
        teamName,
        total: 0,
        pending: 0,
        readyForPickup: 0,
        pickedUp: 0,
        delivered: 0
      };
    }
    
    acc[teamName].total++;
    switch (balloon.status) {
      case 'Pending':
        acc[teamName].pending++;
        break;
      case 'ReadyForPickup':
        acc[teamName].readyForPickup++;
        break;
      case 'PickedUp':
        acc[teamName].pickedUp++;
        break;
      case 'Delivered':
        acc[teamName].delivered++;
        break;
    }
    
    return acc;
  }, {} as Record<string, TeamBalloonStats>);

  const sortedTeams = Object.values(teamStats).sort((a, b) => b.total - a.total);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: expanded ? 2 : 0
      }}>
        <Typography variant="h6">
          Team Statistics
        </Typography>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      <Collapse in={expanded}>
        <List>
          {sortedTeams.map((team) => (
            <ListItem
              key={team.teamName}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.paper',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {team.teamName}
                    </Typography>
                    <Chip
                      label={`Total: ${team.total}`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={`Pending: ${team.pending}`}
                      size="small"
                      variant="outlined"
                      color="default"
                    />
                    <Chip
                      label={`Ready: ${team.readyForPickup}`}
                      size="small"
                      variant="outlined"
                      color="warning"
                    />
                    <Chip
                      label={`Picked Up: ${team.pickedUp}`}
                      size="small"
                      variant="outlined"
                      color="info"
                    />
                    <Chip
                      label={`Delivered: ${team.delivered}`}
                      size="small"
                      variant="outlined"
                      color="success"
                    />
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </Paper>
  );
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`balloon-tabpanel-${index}`}
      aria-labelledby={`balloon-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export const MainPage = () => {
  const theme = lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pendingBalloons, setPendingBalloons] = useState<BalloonRequestDTO[]>([]);
  const [readyForPickupBalloons, setReadyForPickupBalloons] = useState<BalloonRequestDTO[]>([]);
  const [pickedUpBalloons, setPickedUpBalloons] = useState<BalloonRequestDTO[]>([]);
  const [deliveredBalloons, setDeliveredBalloons] = useState<BalloonRequestDTO[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => localStorage.getItem('userRole') as UserRole || 'courier');
  
  // Filter states
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [showOnlyMyBalloons, setShowOnlyMyBalloons] = useState(true);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  useEffect(() => {
    // Show settings dialog if no name or role is set
    if (!userName || !selectedRole) {
      setSettingsDialogOpen(true);
    }
  }, [userName, selectedRole]);

  useEffect(() => {
    let mounted = true;

    const handleBalloonStatusChange = (updates: BalloonUpdates) => {
      if (!mounted) return;

      if (Array.isArray(updates.Pending)) setPendingBalloons(updates.Pending);
      if (Array.isArray(updates.ReadyForPickup)) setReadyForPickupBalloons(updates.ReadyForPickup);
      if (Array.isArray(updates.PickedUp)) setPickedUpBalloons(updates.PickedUp);
      if (Array.isArray(updates.Delivered)) setDeliveredBalloons(updates.Delivered);
    };

    const handleAnnouncement = (message: string) => {
      if (!mounted) return;
      setAnnouncement(message);
      setShowAnnouncement(true);
    };

    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        if (mounted) {
          signalRService.onBalloonStatusChanged(handleBalloonStatusChange);
          signalRService.onReceiveBalloonUpdates(handleBalloonStatusChange);
          signalRService.onReceiveAnnouncement(handleAnnouncement);
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
        const [pending, readyForPickup, pickedUp, delivered] = await Promise.all([
          getPendingBalloons(),
          getReadyForPickupBalloons(),
          getPickedUpBalloons(),
          getDeliveredBalloons(),
          getAllRooms(),
        ]);
        if (!mounted) return;
        setPendingBalloons(Array.isArray(pending) ? pending : []);
        setReadyForPickupBalloons(Array.isArray(readyForPickup) ? readyForPickup : []);
        setPickedUpBalloons(Array.isArray(pickedUp) ? pickedUp : []);
        setDeliveredBalloons(Array.isArray(delivered) ? delivered : []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (mounted) {
          setError('Failed to load balloon data. Please make sure the backend server is running.');
          setPendingBalloons([]);
          setReadyForPickupBalloons([]);
          setPickedUpBalloons([]);
          setDeliveredBalloons([]);
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
        signalRService.offBalloonStatusChanged(handleBalloonStatusChange);
        signalRService.offReceiveBalloonUpdates(handleBalloonStatusChange);
        signalRService.offReceiveAnnouncement(handleAnnouncement);
        signalRService.stopConnection();
      }
    };
  }, []);

  const refreshData = async () => {
    const [pending, readyForPickup, pickedUp, delivered] = await Promise.all([
      getPendingBalloons(),
      getReadyForPickupBalloons(),
      getPickedUpBalloons(),
      getDeliveredBalloons(),
      getAllRooms(),
    ]);
    setPendingBalloons(Array.isArray(pending) ? pending : []);
    setReadyForPickupBalloons(Array.isArray(readyForPickup) ? readyForPickup : []);
    setPickedUpBalloons(Array.isArray(pickedUp) ? pickedUp : []);
    setDeliveredBalloons(Array.isArray(delivered) ? delivered : []);
  };

  const handleMarkReady = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'ReadyForPickup',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error marking balloon as ready:', error);
      await refreshData();
    }
  };

  const handlePickup = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'PickedUp',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error picking up balloon:', error);
      await refreshData();
    }
  };

  const handleDelivery = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'Delivered',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error delivering balloon:', error);
      await refreshData();
    }
  };

  const handleRevert = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'PickedUp',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error reverting balloon:', error);
      await refreshData();
    }
  };

  const handleRevertToReady = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'ReadyForPickup',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error reverting balloon to ready:', error);
      await refreshData();
    }
  };

  const handleRevertToPending = async (balloon: BalloonRequestDTO) => {
    try {
      await updateBalloonStatus(balloon.id, {
        id: balloon.id,
        status: 'Pending',
        statusChangedBy: userName
      });
    } catch (error) {
      console.error('Error reverting balloon to pending:', error);
      await refreshData();
    }
  };

  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    // Only allow closing if both name and role are set
    if (userName && selectedRole) {
      setSettingsDialogOpen(false);
    }
  };

  const handleSaveSettings = () => {
    if (!userName || !selectedRole) {
      return; // Don't save if either is missing
    }
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', selectedRole);
    handleCloseSettingsDialog();
  };

  const getTabs = () => {
    if (selectedRole === 'courier') {
      return [
        { label: `Ready for Pickup (${readyForPickupBalloons.length})`, value: 0 },
        { label: `Picked Up (${pickedUpBalloons.length})`, value: 1 },
        { label: `Delivered (${deliveredBalloons.length})`, value: 2 }
      ];
    } else {
      return [
        { label: `Pending (${pendingBalloons.length})`, value: 0 },
        { label: `Ready for Pickup (${readyForPickupBalloons.length})`, value: 1 },
        { label: `Picked Up (${pickedUpBalloons.length})`, value: 2 },
        { label: `Delivered (${deliveredBalloons.length})`, value: 3 }
      ];
    }
  };

  // Filter functions
  const getFilteredBalloons = (balloons: BalloonRequestDTO[]) => {
    let filtered = balloons;
    
    if (selectedRoom) {
      filtered = filtered.filter(balloon => getRoomFromTeamName(balloon.teamName) === selectedRoom);
    }
    
    if (showOnlyMyBalloons) {
      filtered = filtered.filter(balloon => balloon.statusChangedBy === userName);
    }
    
    return filtered;
  };

  const handleRoleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleRoleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    localStorage.setItem('userRole', role);
    handleRoleMenuClose();
  };

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
            Balloon Delivery System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userName && (
              <Chip
                label={userName + ' (' + selectedRole + ')'}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            )}
            <Tooltip title="Select Role">
              <MuiIconButton onClick={handleRoleMenuOpen} color="inherit">
                <AccountCircleIcon />
              </MuiIconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleRoleMenuClose}
            >
              <MenuItem onClick={() => handleRoleChange('courier')}>Courier</MenuItem>
              {localStorage.getItem('token') && (
                <MenuItem onClick={() => handleRoleChange('admin')}>Admin</MenuItem>
              )}
              <MenuItem onClick={() => handleRoleChange('balloonPrep')}>Balloon Prep</MenuItem>
              <MenuItem onClick={() => handleRoleChange('accompanier')}>Accompanier</MenuItem>
            </Menu>
            {selectedRole === 'admin' && <AnnouncementSender />}
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
              onClick={() => window.location.reload()}
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
              You need to set your name and role before you can interact with balloons.
            </Typography>
          </Paper>
        ) : (
          <>
            <Statistics
              pendingBalloons={pendingBalloons}
              readyForPickupBalloons={readyForPickupBalloons}
              pickedUpBalloons={pickedUpBalloons}
              deliveredBalloons={deliveredBalloons}
              userRole={selectedRole}
            />

            <Paper sx={{ p: 2 }}>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ 
                  mb: 2,
                  '& .MuiTabs-flexContainer': {
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    gap: isMobile ? 1 : 0,
                  },
                  '& .MuiTab-root': {
                    minWidth: isMobile ? 'auto' : 160,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                  }
                }}
              >
                {getTabs().map(tab => (
                  <Tab key={tab.value} label={tab.label} value={tab.value} />
                ))}
              </Tabs>

              {/* Filters */}
              <Box sx={{ 
                mb: 2,
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2,
                alignItems: isMobile ? 'stretch' : 'center'
              }}>
                {selectedRole === 'courier' && (
                  <>
                    <FormControl 
                      fullWidth={isMobile} 
                      sx={{ minWidth: isMobile ? '100%' : 200 }}
                    >
                      <Select
                        value={selectedRoom}
                        label="Filter by Room"
                        onChange={(e) => setSelectedRoom(e.target.value)}
                      >
                        <MenuItem value="">All Rooms</MenuItem>
                        <MenuItem value="Lab-01">Lab-01</MenuItem>
                        <MenuItem value="Lab-52">Lab-52</MenuItem>
                        <MenuItem value="Lab-53">Lab-53</MenuItem>
                        <MenuItem value="Lab-264">Lab-264</MenuItem>
                        <MenuItem value="Lab-216-B">Lab-216-B</MenuItem>
                        <MenuItem value="Lab-265">Lab-265</MenuItem>
                        <MenuItem value="Lab-7">Lab-7</MenuItem>
                        <MenuItem value="Lab-G29">Lab-G29</MenuItem>
                        <MenuItem value="Lab-G18">Lab-G18</MenuItem>
                        <MenuItem value="Lab-G17">Lab-G17</MenuItem>
                      </Select>
                    </FormControl>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={showOnlyMyBalloons}
                          onChange={(e) => setShowOnlyMyBalloons(e.target.checked)}
                        />
                      }
                      label="Show only my balloons"
                    />
                  </>
                )}
              </Box>

              {/* Balloon Lists */}
              {selectedRole === 'courier' ? (
                <>
                  <TabPanel value={activeTab} index={0}>
                    <BalloonList
                      balloons={getFilteredBalloons(readyForPickupBalloons)}
                      showActions={true}
                      onPickup={handlePickup}
                      onRevertToPending={handleRevertToPending}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <BalloonList
                      balloons={getFilteredBalloons(pickedUpBalloons)}
                      showActions={true}
                      onDelivery={handleDelivery}
                      onRevertToReady={handleRevertToReady}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={2}>
                    <BalloonList
                      balloons={getFilteredBalloons(deliveredBalloons)}
                      showActions={true}
                      onRevert={handleRevert}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                </>
              ) : (
                <>
                  <TabPanel value={activeTab} index={0}>
                    {selectedRole === 'balloonPrep' ? (
                      <ColorBalloonList
                        balloons={pendingBalloons}
                        onMarkReady={handleMarkReady}
                      />
                    ) : (
                      <BalloonList
                        balloons={pendingBalloons}
                        showActions={true}
                        onMarkReady={handleMarkReady}
                        userRole={selectedRole}
                      />
                    )}
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <BalloonList
                      balloons={getFilteredBalloons(readyForPickupBalloons)}
                      showActions={true}
                      onPickup={handlePickup}
                      onRevertToPending={handleRevertToPending}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={2}>
                    <BalloonList
                      balloons={getFilteredBalloons(pickedUpBalloons)}
                      showActions={true}
                      onDelivery={handleDelivery}
                      onRevertToReady={handleRevertToReady}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={3}>
                    <BalloonList
                      balloons={getFilteredBalloons(deliveredBalloons)}
                      showActions={true}
                      onRevert={handleRevert}
                      userRole={selectedRole}
                    />
                  </TabPanel>
                </>
              )}
            </Paper>
                
            <TeamStatistics 
              balloons={[
                ...pendingBalloons,
                ...readyForPickupBalloons,
                ...pickedUpBalloons,
                ...deliveredBalloons
              ]} 
            />
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
      <AnnouncementDialog
        open={showAnnouncement}
        message={announcement || ''}
        onClose={() => setShowAnnouncement(false)}
      />
      {/* only show on development */}
      {process.env.NODE_ENV === 'development' && <EnvironmentSwitcher />}
    </Box>
  );
};