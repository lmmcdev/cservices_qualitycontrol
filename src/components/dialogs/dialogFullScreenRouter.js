// DialogFullScreenRouter.jsx
import React from 'react';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Slide,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Routes, Route } from 'react-router-dom';
import EditTicket from '../../pages/editTicket';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DialogFullScreenRouter = ({ open, onClose, ticket }) => {

  const handleClose = () => {
    onClose();
    //navigate('/'); // Vuelve al inicio o donde gustes
  };

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar sx={{ position: 'relative' }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            Edit Ticket
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Renderiza la ruta dentro del diálogo */}
      <EditTicket ticket={ticket} />
      <Routes>
        <Route path="/tickets/edit/:id" element={<EditTicket />} />
      </Routes>
    </Dialog>
  );
};

export default DialogFullScreenRouter;
