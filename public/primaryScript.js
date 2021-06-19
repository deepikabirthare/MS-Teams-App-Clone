const socket = io('/')
const userNameInputbtn = document.getElementById('userNameInputButton')

userNameInputbtn.addEventListener("click", e => {
    e.preventDefault()
    var userName = document.getElementById('takeUserName')
    var user = userName.value;
    console.log(user)
    socket.emit('send-user-name', user)
    userName.value = `user: ${user}`
})
