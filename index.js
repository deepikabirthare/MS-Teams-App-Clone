/**
*created a express server
*@category Index.js
*/
const express = require('express')
const app = express();
const server = require('http').Server(app);
/**
*imported socket.io for real time communication
*it creates a bidirectional channel between Socket.io client and server
*@category Index.js
*/
const io = require('socket.io')(server)

/**
*imported uuid for Cryptographically-strong random unique ids
*users will be directed to these unique ids as they will serve the
*purpose of ROOM_ID
*@category Index.js
*/
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

/**
*get request renders the  main home page of application
*@category Index.js
*/
app.route('/')
  .get(function (req, res) {
    res.render('index');
  })

/**
*get method redirects to a room characterized by ROOM_ID
*post method takes the unique room id when user tries to join
*previously created room and checks this room id to remove spaces
*then redirects the user to this roomId
*@category Index.js
*/
app.route('/meet')
.get(function(req, res) {
  res.redirect(`/meet/${uuidv4()}`);
})
.post(function(req, res) {
  Id = req.body.linkToJoin;
  var str = JSON.stringify(Id)
  var roomId = "";
  var i;
  for(i = 0; i<str.length; i++){
   if(str[i] === '"' || str[i] === ' ')
   continue;
   else
   roomId = roomId + str[i]
  }
  res.redirect(`/meet/${roomId}`);
})

/**
*whenever user is redirected to a room get method is called
*it renders the view of the room (room.ejs)
* @category Index.js
*/
app.route('/meet/:room')
   .get((req, res) => {
    res.render('room', { roomId: req.params.room })
    })

/**
*gets the socket object of EventEmitter class
* handles the events 'join-room', 'message' and 'disconnect'
* @category Index.js
*/
io.on('connection', socket => {
 socket.on('join-room', (roomId, userId) => {
   socket.join(roomId)
   socket.broadcast.to(roomId).emit('user-connected', userId);
   socket.on('message', (user, message) => {
     socket.broadcast.to(roomId).emit('createMessage',user,  message);
   })

   socket.on('disconnect', () =>{
     socket.broadcast.to(roomId).emit('user-disconnected', userId)
   })
 })
})

server.listen(process.env.PORT || 3000);
