// src/components/qc/QcPanel.jsx
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Drawer, Box, CardContent, Typography, Chip, Divider,
  TextField, Button, Rating, Stack, Tooltip, IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
//import { addQcData } from '../../utils/apiTickets';

const statusColor = {
  pending:    { bg: '#FFF5DA', text: '#B08500' },
  in_review:  { bg: '#E7F0FF', text: '#0B61D9' },
  passed:     { bg: '#DAF8F4', text: '#00B8A3' },
  failed:     { bg: '#FFE2EA', text: '#FF3B69' },
  coaching_required: { bg: '#EAE8FA', text: '#7C3AED' },
};

export default function QcPanel({
  open,
  onClose,
  ticket,
  onSubmit,      // async ({ rubric, outcome, score })
  onSetStatus,   // async (statusStr)
  disabled,
  width = 420,
}) {
  const qc = ticket?.qc || {};
  const [rubric, setRubric] = useState({
    compliance: qc?.rubric?.compliance ?? 0,
    accuracy: qc?.rubric?.accuracy ?? 0,
    process: qc?.rubric?.process ?? 0,
    softSkills: qc?.rubric?.softSkills ?? 0,
    documentation: qc?.rubric?.documentation ?? 0,
    comments: qc?.rubric?.comments ?? '',
  });
  const [outcome, setOutcome] = useState(
    qc?.status && ['passed','failed','coaching_required'].includes(qc.status)
      ? qc.status
      : 'passed'
  );

  useEffect(() => {
    setRubric({
      compliance: qc?.rubric?.compliance ?? 0,
      accuracy: qc?.rubric?.accuracy ?? 0,
      process: qc?.rubric?.process ?? 0,
      softSkills: qc?.rubric?.softSkills ?? 0,
      documentation: qc?.rubric?.documentation ?? 0,
      comments: qc?.rubric?.comments ?? '',
    });
    setOutcome(qc?.status && ['passed','failed','coaching_required'].includes(qc.status) ? qc.status : 'passed');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticket?.id, JSON.stringify(qc)]);

  const score = useMemo(
    () => (rubric.compliance + rubric.accuracy + rubric.process + rubric.softSkills + rubric.documentation),
    [rubric]
  );

  const s = statusColor[qc?.status || 'pending'] || {};
  const handleChange = useCallback((k, v) => setRubric(r => ({ ...r, [k]: v || 0 })), []);
  const handleDrawerClose = useCallback(() => { if (!disabled) onClose?.(); }, [disabled, onClose]);

  const handleSave = useCallback(async () => {
    if (!disabled) await onSubmit?.({ rubric, outcome, score });
  }, [disabled, onSubmit, rubric, outcome, score]);

  const handleMarkInReview = useCallback(async () => {
    if (!disabled) await onSetStatus?.('in_review');
  }, [disabled, onSetStatus]);

  const container = typeof document !== 'undefined' ? document.body : undefined;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleDrawerClose}
      variant="temporary"
      keepMounted
      container={container}
      // SÚBELE el z-index para estar por encima de cualquier contenedor fijo
      sx={{
        zIndex: (theme) => ((theme?.zIndex?.modal ?? 1300) + 2),
        '& .MuiDrawer-paper': {
          width,
          overflow: 'hidden',
          boxShadow: 4,
        },
      }}
      ModalProps={{
        keepMounted: true,
        disableEscapeKeyDown: !!disabled,
      }}
    >
      {/* Header */}
      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'space-between', p:2, borderBottom:'1px solid #e0e0e0' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight="bold">Quality Review</Typography>
          <Chip
            label={qc?.status ? qc.status.replace('_',' ') : 'pending'}
            sx={{ bgcolor: s.bg, color: s.text, fontWeight: 'bold' }}
          />
        </Box>
        <IconButton onClick={handleDrawerClose} disabled={disabled} aria-label="Close QC panel">
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ height: '100%', overflowY: 'auto' }}>
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={1} mb={2}>
            <Typography variant="body2">Call Duration: {ticket?.call_duration || 0} min</Typography>
            <Typography variant="body2">Priority: {ticket?.aiClassification?.priority || '—'}</Typography>
            <Typography variant="body2">Risk: {ticket?.aiClassification?.risk || '—'}</Typography>
            <Typography variant="body2">Category: {ticket?.aiClassification?.category || '—'}</Typography>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Stack spacing={2}>
            {[
              ['Compliance','compliance'],
              ['Accuracy','accuracy'],
              ['Process','process'],
              ['Soft skills','softSkills'],
              ['Documentation','documentation'],
            ].map(([label, key]) => (
              <Box key={key} display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ mr: 2 }}>{label}</Typography>
                <Rating value={rubric[key]} onChange={(_, v) => handleChange(key, v)} max={3} />
              </Box>
            ))}

            <TextField
              label="QC comments"
              multiline
              minRows={3}
              value={rubric.comments}
              onChange={e => handleChange('comments', e.target.value)}
            />
          </Stack>

          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <Chip label={`Score: ${score}/15`} color="primary" variant="outlined" />
            <TextField
              select size="small" label="Outcome" value={outcome}
              onChange={e => setOutcome(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="coaching_required">Coaching</option>
            </TextField>
          </Box>

          <Stack direction="row" spacing={1} mt={3} justifyContent="flex-end">
            <Tooltip title="Mark as In review">
              <span>
                <Button variant="outlined" disabled={disabled} onClick={handleMarkInReview}>
                  In review
                </Button>
              </span>
            </Tooltip>
            <Button variant="contained" disabled={disabled} onClick={handleSave}>
              Save review
            </Button>
          </Stack>
        </CardContent>
      </Box>
    </Drawer>
  );
}
