import { useState, useEffect, useCallback } from 'react';
import { format, subDays } from 'date-fns';
import { getApodRange } from '../api/nasa';
import ApodCard from '../components/ApodCard';
import Loader from '../components/Loader';

const Gallery = () => {
  const [apods, setApods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(7);

  const fetchGallery = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), days - 1), 'yyyy-MM-dd');
      
      console.log('Fetching from', startDate, 'to', endDate);
      const data = await getApodRange(startDate, endDate);
      
      setApods(data.reverse()); // Newest first
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchGallery();
  }, [fetchGallery]);

  return (
    <main className="gallery-page">
      <h1>APOD Gallery</h1>
      
      <div className="gallery-controls">
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          disabled={loading}
        >
          <option value={7}>Last 7 Days</option>
          <option value={14}>Last 14 Days</option>
          <option value={30}>Last 30 Days</option>
        </select>
        
        <button onClick={fetchGallery} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="error-message">
          <p>{error}</p>
          <div className="error-help">
            {error.includes('API key') && (
              <p>Get a free key at <a href="https://api.nasa.gov" target="_blank" rel="noopener">api.nasa.gov</a></p>
            )}
            <button onClick={fetchGallery}>Retry</button>
          </div>
        </div>
      ) : (
        <div className="gallery-grid">
          {apods.length > 0 ? (
            apods.map((apod) => <ApodCard key={apod.date} apod={apod} />)
          ) : (
            !loading && <p className="no-results">No images found for this period</p>
          )}
        </div>
      )}
    </main>
  );
};

export default Gallery;