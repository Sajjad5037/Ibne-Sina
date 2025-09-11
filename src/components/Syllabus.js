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
    <div className="h-screen w-screen flex flex-col">
      {/* Controls */}
      <div className="flex items-end gap-4 p-4 bg-gray-100 shadow">
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

      {/* PDF Viewer */}
      <div className="relative flex-1">
        {pdfFile && pages.length > 0 ? (
          <>
            <iframe
              src={`${pdfFile}#page=${pages[currentPageIndex]}`}
              width="100%"
              height="100%"
              title={`PDF Page ${pages[currentPageIndex]}`}
              className="border-0"
            />

            {/* Navigation */}
            <div className="absolute top-1/2 left-0 right-0 flex justify-between items-center px-6">
              <button
                onClick={prevPage}
                disabled={currentPageIndex === 0}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                ◀
              </button>
              <span className="text-white bg-black bg-opacity-50 px-3 py-1 rounded">
                Page {currentPageIndex + 1} / {pages.length}
              </span>
              <button
                onClick={nextPage}
                disabled={currentPageIndex === pages.length - 1}
                className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500 p-4">No PDF loaded yet.</p>
        )}
      </div>
    </div>
  );
}
