import { useState } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Static mapping: subject → chapter → images
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

  const prevPage = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const nextPage = () => {
    if (currentIndex < images.length - 1) setCurrentIndex(currentIndex + 1);
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Controls */}
      <div className="flex items-end gap-4 p-4 bg-gray-200 shadow z-10">
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

      {/* Image Viewer */}
      <div className="relative flex-1 flex justify-center items-center bg-gray-50 overflow-hidden">
        {images.length > 0 ? (
          <>
            <img
              src={images[currentIndex]}
              alt={`Page ${currentIndex + 1}`}
              className="w-full h-full object-contain"
            />

            {/* Navigation */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-6 transform -translate-y-1/2">
              <button
                onClick={prevPage}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                ◀
              </button>
              <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                Page {currentIndex + 1} / {images.length}
              </span>
              <button
                onClick={nextPage}
                disabled={currentIndex === images.length - 1}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No pages loaded yet.</p>
        )}
      </div>
    </div>
  );
}
