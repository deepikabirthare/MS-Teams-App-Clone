// creating a express server
const express = require('express')
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server)
const { v4: uuidv4 } = require('uuid');
const bodyParser = require("body-parser");
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.route('/')
  .get(function (req, res) {
      res.render("index");
  })
  .post(function(req,res){
    const linkToJoin = req.body.linkToJoin
    var str = JSON.stringify(linkToJoin)
    var newString = "";
    var i;
    for(i = 0; i<str.length; i++){
     if(str[i] === '"' || str[i] === ' ')
     continue;
     else
     newString = newString + str[i]
    }
    res.redirect(`/${newString}`);
  })
app.get('/startnewmeet', function (req, res) {
    res.redirect(`/${uuidv4()}`);
  })
app.route('/:room')
   .get((req, res) => {
    res.render('room', { roomId: req.params.room })
    })
io.on('connection', socket => {
 socket.on('join-room', (roomId, userId,user) => {
   socket.join(roomId)
   socket.broadcast.to(roomId).emit('user-connected', userId);
   socket.on('message', message => {
     socket.broadcast.to(roomId).emit('createMessage', message,user);
   })

   socket.on('disconnect', () =>{
     socket.broadcast.to(roomId).emit('user-disconnected', userId)
   })
 })
})

server.listen(process.env.PORT||3000);
