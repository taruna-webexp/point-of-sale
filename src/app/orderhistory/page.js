"use client";

import React, { useEffect, useState } from "react";
import LayoutHeader from "../layoutHearTitle";
import { List, ListItem, ListItemIcon, ListItemText, Avatar, Box } from "@mui/material";
import dayjs from "dayjs";

export default function OrderHistory() {
    const [myOrder, setMyOrder] = useState([]);

    useEffect(() => {
        // Fetch orders from localStorage
        const ordersData = JSON.parse(localStorage.getItem("myOrders")) || [];

        // Ensure each order.date is parsed as a dayjs object and sort by date (newest first)
        const formattedOrders = ordersData?.map(order => ({
            ...order, date: dayjs(order.date) // Parse date to dayjs
        }))
            .sort((a, b) => b.date - a.date); // Sort by date in descending order

        setMyOrder(formattedOrders);
    }, []);


    return (
        <>
            <LayoutHeader pageTitle="Order History" />
            {myOrder.length > 0 ? (
                <Box
                    sx={{
                        maxWidth: "lg",
                        boxShadow: 3,
                        borderRadius: 2,
                        padding: 4,
                        backgroundColor: "white",
                        margin: "0 auto",
                    }}
                >
                    <List>
                        {myOrder.map((order, index) => (
                            <div key={index} className="mb-8 shadow-xl pb-4">


                                {/* Items in the current order */}
                                <div className="bg-red-100 p-4 rounded-lg shadow-sm mb-4">
                                    <div className="mb-4 text-xl font-medium text-gray-600">
                                        <strong>Order Date:</strong> {order.date.format("YYYY-MM-DD HH:mm:ss")}
                                    </div>
                                    <div className="mb-4 text-l font-medium text-gray-500">
                                        <strong>Order Number:</strong> {order.orderId}
                                    </div>
                                    {order.items.map((item) => (
                                        <ListItem key={item.id} disablePadding className="py-4">
                                            <ListItemIcon>
                                                <Avatar alt={item.name} src={item.image} />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <span className="font-semibold text-gray-700">{item.name}</span>
                                                }
                                                secondary={
                                                    <span className="text-gray-500 text-sm">
                                                        Type: <span className="font-medium">{item.type}</span> | Price:{" "}
                                                        <span className="font-medium">${item.price}</span> | Quantity:{" "}
                                                        <span className="font-medium">{item.quantity}</span>
                                                    </span>
                                                }
                                            />
                                        </ListItem>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </List>
                </Box>
            ) : (
                <p className="text-center text-xl text-gray-600 mt-6">No orders found.</p>
            )}
        </>
    );
}
