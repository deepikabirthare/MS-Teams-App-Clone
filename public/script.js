/**
*imported socket.io for real time communication
*@category Script.js
*/
const socket = io('/')

////////////////////////////////////////////////////////////////
/**
*stun and turn servers used for the peer to peer connection
*credentials for turn server are provided by xirsys.
*stun servers used are provided by google.
* @category Script.js
*/
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

///////////////////////////////////////////////////////////////////////////////////////////
var user
/**
*function takes the username input through prompt
*and sets the user variable to obtained username
*function uses bootbox library to generate prompt
* @category Script.js
*/
function getUserName(){
  var box = bootbox.prompt({
      closeButton: false,
      title: "Enter your name or leave blank to chat as Anonymous user",
      centerVertical: true,
      callback: function(result){
        user = result;
        if(user === "" || user === null || user === undefined)
          user = "Anonymous";
      }
  });
  box.find('.modal-content').css({'background': 'rgba(43,43,43,0.4)'});
  box.find('.modal-header').css({'color': '#E8F0F2'});
  box.find(".btn-primary").removeClass("btn-primary").addClass("btn-outline-primary");
  box.find(".btn-secondary").removeClass("btn-secondary").addClass("btn-outline-secondary");
  box.find('input').css({'background-color': 'rgba(43,43,43,0.4)'})
  box.find('input').css({'color': '#E8F0F2'})

}
////////////////////////////////////////////////////////////////

/**
*created a Peer type object for peer to peer communication
* I hosted my own peerjs server on heroku for the purpose
* @typedef {Object} Peer
* @property {string} host "dbpeerjsserver.herokuapp.com", my own peerjs server
* @property {number} port  443 for https requests
* @property {boolean} secure it's a secure port
* @property {object} config iceServers (stun and turns servers)
* @catagory Script.js
*/
var myPeer = new Peer(undefined, {
  host: "dbpeerjsserver.herokuapp.com",
  port: 443,
  secure: true,
  config: configuration
});

///////////////////////////////////////////////////////////////////////////
/**
*variable to store video element
*@category Script.js
*/
const videoGrid = document.getElementById('video-grid')
const myVideo = document.createElement('video')
var myId;
myVideo.muted = true

/**
* array to store unique user Ids and call object
*@category Script.js
*/
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

  /**
  *answering the call by providing our audio and video stream
  *@category Script.js
  */
  myPeer.on('call', (call) => {
    uCall = call;
    call.answer(stream);
    call.on('stream', userVideoStream => {
      uVid = userVideoStream;
    })
  })

  /**
  * when connection is established this function will store the userId
  * and call object of the user who called.
  * @category Script.js
  */
  myPeer.on('connection', (conn) => {
      conn.on('data', (myId) => {
        peers[myId] = uCall;
        const video = document.createElement('video');
        video.setAttribute("id", myId);
        addVideoStream(video, uVid);
    })
  })

  /**
  * listens to the event 'user-connected'
  * if event occurs then call the connectToNewUser() function
  *@category Script.js
  */
  socket.on('user-connected', userId => {
    connectToNewUser(userId, stream);
  })

  /**
  * takes the text messages as input
  *@category Script.js
  */
  let text = $('input');

 /**
 *when enter is pressed send the message
 *@category Script.js
 */
  $('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
      $('ul').append(`<li class="message"><b>You: </b>${text.val()}</li>`);
      scrollToBottom();
      /**
      * emits the event 'message' so that server can listen to it
      * sends the username along with text message to server
      *@category Script.js
      */
      socket.emit('message', user, text.val());
      text.val('');
    }
  });
  /**
  * listens to event 'createMessage' emitted by server
  * and appends the message sent by user to list of
  * messages in chat window.
  * @category Script.js
  */
  socket.on('createMessage', (userName, message) => {
    $('ul').append(`<li class="message"><b>${userName}: </b>${message}</li>`);
    scrollToBottom();
  });
});

////////////////////////////////////////////////////////////////

/**
* listens to event 'user-disconnected' and
* closes the call and removes the video and video grid of user
* @category Script.js
*/
socket.on('user-disconnected', userId => {
  if (peers[userId])  {
    peers[userId].close();
    var userVideo = document.getElementById(userId);
    if(userVideo !== null)
      userVideo.remove();
  }
});

/**
*when connection to peerjs server is established it emits the event to join room
* by passing unique ROOM_ID and userId.
* @category Script.js
*/
myPeer.on('open', id => {
  myId = id;
  socket.emit('join-room', ROOM_ID, id);
});

////////////////////////////////////////////////////////////////

/**
*called when 'user-connected' event is emitted
*this function is used to call the new user that connected
*by sending the stream of the user who is calling.
*This function also strores the call object in peers array
*@param {object} stream we send our own audio and video stream to connect
*@param {string} userId id of the user we want to connect to
*@category Script.js
*/

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

///////////////////////////////////////////////////////////////

/**
*function addVideoStream adds the video element to the video-grid
*videoGrid is the div container used to hold the video stream
*@param {media} video video of the user accessed from the device
*@param {object} stream MediaStream object
*@category Script.js
*/
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  });
  videoGrid.append(video);
}

///////////////////////////////////////////////////////////////

/**
*copies the ROOM_ID to share with different users to join a room
* @category Script.js
*/
function copy(){
  var input = document.createElement('input');
  input.setAttribute('value', ROOM_ID);
  document.body.appendChild(input);
  input.select();
  var result = document.execCommand('copy');
  document.body.removeChild(input);
  var box = bootbox.alert({
      message: "Copied",
      closeButton: false,
  });
  box.find('.modal-content').css({'background': 'rgba(43,43,43,0.4)'});
  box.find('.modal-content').css({'color': '#E8F0F2'});
  box.find(".btn-primary").removeClass("btn-primary").addClass("btn-outline-primary");
  box.find('.modal-content').css({'width': '40%'});
  box.find('.modal-body').css({'height': '20px'});
  box.find('.modal-footer').css({'border-style': 'none'});

}

////////////////////////////////////////////////////////////////

/**
*scrolls to bottom as chat window gets filled
*@category Script.js
*/
const scrollToBottom = () => {
  var d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

/**
*toggles the mute and unmute button
*if audio is true the mutes it else unmutes it
*@category Script.js
*/
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

/**
*to stop and play Video as user clicks to stop Video or play Video
*@category Script.js
*/
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

/**
*hides and show the main chat Window as user toggles the hide and display button
*@category Script.js
*/
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

/**
*changes inner html of mute button
*@category Script.js
*/
const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</sapn>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

/**
*changes inner html of unmute button
*@category Script.js
*/
const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main_mute_button').innerHTML = html;
}

/**
*changes inner html of Stop video button
*@category Script.js
*/
const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}

/**
*changes inner html of play video button
*@category Script.js
*/
const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Show Video</span>
  `
  document.querySelector('.main_video_button').innerHTML = html;
}
