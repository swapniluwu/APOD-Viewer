import { useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import './App.css';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import Loader from './components/Loader';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  const [view, setView] = useState('home');

  return (
    <div className="App">
      <nav>
        <button 
          onClick={() => setView('home')} 
          className={view === 'home' ? 'active' : ''}
        >
          Today's Picture
        </button>
        <button 
          onClick={() => setView('gallery')} 
          className={view === 'gallery' ? 'active' : ''}
        >
          Gallery
        </button>
      </nav>
      
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.reload()}
      >
        {view === 'home' ? <Home /> : <Gallery />}
      </ErrorBoundary>
    </div>
  );
}

export default App;