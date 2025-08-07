import React, { useState, useCallback } from 'react';
import { Card, Box, Typography, Chip } from '@mui/material';
import DialogFullScreenRouter from '../../dialogs/dialogFullScreenRouter';

/**
 * Renders a list of tickets and opens a full-screen dialog on click
 */
export default function TicketListUI({ tickets = [] }) {
  const [open, setOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const handleOpen = useCallback((ticket) => {
    setSelectedTicket(ticket);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setSelectedTicket(null);
  }, []);

  return (
    <>
      <Box sx={{ px: 2 }}>
        {tickets.map((ticket) => (
          <Card
            key={ticket.id}
            onClick={() => handleOpen(ticket)}
            sx={{
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
              px: 2, py: 2, mb: 2, minHeight: 100, width: '100%', maxWidth: 850,
              mx: 'auto', borderRadius: '20px', border: '1px solid #e0e0e0',
              bgcolor: '#f9fbfd', boxShadow: '0px 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.3s ease', cursor: 'pointer',
              '&:hover': {
                bgcolor: '#eaf6ff', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transform: 'translateY(-2px)', borderColor: '#00a1ff'
              },
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="#333"
              noWrap
              sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {ticket.summary || 'Sin resumen'}
            </Typography>

            <Typography
              variant="body2"
              sx={{
                color: '#6c757d', fontWeight: 500, fontSize: '0.75rem', mt: 0.5,
                display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
                overflow: 'hidden'
              }}
            >
              Motivo: {ticket.call_reason || 'Desconocido'}
            </Typography>

            {ticket.status && (
              <Chip
                label={ticket.status.toUpperCase()}
                size="small"
                sx={{
                  mt: 1, fontSize: '0.65rem', fontWeight: 600,
                  bgcolor: '#00A1FF', color: 'white', borderRadius: '999px',
                  alignSelf: 'flex-start'
                }}
              />
            )}
          </Card>
        ))}
      </Box>

      <DialogFullScreenRouter
        open={open}
        onClose={handleClose}
        ticket={selectedTicket}
      />
    </>
  );
}
