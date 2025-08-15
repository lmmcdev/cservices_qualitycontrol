import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Button from '@mui/material/Button';

const QualityButton = ({ status, onClick }) => {
  const isUnderRevision = status === true;
  return (
    <Button
      variant="outlined"
      startIcon={<CheckCircleOutlineIcon />}
      onClick={onClick}
      sx={{
        borderRadius: 6,
        textTransform: 'none',
        fontWeight: 500,
        px: 2.5,
        py: 1,
        borderColor: 'primary.main',
        color: 'primary.main',
        maxWidth: 200,
        marginLeft: 7,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'primary.main',
          color: 'white',
          borderColor: 'primary.main',
        },
      }}
    >
      {isUnderRevision ? 'Under Revision' : 'Set Under Revision'}
    </Button>
  );
};

export default QualityButton;
