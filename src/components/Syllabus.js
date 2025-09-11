import { useState } from "react";

export default function Syllabus() {
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [pdfPages, setPdfPages] = useState([]);

  // Static PDF mapping (subject + chapter → file + pages)
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

  const handleFetchPdf = () => {
    if (subject && chapter && pdfMap[subject]?.[chapter]) {
      setPdfPages(pdfMap[subject][chapter]);
    } else {
      setPdfPages([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Controls Row */}
      <div className="flex items-end gap-4 mb-6">
        {/* Subject */}
        <div className="flex flex-col">
          <label htmlFor="subject" className="font-medium text-gray-700 mb-1">
            Subject:
          </label>
          <select
            id="subject"
            className="border border-gray-300 rounded-md px-3 py-2"
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
        <div className="flex flex-col">
          <label htmlFor="chapter" className="font-medium text-gray-700 mb-1">
            Chapter:
          </label>
          <select
            id="chapter"
            className="border border-gray-300 rounded-md px-3 py-2"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
          >
            <option value="">Select chapter</option>
            <option value="Chapter1">Chapter 1</option>
            <option value="Chapter2">Chapter 2</option>
            <option value="Chapter3">Chapter 3</option>
          </select>
        </div>

        {/* Load PDFs Button */}
        <div className="flex flex-col">
          <label className="invisible mb-1">Load</label>
          <button
            onClick={handleFetchPdf}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Load Pages
          </button>
        </div>
      </div>

      {/* PDF Pages container */}
      <div className="mt-6 grid grid-cols-1 gap-6">
        {pdfPages.file && pdfPages.pages.length > 0 ? (
          pdfPages.pages.map((p) => (
            <iframe
              key={p}
              src={`${pdfPages.file}#page=${p}`}
              width="100%"
              height="600px"
              title={`PDF Page ${p}`}
              className="border rounded shadow"
            />
          ))
        ) : (
          <p className="text-gray-500">No PDF loaded yet.</p>
        )}
      </div>
    </div>
  );
}
