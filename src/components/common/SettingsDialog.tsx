import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { UserRole } from '../../types';

interface SettingsDialogProps {
  open: boolean;
  userName: string;
  userRole: UserRole;
  onClose: () => void;
  onSave: () => void;
  onUserNameChange: (name: string) => void;
}

export const SettingsDialog = ({
  open,
  userName,
  userRole,
  onClose,
  onSave,
  onUserNameChange,
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
          required
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Role</InputLabel>
          <Select
            value={userRole}
            label="Role"
            onChange={(e) => onUserNameChange(e.target.value as UserRole)}
            required
          >
            <MenuItem value="courier">Courier</MenuItem>
            {localStorage.getItem('token') && (
              <MenuItem value="admin">Admin</MenuItem>
            )}
            <MenuItem value="balloonPrep">Balloon Prep</MenuItem>
            <MenuItem value="accompanier">Accompanier</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 