import { Paper, Typography, Button, useMediaQuery, useTheme } from '@mui/material';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
      <Typography>{error}</Typography>
      {onRetry && (
        <Button 
          variant="contained" 
          onClick={onRetry}
          sx={{ mt: 2 }}
          fullWidth={isMobile}
        >
          Retry
        </Button>
      )}
    </Paper>
  );
}; 