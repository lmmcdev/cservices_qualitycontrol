import React, { useMemo, useState } from 'react';
import {
  Box, Card, CardContent, CardHeader, Grid, Typography,
  Stack, TextField, Button, Chip, Skeleton, Alert, IconButton, Tooltip, Autocomplete
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import {
  ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip as RTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Line, AreaChart, Area
} from 'recharts';

// ✅ Asegúrate de que el nombre del archivo y ruta coincidan EXACTAMENTE
import QcKpiRow from './qcKpiRows';
import QcHistogramCard from './qcHistogramCard';

import useQcStats from '../../hooks/useQcStats';

const OUTCOME_COLORS = ['#00B8A3', '#FF3B69', '#7C3AED', '#0B61D9', '#FDB022', '#4B5563'];
const PRIMARY = '#0B61D9';
const ACCENT = '#00B8A3';
const SURFACE_LINE = '#E5E7EB';

const fmtWeek = (w) => w;

export default function QcDashboard() {
  const todayIso = new Date().toISOString().slice(0, 10);
  const thirtyAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(thirtyAgo);
  const [to, setTo] = useState(todayIso);
  const [agent, setAgent] = useState(null);

  const { data, loading, err, refetch, agents } = useQcStats({ from, to, agent });

  // === Nuevos campos ===
  const histogramData = useMemo(() => data?.histogram ?? [], [data]);
  const failRate = data?.failRate ?? 0;
  const coachingRate = data?.coachingRate ?? 0;
  const weakestCriterion = data?.weakestCriterion ?? null;

  // === Existentes ===
  const pieData = useMemo(() => {
    if (!data?.outcomes) return [];
    return Object.entries(data.outcomes)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const barData = useMemo(() => {
    if (!data?.avgScores) return [];
    return [...data.avgScores]
      .map(d => ({ ...d, avgScore: Number(d.avgScore) }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, [data]);

  const trendData = useMemo(() => {
    if (!data?.trend) return [];
    return [...data.trend]
      .map(d => ({ ...d, avgScore: Number(d.avgScore) }))
      .sort((a, b) => a.week.localeCompare(b.week));
  }, [data]);

  /*const rubricData = useMemo(() => {
    if (!data?.rubricAvg) return [];
    return Object.entries(data.rubricAvg).map(([criterion, value]) => ({
      criterion,
      value: Number(value),
    }));
  }, [data]);*/

  const totalEvals = useMemo(() => pieData.reduce((a, b) => a + b.value, 0), [pieData]);
  const topOutcome = useMemo(() => (pieData[0]?.name || '—'), [pieData]);

  const Filters = (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
      <TextField
        type="date" size="small" label="From" value={from}
        onChange={e => setFrom(e.target.value)} InputLabelProps={{ shrink: true }}
      />
      <TextField
        type="date" size="small" label="To" value={to}
        onChange={e => setTo(e.target.value)} InputLabelProps={{ shrink: true }}
      />
      <Autocomplete
        options={agents}
        size="small"
        sx={{ minWidth: 240 }}
        value={agent}
        onChange={(_, val) => setAgent(val)}
        renderInput={(params) => <TextField {...params} label="Agent" placeholder="All agents" />}
        clearOnEscape
      />
      <Button variant="contained" onClick={refetch} startIcon={<RefreshIcon />}>
        Apply
      </Button>
    </Stack>
  );

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardHeader
          title="Quality Control — Metrics"
          subheader={data?.message || 'Aggregations from qc_evaluations'}
          action={Filters}
          sx={{ pb: 0 }}
        />
        <CardContent sx={{ pt: 2 }}>
          {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

          {/* KPIs arriba de todo */}
          <QcKpiRow
            failRate={failRate}
            coachingRate={coachingRate}
            weakestCriterion={weakestCriterion}
          />

          {loading ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} /></Grid>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} /></Grid>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={320} /></Grid>
              <Grid item xs={12} md={6}><Skeleton variant="rounded" height={320} /></Grid>
            </Grid>
          ) : (
            <Grid container spacing={2}>
              {/* === ARRIBA === */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader
                    title="Outcomes"
                    subheader={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip label={`Total: ${totalEvals}`} size="small" />
                        <Chip label={`Top: ${topOutcome}`} size="small" />
                        <Tooltip title="Distribución de resultados (passed/failed/coaching...)">
                          <IconButton size="small"><InfoOutlinedIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </Stack>
                    }
                  />
                  <CardContent>
                    {pieData.length === 0 ? (
                      <Typography color="text.secondary">No data</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <PieChart>
                            <RTooltip />
                            <Legend verticalAlign="bottom" height={28} />
                            <Pie
                              data={pieData}
                              dataKey="value"
                              nameKey="name"
                              innerRadius="55%"
                              outerRadius="82%"
                              stroke="#fff"
                              strokeWidth={1}
                              paddingAngle={2}
                            >
                              {pieData.map((_, i) => (
                                <Cell key={i} fill={OUTCOME_COLORS[i % OUTCOME_COLORS.length]} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader title="Average Score by Agent" subheader="Promedio (0–15)" />
                  <CardContent>
                    {barData.length === 0 ? (
                      <Typography color="text.secondary">No data</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 260 }}>
                        <ResponsiveContainer>
                          <BarChart data={barData} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
                            <CartesianGrid stroke={SURFACE_LINE} strokeDasharray="3 3" />
                            <XAxis dataKey="agent" tick={{ fontSize: 12 }} interval={0} />
                            <YAxis domain={[0, 15]} />
                            <RTooltip />
                            <Bar dataKey="avgScore" fill={PRIMARY} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* === ABAJO === */}
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardHeader title="Score Trend (Weekly)" subheader="Promedio semanal del score" />
                  <CardContent>
                    {trendData.length === 0 ? (
                      <Typography color="text.secondary">No data</Typography>
                    ) : (
                      <Box sx={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                          <AreaChart data={trendData} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
                            <defs>
                              <linearGradient id="gradScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={ACCENT} stopOpacity={0.6}/>
                                <stop offset="95%" stopColor={ACCENT} stopOpacity={0.05}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid stroke={SURFACE_LINE} strokeDasharray="3 3" />
                            <XAxis dataKey="week" tickFormatter={fmtWeek} />
                            <YAxis domain={[0, 15]} />
                            <RTooltip />
                            <Area type="monotone" dataKey="avgScore" stroke={ACCENT} fill="url(#gradScore)" />
                            <Line type="monotone" dataKey="avgScore" stroke={ACCENT} dot={{ r: 2 }} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* 🔥 Histograma en el cuadrante inferior derecho */}
              <Grid item xs={12} md={6}>
                <QcHistogramCard data={histogramData} />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
