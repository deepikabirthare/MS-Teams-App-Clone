const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myId;
var configuration = { iceServers: [{
  urls: "stun:stun.services.mozilla.com",
  username: "louis@mozilla.com",
  credential: "webrtcdemo"
}, {
  urls: [
          "stun:stun.example.com",
          "stun:stun-1.example.com"
  ]
}, { urls: "stun:stun1.l.google.com:19302" },
{ urls: "stun:stun2.l.google.com:19302" },
{ urls: "stun:stun3.l.google.com:19302" },
{ urls: "stun:stun4.l.google.com:19302" },
{ urls: "stun:stun01.sipphone.com" },
{ urls: "stun:stun.l.google.com:19302" },
{ urls:  "stun:bn-turn1.xirsys.com" },
{
  username: "jLpyhSW_Zr7lqqNE6sFytfEDTXabyWTc7wKUducRf0ME6UQIB8EofrpdSTSBheMbAAAAAGDSSRFzaHViaGFtYW1zYQ==",
  credential: "15c32c6e-d399-11eb-84f0-0242ac140004",
  urls: [
      "turn:bn-turn1.xirsys.com:80?transport=udp",
      "turn:bn-turn1.xirsys.com:3478?transport=udp",
      "turn:bn-turn1.xirsys.com:80?transport=tcp",
      "turn:bn-turn1.xirsys.com:3478?transport=tcp",
      "turns:bn-turn1.xirsys.com:443?transport=tcp",
      "turns:bn-turn1.xirsys.com:5349?transport=tcp"
  ]
}
]
};

var myPeer = new Peer(undefined, {
  host: "dbpeerjsserver.herokuapp.com",
  port: 443,
  secure: true,
  config: configuration
});
var user = prompt("Enter user name")
if(user === "" || user === null || user === undefined)
  user = "Anonymous";
const myVideo = document.createElement('video')
myVideo.muted = true
var peers = {}
let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  var uCall;
  var uVid;
  addVideoStream(myVideo, stream);
  myPeer.on('connection', (conn) => {
      conn.on('data', (myId) => {
        // tempId = myId;
        peers[myId] = uCall;
        const video = document.createElement('video');
        video.setAttribute("id", myId);
        addVideoStream(video, uVid);
    })
  })
  myPeer.on('call', (call) => {
    uCall = call;
    call.answer(stream);
    call.on('stream', userVideoStream => {
      uVid = userVideoStream;
    })
  })

  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })

  // input value
  let text = $('input');
  // when press enter send message
  $('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
      $('ul').append(`<li class="message"><b>You: </b>${text.val()}</li>`);
      scrollToBottom();
      socket.emit('message', user, text.val());
      text.val('');
    }
  });
  socket.on('createMessage', (userName, message) => {
    $('ul').append(`<li class="message"><b>${userName}: </b>${message}</li>`);
    scrollToBottom();
  });
})

socket.on('user-disconnected', userId => {
  if (peers[userId])  {
    peers[userId].close();
    var userVideo = document.getElementById(userId);
    if(userVideo !== null)
      userVideo.remove();
  }
});

myPeer.on('open', id => {
  myId = id;
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {

  const call = myPeer.call(userId, stream);
  const conn = myPeer.connect(userId);
  conn.on('open', () => {
    conn.send(myId);
  });
  const video = document.createElement('video');
  video.setAttribute("id", userId);
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });
  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}


var copyButton = document.getElementById('copy-button')

copyButton.addEventListener("click", () =>{
  copy(ROOM_ID)
})

function copy(idCopied){
  var input = document.createElement('input');
  input.setAttribute('value', idCopied);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input);
  alert("copied")
}

const scrollToBottom = () => {
  var d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}


const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    myVideoStream.getAudioTracks()[0].enabled = true;
    setMuteButton();
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    myVideoStream.getVideoTracks()[0].enabled = true;
    setStopVideo();
  }
}

const chatWindow = () => {
  styleType = $(".main_right").css("display");
  if(styleType == "flex")
    $(".main_right").css("display","none");
  else
    $(".main_right").css("display","flex");
}

const disconnectUser = () => {
  window.close();
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}


const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}
