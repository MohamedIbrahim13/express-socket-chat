const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});
console.log(username , room);

const socket =io();

socket.emit('joinRoom',{username,room});

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on('chat',(message)=>{
    outputMessage(message);
    chatMessages.scrollTop =chatMessages.scrollHeight;

});



chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const msg = e.target.msg.value;
    // console.log(msg);
    socket.emit('chatMessage',msg);
    e.target.msg.value ='';
    e.target.msg.focus();
});


// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `;
}



function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
      ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}