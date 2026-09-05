from fastapi import WebSocket
from typing import List, Dict, Any
import logging
import json

logger = logging.getLogger("rakshanet.realtime")

class WebSocketManager:
    """
    Manages real-time WebSocket connections for the LEA command center dashboard.
    Dispatches instant alerts directly to active browser sessions.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Client connected. Active clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Client disconnected. Active clients: {len(self.active_connections)}")

    async def broadcast_alert(self, alert_data: Dict[str, Any]):
        """Broadcasts alert payload to all connected LEA officers."""
        payload = {
            "type": "NEW_ALERT",
            "data": alert_data
        }
        dead_connections = []
        for connection in self.active_connections:
            try:
                await connection.send_json(payload)
            except Exception as e:
                logger.warning(f"Failed to send to client: {e}")
                dead_connections.append(connection)

        for dc in dead_connections:
            self.disconnect(dc)

ws_manager = WebSocketManager()
