import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ChatPage from './ChatPage';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import TwoFactorAuth from './TwoFactorAuth';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgetPassword';
import NotFound from './NotFound';
import LandingPage from './landing-page/LandingPage';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/landingpage" element={<LandingPage />} />
          <Route path="/resetpassword" element={<ProtectedRoute element={<ResetPassword />} />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/" element={<RedirectToExternal url="http://35.226.248.205/home/" />} /> {/* Redirect '/' to external URL */}
          <Route path="/chatpage" element={<ProtectedRoute element={<ChatPage />} />} />
          <Route path="*" element={<NotFound />} /> {/* 404 Not Found */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;

const RedirectToExternal = ({ url }) => {
  useEffect(() => {
    window.location.href = url;
  }, [url]);

  return null; // or you can return a loading spinner or message
};
