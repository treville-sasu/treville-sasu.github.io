var webrtc;

window.addEventListener('load', function() {

  var params = getParams (window.location.href);
  fillForm (params);

  if (params.room) {
    decorateRoom(params.room);

    var mediaOptions = {
        audio: params.with.includes('audio'),
        video: params.with.includes('video') ? { frameRate: {ideal: 30, min:10}, facingMode:"user" } : false
    };
  // { audio: true, video: { width: 320, height:240, frameRate: {ideal: 60, min:10} } }
  // { audio: true, video: { width: 640, height: 480,  } }

      webrtc = new SimpleWebRTC({
        debug: true,
        localVideoEl: 'localVideo',
        remoteVideosEl: '',
        autoRequestMedia: true,
        // detectSpeakingEvents: true,
        autoAdjustMic: false,
        nick: params.nick || 'Jane Doe',
        media: mediaOptions
      });

      webrtc.on('readyToCall', function () {
        webrtc.joinRoom(params.room);
      });

      webrtc.on('localStream', function (stream) {
        // showNickname('local', params.nick);
        // setPeerActions('local');
      });

      webrtc.on('joinedRoom', function (stream) {
        showConnection('connected', 'local');
        showNickname(params.nick, 'local');
        setPeerActions('local');
      });

      webrtc.on('createdPeer', function (peer) {
        setPeerContainer(peer.nick, peer.id);
      });

      webrtc.on('videoAdded', function (video, peer) {
        attachVideo(video, peer.id);
        showNickname(peer.nick, peer.id); //workaround because nick is not here on peer connect
        peer.pc.on('iceConnectionStateChange', function(event){
          showConnection(peer.pc.iceConnectionState, peer.id);
        });
      });

      webrtc.on('videoRemoved', function (video, peer) {
        detachVideo(video, peer.id);
      });


      webrtc.on('volumeChange', function (volume, treshold) {
        showVolume(volume, 'local');
      });

      webrtc.on('remoteVolumeChange', function (peer, volume) {
        showVolume(volume, peer.id);
      });

      webrtc.on('iceFailed', function (peer) {
        console.log('had local relay candidate', peer.pc.hadLocalRelayCandidate);
        console.log('had remote relay candidate', peer.pc.hadRemoteRelayCandidate);
        showConnection(peer.pc.iceConnectionState, peer.id);
      });

      webrtc.on('connectivityError', function (peer) {
        console.log('had local relay candidate', peer.pc.hadLocalRelayCandidate);
        console.log('had remote relay candidate', peer.pc.hadRemoteRelayCandidate);
        showConnection(peer.pc.iceConnectionState, peer.id);
      });

      webrtc.on('localScreenAdded', function (video) {
        setPeerContainer ('Ecran Partagé', 'localScreen');
        attachVideo(video, 'localScreen')
      });

      webrtc.on('localScreenRemoved', function (video) {
        detachVideo(video, 'localScreen');
      });


  }
  // end of onload
});

function getParams (string) { // pas très retro compatible et pas dynamic
  var url = new URL(string);

  var params = {
    room:url.searchParams.get("room"),
    with:url.searchParams.getAll("with"),
    nick:url.searchParams.get("nick")
  };
  return params
}

function fillForm (params) { // ne gère que les inputs text
  for(key in params)
    {
      if(params.hasOwnProperty(key))
        $('input[name='+key+']').val(params[key]);
    }
}
