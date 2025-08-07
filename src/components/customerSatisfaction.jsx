// src/components/customerSatisfaction.jsx

import React from 'react';
import { Box, Card, Typography, Tooltip } from '@mui/material';
import {
  FaAngry,
  FaFrown,
  FaMeh,
  FaSmile,
  FaGrinStars,
} from 'react-icons/fa';
import StarIcon from '@mui/icons-material/Star';

const segments = [
  { Icon: FaAngry,     color: '#d32f2f', label: 'Very Low' },
  { Icon: FaFrown,     color: '#ff8a00', label: 'Low'      },
  { Icon: FaMeh,       color: '#fbc02d', label: 'Fair'     },
  { Icon: FaSmile,     color: '#8bc34a', label: 'Good'     },
  { Icon: FaGrinStars, color: '#4caf50', label: 'Very Good'    },
];

export default function CustomerSatisfaction() {
  const score = 89;
  const idx = Math.min(
    segments.length - 1,
    Math.floor((score / 100) * segments.length)
  );

  // Tamaño de icono responsive
  const getIconSize = () => {
    const w = window.innerWidth;
    if (w < 600) return 24;
    if (w < 900) return 32;
    return 40;
  };
  const iconSize = getIconSize();

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Card
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          height: '100%',
          borderRadius: 2,
          boxShadow: '0px 8px 24px rgba(239,241,246,1)',
        }}
      >
        {/* Caritas filled del color correspondiente */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mb: { xs: 2, sm: 3 },
          }}
        >
          {segments.map(({ Icon, color }, i) => (
            <Box
              key={i}
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={iconSize} color={color} />
            </Box>
          ))}
        </Box>

        {/* Barra segmentada + ícono Star + etiqueta */}
        <Box
          sx={{
            position: 'relative',
            display: 'flex',
            height: 12,
            borderRadius: 6,
            overflow: 'visible',
            mb: 4,
          }}
        >
          {/* segmentos de la barra */}
          {segments.map(({ color }, i) => (
            <Box key={i} sx={{ flex: 1, bgcolor: color }} />
          ))}

          {/* Ícono Star con tooltip al hacer hover */}
          <Tooltip title={`Customer satisfaction: ${score}%`} arrow>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: `${score}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                cursor: 'pointer',
              }}
            >
              <StarIcon
                sx={{
                  fontSize: { xs: 24, sm: 32, md: 40 },
                  fill: '#FFD700',
                  stroke: '#000000',
                  strokeWidth: 1,
                  strokeLinejoin: 'round',
                }}
              />
            </Box>
          </Tooltip>

          {/* Etiqueta justo debajo de la barra */}
          <Typography
            sx={{
              position: 'absolute',
              top: '100%',
              mt: 1,
              left: `${score}%`,
              transform: 'translateX(-50%)',
              fontWeight: 'bold',
              color: segments[idx].color,
              fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
              whiteSpace: 'nowrap',
            }}
          >
            {segments[idx].label.toUpperCase()}
          </Typography>
        </Box>
      </Card>
    </Box>
  );
}
