import { List } from '@mui/material';
import { BalloonRequestDTO, UserRole } from '../types';
import { BalloonItem } from './BalloonItem';

interface BalloonListProps {
  balloons: BalloonRequestDTO[];
  showActions?: boolean;
  userRole?: UserRole;
  onMarkReady?: (balloon: BalloonRequestDTO) => void;
  onPickup?: (balloon: BalloonRequestDTO) => void;
  onDelivery?: (balloon: BalloonRequestDTO) => void;
  onRevert?: (balloon: BalloonRequestDTO) => void;
  onRevertToReady?: (balloon: BalloonRequestDTO) => void;
  onRevertToPending?: (balloon: BalloonRequestDTO) => void;
}

export const BalloonList = ({
  balloons,
  showActions = true,
  userRole,
  onMarkReady,
  onPickup,
  onDelivery,
  onRevert,
  onRevertToReady,
  onRevertToPending,
}: BalloonListProps) => {
  const sortedBalloons = [...balloons].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <List>
      {(Array.isArray(sortedBalloons) ? sortedBalloons : []).map((balloon) => (
        <BalloonItem
          key={balloon.id}
          balloon={balloon}
          showActions={showActions}
          userRole={userRole}
          onMarkReady={onMarkReady}
          onPickup={onPickup}
          onDelivery={onDelivery}
          onRevert={onRevert}
          onRevertToReady={onRevertToReady}
          onRevertToPending={onRevertToPending}
        />
      ))}
    </List>
  );
}; 