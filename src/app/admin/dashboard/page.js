"use client";

import LayoutHeader from '@/app/layoutHearTitle';
import { Box, Grid, Typography } from '@mui/material';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import BarChart from '@/components/dashboard/chart/BarChart';

const Assignments = () => {
    const [chefs, setChefs] = useState([]);
    const [complete, setComplete] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [chartData, setChartData] = useState([]);

    useEffect(() => {
        const chefList = JSON.parse(localStorage.getItem("credentials")) || [];
        console.log("chefList:", chefList);
        setChefs(chefList);

        const completeData = JSON.parse(localStorage.getItem("dragDropData")) || {};
        console.log("completeData:", completeData);
        setComplete(completeData.delivered || []);
        setChartData(completeData)
        const data = JSON.parse(localStorage.getItem("chefOrderDataList")) || [];
        console.log("chefOrderDataList:", data);
        const formattedOrders = data.map(({ date, ...rest }) => ({
            ...rest,
            date: dayjs(date).format("YYYY-MM-DD"),
        }));
        setAllData(formattedOrders);
        setFilteredData(formattedOrders);
    }, []);

    const today = dayjs().format("YYYY-MM-DD");
    const todayOrdersCount = filteredData.filter((item) => item.date === today).length;
    const allOrdersCount = allData.length;
    const deliveredOrderCount = complete.length;

    return (
        <>
            <LayoutHeader pageTitle="Dashboard" />
            <Grid container spacing={2} className="!my-12 justify-center">
                {[
                    {
                        icon: <LocalPharmacyIcon className="!text-7xl" />,
                        label: "Today Orders",
                        value: todayOrdersCount,
                    },
                    {
                        icon: <MenuBookIcon className="!text-7xl" />,
                        label: "All Orders",
                        value: allOrdersCount,
                    },
                    {
                        icon: <SoupKitchenIcon className="!text-7xl" />,
                        label: "Delivered",
                        value: deliveredOrderCount,
                    },
                ].map((item, index) => (
                    <Grid item xs={4} key={index}>
                        <Box className="bg-slate-950 hover:bg-red-700 text-white py-4 px-4">
                            <Typography className="flex justify-between pb-5">
                                <span>{item.icon}</span>
                                <span className="!text-2xl">
                                    <b>{item.value}</b>
                                    <ArrowDropUpIcon />
                                </span>
                            </Typography>
                            <Typography>{item.label}</Typography>
                        </Box>
                    </Grid>
                ))}
            </Grid>
            <Grid container spacing={2} className="!my-12 justify-center">
                <BarChart data={chartData} />
            </Grid>
        </>
    );
};

export default Assignments;
