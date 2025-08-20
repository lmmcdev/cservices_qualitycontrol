// src/App.js
import React, { useState } from 'react';
import { Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

// Contexts and utilities
import AppProviders from './providers/appProvider';
import AppRoutes from './routes/appRoutes';
import { setupFetchAuth } from './setupFetchAuth';

import './App.css';

function AppContent() {
  React.useEffect(() => {
    setupFetchAuth();
  }, []); // ← una sola vez


  const [filters, setFilters] = useState({
    date: '',
    assignedAgents: [],
    callerIds: [],
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f8fafd' }}>
      <AppRoutes
        filters={filters}
        setFilters={setFilters}
      />
    </Box>
  );
}

function App() {
  return (
      <AppProviders>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AppProviders>
  );
}

export default App;