function decorateRoom (name) {
  document.querySelector('#create').style.display = "none";
  document.querySelector('[data-content=roomname]').innerText = name;
  document.querySelector('section#room ').style.display = "block";
}

function setPeerActions (peerId) {
  var peerContainer = getContainerFromPeerId(peerId);

  if(peerContainer.querySelector('video')) { // check if peer sends audio.
    peerContainer.querySelector(".actions > [data-content=mic]").classList.remove('md-inactive');
    peerContainer.querySelector(".actions > [data-content=mic]").addEventListener('click', function(e) {
      mutePeer(e.target.closest('[id^=peer_], #local'));
    });
  } else {
    peerContainer.querySelector(".actions > [data-content=mic]").classList.add('md-inactive');
  }

  if(webrtc.capabilities.supportScreenSharing && peerId == 'local') { // check if peer may share screen.
    peerContainer.querySelector(".actions > [data-content=screen_share]").classList.remove('md-inactive');
    peerContainer.querySelector(".actions > [data-content=screen_share]").addEventListener('click', function(e) {
      shareScreen(e.target.closest('[id^=peer_], #local'));
    });
  } else {
    peerContainer.querySelector(".actions > [data-content=screen_share]").classList.add('md-inactive');
  }

  if(peerContainer.querySelector('video')) { // check if peer sends video.
    peerContainer.querySelector(".actions > [data-content=camera]").classList.remove('md-inactive');
    peerContainer.querySelector(".actions > [data-content=camera]").addEventListener('click', function(e) {
      blindPeer(e.target.closest('[id^=peer_], #local'));
    });
  } else {
    peerContainer.querySelector(".actions > [data-content=camera]").classList.add('md-inactive');
  }
}

function removePeerActions (peerId) {
  var peerContainer = getContainerFromPeerId(peerId);
  peerContainer.querySelector(".actions").remove();
  // peerContainer.querySelector(".status").remove();
}


function mutePeer(peerContainer) {
  var indicator = peerContainer.querySelector(".actions > [data-content=mic]");
  if (indicator.innerText == 'mic_off') {
    if (peerContainer.id == 'local') { webrtc.mute(); }
    else { peerContainer.querySelector('video').volume = 0; }

    indicator.innerText = 'mic';
  } else {
    if (peerContainer.id == 'local') { webrtc.unmute(); }
    else { peerContainer.querySelector('video').volume = 1; }

    indicator.innerText = 'mic_off';
  }
}

function shareScreen(peerContainer){
  var indicator = peerContainer.querySelector(".actions > [data-content=screen_share]");
  if (indicator.innerText = 'screen_share') {
    webrtc.shareScreen(function () { indicator.classList.add("md-inactive"); });
    indicator.classList.remove("md-inactive");
    indicator.innerText = 'stop_screen_share';
  } else {
    // if (webrtc.getLocalScreen()) {
    webrtc.stopScreenShare();
    indicator.classList.remove("md-inactive");
    indicator.innerText = 'screen_share';
  }
}

function blindPeer(peerContainer){
    var indicator = peerContainer.querySelector(".actions > [data-content=camera]");
  if (indicator.innerText == 'videocam_off') {
// TODO find how to display or not the video
    if (peerContainer.id == 'local') { webrtc.pauseVideo(); };
    indicator.innerText = 'videocam';
  } else {
// TODO find how to display or not the video
    if (peerContainer.id == 'local') { webrtc.resumeVideo(); };
    indicator.innerText = 'videocam_off';
  }
}

function setPeerContainer (peerNick, peerId) {
  var Peers = document.querySelector('.gridContainer');
  var peerContainer = getContainerFromPeerId ('local').cloneNode(true);
  peerContainer.id = 'peer_' + peerId;
  peerContainer.querySelector('video').remove();
  Peers.appendChild(peerContainer);
  showNickname(peerNick, peerId);
  setPeerActions(peerId);
}

function attachVideo(video, peerId) {
  video.oncontextmenu = function () { return false; };
  video.ondblclick = function() { this.closest('.videoContainer').classList.toggle('fullscreen'); };

  getContainerFromPeerId(peerId).prepend(video);
}

function detachVideo(video, peerId) {
  getContainerFromPeerId(peerId).remove();
}

function getContainerFromPeerId (peerId) {
  return document.querySelector(peerId == 'local' ? '#local' : '#peer_' + peerId);
}

function showNickname(peerNick, peerId) {
  var indicator = getContainerFromPeerId(peerId).querySelector(".status > [data-content=nickname]");
  indicator.innerText = peerNick;
}

function showVolume(volume, peerId) {
  var indicator = getContainerFromPeerId(peerId).querySelector(".status > [data-content=volume]");

  if (volume <= -40) {
    indicator.classList.add("md-inactive");
    indicator.classList.remove("md-blink");
    indicator.classList.remove("md-alert");
  } else if (volume >= -15) {
    indicator.classList.remove("md-blink");
    indicator.classList.add("md-alert");
    indicator.classList.remove("md-inactive");
  } else {
    indicator.classList.add("md-blink");
    indicator.classList.remove("md-alert");
    indicator.classList.remove("md-inactive");
  }
}

function showConnection(connection, peerId) {
  var indicator = getContainerFromPeerId(peerId).querySelector(".status > [data-content=connection]");

  switch (connection) {
  case 'checking':
    indicator.classList.add("md-blink");
    indicator.classList.remove("md-alert");
    indicator.classList.remove("md-inactive");
    break;
  case 'connected':
  case 'completed': // on caller side
    indicator.classList.remove("md-blink");
    indicator.classList.remove("md-alert");
    indicator.classList.remove("md-inactive");
    break;
  case 'disconnected':
  case 'failed':
  case 'closed':
    indicator.classList.remove("md-blink");
    indicator.classList.add("md-alert");
    indicator.classList.remove("md-inactive");
    break;
  }
}
