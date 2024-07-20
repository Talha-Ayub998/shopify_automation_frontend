import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Make sure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './api';


const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);
  const navigate = useNavigate();
  const { logout, loginSuccess, setLoginSuccess } = useAuth();
  const authToken = localStorage.getItem('authToken');
  const userId = localStorage.getItem('userId');
  const sessionId = localStorage.getItem('sessionId');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  useEffect(() => {
    if (loginSuccess) {
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      setLoginSuccess(false); // Reset login success flag
    }
  }, [loginSuccess, setLoginSuccess]);

  // Load messages from localStorage when the component mounts
  useEffect(() => {
    const loadMessages = () => {
      try {
        const storedMessages = localStorage.getItem('chatMessages');
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages);
          setMessages(parsedMessages);
        }
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
      }
    };

    loadMessages();
    window.addEventListener('storage', loadMessages);

    return () => {
      window.removeEventListener('storage', loadMessages);
    };
  }, []);

  // Save messages to localStorage whenever they change
  // useEffect(() => {
  //   try {
  //     if (messages.length) {
  //       localStorage.setItem('chatMessages', JSON.stringify(messages));
  //       console.log('Saved messages to localStorage:', messages);
  //     }

  //   } catch (error) {
  //     console.error('Error saving messages to localStorage:', error);
  //   }
  // }, [messages]);

  // Scroll to bottom of chat when messages change

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const response = await api.get(`chat/history/${sessionId}/`);
        const fetchedMessages = response.data.messages.map(msg => ({
          text: msg.message,
          isSender: msg.is_sender,
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      }
    };

    fetchChatHistory();
  }, [sessionId]);



  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, isSender: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);

    try {
      // Get the bot's response from ChatGPT
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: input }],
      }, {
        headers: {
          'Authorization': `Bearer sk-proj-Fd3OKuZlEcgY1SUyftdaT3BlbkFJFy0GIKaqkt13c3pbMXLe`,
          'Content-Type': 'application/json',
        },
      });

      const botMessage = { text: response.data.choices[0].message.content, isSender: false };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // Save the chat messages to Django backend using the api instance
      await api.post('chat/messages/', {
        user_id: userId,
        message_text: input,
        session_id: sessionId, // Pass the session ID if using session-based chat
        is_sender: true, // Indicate that the message is from the user
      });

      await api.post('chat/messages/', {
        user_id: userId,
        message_text: botMessage.text,
        session_id: sessionId, // Pass the session ID if using session-based chat
        is_sender: false, // Indicate that the message is from the bot
      });

    } catch (error) {
      console.error('Error fetching response from ChatGPT or saving to Django:', error);
    }

    setInput('');
  };



  return (
    <PageWrapper>
      <ChatPageContainer>
        <Header>
          <HeaderContent>
            <UserEmail>{userEmail}</UserEmail> {/* Add this line */}
            <Title>Chat with Bot</Title>
            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
          </HeaderContent>
        </Header>
        <Body ref={bodyRef}>
          {messages.map((msg, index) => (
            <Message
              key={index}
              isSender={msg.isSender}
              isSameSender={index > 0 && messages[index - 1].isSender === msg.isSender}
            >
              {msg.text}
            </Message>
          ))}
        </Body>
        <InputContainer>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </InputContainer>
      </ChatPageContainer>
      <ToastContainer />
    </PageWrapper>
  );
};

export default ChatPage;


const Title = styled.div`
  font-size: 24px;
  margin: 0 0px 0 -55px /* Add some margin to create space between elements */
`;

const LogoutButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  background-color: #444654;
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #3a3b3d;
  }
`;


const Message = styled.div`
  margin-bottom: 10px;
  padding: 10px;
  background-color: ${props => (props.isSender ? '#e7e7e8' : '#d2e3fc')};
  border: 1px solid ${props => (props.isSender ? '#ccc' : '#aaa')}; /* Add some border to give it a more chat-like feel */
  border-radius: 5px;
  max-width: 60%;
  float: ${props => (props.isSender ? 'right' : 'left')}; /* Use float to align the messages */
  clear: both; /* Add clear:both to prevent overlapping */
  margin: 10px; /* Add some margin to prevent overlapping */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); /* Add some shadow to give it a 3D effect */
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-align: ${props => (props.isSender ? 'right' : 'left')}; /* Align the text to the right for user messages and left for bot messages */
  animation: ${props => (props.isSender ? 'fadeInRight' : 'fadeInLeft')} 0.5s ease-in-out;
  @keyframes fadeInRight {
    0% {
      opacity: 0;
      transform: translateX(20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes fadeInLeft {
    0% {
      opacity: 0;
      transform: translateX(-20px);
    }
    100% {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;


const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f7f7f8;
  font-size: 16px;
  margin-right: 10px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: #202123;
  color: white;
  font-size: 16px;
  cursor: pointer;

  &:hover {
    background-color: #3a3b3d;
  }
`;

const PageWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #e0e0e0; /* Light grey background */
`;

const ChatPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 60%;
  max-width: 800px;
  margin: 20px auto;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  height: 60px;
  background-color: #202123;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 0 20px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between; /* This will distribute the elements evenly */
  padding: 0 20px; /* Add some padding to create space between elements */
`;

const UserEmail = styled.div`
  font-size: 15px;
  color: #ffffff; /* White text */
  background-color: #444654; /* Blue background */
  padding: 5px 10px; /* Add some padding to create a box-like effect */
  border-radius: 5px; /* Add a slight rounded corner effect */
  display: inline-block; /* Make it an inline-block element */
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2); /* Add a subtle shadow effect */
`;

const Body = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: scroll;
  background-color: #f7f7f8;
`;

const InputContainer = styled.div`
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 10px;
  background-color: #ffffff;
  border-top: 1px solid #ddd;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
`;
