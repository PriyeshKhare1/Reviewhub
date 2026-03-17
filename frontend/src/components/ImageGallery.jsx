import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, Zoom } from "swiper/modules";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/thumbs";
import "swiper/css/zoom";

export default function ImageGallery({ images = [] }) {
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Swiper */}
        <Swiper
          modules={[Navigation, Pagination, Thumbs]}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          pagination={{ clickable: true }}
          thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
          spaceBetween={10}
          className="rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-800 relative group"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div
                className="relative w-full h-full cursor-zoom-in"
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.url || image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/80 dark:bg-slate-800/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl">
                    <ZoomIn className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}

          {/* Custom Navigation */}
          {images.length > 1 && (
            <>
              <button className="swiper-button-prev-custom absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </button>
              <button className="swiper-button-next-custom absolute right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
              </button>
            </>
          )}
        </Swiper>

        {/* Thumbnails */}
        {images.length > 1 && (
          <Swiper
            onSwiper={setThumbsSwiper}
            modules={[Thumbs]}
            spaceBetween={8}
            slidesPerView={Math.min(images.length, 6)}
            watchSlidesProgress
            className="thumbs-swiper"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div className="aspect-square rounded-lg overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-blue-500 transition-all">
                  <img
                    src={image.url || image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 z-50 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              onClick={() => setLightboxOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 rounded-full text-white text-sm">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Lightbox Swiper */}
            <Swiper
              modules={[Navigation, Zoom]}
              navigation
              zoom
              initialSlide={lightboxIndex}
              spaceBetween={50}
              className="w-full h-full"
              onClick={(e) => e.stopPropagation()}
              onSlideChange={(swiper) => setLightboxIndex(swiper.activeIndex)}
            >
              {images.map((image, index) => (
                <SwiperSlide key={index} className="flex items-center justify-center">
                  <div className="swiper-zoom-container">
                    <img
                      src={image.url || image}
                      alt={`Full size ${index + 1}`}
                      className="max-w-full max-h-[90vh] object-contain"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
