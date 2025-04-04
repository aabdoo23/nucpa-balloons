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
  AppBar,
  Toolbar,
  IconButton as MuiIconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  MenuItem,
  Menu,
  Autocomplete,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Add as AddIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { signalRService } from '../services/signalR';
import { ToiletRequestDTO, ToiletRequestStatus, ToiletRequestUpdates, Team, UserRole } from '../types';
import { 
  getPendingToiletRequests,
  getInProgressToiletRequests,
  getCompletedToiletRequests,
  updateToiletRequestStatus,
  createToiletRequest,
  deleteToiletRequest,
  getAllTeams,
} from '../services/api';
import { ToiletRequestItem } from '../components/ToiletRequestItem';
import { ToiletRequestStatistics } from '../components/ToiletRequestStatistics';
import { SettingsDialog } from '../components/SettingsDialog';
import { EnvironmentSwitcher } from '../components/EnvironmentSwitcher';
import { lightTheme } from '../theme';

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
      id={`toilet-request-tabpanel-${index}`}
      aria-labelledby={`toilet-request-tab-${index}`}
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

export const ToiletRequestPage = () => {
  const theme = lightTheme;
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [pendingRequests, setPendingRequests] = useState<ToiletRequestDTO[]>([]);
  const [inProgressRequests, setInProgressRequests] = useState<ToiletRequestDTO[]>([]);
  const [completedRequests, setCompletedRequests] = useState<ToiletRequestDTO[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => localStorage.getItem('userRole') as UserRole || 'courier');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    teamId: '',
    isMale: true,
    isUrgent: false,
    comment: '',
  });
  const [teamSearchInput, setTeamSearchInput] = useState('');

  useEffect(() => {
    if (!userName || !selectedRole) {
      setSettingsDialogOpen(true);
    }
  }, [userName, selectedRole]);

  useEffect(() => {
    let mounted = true;

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
        const [pending, inProgress, completed, teamsData] = await Promise.all([
          getPendingToiletRequests(),
          getInProgressToiletRequests(),
          getCompletedToiletRequests(),
          getAllTeams(),
        ]);
        if (!mounted) return;
        setPendingRequests(Array.isArray(pending) ? pending : []);
        setInProgressRequests(Array.isArray(inProgress) ? inProgress : []);
        setCompletedRequests(Array.isArray(completed) ? completed : []);
        setTeams(Array.isArray(teamsData) ? teamsData : []);
      } catch (error) {
        console.error('Error loading initial data:', error);
        if (mounted) {
          setError('Failed to load toilet request data. Please make sure the backend server is running.');
          setPendingRequests([]);
          setInProgressRequests([]);
          setCompletedRequests([]);
          setTeams([]);
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
        signalRService.offReceiveToiletRequestUpdates(handleToiletRequestUpdates);
        signalRService.stopConnection();
      }
    };
  }, []);

  const refreshData = async () => {
    const [pending, inProgress, completed, teamsData] = await Promise.all([
      getPendingToiletRequests(),
      getInProgressToiletRequests(),
      getCompletedToiletRequests(),
      getAllTeams(),
    ]);
    setPendingRequests(Array.isArray(pending) ? pending : []);
    setInProgressRequests(Array.isArray(inProgress) ? inProgress : []);
    setCompletedRequests(Array.isArray(completed) ? completed : []);
    setTeams(Array.isArray(teamsData) ? teamsData : []);
  };

  const handleStart = async (request: ToiletRequestDTO) => {
    try {
      await updateToiletRequestStatus({
        id: request.id,
        status: ToiletRequestStatus.InProgress,
        statusUpdatedBy: userName,
        comment: '',
      });
    } catch (error) {
      console.error('Error starting toilet request:', error);
      await refreshData();
    }
  };

  const handleComplete = async (request: ToiletRequestDTO) => {
    try {
      await updateToiletRequestStatus({
        id: request.id,
        status: ToiletRequestStatus.Completed,
        statusUpdatedBy: userName,
        comment: '',
      });
    } catch (error) {
      console.error('Error completing toilet request:', error);
      await refreshData();
    }
  };

  const handleDelete = async (request: ToiletRequestDTO) => {
    try {
      await deleteToiletRequest(request.id);
    } catch (error) {
      console.error('Error deleting toilet request:', error);
      await refreshData();
    }
  };

  const handleCreate = async () => {
    try {
      await createToiletRequest({
        ...newRequest,
        statusChangedBy: userName,
      });
      setCreateDialogOpen(false);
      setNewRequest({
        teamId: '',
        isMale: true,
        isUrgent: false,
        comment: '',
      });
    } catch (error) {
      console.error('Error creating toilet request:', error);
      await refreshData();
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
            Toilet Request System
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
              You need to set your name and role before you can interact with toilet requests.
            </Typography>
          </Paper>
        ) : (
          <>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateDialogOpen(true)}
              >
                New Request
              </Button>
            </Box>

            <ToiletRequestStatistics
              pendingRequests={pendingRequests}
              inProgressRequests={inProgressRequests}
              completedRequests={completedRequests}
              userName={userName}
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
                <Tab 
                  label={`Pending (${pendingRequests.length})`} 
                  value={0} 
                />
                <Tab 
                  label={`In Progress (${inProgressRequests.length})`} 
                  value={1} 
                />
                <Tab 
                  label={`Completed (${completedRequests.length})`} 
                  value={2} 
                />
              </Tabs>

              <TabPanel value={activeTab} index={0}>
                {pendingRequests.map((request) => (
                  <ToiletRequestItem
                    key={request.id}
                    request={request}
                    showActions={true}
                    userRole={selectedRole}
                    onStart={handleStart}
                    onDelete={handleDelete}
                  />
                ))}
              </TabPanel>
              <TabPanel value={activeTab} index={1}>
                {inProgressRequests.map((request) => (
                  <ToiletRequestItem
                    key={request.id}
                    request={request}
                    showActions={true}
                    userRole={selectedRole}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                  />
                ))}
              </TabPanel>
              <TabPanel value={activeTab} index={2}>
                {completedRequests.map((request) => (
                  <ToiletRequestItem
                    key={request.id}
                    request={request}
                    showActions={true}
                    userRole={selectedRole}
                    onDelete={handleDelete}
                  />
                ))}
              </TabPanel>
            </Paper>
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

      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)}>
        <DialogTitle>Create New Toilet Request</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Autocomplete
              fullWidth
              options={teams}
              getOptionLabel={(option) => `Team ${option.id} - ${option.codeforcesHandle}`}
              value={teams.find(team => team.id === newRequest.teamId) || null}
              onChange={(_, newValue) => setNewRequest({ ...newRequest, teamId: newValue?.id || '' })}
              inputValue={teamSearchInput}
              onInputChange={(_, newInputValue) => setTeamSearchInput(newInputValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Team"
                  required
                  error={!newRequest.teamId}
                  helperText={!newRequest.teamId ? "Please select a team" : ""}
                />
              )}
              renderOption={(props, option) => (
                <li {...props}>
                  Team {option.id} - {option.codeforcesHandle}
                </li>
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              noOptionsText="No teams found"
              loadingText="Loading teams..."
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRequest.isMale}
                  onChange={(e) => setNewRequest({ ...newRequest, isMale: e.target.checked })}
                />
              }
              label="Male"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={newRequest.isUrgent}
                  onChange={(e) => setNewRequest({ ...newRequest, isUrgent: e.target.checked })}
                />
              }
              label="Urgent"
            />
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={3}
              value={newRequest.comment}
              onChange={(e) => setNewRequest({ ...newRequest, comment: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleCreate}
            variant="contained"
            disabled={!newRequest.teamId}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* only show on development */}
      {process.env.NODE_ENV === 'development' && <EnvironmentSwitcher />}
    </Box>
  );
}; 