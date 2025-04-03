import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export const Navbar = () => {
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          NUCPA Balloons
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Balloons
          </Button>
          <Button color="inherit" component={RouterLink} to="/toilet">
            Toilet Requests
          </Button>
          {token && (
            <>
              <Button color="inherit" component={RouterLink} to="/admin">
                Admin Settings
              </Button>
              <Button color="inherit" component={RouterLink} to="/adminDashboard">
                Admin Dashboard
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}; 