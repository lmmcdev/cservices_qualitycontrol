// src/components/customAudioPlayer.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import Replay10Icon from '@mui/icons-material/Replay10';
import Forward10Icon from '@mui/icons-material/Forward10';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { icons } from '../icons';

export default function CustomAudioPlayer({ src }) {
  const audio = useRef(new Audio(src));
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const a = audio.current;
    const onLoaded = () => setDuration(a.duration);
    const onTime = () => setTime(a.currentTime);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    return () => {
      a.pause();
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
    };
  }, []);

  useEffect(() => {
    playing ? audio.current.play() : audio.current.pause();
  }, [playing]);

  useEffect(() => {
    audio.current.volume = volume;
  }, [volume]);

  const formatTime = secs => {
    const m = Math.floor(secs / 60).toString().padStart(2,'0');
    const s = Math.floor(secs % 60).toString().padStart(2,'0');
    return `${m}:${s}`;
  };

  const seekTo = val => {
    audio.current.currentTime = val;
    setTime(val);
  };

  const skip = delta => {
    const newTime = Math.min(duration, Math.max(0, time + delta));
    seekTo(newTime);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: '10px',
        boxShadow: '0px 2px 8px #eff1f6',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: '#fff'
      }}
    >
      {/* skip/play group */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton onClick={() => skip(-10)} size="small">
          <Replay10Icon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={() => setPlaying(p => !p)}
          size="small"
          sx={{ width: 30, height: 30, color: '#111629' }}
        >
          {playing
            ? <icons.pause style={{ fontSize: 30, color: '#111629' }} />
            : <icons.play  style={{ fontSize: 30, color: '#111629' }} />
          }
        </IconButton>

        <IconButton onClick={() => skip(10)} size="small">
          <Forward10Icon fontSize="small" />
        </IconButton>
      </Box>

      {/* divider */}
      <Box
        sx={{
          width: '1px',
          bgcolor: '#eff1f6',
          alignSelf: 'stretch',
          mx: '4px'
        }}
      />

      {/* time & slider */}
      <Typography variant="caption" sx={{ width: 40, textAlign: 'right' }}>
        {formatTime(time)}
      </Typography>

      <Slider
        size="small"
        value={time}
        min={0}
        max={duration}
        onChange={(e, v) => seekTo(v)}
        sx={{
          flexGrow: 1,
          '& .MuiSlider-rail': {
            color: '#cccccc',  // rail más oscuro
            height: 4
          },
          '& .MuiSlider-track': {
            color: '#00a1ff',
            height: 4
          },
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            '&:hover, &.Mui-focusVisible': { boxShadow: 'none' }
          }
        }}
      />

      <Typography variant="caption" sx={{ width: 40, textAlign: 'left' }}>
        {formatTime(duration)}
      </Typography>

      {/* volume */}
      <VolumeUpIcon fontSize="small" />
      <Slider
        size="small"
        value={volume}
        min={0}
        max={1}
        step={0.01}
        onChange={(e, v) => setVolume(v)}
        sx={{ width: 80 }}
      />
    </Box>
  );
}
