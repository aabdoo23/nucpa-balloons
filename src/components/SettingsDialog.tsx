import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';
import { UserRole } from '../types';

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
          type="text"
          fullWidth
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={!userName}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 