import { useState } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [pdfFile, setPdfFile] = useState("");
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  // Static PDF mapping
  const pdfMap = {
    Math: {
      Chapter1: { file: "/GRE-Verbal-Reasoning.pdf", pages: [1, 2] },
      Chapter2: { file: "/GRE-Verbal-Reasoning.pdf", pages: [3, 4] },
    },
    Physics: {
      Chapter1: { file: "/GRE-Verbal-Reasoning.pdf", pages: [1] },
      Chapter2: { file: "/GRE-Verbal-Reasoning.pdf", pages: [2, 3] },
    },
    Biology: {
      Chapter1: { file: "/GRE-Verbal-Reasoning.pdf", pages: [5, 6] },
      Chapter3: { file: "/GRE-Verbal-Reasoning.pdf", pages: [7] },
    },
  };

  const handleLoadPdf = () => {
    if (subject && chapter && pdfMap[subject]?.[chapter]) {
      setPdfFile(pdfMap[subject][chapter].file);
      setPages(pdfMap[subject][chapter].pages);
      setCurrentPageIndex(0);
    } else {
      setPdfFile("");
      setPages([]);
      setCurrentPageIndex(0);
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) setCurrentPageIndex(currentPageIndex - 1);
  };

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) setCurrentPageIndex(currentPageIndex + 1);
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Controls */}
      <div className="flex items-end gap-4 mb-6">
        {/* Subject */}
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

        {/* Chapter */}
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

        {/* Load PDF */}
        <div className="flex flex-col">
          <label className="invisible mb-1">Load</label>
          <button
            onClick={handleLoadPdf}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load PDF
          </button>
        </div>
      </div>

      {/* Carousel PDF Viewer */}
      {pdfFile && pages.length > 0 ? (
        <div className="flex flex-col items-center">
          <iframe
            src={`${pdfFile}#page=${pages[currentPageIndex]}`}
            width="100%"
            height="900px"
            title={`PDF Page ${pages[currentPageIndex]}`}
            className="border rounded shadow mb-4"
          />

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <button
              onClick={prevPage}
              disabled={currentPageIndex === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              ◀ Previous
            </button>
            <span>
              Page {currentPageIndex + 1} of {pages.length}
            </span>
            <button
              onClick={nextPage}
              disabled={currentPageIndex === pages.length - 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 mt-4">No PDF loaded yet.</p>
      )}
    </div>
  );
}
