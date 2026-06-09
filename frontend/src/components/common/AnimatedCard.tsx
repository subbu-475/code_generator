import { type ReactNode } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import { type SxProps, type Theme } from '@mui/material/styles';

interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  delay?: number;
  glowColor?: string;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
  id?: string;
}

export default function AnimatedCard({
  children,
  onClick,
  delay = 0,
  glowColor,
  sx,
  contentSx,
  id,
}: AnimatedCardProps) {
  const animationStyle = {
    animation: `fadeInUp 0.5s ease ${delay}s both`,
  };

  const glowHover = glowColor
    ? {
        '&:hover': {
          borderColor: `${glowColor}50`,
          boxShadow: `0 8px 32px ${glowColor}25, 0 0 0 1px ${glowColor}20`,
          transform: 'translateY(-4px)',
        },
      }
    : {};

  const cardContent = (
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, ...contentSx }}>
      {children}
    </CardContent>
  );

  return (
    <Card
      id={id}
      sx={{
        ...animationStyle,
        cursor: onClick ? 'pointer' : 'default',
        ...glowHover,
        ...sx,
      }}
    >
      {onClick ? (
        <CardActionArea
          onClick={onClick}
          sx={{
            borderRadius: 'inherit',
            '& .MuiCardActionArea-focusHighlight': {
              background: 'transparent',
            },
          }}
        >
          {cardContent}
        </CardActionArea>
      ) : (
        cardContent
      )}
    </Card>
  );
}
