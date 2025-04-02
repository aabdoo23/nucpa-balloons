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
} from '@mui/material';
import { UserRole } from '../types';

interface SettingsDialogProps {
  open: boolean;
  userName: string;
  userRole: UserRole;
  onClose: () => void;
  onSave: () => void;
  onUserNameChange: (name: string) => void;
  onUserRoleChange: (role: UserRole) => void;
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
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Your Name"
          fullWidth
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          helperText="This name will be used for all status changes"
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            value={userRole}
            label="Role"
            onChange={(e) => onUserRoleChange(e.target.value as UserRole)}
          >
            <MenuItem value="courier">Courier</MenuItem>
            <MenuItem value="balloonPrep">Balloon Prep</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 