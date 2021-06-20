const socket = io('/')
const videoGrid = document.getElementById('video-grid')
var myPeer = new Peer(undefined, {
  host: "dbpeerjsserver.herokuapp.com",
  port: 443,
  secure: true
});
const myVideo = document.createElement('video')
myVideo.muted = true
const peers = {}
let myVideoStream;
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream;
  addVideoStream(myVideo, stream);

  myPeer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream);
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
      socket.emit('message', text.val());
      text.val('');
    }
  });
  socket.on('createMessage', message => {
    $('ul').append(`<li class="message"><b>User: </b>${message}</li>`);
    scrollToBottom();
  });
})


socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});



myPeer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement('video');
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
  console.log("Hello");
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
