import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { UserRole } from '../types';

interface SettingsDialogProps {
  open: boolean;
  userName: string;
  userRole: UserRole;
  onClose: () => void;
  onSave: () => void;
  onUserNameChange: (value: string) => void;
  onUserRoleChange: (value: UserRole) => void;
}

export const SettingsDialog = ({
  open,
  userName,
  userRole,
  onClose,
  onSave,
  onUserNameChange,
  onUserRoleChange,
}: SettingsDialogProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ pb: isMobile ? 1 : 2 }}>
        Settings
      </DialogTitle>
      <DialogContent sx={{ pb: isMobile ? 2 : 3 }}>
        <TextField
          autoFocus
          margin="dense"
          label="Your Name"
          fullWidth
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          helperText="This name will be used for all status changes"
          sx={{ mb: isMobile ? 2 : 3 }}
        />
        <FormControl fullWidth>
          <InputLabel>Role</InputLabel>
          <Select
            value={userRole}
            label="Role"
            onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
            sx={{ mb: isMobile ? 2 : 3 }}
          >
            <MenuItem value="courier">Courier</MenuItem>
            <MenuItem value="balloonPrep">Balloon Prep</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions sx={{ 
        px: isMobile ? 2 : 3,
        pb: isMobile ? 2 : 3,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0
      }}>
        <Button 
          onClick={onClose}
          fullWidth={isMobile}
          variant={isMobile ? "outlined" : "text"}
        >
          Cancel
        </Button>
        <Button 
          onClick={onSave} 
          variant="contained" 
          color="primary"
          fullWidth={isMobile}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 