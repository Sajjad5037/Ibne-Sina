import { useState } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [images, setImages] = useState([]);

  const handleFetchImages = async () => {
    // Example: call backend API with subject & chapter
    try {
      const res = await fetch(
        `http://localhost:5000/api/images?subject=${subject}&chapter=${chapter}`
      );
      const data = await res.json();
      setImages(data.images || []);
    } catch (err) {
      console.error("Error fetching images", err);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      {/* Subject */}
      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="subject" className="font-medium text-gray-700">
          Subject:
        </label>
        <select
          id="subject"
          className="border border-gray-300 rounded-md px-3 py-2 flex-1"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          <option value="">Select subject</option>
          <option value="Math">Math</option>
          <option value="Physics">Physics</option>
          <option value="Biology">Biology</option>
        </select>
      </div>

      {/* Chapter */}
      <div className="mb-4">
        <label
          htmlFor="chapter"
          className="block mb-2 font-medium text-gray-700"
        >
          Chapter:
        </label>
        <select
          id="chapter"
          className="border border-gray-300 rounded-md px-3 py-2 w-full"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
        >
          <option value="">Select chapter</option>
          <option value="Chapter1">Chapter 1</option>
          <option value="Chapter2">Chapter 2</option>
          <option value="Chapter3">Chapter 3</option>
        </select>
      </div>

      {/* Button to fetch images */}
      <button
        onClick={handleFetchImages}
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        Load Images
      </button>

      {/* Images container */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        {images.length > 0 ? (
          images.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`related-${idx}`}
              className="rounded-lg border shadow"
            />
          ))
        ) : (
          <p className="text-gray-500 col-span-2">No images loaded yet.</p>
        )}
      </div>
    </div>
  );
}
