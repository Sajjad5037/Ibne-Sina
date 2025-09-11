import { useState } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Map subject + chapter → images
  const imageMap = {
    Math: {
      Chapter1: ["/page_1.png", "/page_2.png"],
      Chapter2: ["/page_3.png", "/page_4.png"],
    },
    Physics: {
      Chapter1: ["/page_1.png"],
      Chapter2: ["/page_2.png", "/page_3.png"],
    },
    Biology: {
      Chapter1: ["/page_5.png", "/page_6.png"],
      Chapter3: ["/page_7.png"],
    },
  };

  const handleLoadImages = () => {
    if (subject && chapter && imageMap[subject]?.[chapter]) {
      setImages(imageMap[subject][chapter]);
      setCurrentIndex(0);
    } else {
      setImages([]);
      setCurrentIndex(0);
    }
  };

  const prevImage = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextImage = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Controls */}
      <div className="flex items-end gap-4 p-4 bg-gray-100 shadow z-10">
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select subject</option>
            <option value="Math">Math</option>
            <option value="Physics">Physics</option>
            <option value="Biology">Biology</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Chapter:</label>
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select chapter</option>
            <option value="Chapter1">Chapter 1</option>
            <option value="Chapter2">Chapter 2</option>
            <option value="Chapter3">Chapter 3</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="invisible mb-1">Load</label>
          <button
            onClick={handleLoadImages}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load Pages
          </button>
        </div>
      </div>

      {/* Image Carousel */}
      <div className="relative flex-1 flex items-center justify-center bg-gray-200">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`Page ${currentIndex + 1}`}
              className="object-contain w-full h-full"
            />

            {/* Navigation */}
            <button
              onClick={prevImage}
              disabled={currentIndex === 0}
              className="absolute left-4 bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              ◀
            </button>
            <button
              onClick={nextImage}
              disabled={currentIndex === images.length - 1}
              className="absolute right-4 bg-gray-300 px-4 py-2 rounded disabled:opacity-50"
            >
              ▶
            </button>

            {/* Page indicator */}
            <span className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded">
              Page {currentIndex + 1} / {images.length}
            </span>
          </>
        ) : (
          <p className="text-gray-500">No pages loaded yet.</p>
        )}
      </div>
    </div>
  );
}
