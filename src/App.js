// src/App.js
import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';

// Contexts and utilities
import AppProviders from './providers/appProvider';
import AppRoutes from './routes/appRoutes';

//import { useInitAppData } from './components/hooks/useInitAppData';

import './App.css';

function AppContent() {
  const [agentEmail, setAgentEmail] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    assignedAgents: [],
    callerIds: [],
  });
  //const { state, } = useAgents();
  //const agent = state.agents.find(a => a.agent_email === agentEmail );
  
  //temporal retirar react msal
  useEffect(() => {
    setAgentEmail('esteban.ulloa@clmmail.com');
  }, []);

  //useInitAppData();


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', bgcolor: '#f8fafd' }}>
      <AppRoutes
        agentEmail={agentEmail}
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