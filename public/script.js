const socket = io('/')
const main = document.querySelector('main')
const peer = new Peer(undefined, {
  host: '/',
  port: '3001'
})
const hostVideo = document.createElement('video')
hostVideo.muted = true;

const peers = {}

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  addVideoStream(hostVideo, stream)

  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => addVideoStream(video, userVideoStream))
  })

  socket.on('user-connected', userId => connectToNewUser(userId, stream))
})

socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close()
})

peer.on('open', id => {
  socket.emit('join-room', ROOM_ID, id)
})

const connectToNewUser = (userId, stream) => {
  const call = peer.call(userId, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
  call.on('close', () => video.remove())
}

const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => video.play())
  main.append(video)
}