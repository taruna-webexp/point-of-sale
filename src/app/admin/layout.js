"use client";
import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import TemporaryDrawer from "@/components/Drawer";
import Navbar from "@/components/common/Navbar";

export default function AdminLayout({ children }) {
    const [open, setOpen] = useState(true); // Default drawer is open

    return (
        <>
            <div>
                {/* Navbar */}

                <Navbar open={open} setOpen={setOpen} />

                <Grid container>
                    {/* Drawer Section */}
                    <Grid
                        item
                        sx={{
                            width: open ? 250 : 0, // Adjust width based on Drawer state
                            transition: "width 0.3s ease", // Smooth transition
                            height: "100vh", // Full height
                            backgroundColor: "#f4f4f4", // Background color for the drawer
                            position: "relative",
                            // For centering the toggle button
                        }}
                    >
                        {/* Drawer Component */}
                        <TemporaryDrawer open={open} setOpen={setOpen} />


                    </Grid>

                    {/* Main Content Section */}
                    <Grid
                        className="!m-0"
                        item
                        xs
                        sx={{
                            marginLeft: open ? "250px" : "0", // Adjust margin dynamically
                            padding: 2,

                        }}
                    >
                        {children}
                    </Grid>
                </Grid>
            </div>
        </>
    );
}