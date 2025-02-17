import React, { useContext, useEffect, useState } from 'react'
import "./Chat.css"
import LeftSideBar from '../../components/LeftSidebar/LeftSideBar'
import RightSideBar from '../../components/RightSidebar/RightSideBar'
import ChatBox from '../../components/ChatBox/ChatBox'
import { AppContext } from '../../context/AppContext'

const Chat = () => {

  const {userData, chatData} = useContext(AppContext);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if(chatData && userData){
      setLoading(false);
    }

  },[chatData, userData])

  return (
    
    <div className='chat'>
      {loading
      ?<p className='loading'>Loading...</p>
      : <div className="chat-container">
            <LeftSideBar />
            <ChatBox />
            <RightSideBar />
        </div>
    }   
    </div>
  )
}

export default Chat