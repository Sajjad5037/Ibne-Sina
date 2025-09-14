import { useState, useEffect } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [className, setClassName] = useState("");
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageMap, setImageMap] = useState({});
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch the image map JSON from your GCS bucket on mount
  useEffect(() => {
    const fetchImageMap = async () => {
      try {
        const res = await fetch(
          "https://storage.googleapis.com/ibne_sina_app/imageMap.json"
        );
        const data = await res.json();
        setImageMap(data);
      } catch (err) {
        console.error("Failed to load imageMap.json", err);
      } finally {
        setLoading(false);
      }
    };
    fetchImageMap();
  }, []);

  const handleLoadPages = () => {
    if (
      subject &&
      chapter &&
      className &&
      imageMap[subject]?.[chapter]?.[className]
    ) {
      setImages(imageMap[subject][chapter][className]);
      setCurrentIndex(0);
    } else {
      setImages([]);
      setCurrentIndex(0);
    }
  };

  const prevPage = () => currentIndex > 0 && setCurrentIndex(currentIndex - 1);
  const nextPage = () =>
    currentIndex < images.length - 1 && setCurrentIndex(currentIndex + 1);

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

    {/* Load Pages Button */}
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
    {images.length > 0 ? (
      <>
        <img
          src={images[currentIndex]}
          alt={`Page ${currentIndex + 1}`}
          className="w-full h-full object-contain transform scale-100"
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
