import React, { useState, useRef, useEffect } from "react";
import { LinkedList } from "../DataStructures/LinkedList";
import {
  Moon,
  Sun,
  Save,
  Upload,
  Undo,
  Redo,
  Search,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Clock,
} from "lucide-react";
import "./TextEditor.css";

const TextEditor = () => {
  const [text, setText] = useState("");
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [fontSize, setFontSize] = useState(16);
  const [alignment, setAlignment] = useState("left");
  const [darkMode, setDarkMode] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [findMode, setFindMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const linkedList = useRef(new LinkedList());
  const textareaRef = useRef(null);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && text) {
      const timer = setTimeout(() => {
        localStorage.setItem("editorContent", text);
        setLastSaved(new Date().toLocaleTimeString());
      }, 30000); // Auto-save every 30 seconds
      return () => clearTimeout(timer);
    }
  }, [text, autoSave]);

  // Load saved content
  useEffect(() => {
    const savedContent = localStorage.getItem("editorContent");
    if (savedContent) {
      setText(savedContent);
      linkedList.current.clear();
      [...savedContent].forEach((char) => linkedList.current.append(char));
    }
  }, []);

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setUndoStack((prev) => [...prev, text]);
    setRedoStack([]);
    setText(newText);

    linkedList.current.clear();
    [...newText].forEach((char) => linkedList.current.append(char));
  };

  const handleFind = () => {
    if (!searchText) return;

    const textarea = textareaRef.current;
    const content = textarea.value;
    const searchRegex = new RegExp(searchText, "gi");
    let match;
    let matches = [];

    while ((match = searchRegex.exec(content)) !== null) {
      matches.push(match.index);
    }

    if (matches.length > 0) {
      textarea.setSelectionRange(matches[0], matches[0] + searchText.length);
      textarea.focus();
    }
  };

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousText = undoStack[undoStack.length - 1];
      setRedoStack((prev) => [...prev, text]);
      setUndoStack((prev) => prev.slice(0, -1));
      setText(previousText);

      linkedList.current.clear();
      [...previousText].forEach((char) => linkedList.current.append(char));
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextText = redoStack[redoStack.length - 1];
      setUndoStack((prev) => [...prev, text]);
      setRedoStack((prev) => prev.slice(0, -1));
      setText(nextText);

      linkedList.current.clear();
      [...nextText].forEach((char) => linkedList.current.append(char));
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setUndoStack((prev) => [...prev, text]);
        setRedoStack([]);
        setText(content);

        linkedList.current.clear();
        [...content].forEach((char) => linkedList.current.append(char));
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "edited-file.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setLastSaved(new Date().toLocaleTimeString());
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-gray-200" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div className="max-w-6xl mx-auto p-6">
        <div
          className={`rounded-lg shadow-lg p-6 ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">Text Editor</h1>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {darkMode ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last saved: {lastSaved}</span>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={() => setAutoSave(!autoSave)}
                  className="rounded"
                />
                <span className="text-sm">Auto-save</span>
              </label>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex items-center space-x-4">
              <label
                className={`inline-flex items-center px-4 py-2 rounded cursor-pointer ${
                  darkMode
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-500 hover:bg-blue-600"
                } text-white`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
                <input
                  type="file"
                  className="hidden"
                  accept=".txt"
                  onChange={handleFileUpload}
                />
              </label>
              <button
                onClick={handleUndo}
                disabled={undoStack.length === 0}
                className={`inline-flex items-center px-4 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                <Undo className="w-4 h-4 mr-2" />
                Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={redoStack.length === 0}
                className={`inline-flex items-center px-4 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                <Redo className="w-4 h-4 mr-2" />
                Redo
              </button>
              <button
                onClick={handleDownload}
                className={`inline-flex items-center px-4 py-2 rounded ${
                  darkMode
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Type className="w-4 h-4" />
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(parseInt(e.target.value))}
                  className={`border rounded p-1 ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {[12, 14, 16, 18, 20, 24, 28, 32].map((size) => (
                    <option key={size} value={size}>
                      {size}px
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => setAlignment("left")}
                  className={`p-2 rounded ${
                    alignment === "left" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  <AlignLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlignment("center")}
                  className={`p-2 rounded ${
                    alignment === "center" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  <AlignCenter className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setAlignment("right")}
                  className={`p-2 rounded ${
                    alignment === "right" ? "bg-blue-500 text-white" : ""
                  }`}
                >
                  <AlignRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Find in text..."
                  className={`pl-8 pr-4 py-2 rounded ${
                    darkMode
                      ? "bg-gray-700 border-gray-600"
                      : "bg-white border-gray-300"
                  }`}
                />
                <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              </div>
              <button
                onClick={handleFind}
                className={`px-4 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                Find
              </button>
            </div>
          </div>

          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            style={{
              fontSize: `${fontSize}px`,
              textAlign: alignment,
            }}
            className={`w-full h-[60vh] p-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? "bg-gray-700 text-gray-200" : "bg-white text-gray-800"
            }`}
            placeholder="Start typing or upload a file..."
          />

          <div className="mt-4 flex justify-between text-sm">
            <div>Characters: {linkedList.current.length}</div>
            <div>
              Words: {text.trim() ? text.trim().split(/\s+/).length : 0}
            </div>
            <div>Lines: {text ? text.split("\n").length : 0}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditor;
