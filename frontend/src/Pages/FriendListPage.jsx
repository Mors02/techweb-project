import { Typography, Box, TextField, Stack, Button, Tabs, Tab } from "@mui/material";
import React, {useEffect, useState} from "react";
import { CiChat1 } from "react-icons/ci";
import { TbFriendsOff } from "react-icons/tb";
import { IoMdClose } from "react-icons/io";
import { axiosConfig } from "../config/axiosConfig";
import { toast } from "react-toastify";
import { ErrorMap } from "../config/enums";
import { FaCheck } from "react-icons/fa6";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'; 
import { useNavigate } from "react-router";

export function PanelTab(props) {
    const { children, value, index, ...other} = props;
    
    return (
        <Box
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <>{children}</>}
        </Box>
    )
}

export default function FriendListPage({onClick}) {
    const [value, setValue] = useState(0);
    const [friends, setFriends] = useState([])
    const [username, setUsername] = useState("")
    const [friendRequests, setFriendRequests] = useState([])
    const navigate = useNavigate()

    useEffect(() => {
        refreshFriendRequests()
        refreshFriends()
    }, [])

    const handleChange = (event, newValue) => {        
        setValue(newValue);
    };

    function refreshFriendRequests() {
        axiosConfig.get("/api/friend-requests/")
        .then((res) => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setFriendRequests(res.data)
        })
        .catch((err) => {
            toast.error(ErrorMap["ERR_SERVER_ERROR"]);
        })
    }

    function refreshFriends() {
        axiosConfig.get("/api/friends/")
        .then((res) => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            setFriends(res.data)
        })
        .catch((err) => {
            toast.error(ErrorMap["ERR_SERVER_ERROR"]);
        })
    }

    function sendRequest () {
        if (username == "") {
            toast.error("Username non può essere vuoto")
            return 
        }

        axiosConfig.post("api/friend-requests/", {username})
            .then((res) => {
                if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                    throw new Error(res["response"]["data"])
                toast.success("Richiesta inviata con successo.");
            })
            .catch((err) => {
                console.log(err)
                toast.error(ErrorMap[err.message])
            })
        
    }

    function closeRequest(id, status) {
        axiosConfig.patch("api/friend-requests/"+id, {status})
        .then(res => {
            if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                throw new Error(res["response"]["data"])
            if (status=="den")
                toast.success("Richiesta rifiutata.")
            else {
                toast.success("Richiesa accetta.")
            }
        })
        .catch((err) => {
            console.log(err)
            toast.error(ErrorMap[err.message])
        })
        .finally(() => {
            refreshFriendRequests()
            refreshFriends()   
        })
    }

    function deleteFriend(username, id) {
        confirmAlert({
            title: 'Vuoi annullare l\'amicizia con '+ username +'?',
            message: 'Potrai fare una nuova richiesta di amicizia quando vuoi.',
            buttons: [
            {
                label: 'Procedi',
                onClick: () => {
                    axiosConfig.delete("api/friends/"+id+"/")
                    .then(res => {
                        if (res.code == "ERR_BAD_REQUEST" || res.code == "ERR_BAD_RESPONSE")
                            throw new Error(res["response"]["data"])
                        toast.success("Amicizia annullata correttamente.")
                    })
                    .catch(err => {
                        toast.error(ErrorMap[err.message])
                    })
                    .finally(() => {
                        refreshFriends()
                    })
                }
            },
            {
                label: 'Indietro'
            }
            ]
        });        
    }

    function openChat(friend) {
        return navigate('/chat/' + friend.id, { state: { friend: friend } })
    }

    return (
        <>
        <Box className=" bg-slate-600 rounded-t-lg">
            <Tabs value={value} onChange={handleChange} >
                <Tab label="Amici" />
                <Tab label="Richieste" />
                <Button className=" rounded-2xl h-14" color="error" onClick={onClick}><IoMdClose className="w-6 h-6"/></Button>
            </Tabs>            
        </Box>
        
            <PanelTab value={value} index={0}>
                {friends.length == 0 && <Typography className="grid place-items-center justify-center !mt-4">Non hai nessun amico</Typography>}
                {friends.map(friend => (
                        <Stack direction={"row"} className="border-solid border-b-2 border-black">
                            {console.log(friend)}
                            <img className="object-cover rounded-full w-8 h-8 m-1" src={process.env.REACT_APP_BASE_URL + friend.profile_picture}/>
                            <Typography variant="h6" className="pl-4 py-1" ><a href={"/user/"+friend.id}>{friend.username}</a></Typography>
                            <CiChat1 onClick={() => openChat(friend)}className="ml-32 h-8 w-8 cursor-pointer" />
                            <TbFriendsOff onClick={() => deleteFriend(friend.username, friend.id)} className="ml-2 h-8 w-8 cursor-pointer" color="red"/>
                        </Stack>
                    ))}
            </PanelTab>
                                    
            <PanelTab value={value} index={1}>
                <Stack direction={"row"} className="border-solid border-b-2 border-black">
                    <TextField title="Username" label="Username" onChange={(event) => {setUsername(event.target.value)}} variant="standard"></TextField>
                    <Button variant="text" onClick={() => sendRequest()}>Invia richiesta</Button>
                </Stack>
                {friendRequests.map(request => (
                    <Stack direction={"row"} className="border-solid border-b-2 border-black">
                        {console.log(request)}
                        <img className="object-cover rounded-full w-8 h-8 m-1" src={process.env.REACT_APP_BASE_URL + request.profile_picture}/>
                        <Typography variant="h6" className="pl-4 py-1" ><a href={"/user/"+request.user_id}>{request.username}</a></Typography>
                        <FaCheck className="ml-32 h-8 w-8 cursor-pointer" color="green" onClick={() => closeRequest(request.id, "acc")} />
                        <IoMdClose className="ml-2 h-8 w-8 cursor-pointer" color="red" onClick={() => closeRequest(request.id, "den")}/>
                    </Stack>
                ))}
            </PanelTab>
              
        </>
    )
}