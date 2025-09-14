import { useState, useEffect } from "react";

export default function Syllabus() {
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [imageMap, setImageMap] = useState({});
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // 🔹 Load image map from GCS on mount
  useEffect(() => {
    const fetchImageMap = async () => {
      try {
        const response = await fetch(
          "https://storage.googleapis.com/ibne_sina_app/imageMap1.json"
        );
        const data = await response.json();
        setImageMap(data);
      } catch (error) {
        console.error("❌ Failed to load imageMap1.json", error);
      } finally {
        setLoading(false);
      }
    };

    fetchImageMap();
  }, []);

  // 🔹 Load pages based on user selection
  const handleLoadPages = () => {
    console.log("Selected:", { className, subject, chapter });
    console.log("Available classes:", Object.keys(imageMap));

    if (className && imageMap[className]) {
      console.log("Available subjects:", Object.keys(imageMap[className]));
    }
    if (className && subject && imageMap[className]?.[subject]) {
      console.log(
        "Available chapters:",
        Object.keys(imageMap[className][subject])
      );
    }

    const pages = imageMap[className]?.[subject]?.[chapter];

    if (pages?.length) {
      console.log("✅ Found pages:", pages);
      setImages(pages);
      setCurrentIndex(0);
    } else {
      console.warn("⚠️ No matching pages found");
      setImages([]);
      setCurrentIndex(0);
    }
  };

  // 🔹 Navigation
  const prevPage = () => currentIndex > 0 && setCurrentIndex((i) => i - 1);
  const nextPage = () =>
    currentIndex < images.length - 1 && setCurrentIndex((i) => i + 1);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading syllabus data...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col">
      {/* Controls */}
      <div className="flex items-end gap-4 p-4 bg-gray-100 shadow z-10">
        {/* Class */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Class:</label>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select class</option>
            {Object.keys(imageMap).map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        {/* Subject */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Subject:</label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            disabled={!className}
          >
            <option value="">Select subject</option>
            {className &&
              Object.keys(imageMap[className] || {}).map((subj) => (
                <option key={subj} value={subj}>
                  {subj}
                </option>
              ))}
          </select>
        </div>

        {/* Chapter */}
        <div className="flex flex-col">
          <label className="font-medium text-gray-700 mb-1">Chapter:</label>
          <select
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
            disabled={!subject}
          >
            <option value="">Select chapter</option>
            {subject &&
              Object.keys(imageMap[className]?.[subject] || {}).map((ch) => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
          </select>
        </div>

        {/* Load Pages */}
        <div className="flex flex-col">
          <label className="invisible mb-1">Load</label>
          <button
            onClick={handleLoadPages}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load Pages
          </button>
        </div>
      </div>

      {/* Image Viewer */}
      <div className="relative flex-1 flex justify-center items-center bg-gray-50">
        {images.length ? (
          <>
            {/* Debug helper */}
            <pre className="absolute top-2 left-2 bg-white text-xs p-1 rounded shadow">
              {images[currentIndex]}
            </pre>

            <img
              src={images[currentIndex]}
              alt={`Page ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
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
          <p className="text-gray-500 p-4">No pages loaded yet.</p>
        )}
      </div>
    </div>
  );
}
