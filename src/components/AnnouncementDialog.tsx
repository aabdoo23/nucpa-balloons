import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AnnouncementDialogProps {
  open: boolean;
  message: string;
  onClose: () => void;
}

export const AnnouncementDialog = ({ open, message, onClose }: AnnouncementDialogProps) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="announcement-dialog-title"
      aria-describedby="announcement-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: `2px solid ${theme.palette.warning.main}`,
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle 
        id="announcement-dialog-title"
        sx={{
          bgcolor: theme.palette.warning.light,
          color: theme.palette.warning.contrastText,
          fontWeight: 'bold',
        }}
      >
        Important Announcement
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <DialogContentText 
            id="announcement-dialog-description"
            sx={{ 
              color: theme.palette.text.primary,
              fontSize: '1.1rem',
              whiteSpace: 'pre-line'
            }}
          >
            {message}
          </DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          variant="contained"
          color="primary"
          fullWidth
          sx={{ m: 1 }}
        >
          I Understand
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 