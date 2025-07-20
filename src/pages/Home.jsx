import { useState, useEffect } from 'react';
import { getApod, enhanceApodData } from '../api/nasa';
import ApodCard from '../components/ApodCard';
import DatePicker from '../components/DatePicker';
import Loader from '../components/Loader';

const Home = () => {
  const [apod, setApod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [user, setUser] = useState(null);

  // Mock user data storage
  const mockUsers = [
    { email: 'user@example.com', password: 'password123', name: 'Demo User' }
  ];

  const fetchApod = async (date = '') => {
    try {
      setLoading(true);
      setError(null);
      const data = await getApod(date);
      
      if (!data.display_url && !data.url && !data.hdurl) {
        throw new Error('No valid image URL found');
      }
      
      setApod(data);
      setSelectedDate(date || '');
    } catch (err) {
      setError(err.message);
      console.error('APOD fetch error:', err);
      
      if (err.cause?.response?.data) {
        try {
          setApod(enhanceApodData(err.cause.response.data));
        } catch (enhanceError) {
          console.error('Enhance error failed:', enhanceError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApod();
  }, []);

  const handleAuthChange = (e) => {
    const { name, value } = e.target;
    setAuthForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    
    if (isLogin) {
      // Mock login
      const foundUser = mockUsers.find(
        u => u.email === authForm.email && u.password === authForm.password
      );
      
      if (foundUser) {
        setUser(foundUser);
        setShowAuthModal(false);
        setAuthForm({ email: '', password: '', name: '' });
      } else {
        alert('Invalid credentials');
      }
    } else {
      // Mock signup
      if (authForm.email && authForm.password && authForm.name) {
        const newUser = {
          email: authForm.email,
          password: authForm.password,
          name: authForm.name
        };
        setUser(newUser);
        setShowAuthModal(false);
        setAuthForm({ email: '', password: '', name: '' });
        alert('Account created successfully!');
      } else {
        alert('Please fill all fields');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (loading && !apod) return <Loader />;

  return (
    <main className="home-container">
      <div className="auth-controls">
        {user ? (
          <div className="user-info">
            <span>Welcome, {user.name}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button 
            className="auth-button"
            onClick={() => setShowAuthModal(true)}
          >
            Login / Sign Up
          </button>
        )}
      </div>

      <h1>Astronomy Picture of the Day</h1>
      <DatePicker onDateSelect={fetchApod} />
      
      {error ? (
        <div className="error-message">
          <p>{error}</p>
          {apod && <ApodCard apod={apod} />}
          <div className="error-actions">
            <button onClick={() => fetchApod(selectedDate)}>Retry</button>
            <a 
              href={`https://apod.nasa.gov/apod/ap${selectedDate.replace(/-/g, '').slice(2)}.html`} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              View on NASA Website
            </a>
          </div>
        </div>
      ) : (
        apod && <ApodCard apod={apod} />
      )}

      {showAuthModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <button 
              className="close-button"
              onClick={() => setShowAuthModal(false)}
            >
              &times;
            </button>
            
            <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
            
            <form onSubmit={handleAuthSubmit}>
              {!isLogin && (
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={authForm.name}
                    onChange={handleAuthChange}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={authForm.email}
                  onChange={handleAuthChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={authForm.password}
                  onChange={handleAuthChange}
                  required
                />
              </div>
              
              <button type="submit" className="submit-button">
                {isLogin ? 'Login' : 'Sign Up'}
              </button>
            </form>
            
            <p className="auth-toggle">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button 
                className="toggle-button"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign up' : 'Login'}
              </button>
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default Home;