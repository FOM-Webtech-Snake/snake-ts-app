import {Player} from "../../shared/model/Player";
import React from "react";
import {Badge, ListGroup} from "react-bootstrap";
import {PlayerStatusEnum} from "../../shared/constants/PlayerStatusEnum";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";

interface PlayerListItemProps {
    player: Player;
    isMobile?: boolean;
}

const PlayerListItem: React.FC<PlayerListItemProps> = ({player, isMobile = false}) => {
    const playerNameStyle = {
        maxWidth: isMobile ? '75px' : '100px',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    };

    const colorDotStyle = {
        width: isMobile ? '15px' : '20px',
        height: isMobile ? '15px' : '20px',
        backgroundColor: player.getColor(),
        borderRadius: '50%',
        border: '1px solid #fff',
        marginRight: isMobile ? '8px' : '10px',
    };

    return (
        <ListGroup.Item
            className={`d-flex justify-content-between align-items-center ${isMobile ? 'bg-transparent text-light p-1' : ''}`}
        >
      <span className="d-flex align-items-center">
        {player.getColor() && player.getStatus() !== PlayerStatusEnum.DEAD && (
            <div style={colorDotStyle}></div>
        )}
          {player.getStatus() === PlayerStatusEnum.DEAD && (
              <span
                  style={{
                      marginRight: '3px',
                      color: 'red',
                      fontSize: '0.9rem',
                  }}
                  title="Player is dead"
              >
            &#x2620;
          </span>
          )}
          <span style={playerNameStyle}>
          {player.getName()}
        </span>
      </span>
            <span>
        {player.getScore()}
                {player.getRole() === PlayerRoleEnum.HOST && (
                    <Badge bg="success" className="ms-2" style={{fontSize: '0.7rem'}}>H</Badge>
                )}
      </span>
        </ListGroup.Item>
    );
};

export default PlayerListItem;