import { useState, useEffect } from 'react';
import { UserRole } from '../types';

export const useUserSettings = () => {
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');
  const [selectedRole, setSelectedRole] = useState<UserRole>(() => localStorage.getItem('userRole') as UserRole || 'courier');
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    if (!userName || !selectedRole) {
      setSettingsDialogOpen(true);
    }
  }, [userName, selectedRole]);

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

  return {
    userName,
    setUserName,
    selectedRole,
    settingsDialogOpen,
    anchorEl,
    handleOpenSettingsDialog,
    handleCloseSettingsDialog,
    handleSaveSettings,
    handleRoleMenuOpen,
    handleRoleMenuClose,
    handleRoleChange,
  };
}; 