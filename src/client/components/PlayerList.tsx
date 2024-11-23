import React, {useEffect, useState} from 'react';
import {useGameSessionSocket} from "./GameSessionSocketContext";
import {Player} from "../../shared/Player";
import {PlayerRoleEnum} from "../../shared/constants/PlayerRoleEnum";
import {getLogger} from "../../shared/config/LogConfig";

interface PlayerListProps {
}

const log = getLogger("client.components.PlayerList");

const PlayerList: React.FC<PlayerListProps> = ({}) => {
    const {session} = useGameSessionSocket();
    const [players, setPlayers] = useState<Player[] | null>(null);

    useEffect(() => {
        if (session) {
            // Listen for updates to the session and players
            setPlayers(session.getPlayersAsArray() || null);
            log.debug(`session ${session}`);
        }
    }, [session]);

    if (!players) {
        return <p className="text-white text-center">Waiting for players to join...</p>;
    }

    return (
        <div className="player-list text-white">
            <h2 className="text-center mb-3">Players in Lobby</h2>
            <ul className="list-group">
                {Object.entries(players).map(([key, player]) => (
                    <li
                        key={key}
                        className="list-group-item d-flex justify-content-between align-items-center"
                        style={{
                            backgroundColor: '#343a40',
                            color: '#fff',
                            border: '1px solid #fff',
                        }}>
                        <span>{player.getName()}</span>
                        {player.getRole() === PlayerRoleEnum.HOST && (
                            <span className="badge bg-success text-white">Host</span>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerList;
