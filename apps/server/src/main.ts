import { createServer } from 'http';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';

import type { EventUpdatePayload, SelectionPriceChangePayload, WebSocketMessage } from '@my-org/common';
import { getEvents, resetEvents } from './api/events';

// import { WsMessageType } from '@my-org/common';

enum WsMessageType {
    SelectionPriceChange = 'SelectionPriceChange',
    EventStatusUpdate = 'EventStatusUpdate',
    ScoreUpdate = 'ScoreUpdate',
}

const app = express();
const httpServer = createServer(app);

// Configure CORS for both HTTP and WebSocket
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: false,
};

app.use(cors(corsOptions));
app.use(express.json());

// Configure Socket.IO with CORS and better error handling
const io = new Server(httpServer, {
    cors: corsOptions,
    transports: ['websocket', 'polling'],
    pingTimeout: 30000,
    pingInterval: 25000,
    connectTimeout: 10000,
    allowEIO3: true,
});

// Store missed updates during client disconnections
const missedUpdates = new Map<string, WebSocketMessage<any>[]>();
let currentRevision = 3; // Start from revision 3 as per mock data

// Helper to increment revision
const incrementRevision = () => {
    currentRevision++;
    return currentRevision;
};

// API Routes
// Move these declarations to the top level so they can be reset

// Add this function to reset WebSocket state
const resetWebSocketState = () => {
    missedUpdates.clear();
    currentRevision = 3;
    io.emit('reset'); // Notify all clients
};

app.get('/api/health', (req, res) => {
    res.status(200).send('OK');
});
app.get('/api/events', getEvents);
// Modify the reset endpoint to reset both events and WebSocket state
app.post('/api/reset', (req, res) => {
    resetEvents(req, res);
    resetWebSocketState();
});

io.on('connection', (socket) => {
    console.log('⚡️ WebSocket connected:', socket.id);

    // Handle subscription requests with revision
    socket.on('subscribe', ({ channel, lastRevision }: { channel: string; lastRevision: number }) => {
        console.log('⚡️ Subscription request:', { channel, lastRevision });

        // Send missed updates if any
        const updates = missedUpdates.get(channel)?.filter((msg) => (msg.revision ?? 0) > lastRevision);
        if (updates?.length) {
            console.log(`⚡️ Sending ${updates.length} missed updates for ${channel}`);
            updates.forEach((update) => {
                socket.emit(channel, update);
            });
        }
    });

    // Handle market-specific price updates
    socket.on('market:update', (channel: string, message: WebSocketMessage<SelectionPriceChangePayload>) => {
        try {
            console.log('⚡️ WebSocket received market update:', { channel, message });

            // Parse market ID from channel
            const match = channel.match(/\*:Market:(\d+)/);
            if (!match) {
                console.log('⚡️ WebSocket error: Invalid market channel format:', channel);
                return;
            }

            if (message.type === WsMessageType.SelectionPriceChange) {
                // Add revision to message
                const updatedMessage: WebSocketMessage<SelectionPriceChangePayload> = {
                    ...message,
                    revision: incrementRevision(),
                };

                // Store update for disconnected clients
                if (!missedUpdates.has(channel)) {
                    missedUpdates.set(channel, []);
                }
                missedUpdates.get(channel)!.push(updatedMessage);

                // Keep only last 100 updates per channel
                if (missedUpdates.get(channel)!.length > 100) {
                    missedUpdates.get(channel)!.shift();
                }

                // Broadcast the price change to all clients
                io.emit(channel, updatedMessage);

                console.log('⚡️ WebSocket broadcast price change:', { channel, updatedMessage });
            }
        } catch (error) {
            console.error('⚡️ WebSocket error processing market update:', error);
            socket.emit('error', { message: 'Error processing market update' });
        }
    });

    // Handle event-specific updates (e.g., suspension)
    socket.on('event:update', (channel: string, message: WebSocketMessage<EventUpdatePayload>) => {
        try {
            console.log('⚡️ WebSocket received event update:', { channel, message });

            // Parse event ID from channel
            const match = channel.match(/\*:Event:(\d+)/);
            if (!match) {
                console.log('⚡️ WebSocket error: Invalid event channel format:', channel);
                return;
            }

            if (message.type === WsMessageType.EventStatusUpdate) {
                // Add revision to message
                const updatedMessage: WebSocketMessage<EventUpdatePayload> = {
                    ...message,
                    revision: incrementRevision(),
                };

                // Store update for disconnected clients
                if (!missedUpdates.has(channel)) {
                    missedUpdates.set(channel, []);
                }
                missedUpdates.get(channel)!.push(updatedMessage);

                // Keep only last 100 updates per channel
                if (missedUpdates.get(channel)!.length > 100) {
                    missedUpdates.get(channel)!.shift();
                }

                // Broadcast the event update to all clients
                io.emit(channel, updatedMessage);

                console.log('⚡️ WebSocket broadcast event update:', { channel, updatedMessage });
            }
        } catch (error) {
            console.error('⚡️ WebSocket error processing event update:', error);
            socket.emit('error', { message: 'Error processing event update' });
        }
    });

    socket.on('error', (error) => {
        console.error('⚡️ WebSocket error:', error);
    });

    socket.on('disconnect', (reason) => {
        console.log('⚡️ WebSocket disconnected:', { id: socket.id, reason });
    });
});

// Error handling for the HTTP server
httpServer.on('error', (error) => {
    console.error('Server error:', error);
});

const PORT = process.env.PORT || 3001;

// Start server with better error handling
try {
    httpServer.listen(PORT, () => {
        console.log(`⚡️ Server running on port ${PORT}`);
    });
} catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
}
