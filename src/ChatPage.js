import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { useAuth } from './AuthContext'; // Make sure this path is correct
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from './api';
import { FaLock, FaSignOutAlt, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import { Oval } from 'react-loader-spinner';
import logo from './Ecomaitech.com-logo.png' // Make sure the path is correct

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bodyRef = useRef(null);
  const { logout, loginSuccess, setLoginSuccess, passwordChanges, setPasswordChanges } = useAuth();
  const userId = localStorage.getItem('userId');
  const sessionId = localStorage.getItem('sessionId');
  const userEmail = localStorage.getItem('userEmail');
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loginSuccess) {
      toast.success('Login successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setLoginSuccess(false); // Reset login success flag
  }, [loginSuccess, setLoginSuccess]);


  useEffect(() => {
    if (passwordChanges) {
      toast.success('Password reset successful!', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setPasswordChanges(false); // Reset login success flag
  }, [passwordChanges, setPasswordChanges]);

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

  useEffect(() => {
    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await api.get(`chat/history/${sessionId}/`);
        const fetchedMessages = response.data.messages.map(msg => ({
          text: msg.message,
          isSender: msg.is_sender,
        }));
        setMessages(fetchedMessages);
      } catch (error) {
        console.error('Error fetching chat history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChatHistory();
  }, [sessionId]);


  const formatMessageText = (text) => {
    return text.split('\n').map((part, index) => (
      <React.Fragment key={index}>
        {part}
        {index < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };


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


  const getInitials = (email) => {
    if (!email) return '';
    const initials = email.slice(0, 2).toUpperCase();
    return initials;
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = () => {
    logout();
  };

  const handleChangePassword = () => {
    navigate('/resetpassword')
  };


  return (
    <PageWrapper>
      {loading && (
        <LoadingContainer>
          <Oval
            height={100}
            width={100}
            color="#4fa94d"
            visible={true}
            ariaLabel='oval-loading'
            secondaryColor="#4fa94d"
            strokeWidth={2}
            strokeWidthSecondary={2}
          />
        </LoadingContainer>
      )}
      <ChatPageContainer>
        <Header>
          <HeaderContent>
            <Logo src={logo} alt="Logo" />
            <UserEmail onClick={toggleDropdown}>{getInitials(userEmail)}</UserEmail>
            <DropdownMenu open={dropdownOpen}>
              <MenuItem>
                <Icon><FaEnvelope /></Icon>
                {userEmail}
              </MenuItem>
              <MenuItem onClick={handleChangePassword}>
                <Icon><FaLock /></Icon>
                Change Password
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Icon><FaSignOutAlt /></Icon>
                Logout
              </MenuItem>
            </DropdownMenu>
          </HeaderContent>
        </Header>
        <Body ref={bodyRef}>
          {messages.map((msg, index) => (
            <Message
              key={index}
              isSender={msg.isSender}
              isSameSender={index > 0 && messages[index - 1].isSender === msg.isSender}
            >
              {formatMessageText(msg.text)}
            </Message>
          ))}
        </Body>
        <InputContainer>
          <Input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default Enter behavior (new line)
                handleSendMessage();
              }
            }}
            rows={4} // Adjust rows if you want to control height initially
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </InputContainer>
      </ChatPageContainer>
      <ToastContainer />
    </PageWrapper>
  );

};

export default ChatPage;


const Logo = styled.img`
  height: 75px;
  margin: 8px 0 0 0rem;
`;
const Title = styled.div`
  font-size: 24px;
  margin: 0 0px 0 -55px /* Add some margin to create space between elements */
`;

const Messagess = styled.div`
  margin-bottom: ${(props) => (props.isSameSender ? "5px" : "15px")};
  padding: 10px 20px;
  background-color: ${props => (props.isSender ? '#e7e7e8' : '#d2e3fc')};
  border: 1px solid ${props => (props.isSender ? '#ccc' : '#aaa')}; /* Add some border to give it a more chat-like feel */
  border-radius: 5px;
  max-width: 60%;
  word-wrap: break-word;
  align-self: ${(props) => (props.isSender ? "flex-end" : "flex-start")};
  border-radius: ${(props) => (props.isSender ? "20px 20px 0 20px" : "20px 20px 20px 0")};
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


const Input = styled.textarea`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background-color: #f7f7f8;
  font-size: 16px;
  margin-right: 10px;
  resize: none; /* Prevent resizing */
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


const DropdownMenu = styled.div`
  position: absolute;
  top: 65px;
  right: 10px;
  background-color: #444654;
  color: #ffffff;
  border-radius: 5px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
  display: ${({ open }) => (open ? 'block' : 'none')};
  padding: 10px;
  z-index: 1000;
  min-width: 200px;
`;

const MenuItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  color: #ffffff;
  cursor: pointer;

  &:hover {
    background-color: #555555;
  }
`;

const Icon = styled.div`
  margin-right: 10px;
`;

const LogoutButton = styled.button`
  background-color: #f00;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 10px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  &:hover {
    background-color: #c00;
  }
`;

const Header = styled.div`
  padding: 10px 20px;
  height: 60px;
  background-color: #202123;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: 2px 20px;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #444;
  justify-content: space-between;
`;

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  justify-content: space-between; /* This will distribute the elements evenly */
  padding: 0 20px; /* Add some padding to create space between elements */
`;

const UserEmail = styled.span`
  font-size: 1rem;
  cursor: pointer;
  padding: 0.2rem;
  background-color: #555;
  color: #fff;
  border-radius: 50%;
  text-align: center;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background-color: #777;
  }
`;

const Body = styled.div`
  flex: 1;
  padding: 10px;
  overflow-y: scroll;
  background-color: #f7f7f8;
`;


const LoadingContainer = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    position: fixed;
    top: 0;
    left: 0;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
`;

const ChatPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 90vh;
  width: 100%;
  max-width: 600px; /* Adjusted for smaller screens */
  margin: 20px auto;
  background-color: #ffffff;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    width: 95%; /* Make it more flexible on small screens */
    height: 80vh;
  }
`;


const Message = styled.div`
${'' /* background-color: ${(props) => (props.isSender ? '#1a202c' : '#f5f5f5')};
color: ${(props) => (props.isSender ? '#fff' : '#333')}; */}
  margin-bottom: ${(props) => (props.isSameSender ? "5px" : "15px")};
  padding: 10px 20px;
  background-color: ${props => (props.isSender ? '#e7e7e8' : '#d2e3fc')};
  border: 1px solid ${props => (props.isSender ? '#ccc' : '#aaa')};
  border-radius: 5px;
  max-width: 90%; /* Adjust for smaller screens */
  word-wrap: break-word;
  align-self: ${(props) => (props.isSender ? "flex-end" : "flex-start")};
  border-radius: ${(props) => (props.isSender ? "20px 20px 0 20px" : "20px 20px 20px 0")};
  float: ${props => (props.isSender ? 'right' : 'left')};
  clear: both;
  margin: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-align: ${props => (props.isSender ? 'right' : 'left')};
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


const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 16px; /* Adjust margins if needed */
  @media (max-width: 768px) {
    height: auto; /* Make it adjust based on content */
  }
`;