import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignIn from './SignIn';
import SignUp from './SignUp';
import ChatPage from './ChatPage';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from './AuthContext';
import TwoFactorAuth from './TwoFactorAuth';
import ResetPassword from './ResetPassword';
import ForgotPassword from './ForgetPassword';
import NotFound from './NotFound';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/2fa" element={<TwoFactorAuth />} />
          <Route path="/resetpassword" element={<ProtectedRoute element={<ResetPassword />} />} />
          <Route path="/forgetpassword" element={<ForgotPassword />} />
          <Route path="/" element={<SignIn />} /> {/* Default to SignIn */}
          <Route path="/chatpage" element={<ProtectedRoute element={<ChatPage />} />} />
          <Route path="*" element={<NotFound />} /> {/* 404 Not Found */}
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
