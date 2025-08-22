// src/pages/editTicket.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, IconButton, Tooltip, Chip, Stack, Button
} from '@mui/material';
import TicketStatusBar from '../components/auxiliars/tickets/ticketStatusBar.jsx';
import AlertSnackbar from '../components/auxiliars/alertSnackbar';
import { useLoading } from '../providers/loadingProvider';
import TicketNotes from '../components/auxiliars/tickets/ticketNotes.jsx';
import TicketCollaborators from '../components/auxiliars/tickets/ticketCollaborators.jsx';
import TicketAudio from '../components/auxiliars/tickets/ticketAudio.jsx';
import AddNoteDialog from '../components/dialogs/addNotesDialog';
import TicketAssignee from '../components/auxiliars/tickets/ticketAssignee.jsx';
import PatientProfileDialog from '../components/dialogs/patientProfileDialog';
import TicketWorkTime from '../components/auxiliars/tickets/ticketWorkTime.js';
import { TicketIndicators } from '../components/auxiliars/tickets/ticketIndicators.jsx';
import TicketLinkOptions from '../components/auxiliars/tickets/ticketLinkOptions.jsx';
import { useTickets } from '../context/ticketsContext.js';
import QualityButton from '../components/fields/qualityButton.js';
import { handleAddNoteHandler } from '../utils/js/ticketActions.js';
import { getStatusColor } from '../utils/js/statusColors.js';
import MergeIcon from '@mui/icons-material/Merge';
import EmptyState from '../components/auxiliars/emptyState.js';
import QcPanel from '../components/qc/qcPanel.jsx';
import { addQcData } from '../utils/apiTickets.js';

const qcColors = {
  pending:    { bg: '#FFF5DA', text: '#B08500' },
  in_review:  { bg: '#E7F0FF', text: '#0B61D9' },
  passed:     { bg: '#DAF8F4', text: '#00B8A3' },
  failed:     { bg: '#FFE2EA', text: '#FF3B69' },
  coaching_required: { bg: '#EAE8FA', text: '#7C3AED' },
};

function toName(email = '') {
  const [u] = String(email).split('@');
  if (!u) return email || '—';
  return u.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

export default function EditTicket({ ticket: initialTicket }) {
  const { setLoading } = useLoading();
  const { dispatch } = useTickets();

  const [ticket] = useState(initialTicket);
  const [status, setStatus] = useState(ticket?.status || '');
  const [qualityControl, setQualityControl] = useState(!!ticket?.quality_control);
  const [notes, setNotes] = useState(ticket?.notes || []);
  const [patientDob] = useState(formatDate(ticket?.patient_dob));
  const [noteContent, setNoteContent] = useState('');
  const [, setOpenNoteDialog] = useState(false);

  // QC drawer state
  const [qcOpen, setQcOpen] = useState(false);
  const [qcSaving, setQcSaving] = useState(false);

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

  // Derivados de QC
  // 👉 Derivados de QC (ordenados)
  const qc = ticket?.qc || null;
  const qcHistory = useMemo(() => {
    if (!qc?.history) return [];
    return [...qc.history].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [qc?.history]);

  // helper para nombre
  function toName(email = '') {
    const [u] = String(email).split('@');
    if (!u) return email || '—';
    return u.split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
  }

  const qcMeta = useMemo(() => {
    if (!qc) return null;
    const sKey = qc.status || 'pending';
    const col = qcColors[sKey] || qcColors.pending;
    const score = typeof qc.score === 'number' ? qc.score : (
      (qc.rubric?.compliance ?? 0) +
      (qc.rubric?.accuracy ?? 0) +
      (qc.rubric?.process ?? 0) +
      (qc.rubric?.softSkills ?? 0) +
      (qc.rubric?.documentation ?? 0)
    );
    const reviewer = qc.reviewer_email ? toName(qc.reviewer_email) : '—';
    const updated = qc.updatedAt ? new Date(qc.updatedAt).toLocaleString() : '—';
    const label = String(sKey).replace('_', ' ');
    return { label, col, score, reviewer, updated };
  }, [qc]);

  useEffect(() => {
    setQualityControl(!!ticket?.quality_control);
  }, [ticket?.quality_control]);

  function formatDate(dateStr = '01-01-1901') {
    const date = new Date(dateStr);
    return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}/${date.getFullYear()}`;
  }

  const toggleDialog = (name, value) => {
    setOpenDialogs((prev) => ({ ...prev, [name]: value }));
  };

  // 🔔 Abrir panel (de momento sin cambiar status del ticket)
  const handleQualityClick = useCallback(async () => {
    setQcOpen(true);
    // Si quieres, aquí puedes disparar QARevisionStart/End con tu endpoint de status del ticket
  }, []);

  // Notas
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
      setErrorOpen: () => {},
    });

    if (result?.success) {
      setNotes(result.message.ticket?.notes || []);
    }
  }, [dispatch, setLoading, ticket?.id, noteContent, setNotes, setNoteContent, setOpenNoteDialog, setStatus]);

  if (!ticket) return <EmptyState />;

  return (
    <>
      <Paper
        sx={{
          position: 'fixed', top: 150, left: 220, right: 20, bottom: 20,
          display: 'flex', flexDirection: 'column', overflow: 'auto',
          borderRadius: 4, p: 4, bgcolor: '#fff',
          boxShadow: '0px 8px 24px rgba(239, 241, 246, 1)'
        }}
      >
        {/* Under Revision */}
        <QualityButton status={qualityControl} onClick={handleQualityClick} />

        <Box sx={{ mt: 3, mb: 2 }}>
          <TicketStatusBar currentStatus={status} />
        </Box>

        <Grid container justifyContent="center" spacing={2}>
          {/* Col 1 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '540px' }}>
              <Card variant="outlined">
                <CardContent sx={{ p: '20px 25px 25px 30px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>
                      Patient Information
                    </Typography>
                    <TicketLinkOptions />
                    <Tooltip title="View Profile">
                      <IconButton onClick={() => toggleDialog('patientProfile', true)} size="small" sx={{ color: '#00a1ff' }}>
                        <i className="fa fa-id-card" />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Typography>
                    <strong>Patient Name:</strong><br />
                    {ticket.linked_patient_snapshot?.DOB ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MergeIcon color="success" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          {ticket.linked_patient_snapshot.Name}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>{ticket.patient_name}</Typography>
                    )}
                  </Typography>

                  <Typography>
                    <strong>Patient DOB:</strong><br />
                    {ticket.linked_patient_snapshot?.DOB ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <MergeIcon color="success" />
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                          {ticket.linked_patient_snapshot.DOB}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography>{ticket.patient_dob}</Typography>
                    )}
                  </Typography>

                  <Typography><strong>Phone:</strong><br />{ticket.phone}</Typography>
                  <Typography><strong>Callback Number:</strong><br />{ticket.callback_number}</Typography>
                </CardContent>
              </Card>

              <TicketNotes
                notes={notes}
                onAddNote={() => toggleDialog('note', true)}
                status={status}
              />
            </Box>
          </Grid>

          {/* Col 2 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '540px' }}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>
                    Call Information
                  </Typography>
                  <TicketIndicators ai_data={ticket.aiClassification} showTooltip iconsOnly />
                  <Typography><strong>Caller ID:</strong> {ticket.caller_id}</Typography>
                  <Typography><strong>Caller Name:</strong> {ticket.caller_Name}</Typography>
                  <Typography><strong>Call Reason:</strong> {ticket.call_reason}</Typography>
                  <Typography><strong>Summary:</strong> {ticket.summary}</Typography>
                  <Typography><strong>Creation Date:</strong> {ticket.creation_date}</Typography>
                </CardContent>
              </Card>

              <TicketAudio audioUrl={ticket.url_audio} title="Audio" status={status} />
            </Box>
          </Grid>

          {/* Col 3 */}
          <Grid item>
            <Box display="flex" flexDirection="column" gap={2} sx={{ width: '380px' }}>
              <TicketAssignee assigneeEmail={ticket.agent_assigned} status={status} />
              <TicketCollaborators collaborators={ticket.collaborators} status={status} />

              {/* QC Summary */}
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>
                      Quality Review
                    </Typography>
                    
                  </Box>

                  {qcHistory.length > 0 ? (
                    <Stack spacing={1}>
                      {qcHistory.map((h, idx) => (
                        <Stack
                          key={idx}
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Chip size="small" variant="outlined" label={`Score: ${h.score ?? '—'}/15`} />
                          {qc?.status ? (
                            <Chip
                              size="small"
                              label={h.status.replace('_',' ')}
                              sx={{
                                bgcolor: (qcColors[h.status] || qcColors.pending).bg,
                                color: (qcColors[h.status] || qcColors.pending).text,
                                fontWeight: 'bold'
                              }}
                            />
                            ) : (
                              <Chip size="small" label="No review" />
                          )}
                          <Typography variant="body2" color="text.secondary">
                            {toName(h.reviewer_email)}
                          </Typography>
                        </Stack>
                      ))}

                      <Box mt={1} display="flex" justifyContent="flex-end">
                        <Button size="small" variant="contained" onClick={() => setQcOpen(true)}>
                          View details
                        </Button>
                      </Box>
                    </Stack>
                  ) : (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        No quality review has been recorded for this ticket yet.
                      </Typography>
                      <Box display="flex" justifyContent="flex-end">
                        <Button size="small" variant="outlined" onClick={() => setQcOpen(true)}>
                          Start review
                        </Button>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: getStatusColor(status) }}>
                    Time on Task
                  </Typography>
                  <TicketWorkTime workTimeData={ticket.work_time} />
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Dialogs */}
      <AddNoteDialog
        open={openDialogs.note}
        onClose={() => toggleDialog('note', false)}
        onSubmit={handleAddNote}
        value={noteContent}
        onChange={(e) => setNoteContent(e.target.value)}
      />
      <PatientProfileDialog
        open={openDialogs.patientProfile}
        onClose={() => toggleDialog('patientProfile', false)}
        patientName={ticket.patient_name}
        patientDob={patientDob}
        patientPhone={ticket.phone}
      />
      <AlertSnackbar
        open={snackbar.open}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        severity={snackbar.severity}
        message={snackbar.message}
      />

      {/* QC Drawer */}
      <QcPanel
        open={qcOpen}
        onClose={() => setQcOpen(false)}
        ticket={ticket}
        disabled={qcSaving}
        onSubmit={async ({ rubric, outcome, score }) => {
          try {
            setQcSaving(true);
            // TODO: llama tu API de QC, ej:
            console.log(rubric, outcome, score);
            await addQcData(dispatch, setLoading, ticket.id, { rubric, outcome, score });
            // await saveQcReview({ ticketId: ticket.id, rubric, outcome, score });
            setSnackbar({ open: true, message: 'QC review saved', severity: 'success' });
            setQcOpen(false);
          } catch (e) {
            setSnackbar({ open: true, message: e?.message || 'Error saving QC review', severity: 'error' });
          } finally {
            setQcSaving(false);
          }
        }}
        onSetStatus={async (qcStatus) => {
          try {
            setQcSaving(true);
            // TODO: llama a tu API de estado QC:
            // await setQcStatus({ ticketId: ticket.id, status: qcStatus });
            setSnackbar({ open: true, message: `QC status set to ${qcStatus}`, severity: 'success' });
          } catch (e) {
            setSnackbar({ open: true, message: e?.message || 'Error setting QC status', severity: 'error' });
          } finally {
            setQcSaving(false);
          }
        }}
      />
    </>
  );
}
