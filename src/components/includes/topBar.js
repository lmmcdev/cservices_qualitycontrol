import {
  Card, CardContent, Typography, Stack
} from '@mui/material';

export default function Topbar() {

  return (
    <>
      <Card
        sx={{
          position: 'fixed',
          top: 40,
          left: 220,
          right: 20,
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderRadius: 2,
          backgroundColor: '#fff',
          boxShadow: '0px 4px 12px rgba(239, 241, 246, 1)',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingY: 2,
            paddingX: 3,
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="p" sx={{ minWidth: 160, color: 'text.secondary', fontWeight: 'bold' }}>
            Quality Control
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            

            

            
          </Stack>
        </CardContent>
      </Card>

      
    </>
  );
}