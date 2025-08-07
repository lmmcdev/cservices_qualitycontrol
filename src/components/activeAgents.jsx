// src/components/activeAgents.jsx

import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group'; // 👥

export default function ActiveAgents() {
  const activeCount = 6; // Reemplázalo con tu dato real

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Card
        sx={{
          borderRadius: 3,
          width: '100%',
          height: '100%',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#fff',
          boxShadow: '0px 8px 24px rgba(239, 241, 246, 1)',
          '&:hover .group-icon': {
            transform: 'translate(-50%, -50%) scale(1.1)',
            transition: 'transform 0.5s ease-in-out',
          },
        }}
      >
        <CardContent
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            p: 2,
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: '#999', letterSpacing: 1, mb: 1 }}
          >
            Active Agents
          </Typography>

          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: '#00a1ff' }}
          >
            {activeCount}
          </Typography>
        </CardContent>

        <GroupIcon
          className="group-icon"
          sx={{
            position: 'absolute',
            fontSize: '8rem',
            color: '#e0f7ff',
            opacity: 0.4,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        />
      </Card>
    </Box>
  );
}
