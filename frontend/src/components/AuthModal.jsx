import React, { useState, useRef, useEffect } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Key } from 'lucide-react';
import { useAppDispatch } from '../redux/store';
import { loginUser, signupUser, forgotPassword, verifyOTP, resetPassword, logout } from '../redux/slices/authSlice';

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isOTPSent, setIsOTPSent] = useState(false);
  const [isOTPVerified, setIsOTPVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [resetToken, setResetToken] = useState(null);
  const otpInputs = useRef([]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!isOpen) {
      // Reset all states when modal closes
      setIsLogin(true);
      setIsForgotPassword(false);
      setIsOTPSent(false);
      setIsOTPVerified(false);
      setEmail('');
      setPassword('');
      setName('');
      setOtp(['', '', '', '', '', '']);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');
      setResetToken(null);
    } else {
      console.log('Current password state:', password); // Log password state when modal opens
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      await dispatch(forgotPassword({ email })).unwrap();
      setSuccessMessage('OTP sent to your email');
      setIsOTPSent(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const verifyOTPResponse = await dispatch(verifyOTP({ email, otp: fullOtp })).unwrap();
      setResetToken(verifyOTPResponse.resetToken);
      setSuccessMessage('OTP verified successfully');
      setIsOTPVerified(true);
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');
  
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
  
    try {
      // 1. First reset the password
      await dispatch(resetPassword({ email, newPassword, resetToken })).unwrap();
      
      // 2. Clear any existing auth state
      dispatch(logout()); // Make sure you import your logout action
      
      // 3. Show success message
      setSuccessMessage('Password reset successfully. Please login with your new password.');
      
      // 4. Reset form and show login
      setTimeout(() => {
        resetForgotPasswordFlow();
        setIsForgotPassword(false);
        setIsLogin(true);
        setPassword(''); // Clear password field
      }, 1000);
  
    } catch (err) {
      // Improved error handling
      const errorMessage = err.payload 
        ? err.payload 
        : err.message || 'An error occurred. Please try again.';
      setError(errorMessage);
      
      // Log detailed error for debugging
      console.error('Password reset error:', {
        error: err,
        email,
        hasToken: !!resetToken,
        newPasswordLength: newPassword.length
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    console.log('Login attempt with:', { email, password });

    try {
      if (isLogin) {
        await dispatch(loginUser({ email, password })).unwrap();
        onSuccess?.();
        onClose();
      } else {
        await dispatch(signupUser({ name, email, password })).unwrap();
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPasswordFlow = () => {
    setIsOTPSent(false);
    setIsOTPVerified(false);
    setOtp(['', '', '', '', '', '']);
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
    setResetToken(null);
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus to next input
    if (value && index < 5) {
      otpInputs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1].focus();
    }
  };

  const handleBackToSignIn = () => {
    resetForgotPasswordFlow();
    setIsForgotPassword(false);
  };

  return (
    <div className="fixed inset-0 bg-opacity-10 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isForgotPassword
              ? (isOTPVerified ? 'Reset Password' : isOTPSent ? 'Verify OTP' : 'Reset Password')
              : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={
          isForgotPassword
            ? (isOTPVerified ? handleResetPassword : isOTPSent ? handleVerifyOTP : handleSendOTP)
            : handleSubmit
        } className="p-6 space-y-4">
          {!isLogin && !isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                placeholder="Enter your email"
                required
                disabled={isOTPSent && isForgotPassword}
              />
            </div>
          </div>

          {isOTPSent && isForgotPassword && !isOTPVerified && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter 6-digit OTP
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (otpInputs.current[index] = el)}
                    className="w-12 h-12 text-center text-xl border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 dark:bg-gray-700"
                    inputMode="numeric"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>
          )}

          {isOTPVerified && isForgotPassword && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Enter new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                    placeholder="Confirm new password"
                    required
                  />
                </div>
              </div>
            </>
          )}

          {!isForgotPassword && !isOTPSent && !isOTPVerified && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {successMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Please wait...'
              : isForgotPassword
                ? (isOTPVerified
                  ? 'Reset Password'
                  : isOTPSent
                    ? 'Verify OTP'
                    : 'Send OTP')
                : isLogin
                  ? 'Sign In'
                  : 'Create Account'}
          </button>

          <div className="text-center space-y-2">
            {isLogin && !isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  resetForgotPasswordFlow();
                }}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
              >
                Forgot Password?
              </button>
            )}

            {isForgotPassword && (
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium"
              >
                {isOTPSent ? 'Change Email' : 'Back to Sign In'}
              </button>
            )}

            {!isForgotPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccessMessage('');
                }}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 text-sm font-medium block"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            )}
          </div>
        </form>

        {!isForgotPassword && (
          <div className="px-6 pb-6">
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <p className="text-sm text-green-700 dark:text-green-300 font-medium mb-2">
                Demo Credentials:
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                Email: demo@quranai.com<br />
                Password: demo123
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthModal;