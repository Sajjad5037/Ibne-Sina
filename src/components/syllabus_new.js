import { useState, useEffect } from "react";
import axios from "axios";

export default function syllabus_new() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [images, setImages] = useState([]);
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const API_BASE = "http://localhost:8000"; // replace with your backend URL

  // 🔹 Load available classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_BASE}/classes`);
        setClasses(res.data); // assume backend returns ["Class 7", "Class 8", ...]
      } catch (err) {
        console.error("Failed to fetch classes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClasses();
  }, []);

  // 🔹 Load subjects whenever class changes
  useEffect(() => {
    if (!className) return setSubjects([]);
    const fetchSubjects = async () => {
      try {
        const res = await axios.get(`${API_BASE}/subjects?class=${encodeURIComponent(className)}`);
        setSubjects(res.data); // assume backend returns ["Math", "Science", ...]
      } catch (err) {
        console.error("Failed to fetch subjects:", err);
        setSubjects([]);
      }
    };
    fetchSubjects();
  }, [className]);

  // 🔹 Load chapters whenever class or subject changes
  useEffect(() => {
    if (!className || !subject) return setChapters([]);
    const fetchChapters = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/chapters?class=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}`
        );
        setChapters(res.data); // assume backend returns ["Algebra", "Geometry", ...]
      } catch (err) {
        console.error("Failed to fetch chapters:", err);
        setChapters([]);
      }
    };
    fetchChapters();
  }, [className, subject]);

  // 🔹 Load images for selected chapter
  const handleLoadPages = async () => {
    if (!className || !subject || !chapter) return;
    try {
      const res = await axios.get(
        `${API_BASE}/chapter-images?class=${encodeURIComponent(className)}&subject=${encodeURIComponent(subject)}&chapter=${encodeURIComponent(chapter)}`
      );
      setImages(res.data); // assume backend returns ["url1", "url2", ...]
      setCurrentIndex(0);
    } catch (err) {
      console.error("Failed to load images:", err);
      setImages([]);
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
            onChange={(e) => {
              setClassName(e.target.value);
              setSubject("");
              setChapter("");
              setImages([]);
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Select class</option>
            {classes.map((cls) => (
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
            onChange={(e) => {
              setSubject(e.target.value);
              setChapter("");
              setImages([]);
            }}
            className="border border-gray-300 rounded-md px-3 py-2"
            disabled={!className}
          >
            <option value="">Select subject</option>
            {subjects.map((subj) => (
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
            {chapters.map((ch) => (
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
            <pre className="absolute top-2 left-2 bg-white text-xs p-1 rounded shadow">
              {images[currentIndex]}
            </pre>

            <img
              src={images[currentIndex]}
              alt={`Page ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

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
