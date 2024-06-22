import React, { useState, useEffect } from "react";
import { axiosConfig, getCookie } from "../config/axiosConfig";
import Sidebar from "./Sidebar";
import { Container, Button, Box, Drawer, CircularProgress } from "@mui/material";
import { Container, Button, Box, Drawer, CircularProgress } from "@mui/material";
import ReorderIcon from '@mui/icons-material/Reorder';
import useCurrentUser from "../config/UseCurrentUser";
import { useAuth } from "../config/AuthContext";
import useCurrentUser from "../config/UseCurrentUser";
import { useAuth } from "../config/AuthContext";

function Layout(props) {
    const [open, toggleDrawer] = useState(false);
    const {loggedIn, loading} = useCurrentUser();
    const { isAuthenticated, login, logout } = useAuth();
    

    const {loggedIn, loading} = useCurrentUser();
    const { isAuthenticated, login, logout } = useAuth();
    

    return (
        
        
        <Box>
            {!loading? <>
                <Container class="min-h-12 bg-slate-500">
                    <div class="p-5">
                        LOGO HERE
                        <Button class="float-right" onClick={() => toggleDrawer(true)}><ReorderIcon /></Button>
                    </div>
                </Container>
                <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                    <Sidebar authUser={isAuthenticated} onSelect={() => toggleDrawer(false)}/>
                </Drawer>
                { props.children }  </> : <CircularProgress />
            }
        </Box>              
            {!loading? <>
                <Container class="min-h-12 bg-slate-500">
                    <div class="p-5">
                        LOGO HERE
                        <Button class="float-right" onClick={() => toggleDrawer(true)}><ReorderIcon /></Button>
                    </div>
                </Container>
                <Drawer open={open} onClose={() => toggleDrawer(false) } anchor="right">
                    <Sidebar authUser={isAuthenticated} onSelect={() => toggleDrawer(false)}/>
                </Drawer>
                { props.children }  </> : <CircularProgress />
            }
        </Box>              
    );
}

export default Layout