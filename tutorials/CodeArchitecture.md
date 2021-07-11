<img  src="codearchitecture.png" width="700" height="700">

## Description of the Code Architecture

1. Clients interacts with the server for url of the app and home page of the app is rendered.

2. Server is same for multiple clients.

3. Then Client requests the server for joining room.

4. Sever redirects the clients to unique roomId.

5. Once the room is joined event is emitted using socket.io

6. Socket.io handles the events and  creates real time communication channel between client and server.

7. Then a peer object is created and request is sent to peerjs server for connecting to peer.

8. peerjs library is based on webrtc and uses stun servers for peer to peer connection.

9. But since NAT and firewall creates issue while sharing users media so turn servers need to be used for relaying the traffic.
10. That's how two people are finally able to connect using my app.
