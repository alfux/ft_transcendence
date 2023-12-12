import asyncio
import websockets

async def send_websocket_event():
    uri = "ws://your-backend-url"  # Replace with your actual WebSocket server URL

    async with websockets.connect(uri) as websocket:
        # Your WebSocket message payload
        message = "Hello, Backend!"

        # Sending the message to the WebSocket server
        await websocket.send(message)

        # You can await a response if needed
        response = await websocket.recv()
        print(f"Received response: {response}")

# Run the event loop
asyncio.get_event_loop().run_until_complete(send_websocket_event())
