import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, IconButton, Tooltip
} from '@mui/material';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import TicketStatusBar from '../components/ticketStatusBar';
import AlertSnackbar from '../components/auxiliars/alertSnackbar';
import { useLoading } from '../providers/loadingProvider';
import TicketNotes from '../components/ticketNotes';
import TicketCollaborators from '../components/ticketCollaborators';
import TicketAudio from '../components/auxiliars/tickets/ticketAudio.jsx';
import AddNoteDialog from '../components/dialogs/addNotesDialog';
import TicketAssignee from '../components/auxiliars/tickets/ticketAssignee.jsx';
import PatientProfileDialog from '../components/dialogs/patientProfileDialog';
import TicketWorkTime from '../components/ticketWorkTime';
import { TicketIndicators } from '../components/ticketIndicators';
import TicketLinkOptions from '../components/ticketLinkOptions';
import { useTickets } from '../context/ticketsContext.js';
import QualityButton from '../components/components/fields/qualityButton.js';
import { handleStatusChange, handleAddNoteHandler } from '../utils/js/ticketActions.js';
import { getStatusColor } from '../utils/js/statusColors.js';

export default function EditTicket({ ticket: initialTicket }) {
  const { setLoading } = useLoading();
  const { dispatch } = useTickets();

  const [ticket, ] = useState(initialTicket);
  const [status, setStatus] = useState(ticket?.status || '');
  const [qualityControl, setQualityControl] = useState(ticket?.quality_control);
  const [notes, setNotes] = useState(ticket?.notes || []);
  const [patientDob, ] = useState(formatDate(ticket?.patient_dob));
  const [noteContent, setNoteContent] = useState('');
  const [, setOpenNoteDialog] = useState(false);

  const [openDialogs, setOpenDialogs] = useState({
    note: false,
    agent: false,
    reassignAgent: false,
    confirm: false,
    patientProfile: false
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleQualityClick = useCallback(async () => {
    const newStatus = qualityControl ? 'QARevisionEnd' : 'QARevisionStart';
    const result = await handleStatusChange({
      dispatch,
      setLoading,
      ticketId: ticket.id,
      newStatus: newStatus,
      setStatus,
      setSuccessMessage: (msg) => setSnackbar({ open: true, message: msg, severity: 'success' }),
      setErrorMessage: (msg) => setSnackbar({ open: true, message: msg, severity: 'error' }),
      setSuccessOpen: () => {},
      setErrorOpen: () => {}
    });
    if (result.success) {
      setQualityControl(result.message.responseData.quality_control);
      setNotes(result.message.responseData.notes);
    }
  }, [dispatch, setLoading, ticket.id, qualityControl]);


   const handleAddNote = useCallback(async () => {
      const result = await handleAddNoteHandler({
        dispatch, 
        setLoading, 
        ticketId: ticket.id, 
        noteContent, 
        setNotes, 
        setNoteContent, 
        setOpenNoteDialog, 
        setStatus, 
        setSuccessMessage: (msg) => setSnackbar({ open: true, message: msg, severity: 'success' }),
        setErrorMessage: (msg) => setSnackbar({ open: true, message: msg, severity: 'error' }),
        setSuccessOpen: () => {},
        setErrorOpen: () => {}});

        if (result.success) {
          setNotes(result.message.ticket?.notes)
        }
    }, [dispatch, setLoading, ticket.id, noteContent, setNotes, setNoteContent, setOpenNoteDialog, setStatus]);
    

  useEffect(() => {
    setQualityControl(ticket.quality_control);
  }, [ticket.quality_control]);

  function formatDate(dateStr = '01-01-1901') {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  }

  const toggleDialog = (name, value) => {
    setOpenDialogs((prev) => ({ ...prev, [name]: value }));
  };

  if (!ticket) return <Typography>Ticket not found</Typography>;

  return (
    <>
      <Paper sx={{ position: 'fixed', top: 150, left: 220, right: 20, bottom: 20, display: 'flex', flexDirection: 'column', overflow: 'auto', borderRadius: 4, p: 4, backgroundColor: '#fff', boxShadow: '0px 8px 24px rgba(239, 241, 246, 1)' }}>
        <QualityButton status={qualityControl} onClick={handleQualityClick} />

        <Box sx={{ mt: 3, mb: 2 }}>
          <TicketStatusBar currentStatus={status} />
        </Box>

        <Grid container justifyContent="center" spacing={2}>
          {/* Column 1 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '540px' }}>
              <Card variant="outlined">
                <CardContent sx={{ p: '20px 25px 25px 30px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>Patient Information</Typography>
                    <TicketLinkOptions />
                    <Tooltip title="View Profile">
                      <IconButton onClick={() => toggleDialog('patientProfile', true)} size="small" sx={{ color: '#00a1ff' }}>
                        <i className="fa fa-id-card" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {ticket.linked_patient_snapshot?.Name ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <InsertLinkIcon color="success" />
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                        {ticket.linked_patient_snapshot.Name}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography>{ticket.patient_name}</Typography>
                  )}

                  <Typography><strong>Patient DOB:</strong><br />{ticket.linked_patient_snapshot?.DOB || patientDob}</Typography>
                  <Typography><strong>Phone:</strong><br />{ticket.phone}</Typography>
                  <Typography><strong>Callback Number:</strong><br />{ticket.callback_number}</Typography>
                </CardContent>
              </Card>
              <TicketNotes notes={notes} onAddNote={() => toggleDialog('note', true)} status={status} />
            </Box>
          </Grid>

          {/* Column 2 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '540px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>Call Information</Typography>
                  <TicketIndicators ai_data={ticket.aiClassification} showTooltip iconsOnly />
                  <Typography><strong>Caller ID:</strong> {ticket.caller_id}</Typography>
                  <Typography><strong>Caller Name:</strong> {ticket.caller_Name}</Typography>
                  <Typography><strong>Call Reason:</strong> {ticket.call_reason}</Typography>
                  <Typography><strong>Summary:</strong> {ticket.summary}</Typography>
                  <Typography><strong>Creation Date:</strong> {new Date(ticket.creation_date).toLocaleString()}</Typography>
                </CardContent>
              </Card>
              <TicketAudio audioUrl={ticket.url_audio} title="Audio" status={status} />
            </Box>
          </Grid>

          {/* Column 3 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '380px' }}>
              <TicketAssignee assigneeEmail={ticket.agent_assigned} status={status} />
              <TicketCollaborators collaborators={ticket.collaborators} status={status} />
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>Time on Task</Typography>
                  <TicketWorkTime workTimeData={ticket.work_time} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialogs */}
      <AddNoteDialog open={openDialogs.note} onClose={() => toggleDialog('note', false)} onSubmit={handleAddNote} value={noteContent} onChange={(e) => setNoteContent(e.target.value)} />
      <PatientProfileDialog open={openDialogs.patientProfile} onClose={() => toggleDialog('patientProfile', false)} patientName={ticket.patient_name} patientDob={patientDob} patientPhone={ticket.phone} />
      <AlertSnackbar open={snackbar.open} onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} message={snackbar.message} />
    </>
  );
}
