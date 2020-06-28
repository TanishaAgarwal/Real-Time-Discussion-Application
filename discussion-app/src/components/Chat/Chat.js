import React, {useState, useEffect} from 'react'
import qs from 'query-string';
import io from 'socket.io-client';

import './Chat.css';

import TextContainer from '../TextContainer/TextContainer';
import Messages from '../Messages/Messages';
import InfoBar from '../InfoBar/InfoBar';
// import Input from '../Input/Input';


let socket; 

const Chat = ({location}) => {
    const [name, setName] = useState('');
    const [room, setRoom] = useState('');
    const [users, setUsers] = useState('');
    const [msg, setMsg] = useState('');
    const [msgs, setMsgs] = useState([]);
    const ENDPOINT = 'https://discussion-app.herokuapp.com/';

    useEffect(() => {
        const {name, room} = qs.parse(location.search);
        
        socket = io(ENDPOINT);

        setName(name);
        setRoom(room);

        socket.emit('join', {name, room}, ()=>{

        });

        return ()=>{
            socket.emit('disconnect');

            socket.off();
        }
    }, [ENDPOINT, location.search]);
    
    useEffect(() => {
        socket.on('msg', (msg)=>{
            setMsgs([...msgs, msg]);
        });
        socket.on("roomData", ({ users }) => {
            setUsers(users);
          });
    }, [msgs]);

    const sendMsg = (event) => {
        event.preventDefault();
    
        if(msg) {
          socket.emit('sendMsg', msg, () => setMsg(''));
        }
      }
    

    return (
        <div className="outerContainer">
            <div className="container">
                <InfoBar room={room} />
                <Messages messages={msgs} name={name} />
                <form className='form'>
                    <input
                      className='input'
                      value={msg}
                      type='text'
                      placeholder="Type a message..."
                      onChange={(e) => setMsg(e.target.value)} 
                      onKeyPress={e => e.key === 'Enter' ?sendMsg(e) :null} 
                    />
                    <button className="sendButton" onClick={e => sendMsg(e)}>Send</button>
                </form>
            </div>
            <TextContainer users={users}/>
        </div>
    )
}
export default Chat;