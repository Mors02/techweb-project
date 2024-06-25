import { axiosConfig } from '../config/axiosConfig';
import { React, useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Button } from '@mui/material';
import { FaPlus } from "react-icons/fa";
import Box from '@mui/material/Box';
import GameList from './GameList';
import useCurrentUser from '../config/UseCurrentUser';

function UserGamesPage() {
    const [games, setGames] = useState([])
    const { user, userLoading } = useCurrentUser()
    const navigate = useNavigate()

    useEffect(() => {
        axiosConfig.get('/api/your-games/')
            .then(res => {
                    setGames(res.data)
                }
            )
    }, [])

    function handleClick(game) {
        if (game.publisher == user.id)
            return navigate('/games/' + game.id + '/edit')
        return navigate('/games/' + game.id)
    }

    if (!userLoading)
    return (
        <Box className='px-10 py-8'>
            <GameList games={games} handleClick={handleClick} />

            <Button className='!mt-6' variant='contained'>
                <FaPlus className='mr-2' /><Link to="/publish">Nuovo Gioco</Link>
            </Button>
        </Box>
    );
}

export default UserGamesPage;