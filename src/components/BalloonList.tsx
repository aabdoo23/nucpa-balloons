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
}

export const BalloonList = ({
  balloons,
  showActions = true,
  userRole,
  onMarkReady,
  onPickup,
  onDelivery,
  onRevert,
}: BalloonListProps) => {
  return (
    <List>
      {(Array.isArray(balloons) ? balloons : []).map((balloon) => (
        <BalloonItem
          key={balloon.id}
          balloon={balloon}
          showActions={showActions}
          userRole={userRole}
          onMarkReady={onMarkReady}
          onPickup={onPickup}
          onDelivery={onDelivery}
          onRevert={onRevert}
        />
      ))}
    </List>
  );
}; 