import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Button, Typography } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

const Room = props => {
    
    const[votesToSkip, setVotesToSkip] = useState(2);
    const[guestCanPause, setGuestCanPause] = useState(false);
    const[isHost, setIsHost] = useState(false);
    const[showSetings, setShowSettings] = useState(false);
    const[spotifyAuthenticated, setSpotifyAuthenticated] = useState(false);
    const[song, setSong] = useState({});
    const { roomCode } = useParams();

    const navigate = useNavigate();
    
    useEffect(() => {
        const interval = setInterval(getCurrentSong, 1000);
        return () => clearInterval(interval);
    }, []);

    const authenticateSpotify = () => {
        fetch('/spotify/is-authenticated')
            .then((response) => response.json())
            .then((data) => {
                setSpotifyAuthenticated(data.status);
                if (!data.status) {
                    fetch('/spotify/get-auth-url')
                        .then((response) => response.json())
                        .then((data) => {
                            window.location.replace(data.url);
                        });
                }
            });
    } 

    const getRoomDetails = () => {
        fetch('/api/get-room?code='+roomCode)
        .then((response) => {
            if (!response.ok) {
                props.leaveRoomCallback();
                navigate("/");
            }
            return response.json();
        })
        .then((data) => {
            setVotesToSkip(data.votes_to_skip);
            setGuestCanPause(data.guest_can_pause);
            setIsHost(data.is_host);
            
        });
        if(isHost) {
            authenticateSpotify();
        }
    }

    const getCurrentSong = () => {
        fetch("/spotify/current-song")
            .then((response) => {
                if (!response.ok) {
                return {};
                } else {
                return response.json();
                }
            })
            .then((data) => {
                setSong(data);
                console.log(data);
            });
    }

    getRoomDetails();
    
    const leaveButtonPressed = () => {
        const requestOptions = {
            method: "POST",
            headers: {"Content-Type":"application/json"},
        };
        fetch("/api/leave-room", requestOptions)
        .then((_response) => {
            props.leaveRoomCallback();
            navigate("/");
        });
    }

    const updateShowSettings = (value) => {
        setShowSettings(value);
    }

    const renderSettings = (
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
                <CreateRoomPage 
                    update={true} 
                    votesToSkip={votesToSkip} 
                    guestCanPause={guestCanPause}
                    roomCode={roomCode}
                    updateCallback={getRoomDetails}>
                </CreateRoomPage>
            </Grid>
            <Grid item xs={12} align="center">
            <Button variant="contained" color="secondary" onClick={() => updateShowSettings(false)}>
                Close
            </Button>
            </Grid>
        </Grid>
    )

    const renderSettingsButton = (
        <Grid item xs={12} align="center">
            <Button variant="contained" color="primary" onClick={() => updateShowSettings(true)}>
                Settings
            </Button>
        </Grid>
    )

    if (showSetings) {
        return renderSettings;
    }
    return (
        <Grid container spacing={1}>
            <MusicPlayer {...song}/>
            <Grid item xs={12} align="center">
                <Typography component="h4" variant="subtitle2">
                    Code = {roomCode}
                </Typography>
            </Grid>
            {isHost ? renderSettingsButton : null}
            <Grid item xs={12} align="center">
                <Button color="secondary" variant="contained" onClick={leaveButtonPressed}>
                    Leave Room
                </Button>
            </Grid>
        </Grid>
    )
}

export default Room
