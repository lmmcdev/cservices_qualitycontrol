// src/components/qc/QcKpiRow.jsx
import React from 'react';
import { Grid, Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

/**
 * Props:
 * - failRate: number (0-100)
 * - coachingRate: number (0-100)
 * - weakestCriterion: { name: string, value: number } | null
 */
export default function QcKpiRow({ failRate = 0, coachingRate = 0, weakestCriterion = null }) {
  const items = [
    {
      title: 'Fail Rate',
      value: `${Number(failRate).toFixed(2)}%`,
      progress: Math.min(100, Math.max(0, Number(failRate))),
      helper: 'Porcentaje de evaluaciones con outcome = failed',
    },
    {
      title: 'Coaching Rate',
      value: `${Number(coachingRate).toFixed(2)}%`,
      progress: Math.min(100, Math.max(0, Number(coachingRate))),
      helper: 'Porcentaje con outcome = coaching_required',
    },
    {
      title: 'Weakest Criterion',
      value: weakestCriterion ? `${weakestCriterion.name} (${weakestCriterion.value.toFixed(2)}/3)` : '—',
      progress: weakestCriterion ? (weakestCriterion.value / 3) * 100 : 0,
      helper: 'Criterio con menor promedio (0–3)',
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 1 }}>
      {items.map((it, idx) => (
        <Grid key={idx} item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">{it.title}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{it.value}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <LinearProgress variant="determinate" value={it.progress} />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(it.progress)}%
                </Typography>
              </Box>
              <Typography variant="caption" color="text.secondary">{it.helper}</Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
