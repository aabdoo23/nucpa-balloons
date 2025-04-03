import { ReactNode } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tooltip,
  Chip,
  IconButton as MuiIconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  AccountCircle as AccountCircleIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';
import { UserRole } from '../../types';

interface AppLayoutProps {
  children: ReactNode;
  title: string;
  userName: string;
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  onSettingsOpen: () => void;
  anchorEl: HTMLElement | null;
  onRoleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onRoleMenuClose: () => void;
}

export const AppLayout = ({
  children,
  title,
  userName,
  selectedRole,
  onRoleChange,
  onSettingsOpen,
  anchorEl,
  onRoleMenuOpen,
  onRoleMenuClose,
}: AppLayoutProps) => {
  return (
    <Box sx={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {userName && (
              <Chip
                label={`${userName} (${selectedRole})`}
                color="primary"
                variant="outlined"
                size="medium"
                sx={{ fontWeight: 'bold', fontSize: '1rem' }}
              />
            )}
            {selectedRole === 'admin' && (
              <Tooltip title="Admin Dashboard">
                <MuiIconButton 
                  onClick={() => window.location.href = '/admin'} 
                  color="inherit"
                >
                  <DashboardIcon />
                </MuiIconButton>
              </Tooltip>
            )}
            <Tooltip title="Select Role">
              <MuiIconButton onClick={onRoleMenuOpen} color="inherit">
                <AccountCircleIcon />
              </MuiIconButton>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={onRoleMenuClose}
            >
              <MenuItem onClick={() => onRoleChange('courier')}>Courier</MenuItem>
              {localStorage.getItem('token') && (
                <MenuItem onClick={() => onRoleChange('admin')}>Admin</MenuItem>
              )}
              <MenuItem onClick={() => onRoleChange('balloonPrep')}>Balloon Prep</MenuItem>
              <MenuItem onClick={() => onRoleChange('accompanier')}>Accompanier</MenuItem>
            </Menu>
            <Tooltip title="Settings">
              <MuiIconButton onClick={onSettingsOpen} color="inherit">
                <SettingsIcon />
              </MuiIconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      {children}
    </Box>
  );
}; 