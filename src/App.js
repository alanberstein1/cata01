import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";

export default function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [nameTextObj, setNameTextObj] = useState(null);
  const [nameInput, setNameInput] = useState("Your Name");
  const [templates, setTemplates] = useState([]);
  const [user, setUser] = useState(null);

  const handleSaveTemplate = async () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const name = prompt("Enter a name for this template:");
    if (!name) return;

    await addDoc(collection(db, "templates"), {
      name,
      json
    });

    alert("Template saved successfully!");
  };

  const handleExportAsImage = () => {
    if (!canvas) return;
    const dataURL = canvas.toDataURL({ format: "png" });
    const link = document.createElement("a");
    link.download = "canvas-export.png";
    link.href = dataURL;
    link.click();
  };

  useEffect(() => {
    const newCanvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#fff"
    });

    // Add editable text
    const text = new fabric.Textbox(nameInput, {
      left: 200,
      top: 100,
      width: 300,
      fontSize: 30
    });

    newCanvas.add(text);
    setCanvas(newCanvas);
    setNameTextObj(text);

    // Setup image adder function
    window.addLibraryObject = (url) => {
      fabric.Image.fromURL(url, (img) => {
        img.left = 400;
        img.top = 200;
        img.scaleToWidth(100);
        newCanvas.add(img);
      });
    };

    const loadTemplates = async () => {
      const querySnapshot = await getDocs(collection(db, "templates"));
      const loaded = [];
      querySnapshot.forEach((doc) => {
        loaded.push({ id: doc.id, ...doc.data() });
      });
      setTemplates(loaded);
    };
    loadTemplates();

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Update canvas text live
  useEffect(() => {
    if (nameTextObj) {
      nameTextObj.text = nameInput;
      canvas.renderAll();
    }
  }, [nameInput, nameTextObj, canvas]);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans bg-gray-50 min-h-screen">
      {!user && (
        <button onClick={handleSignIn} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
          Sign in with Google
        </button>
      )}
      {user && (
        <div className="mb-4">
          Logged in as: {user.displayName}
        </div>
      )}
      <select onChange={(e) => {
        const selected = templates.find((t) => t.id === e.target.value);
        if (selected && selected.json && canvas) {
          canvas.loadFromJSON(selected.json, canvas.renderAll.bind(canvas));
        }
      }} className="mb-4 px-3 py-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring focus:ring-blue-200">
        <option value="">-- Select Template --</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div className="flex gap-2.5 mb-2.5">
        <div className="flex flex-col gap-2 p-4 bg-white rounded shadow-md w-48">
          <strong className="text-gray-700 mb-2">Library</strong>
          <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200" onClick={() => window.addLibraryObject("/objects/flower.png")}>🌸 Flower</button>
          <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200" onClick={() => window.addLibraryObject("/objects/car.png")}>🚗 Car</button>
          <button className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200" onClick={() => window.addLibraryObject("/objects/star.png")}>⭐ Star</button>
        </div>
      </div>
      <canvas ref={canvasRef} />
      {/* 
        To add a new template:
        1. Use the canvas tools to build your design.
        2. Click 'Save as New Template' to store it in Firestore.
        3. It will appear in the dropdown above for reuse or editing.
      */}
      <div className="mt-5">
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          className="text-lg p-2 w-full max-w-sm border border-gray-300 rounded mb-4 shadow-sm"
        />
        {/* 
        <div>
          <button onClick={() => window.addLibraryObject("/objects/flower.png")}>Add Flower</button>
          <button onClick={() => window.addLibraryObject("/objects/car.png")}>Add Car</button>
          <button onClick={() => window.addLibraryObject("/objects/star.png")}>Add Star</button>
        </div>
        */}
        <button
          onClick={handleSaveTemplate}
          className="mt-2.5 mr-3 px-4 py-2 text-base bg-green-500 text-white rounded shadow hover:bg-green-600 transition"
        >
          Save as New Template
        </button>
        <button
          onClick={handleExportAsImage}
          className="mt-2.5 px-4 py-2 text-base bg-indigo-500 text-white rounded shadow hover:bg-indigo-600 transition"
        >
          Export as PNG
        </button>
      </div>
    </div>
  );
}