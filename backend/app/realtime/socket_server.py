"""
WebSocket Connection Manager for RakshaNet Command Center.

Manages persistent WebSocket connections from frontend clients and provides
broadcast capabilities for real-time alert push, freeze notifications, and
pipeline progress updates.
"""
import json
import logging
from datetime import datetime, timezone
from typing import List, Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger("websocket")


class ConnectionManager:
    """
    Manages active WebSocket connections with automatic cleanup.
    Provides broadcast methods for pushing events to all connected clients.
    """

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self._connection_count = 0

    async def connect(self, websocket: WebSocket):
        """Accept and register a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)
        self._connection_count += 1
        logger.info(f"🔌 WebSocket client connected. Active connections: {len(self.active_connections)}")

        # Send welcome event
        await self._send_json(websocket, {
            "event_type": "CONNECTED",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": {
                "message": "Connected to RakshaNet Command Center real-time feed.",
                "active_clients": len(self.active_connections)
            }
        })

    def disconnect(self, websocket: WebSocket):
        """Remove a disconnected WebSocket client."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"🔌 WebSocket client disconnected. Active connections: {len(self.active_connections)}")

    async def broadcast(self, event: dict):
        """
        Broadcast an event to ALL connected clients.
        Automatically cleans up dead connections.
        """
        if not self.active_connections:
            return

        dead_connections = []
        for connection in self.active_connections:
            try:
                await self._send_json(connection, event)
            except Exception:
                dead_connections.append(connection)

        # Clean up dead connections
        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_event(self, event_type: str, payload: dict):
        """Convenience method to broadcast a typed event."""
        event = {
            "event_type": event_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "payload": payload
        }
        await self.broadcast(event)

    async def _send_json(self, websocket: WebSocket, data: dict):
        """Send JSON data to a single WebSocket connection."""
        await websocket.send_json(data)

    @property
    def client_count(self) -> int:
        return len(self.active_connections)


# Singleton instance used across the application
ws_manager = ConnectionManager()
