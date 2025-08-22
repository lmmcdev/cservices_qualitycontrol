// src/components/qc/QcHistogramCard.jsx
import React from 'react';
import { Card, CardHeader, CardContent, Typography, Box } from '@mui/material';
import {
  ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip as RTooltip,
} from 'recharts';

const SURFACE_LINE = '#E5E7EB';
const PRIMARY = '#0B61D9';

/**
 * Props:
 * - data: [{ label: '0–5', count: number }, ...]
 */
export default function QcHistogramCard({ data = [] }) {
  const total = data.reduce((a, b) => a + (b.count || 0), 0);

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardHeader
        title="Score Distribution"
        subheader={`Total evaluations: ${total}`}
      />
      <CardContent>
        {data.length === 0 ? (
          <Typography color="text.secondary">No data</Typography>
        ) : (
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 4 }}>
                <CartesianGrid stroke={SURFACE_LINE} strokeDasharray="3 3" />
                <XAxis dataKey="label" />
                <YAxis allowDecimals={false} />
                <RTooltip />
                <Bar dataKey="count" fill={PRIMARY} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
