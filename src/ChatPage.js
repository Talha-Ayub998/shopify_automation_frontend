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
  const [isTyping, setIsTyping] = useState(false);
  const [typingDots, setTypingDots] = useState('');
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
          graph: msg.graph || null,
          isSender: msg.is_sender
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

  useEffect(() => {
    let interval;
    if (isTyping) {
      interval = setInterval(() => {
        setTypingDots(prev => (prev.length < 3 ? prev + '.' : ''));
      }, 500);  // Adjust the timing for the dots animation
    } else {
      setTypingDots('');
    }
    return () => clearInterval(interval);
  }, [isTyping]);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { text: input, isSender: true };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setIsTyping(true);
    setInput(''); // Clear the input field immediately

    try {
      // Make a POST request to your Django API using the api instance
      const response = await api.post('chat/chatbot/', {
        user_id: userId, // Ensure userId is defined and correct
        prompt: input,
      });
      // Extract the bot's response and graph (if any)
      const { description, graph } = response.data;
      const botMessage = { text: description, isSender: false };

      // Update the messages state with the bot's text response
      setMessages(prevMessages => [...prevMessages, botMessage]);

      // If there is a graph, add it to the messages
      if (graph) {
        const graphMessage = { graph, isSender: false };
        setMessages(prevMessages => [...prevMessages, graphMessage]);
      }

      // Save the user message to Django backend
      await api.post('chat/messages/', {
        message_text: input,
        session_id: sessionId, // Pass the session ID if using session-based chat
        is_sender: true, // Indicate that the message is from the user
      });

      // Save the bot's text response to Django backend
      await api.post('chat/messages/', {
        message_text: description,
        session_id: sessionId, // Pass the session ID if using session-based chat
        is_sender: false, // Indicate that the message is from the bot
      });

      // Save the bot's graph (if any) to Django backend
      if (graph) {
        await api.post('chat/messages/', {
          graph: graph,  // Pass the graph data
          session_id: sessionId, // Pass the session ID if using session-based chat
          is_sender: false, // Indicate that the message is from the bot (graph)
        });
      }

    } catch (error) {
      console.error('Error fetching response from the API or saving to Django:', error);
    } finally {
      // Remove the bot typing indicator
      setIsTyping(false);
    }
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
              {msg.text && (
                <MessageText isSender={msg.isSender}>
                  {formatMessageText(msg.text)}
                </MessageText>
              )}
              {msg.graph && (
                <img src={`data:image/png;base64,${msg.graph}`} alt="Graph" style={{ width: '100%', maxHeight: '500px', objectFit: 'contain' }} />
              )}
            </Message>
          ))}
          {isTyping && (
            <Message isSender={false}>
              <MessageText isSender={false}>
                {typingDots || '...'}
              </MessageText>
            </Message>
          )}
        </Body>
        <InputContainer>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault(); // Prevent default Enter behavior (new line)
                handleSendMessage();
              }
            }}
            rows={4} // Adjust rows to control height
            disabled={isTyping}
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </InputContainer>
      </ChatPageContainer>
      <ToastContainer />
    </PageWrapper>
  );

};

export default ChatPage;

const MessageText = styled.div`
  text-align: left
`;

const Logo = styled.img`
  height: 150px;
  margin: 8px 0 0 0rem;
`;

const Textarea = styled.textarea`
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
  max-width: 1000px; /* Adjusted for smaller screens */
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
  margin: 16px 16px; /* Adjust margins if needed */
  @media (max-width: 768px) {
    height: auto; /* Make it adjust based on content */
  }
`;