import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { UserPlus, Loader2, Phone, Lock } from 'lucide-react';
import { baseUrl } from '../baseurl';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Modal from './Modal'; // keep Modal for generic messages
import { useDarkMode } from './DarkModeContext';

export default function Register() {
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Modal state (keeps using your existing Modal for messages)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalType, setModalType] = useState('info');
  const [modalContent, setModalContent] = useState(null);

  const openModal = (title, type, content) => {
    setModalTitle(title);
    setModalType(type);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  // New: unified submit handler that sends phone+password (stacked inputs)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // basic validation
    if (!phoneNumber) {
      openModal('Validation error', 'error', <p>Phone number is required.</p>);
      return;
    }

    if (!password) {
      openModal('Validation error', 'error', <p>Password is required.</p>);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        phnumber: phoneNumber,
        password: password,
      };

      const response = await axios.post(`${baseUrl}/api/def-token-register`, payload);

      // adjust logic depending on your API convention — here we follow your previous behaviour
      if (response.status === 201) {
        // 201 might mean "already exists" in your backend (kept from original code)
        openModal('Already exists!', 'warning', <p>{response.data?.message || 'This account already exists.'}</p>);
      } else {
        // success path
        openModal('Success!', 'success', <p>Welcome {response.data?.name || ''}</p>);

        // optionally store token or navigate — uncomment if your backend returns a token
        if (response.data?.token) {
          Cookies.set('token', response.data.token);
        }

        // navigate to search or dashboard if desired
        if (response.data?.name) {
          // small delay so user can read modal (optional)
          setTimeout(() => navigate('/search'), 700);
        }
      }
    } catch (error) {
      // if your backend sometimes returns 500 to indicate "need different endpoint" you can handle here
      const status = error?.response?.status;
      if (status === 500) {
        openModal('Server error', 'error', <p>Server returned an error (500). Try again later.</p>);
      } else if (status === 400 || status === 401) {
        openModal('Login failed', 'error', <p>{error?.response?.data?.message || 'Invalid credentials.'}</p>);
      } else {
        openModal('Error', 'error', <p>Failed to register. Please try again.</p>);
      }
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'} flex items-center justify-center p-4`}>
      <Navbar />

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
            <UserPlus className="h-6 w-6 text-white" />
          </div>
          <h2 className={`mt-6 text-3xl font-extrabold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
            Welcome to Spectra
          </h2>
          <p className={`mt-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Please enter your details to register
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Phone input */}
            <div>
              <label htmlFor="phone" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Student Phone Number (Netra)
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>

            {/* Password input (stacked) */}
            <div>
              <label htmlFor="password" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Password
              </label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`block w-full pl-11 pr-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`relative w-full flex justify-center py-3 px-4 rounded-lg text-sm font-semibold text-white transition-all duration-200 ease-in-out ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}>
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-blue-200" />
              ) : (
                <UserPlus className="h-5 w-5 text-blue-200" />
              )}
            </span>
            {loading ? 'Processing...' : 'Register Now'}
          </button>

          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="h-px w-12 bg-gray-200"></div>
            <span className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Already registered?</span>
            <div className="h-px w-12 bg-gray-200"></div>
          </div>

          <div className="text-center">
            <a href="/search" className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors duration-200`}>
              Check Details
            </a>
          </div>
        </form>
      </div>

      {/* Modal Component for messages */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalTitle} type={modalType}>
        {modalContent}
      </Modal>
    </div>
  );
}
