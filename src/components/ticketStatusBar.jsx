// src/components/TicketStatusBar.jsx
import {
  Box,
  Typography,
} from '@mui/material';

import { getStatusColor } from '../utils/js/statusColors';

const TicketStatusBar = ({ currentStatus }) => {

  
  return (
    <>
      <Box display="flex" justifyContent="center">
        <Box
        width="100%"
        maxWidth="1500px"
        display="flex"
        mt={2}
        borderRadius="20px"
        boxShadow={0}
        sx={{ backgroundColor: '#fff' }}
      >
        {['New', 'Duplicated', 'Emergency', 'In Progress', 'Pending', 'Done'].map((status) => {
          const bg = getStatusColor(status, 'bg');
          const text = getStatusColor(status, 'text');
          const isActive = currentStatus === status;

          return (
            <Box
              key={status}
              flex={1}
              textAlign="center"
              sx={{
                py: 1.5,
                cursor: 'pointer',
                backgroundColor: bg,
                color: text,
                fontWeight: 'bold',
                fontSize: '1rem',
                borderTop: isActive ? `3px solid ${text}` : '1px solid transparent',
                borderBottom: isActive ? `3px solid ${text}` : '1px solid transparent',
                borderRight: isActive ? `3px solid ${text}` : '1px solid transparent',
                borderLeft: isActive ? `3px solid ${text}` : '1px solid transparent',

                /* Redondear solo la primera y la última pestaña */
                '&:first-of-type': {
                  borderTopLeftRadius: '20px',
                  borderBottomLeftRadius: '20px',
                  borderLeft: isActive ? `3px solid ${text}` : '1px solid transparent',
                },
                '&:last-of-type': {
                  borderTopRightRadius: '20px',
                  borderBottomRightRadius: '20px',
                  borderRight: isActive ? `3px solid ${text}` : '1px solid transparent',
                },

                '&:hover': { opacity: 0.9 },
              }}
            >
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <Typography variant="body2" fontWeight="bold" fontSize="1rem">
                  {status}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
    </>
  );
};

export default TicketStatusBar;
