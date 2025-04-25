import { useState } from 'react';
import { 
  Box, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Announcement as AnnouncementIcon } from '@mui/icons-material';
import { signalRService } from '../services/signalR';

export const AnnouncementSender = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSend = async () => {
    if (message.trim()) {
      try {
        await signalRService.sendAnnouncement(message);
        setMessage('');
        handleClose();
      } catch (error) {
        console.error('Failed to send announcement:', error);
      }
    }
  };

  return (
    <>
      <Tooltip title="Send Announcement">
        <IconButton 
          onClick={handleOpen}
          color="warning"
          sx={{ 
            bgcolor: 'warning.light',
            '&:hover': {
              bgcolor: 'warning.main',
            }
          }}
        >
          <AnnouncementIcon />
        </IconButton>
      </Tooltip>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Send Announcement</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              autoFocus
              multiline
              rows={4}
              fullWidth
              variant="outlined"
              label="Announcement Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter your announcement message here..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button 
            onClick={handleSend} 
            variant="contained" 
            color="warning"
            disabled={!message.trim()}
          >
            Send Announcement
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 