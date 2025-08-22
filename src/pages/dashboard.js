import React from 'react';
import { Container } from '@mui/material';
import QcDashboard from '../components/components/qcDashboards/qcDashboard';

export default function QualityDashboardPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <QcDashboard />
    </Container>
  );
}
