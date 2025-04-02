import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Settings as SettingsIcon } from '@mui/icons-material';
import { signalRService } from '../services/signalR';
import { BalloonRequestDTO, UserRole, BalloonUpdates } from '../types';
import { 
  getPendingBalloons, 
  getPickedUpBalloons, 
  getDeliveredBalloons, 
  getReadyForPickupBalloons,
  updateBalloonStatus 
} from '../services/api';
import { BalloonList } from '../components/BalloonList';
import { SettingsDialog } from '../components/SettingsDialog';
import { EnvironmentSwitcher } from '../components/EnvironmentSwitcher';

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
  const theme = useTheme();
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
  const [userRole, setUserRole] = useState<UserRole>(() => localStorage.getItem('userRole') as UserRole || 'courier');

  useEffect(() => {
    // Show settings dialog if no name or role is set
    if (!userName || !userRole) {
      setSettingsDialogOpen(true);
    }
  }, [userName, userRole]);

  useEffect(() => {
    let mounted = true;

    const handleBalloonStatusChange = (updates: BalloonUpdates) => {
      if (!mounted) return;

      if (Array.isArray(updates.Pending)) setPendingBalloons(updates.Pending);
      if (Array.isArray(updates.ReadyForPickup)) setReadyForPickupBalloons(updates.ReadyForPickup);
      if (Array.isArray(updates.PickedUp)) setPickedUpBalloons(updates.PickedUp);
      if (Array.isArray(updates.Delivered)) setDeliveredBalloons(updates.Delivered);
    };

    const initializeSignalR = async () => {
      try {
        await signalRService.startConnection();
        if (mounted) {
          signalRService.onBalloonStatusChanged(handleBalloonStatusChange);
          signalRService.onReceiveBalloonUpdates(handleBalloonStatusChange);
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

  const handleOpenSettingsDialog = () => {
    setSettingsDialogOpen(true);
  };

  const handleCloseSettingsDialog = () => {
    // Only allow closing if both name and role are set
    if (userName && userRole) {
      setSettingsDialogOpen(false);
    }
  };

  const handleSaveSettings = () => {
    if (!userName || !userRole) {
      return; // Don't save if either is missing
    }
    localStorage.setItem('userName', userName);
    localStorage.setItem('userRole', userRole);
    handleCloseSettingsDialog();
  };

  const getTabs = () => {
    if (userRole === 'courier') {
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

  return (
    <Container maxWidth="md" sx={{ px: isMobile ? 1 : 3 }}>
      <Box sx={{ mt: isMobile ? 2 : 4 }}>
        <Paper elevation={3} sx={{ p: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            gap: isMobile ? 2 : 0,
            mb: 2 
          }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center', 
              gap: 2 
            }}>
              <Typography variant={isMobile ? "h5" : "h4"}>
                Balloon Requests
              </Typography>
              {userName && userRole ? (
                <Chip
                  label={`${userName} (${userRole})`}
                  color="primary"
                  variant="outlined"
                  size={isMobile ? "medium" : "small"}
                />
              ) : (
                <Chip
                  label="Please set your name and role"
                  color="error"
                  variant="outlined"
                  size={isMobile ? "medium" : "small"}
                />
              )}
            </Box>
            <Tooltip title="Change your name and role">
              <IconButton 
                onClick={handleOpenSettingsDialog}
                sx={{ 
                  mt: isMobile ? 1 : 0,
                  alignSelf: isMobile ? 'flex-end' : 'auto'
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Box>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
              <Typography>{error}</Typography>
              <Button 
                variant="contained" 
                onClick={() => window.location.reload()}
                sx={{ mt: 2 }}
                fullWidth={isMobile}
              >
                Retry
              </Button>
            </Box>
          ) : !userName || !userRole ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" color="error" gutterBottom>
                Please set your name and role to continue
              </Typography>
              <Typography color="text.secondary">
                You need to set your name and role before you can interact with balloons.
              </Typography>
            </Box>
          ) : (
            <>
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{ 
                  mb: 3,
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

              {userRole === 'courier' ? (
                <>
                  <TabPanel value={activeTab} index={0}>
                    <BalloonList
                      balloons={readyForPickupBalloons}
                      showActions={true}
                      onPickup={handlePickup}
                      userRole={userRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <BalloonList
                      balloons={pickedUpBalloons}
                      showActions={true}
                      onDelivery={handleDelivery}
                      userRole={userRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={2}>
                    <BalloonList
                      balloons={deliveredBalloons}
                      showActions={true}
                      onRevert={handleRevert}
                      userRole={userRole}
                    />
                  </TabPanel>
                </>
              ) : (
                <>
                  <TabPanel value={activeTab} index={0}>
                    <BalloonList
                      balloons={pendingBalloons}
                      showActions={true}
                      onMarkReady={handleMarkReady}
                      userRole={userRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={1}>
                    <BalloonList
                      balloons={readyForPickupBalloons}
                      showActions={true}
                      onPickup={handlePickup}
                      userRole={userRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={2}>
                    <BalloonList
                      balloons={pickedUpBalloons}
                      showActions={true}
                      onDelivery={handleDelivery}
                      userRole={userRole}
                    />
                  </TabPanel>
                  <TabPanel value={activeTab} index={3}>
                    <BalloonList
                      balloons={deliveredBalloons}
                      showActions={true}
                      onRevert={handleRevert}
                      userRole={userRole}
                    />
                  </TabPanel>
                </>
              )}
            </>
          )}
        </Paper>
      </Box>

      <SettingsDialog
        open={settingsDialogOpen}
        userName={userName}
        userRole={userRole}
        onClose={handleCloseSettingsDialog}
        onSave={handleSaveSettings}
        onUserNameChange={setUserName}
        onUserRoleChange={setUserRole}
      />
      <EnvironmentSwitcher />
    </Container>
  );
};