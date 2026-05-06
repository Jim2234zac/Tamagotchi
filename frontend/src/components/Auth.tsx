import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

interface User {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.toUpperCase()
    }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { username: formData.username, password: formData.password }
        : { 
            username: formData.username, 
            email: formData.email, 
            password: formData.password 
          };

      const response = await axios.post(`http://localhost:3001${endpoint}`, payload);
      
      if ((response.data as any).user) {
        // Login successful
        onAuthSuccess((response.data as any).user);
        setSuccess('Login successful! 🎮');
      } else {
        // Registration successful
        setSuccess('Registration successful! Please login 🎮');
        setIsLogin(true);
        setFormData({ username: '', email: '', password: '' });
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setFormData({ username: '', email: '', password: '' });
  };

  return (
    <div className="auth-container">
      <div className="auth-screen">
        <h1 className="auth-title">
          {isLogin ? '🔐 LOGIN' : '📝 REGISTER'}
        </h1>
        
        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            className="auth-input"
            placeholder="USERNAME"
            value={formData.username}
            onChange={handleInputChange}
            required
            maxLength={20}
          />
          
          {!isLogin && (
            <input
              type="email"
              name="email"
              className="auth-input"
              placeholder="EMAIL"
              value={formData.email}
              onChange={handleInputChange}
              required
              maxLength={100}
            />
          )}
          
          <input
            type="password"
            name="password"
            className="auth-input"
            placeholder="PASSWORD"
            value={formData.password}
            onChange={handleInputChange}
            required
            maxLength={50}
          />
          
          <button 
            type="submit" 
            className={`auth-btn ${isLogin ? 'login' : 'register'}`}
            disabled={loading}
          >
            {loading ? 'LOADING...' : (isLogin ? '🚀 LOGIN' : '📝 REGISTER')}
          </button>
        </form>
        
        <div className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <a href="#" onClick={toggleMode}>
            {isLogin ? 'REGISTER NOW' : 'LOGIN NOW'}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
