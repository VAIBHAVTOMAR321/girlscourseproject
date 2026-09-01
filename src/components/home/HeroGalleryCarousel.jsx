import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import "../../assets/css/hero-carousel.css";

const GALLERY_API = 'https://brjobsedu.com/girls_course/girls_course_backend/api/our-gallery/';
const BASE_URL = 'https://brjobsedu.com/girls_course/girls_course_backend';

const getImageUrl = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  if (img.startsWith('/media')) return BASE_URL + img;
  return img;
};

const DEFAULT_SLIDES = [
  {
    id: 'fallback-1',
    src: 'https://picsum.photos/id/1015/1920/1080',
   
  },
  {
    id: 'fallback-2',
    src: 'https://picsum.photos/id/1016/1920/1080',
 
  },
  {
    id: 'fallback-3',
    src: 'https://picsum.photos/id/1018/1920/1080',
   
  },
];

const HeroGalleryCarousel = ({
  slides: propSlides,
  autoplayInterval = 2000,
}) => {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const autoPlayRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  /* ---- Fetch gallery images from API ---- */
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        setIsLoading(true);
        console.log('🎨 Fetching gallery images from:', GALLERY_API);
        const response = await axios.get(GALLERY_API);
        console.log('📸 API Response:', response.data);
        
        if (
          response.data &&
          response.data.success &&
          Array.isArray(response.data.data) &&
          response.data.data.length > 0
        ) {
          const galleryImages = response.data.data
            .filter((item) => item.img)
            .map((item, index) => ({
              id: item.id || `api-${index}`,
              src: getImageUrl(item.img),
              heading: DEFAULT_SLIDES[index % DEFAULT_SLIDES.length].heading,
              description:
                DEFAULT_SLIDES[index % DEFAULT_SLIDES.length].description,
              btnText: DEFAULT_SLIDES[index % DEFAULT_SLIDES.length].btnText,
            }));
          console.log('✅ Gallery Images Loaded:', galleryImages.length, galleryImages);
          if (galleryImages.length > 0) {
            setSlides(galleryImages);
            setIsLoading(false);
            return;
          }
        }
        // Fallback to default slides if API fails or returns empty
        console.warn('⚠️ No gallery images found, using default slides');
        setSlides(propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES);
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching gallery images:', error);
        // Fallback to default slides on error
        setSlides(propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES);
        setIsLoading(false);
      }
    };

    if (propSlides && propSlides.length > 0) {
      console.log('📋 Using provided slides:', propSlides.length);
      setSlides(propSlides);
      setIsLoading(false);
    } else {
      fetchGalleryImages();
    }
  }, [propSlides]);

  /* ---- Autoplay ---- */
  const startAutoPlay = useCallback(() => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      goToNext();
    }, autoplayInterval);
  }, [slides.length, currentIndex, autoplayInterval]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (slides.length > 0) {
      startAutoPlay();
      return () => stopAutoPlay();
    }
  }, [slides.length, startAutoPlay, stopAutoPlay]);

  /* ---- Navigation ---- */
  const goToSlide = useCallback(
    (index) => {
      if (isTransitioning || slides.length === 0) return;
      setIsTransitioning(true);
      setCurrentIndex(((index % slides.length) + slides.length) % slides.length);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning, slides.length]
  );

  const goToNext = useCallback(() => {
    goToSlide(currentIndex + 1);
  }, [currentIndex, goToSlide]);

  const goToPrev = useCallback(() => {
    goToSlide(currentIndex - 1);
  }, [currentIndex, goToSlide]);

  /* ---- Touch / Swipe ---- */
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  /* ---- Keyboard ---- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToPrev, goToNext]);

  if (slides.length === 0) {
    console.warn('⚠️ No slides available');
    return null;
  }

  return (
    <div
      id="heroCarousel"
      className="hero-carousel"
      onMouseEnter={stopAutoPlay}
      onMouseLeave={startAutoPlay}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ---- Slides ---- */}
      <div className="carousel-inner">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
            style={{ backgroundImage: `url('${slide.src}')` }}
          >
            <div className="carousel-overlay">
              <h1 className="carousel-heading">{slide.heading}</h1>
              <p className="carousel-description">{slide.description}</p>
             
            </div>
          </div>
        ))}
      </div>

      {/* ---- Glass Controls ---- */}
      {slides.length > 1 && (
        <>
          <button
            className="glass-control prev"
            type="button"
            onClick={goToPrev}
            aria-label="Previous slide"
          >
            &#10094;
          </button>
          <button
            className="glass-control next"
            type="button"
            onClick={goToNext}
            aria-label="Next slide"
          >
            &#10095;
          </button>
        </>
      )}

      {/* ---- Dot Indicators ---- */}
      {slides.length > 1 && (
        <div className="carousel-indicators-custom">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* ---- Slide Counter ---- */}
      <div className="slide-counter">
        <span className="counter-current">
          {String(currentIndex + 1).padStart(2, '0')}
        </span>
        <span className="counter-sep">/</span>
        <span className="counter-total">
          {String(slides.length).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default HeroGalleryCarousel;