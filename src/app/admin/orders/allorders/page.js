"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    Grid,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Typography,
    Paper,

} from "@mui/material";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";
import BasicDatePicker from "@/components/share/form/DatePicker";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormInput from "@/components/share/form/FormInput";
import LayoutHeader from "@/app/layoutHearTitle";

import {
    useDraggable,
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    useDroppable,
} from "@dnd-kit/core";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AllOrder() {


    const { data: session, status } = useSession();
    const [currentChef, setCurrentChef] = useState();
    const router = useRouter();
    // Ensure client-side checks for localStorage usage

    useEffect(() => {
        if (status === "loading") {
            console.log("Session is loading...");
        } else if (status === "unauthenticated") {
            console.log("User is not authenticated");
            router.push("/login"); // Redirect unauthenticated users
        } else if (session?.user?.email) {
            console.log("Authenticated user email:", session.user.email);
            if (session.user.email !== undefined || null)
                setCurrentChef(session.user.email)
            localStorage.setItem("loginChef", session.user.email)
        }
    }, [status, session, router]);


    const today = dayjs();

    const { control, handleSubmit, watch } = useForm({
        defaultValues: {
            startDateRange: today,
            endDateRange: today,
        },
    });
    const startDate = watch("startDateRange");
    const endDate = watch("endDateRange");


    // useEffect hook to load data from local storage on initial render
    const [columns, setColumns] = useState({
        allOrders: [],
        preparing: [],

        delivered: [],
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedData = JSON.parse(localStorage.getItem("dragDropData"));
            if (savedData) {
                // Sort data in descending order by `id`
                setColumns(savedData);
            }
        }
    }, []);


    useEffect(() => {
        // Check if `newChefOrderDataList` already exists in localStorage
        const storedData = JSON.parse(localStorage.getItem('particularChefOrder'));
        const storedLoginChef = localStorage.getItem("loginChef")
        if (storedData) {
            try {
                // Check if the specific chef's data exists
                if (storedData.hasOwnProperty(storedLoginChef)) {
                    const parsedData = storedData[storedLoginChef]; // Extract the chef's data

                    // Only set `newChefOrderDataList` if it does not already exist
                    if (!localStorage.getItem('newChefOrderDataList')) {
                        localStorage.setItem('newChefOrderDataList', JSON.stringify(parsedData));
                    }

                    // Format and update state as necessary
                    const formattedOrders = parsedData.map((order) => ({
                        ...order,
                        date: dayjs(order.date).format('YYYY-MM-DD'),
                    }));

                    setColumns((prev) => {
                        const preparingIds = prev.preparing.map(order => order.id);
                        const deliveredIds = prev.delivered.map(order => order.id);

                        return {
                            ...prev,
                            allOrders: formattedOrders.sort((a, b) => b.id - a.id)
                                .filter(order => !preparingIds.includes(order.orderId) && !deliveredIds.includes(order.orderId))
                                .map(order => ({
                                    id: order.orderId,
                                    date: order.date,
                                    items: order.items,
                                })),
                            preparing: prev.preparing,
                            delivered: prev.delivered
                        };
                    });
                } else {
                    setColumns({
                        allOrders: [],
                        preparing: [],
                        delivered: []
                    })
                    // localStorage.setItem('newChefOrderDataList', JSON.stringify([]));

                }
            } catch (error) {
                console.error('Error parsing stored data:', error);
            }
        } else {
            console.warn('No stored data found.');
        }

    }, [session]); // Empty dependency array to run only once on component mount

    // Update localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem("dragDropData", JSON.stringify(columns));
    }, [columns]);

    // Initialize the drag-and-drop sensors
    const sensors = useSensors(useSensor(PointerSensor));

    // Filter data based on the form submission
    const onSubmit = ({ startDateRange, endDateRange, orderNumber }) => {
        // Format date range
        const start = startDateRange ? dayjs(startDateRange).format("YYYY-MM-DD") : null;
        const end = endDateRange ? dayjs(endDateRange).format("YYYY-MM-DD") : null;

        // Reload the original data from localStorage
        const dataDrag = JSON.parse(localStorage.getItem("dragDropData"))


        const filterOrders = dataDrag.filter((order) => {
            const orderDate = order.date;

            const isOrderMatch = orderNumber
                ? order.id.toString() === orderNumber.toString()
                : true;

            const isDateInRange = start && end
                ? orderDate >= start && orderDate <= end
                : true;

            return isOrderMatch && isDateInRange;
        });


        // Apply filters to each category



        // Update state with the filtered data
        setColumns(filterOrders);
    };


    // Handle the end of a drag-and-drop operation
    const handleDragEnd = (event) => {
        const { active, over } = event;
        // Exit if no drop target exists
        if (!over) return;

        // Find the source column where the item was initially located
        const sourceColumn = Object.keys(columns).find((key) =>
            columns[key].some((item) => item.id === active.id)
        );

        // Identify the destination column where the item is dropped
        const destinationColumn = over.id;

        // Check  source and destination columns are valid and different
        if (sourceColumn && destinationColumn && sourceColumn !== destinationColumn) {
            setColumns((prev) => {
                // Clone the current source and destination columns
                const sourceItems = [...prev[sourceColumn]];
                const destinationItems = [...prev[destinationColumn]];

                // Find and remove the item from the source column
                const [movedItem] = sourceItems.splice(
                    sourceItems.findIndex((item) => item.id === active.id),
                    1
                );
                // Add the item to the destination column
                destinationItems.push(movedItem);
                // Update the state with the new order of items in both columns
                return {
                    ...prev,
                    [sourceColumn]: sourceItems,
                    [destinationColumn]: destinationItems,
                };

            });
        }
    };

    // Droppable component for columns
    const Droppable = ({ id, children }) => {
        const { setNodeRef } = useDroppable({ id });
        return (
            <div
                ref={setNodeRef}
                className="bg-gray-100 p-4 border  min-h-[200px]"
                style={{ minHeight: "200px", padding: "16px", border: "1px solid gray" }}
            >
                {children}
            </div>
        );
    };


    // Draggable component for task cards
    const Draggable = ({ id, children }) => {
        const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

        // Define the style for the draggable element
        const style = {
            transform: transform
                ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
                : undefined,
        };
        return (
            <div
                ref={setNodeRef}
                style={{ ...style, cursor: "grab" }}
                {...listeners}
                {...attributes}
                className="p-2 border  rounded  shadow-md grid justify-center"
            >
                {children}
            </div>
        );
    };

    return (
        <>
            <LayoutHeader pageTitle="All Orders" />
            <Paper sx={{ padding: 3, marginBottom: 4, boxShadow: 3 }}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3} sm={4}>
                            <BasicDatePicker
                                name="startDateRange"
                                control={control}
                                maxDate={endDate}
                            />
                        </Grid>
                        <Grid item xs={3} sm={4}>
                            <BasicDatePicker
                                name="endDateRange"
                                control={control}
                                minDate={startDate}
                            />
                        </Grid>
                        <Grid item xs={3} sm={3}>
                            <FormInput
                                name="orderNumber"
                                control={control}
                                inputType="number"
                                placeholder="Order ID"
                            />
                        </Grid>
                        <Grid item xs={2} sm={1}>
                            <Button type="submit" variant="contained" color="error">
                                Apply
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
            <DndContext
                className="!bg-red-100"
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                {/* Render columns dynamically based on state */}
                <div className="grid grid-cols-3 gap-4 p-4 !bg-red-100">
                    {Object.keys(columns).map((columnId) => (
                        <div key={columnId} className="flex flex-col">
                            <div className="bg-red-600 py-2">
                                <h3 className="text-lg font-bold capitalize text-center text-white">{columnId}</h3></div>
                            <Droppable id={columnId}>
                                {columns[columnId].map((task) => (
                                    <Draggable key={task.id} id={task.id} className="" >
                                        {/* Display each task as a Material-UI Card */}
                                        <Card sx={{ width: 400, bgcolor: "#dcdcdc;", padding: 2, border: "1px solid #b6b6b6" }}>
                                            <Typography >
                                                {`Order ID: ${task.id}`}
                                            </Typography>

                                            <CardContent className="grid">
                                                <Typography variant="p" className="text-2xl">
                                                    {task?.items[0]?.name}
                                                </Typography>

                                                <div className="flex gap-4 py-2">
                                                    <Typography variant="body2">
                                                        Quantity: {task?.items[0]?.quantity}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        Type:  {task?.items[0]?.type}
                                                    </Typography>

                                                </div>
                                                <Typography className="text-gray-500" variant="body2">
                                                    {task.date}
                                                </Typography>
                                            </CardContent>

                                            {/* Accordion for additional item details */}
                                            {task?.items?.length > 1 && (
                                                <Accordion>
                                                    <AccordionSummary className="" expandIcon={<ExpandMoreIcon />} onPointerDown={(e) => e.stopPropagation()} >
                                                        More
                                                    </AccordionSummary >

                                                    <AccordionDetails className="!p-0">
                                                        {task?.items?.slice(1)?.map((item, index) => (
                                                            <div key={index} className=" items-center gap-2">

                                                                <CardContent className="mb-2" sx={{ bgcolor: "#dcdcdc;", }}>
                                                                    <Typography variant="p" className="">
                                                                        {item.name}
                                                                    </Typography>
                                                                    <div className="flex gap-2">
                                                                        <Typography variant="body2">
                                                                            Quantity: {item.quantity}
                                                                        </Typography>
                                                                        <Typography variant="body2">
                                                                            Type: {item.type}
                                                                        </Typography>
                                                                    </div>
                                                                </CardContent>
                                                            </div>
                                                        ))}
                                                    </AccordionDetails>
                                                </Accordion>
                                            )}
                                        </Card>
                                    </Draggable>
                                ))}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DndContext>
        </>
    );
}
