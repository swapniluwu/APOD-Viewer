import { useState } from 'react';
import { FaCalendarAlt, FaExternalLinkAlt, FaDownload } from 'react-icons/fa';
import PropTypes from 'prop-types';

const ApodCard = ({ apod }) => {
  const [downloadStatus, setDownloadStatus] = useState({
    loading: false,
    error: null
  });

  const handleDownload = () => {
    if (!apod.download_url) {
      setDownloadStatus({ error: 'No download available' });
      return;
    }

    setDownloadStatus({ loading: true, error: null });
    try {
      const link = document.createElement('a');
      link.href = apod.download_url;
      link.download = `NASA-APOD-${apod.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      setDownloadStatus({ loading: false, error: 'Download failed', message:error.message });
    } finally {
      setDownloadStatus(prev => ({ ...prev, loading: false }));
    }
  };

  if (!apod) return null;

  return (
    <div className="apod-card">
      <h2>{apod.title}</h2>
      <p className="apod-date">
        <FaCalendarAlt /> {apod.date}
      </p>
      
      <div className="apod-media">
        {apod.media_type === 'image' ? (
          <img 
            src={apod.display_url} 
            alt={apod.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder.jpg';
            }}
          />
        ) : (
          <div className="video-container">
            <iframe
              src={apod.url}
              title={apod.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      <p className="apod-explanation">{apod.explanation}</p>
      
      <div className="apod-actions">
        <button 
          onClick={handleDownload}
          disabled={downloadStatus.loading || !apod.download_url}
        >
          {downloadStatus.loading ? 'Downloading...' : (
            <>
              <FaDownload /> Download
            </>
          )}
        </button>
        <a
          href={apod.url}
          target="_blank"
          rel="noopener noreferrer"
          className="external-link"
        >
          <FaExternalLinkAlt /> View Original
        </a>
      </div>

      {downloadStatus.error && (
        <p className="download-error">{downloadStatus.error}</p>
      )}
    </div>
  );
};

ApodCard.propTypes = {
  apod: PropTypes.shape({
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    explanation: PropTypes.string,
    media_type: PropTypes.oneOf(['image', 'video']),
    url: PropTypes.string,
    hdurl: PropTypes.string,
    thumbnail_url: PropTypes.string,
    display_url: PropTypes.string,
    download_url: PropTypes.string
  })
};

export default ApodCard;