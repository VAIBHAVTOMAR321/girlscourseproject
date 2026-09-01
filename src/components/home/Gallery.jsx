import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "../../assets/css/gallery.css";

const API_URL = 'https://brjobsedu.com/girls_course/girls_course_backend/api/our-gallery/';
const BASE_URL = 'https://brjobsedu.com/girls_course/girls_course_backend';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/media')) return BASE_URL + img;
  return img;
};

function Gallery() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightbox, setLightbox] = useState({ open: false, image: null, index: 0 });

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_URL);

        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const galleryImages = response.data.data
            .filter((item) => item.img !== null && item.img !== '')
            .map((item) => ({
              id: item.id,
              src: getImageUrl(item.img),
           
              date: item.created_at,
            }));
          setImages(galleryImages);
        } else {
          setError('No gallery images found.');
        }
      } catch (err) {
        console.error('Gallery fetch error:', err);
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const openLightbox = (index) => {
    setLightbox({ open: true, image: images[index], index });
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightbox({ open: false, image: null, index: 0 });
    document.body.style.overflow = 'auto';
  };

  const goPrev = (e) => {
    e.stopPropagation();
    const prevIndex = (lightbox.index - 1 + images.length) % images.length;
    setLightbox({ ...lightbox, image: images[prevIndex], index: prevIndex });
  };

  const goNext = (e) => {
    e.stopPropagation();
    const nextIndex = (lightbox.index + 1) % images.length;
    setLightbox({ ...lightbox, image: images[nextIndex], index: nextIndex });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.open) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrev(e);
      if (e.key === 'ArrowRight') goNext(e);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox, images]);

  return (
    <section className="gallery-section">
      <div className="gallery-header">
        <h2 className="gallery-title">Gallery</h2>
        <p className="gallery-subtitle">Explore the beautiful moments captured in our gallery</p>
      </div>

      {loading && (
        <div className="gallery-loading">
          <div className="gallery-spinner"></div>
          <p>Loading gallery...</p>
        </div>
      )}

      {error && !loading && (
        <div className="gallery-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p>{error}</p>
          <button className="gallery-retry-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="gallery-empty">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
            <circle cx="9" cy="9" r="2"/>
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
          </svg>
          <p>No images found in the gallery.</p>
        </div>
      )}

      {!loading && !error && images.length > 0 && (
        <div className="gallery-grid">
          {images.map((item, index) => (
            <div
              className="gallery-item"
              key={item.id}
              onClick={() => openLightbox(index)}
            >
              <div className="gallery-img-wrapper">
                <img
                  src={item.src}
                  alt={item.title}
                  className="gallery-img"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/seed/placeholder/600/400.jpg';
                  }}
                />
                <div className="gallery-overlay">
                  <div className="overlay-content">
                    <div>
                      <h3 className="overlay-title">{item.title}</h3>
                    </div>
                    <div className="overlay-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h6v6"/>
                        <path d="M10 14L21 3"/>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {lightbox.open && lightbox.image && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="lightbox-close" onClick={closeLightbox}>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"/>
                <path d="m6 6 12 12"/>
              </svg>
            </button>

            <img
              src={lightbox.image.src}
              alt={lightbox.image.title}
              className="lightbox-img"
            />

            <div className="lightbox-info">
              <h3 className="lightbox-title">
                {lightbox.image.title}
                <span className="lightbox-counter">
                  {lightbox.index + 1} / {images.length}
                </span>
              </h3>
            </div>

            {images.length > 1 && (
              <button className="lightbox-nav lightbox-prev" onClick={goPrev}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
              </button>
            )}
            {images.length > 1 && (
              <button className="lightbox-nav lightbox-next" onClick={goNext}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m9 18 6-6-6-6"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default Gallery;
