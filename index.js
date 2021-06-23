const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");
app.set('view engine', 'ejs');

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));
app.route('/')
  .get(function (req, res) {
    res.render('index');
  })
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
app.route('/meet/:room')
   .get((req, res) => {
    res.render('room', { roomId: req.params.room })
    })

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
