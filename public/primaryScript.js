const socket = io('/')
const userNameInputbtn = document.getElementById('userNameInputButton')
const joinButtonInput  = document.getElementById('joinButton')
const newMeetButtonInput = document.getElementById('newMeetButton')
var user = "Anonymous"
userNameInputbtn.addEventListener("click", e => {
    e.preventDefault()
    var userName = document.getElementById('takeUserName')
     user = userName.value;
    socket.emit('send-user-name', user)
    userName.value = `user: ${user}`
})

newMeetButton.addEventListener("click", () =>{
  if(user === "Anonymous"){
        socket.emit('send-user-name', user)
        user = ''
  }
})

joinButtonInput.addEventListener("click", ()=>{
  if(user === "Anonymous"){
      socket.emit('send-user-name', user)
  }
})
