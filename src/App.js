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
    <div style={{ padding: 20 }}>
      {!user && (
        <button onClick={handleSignIn} style={{ marginBottom: 10 }}>
          Sign in with Google
        </button>
      )}
      {user && (
        <div style={{ marginBottom: 10 }}>
          Logged in as: {user.displayName}
        </div>
      )}
      <select onChange={(e) => {
        const selected = templates.find((t) => t.id === e.target.value);
        if (selected && selected.json && canvas) {
          canvas.loadFromJSON(selected.json, canvas.renderAll.bind(canvas));
        }
      }} style={{ marginBottom: 10 }}>
        <option value="">-- Select Template --</option>
        {templates.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <strong>Library</strong>
          <button onClick={() => window.addLibraryObject("/objects/flower.png")}>🌸 Flower</button>
          <button onClick={() => window.addLibraryObject("/objects/car.png")}>🚗 Car</button>
          <button onClick={() => window.addLibraryObject("/objects/star.png")}>⭐ Star</button>
        </div>
      </div>
      <canvas ref={canvasRef} />
      {/* 
        To add a new template:
        1. Use the canvas tools to build your design.
        2. Click 'Save as New Template' to store it in Firestore.
        3. It will appear in the dropdown above for reuse or editing.
      */}
      <div style={{ marginTop: 20 }}>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="Enter your name"
          style={{
            fontSize: "18px",
            padding: "8px",
            width: "300px",
            marginBottom: "10px"
          }}
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
          style={{ marginTop: "10px", padding: "8px", fontSize: "16px" }}
        >
          Save as New Template
        </button>
        <button
          onClick={handleExportAsImage}
          style={{ marginTop: "10px", padding: "8px", fontSize: "16px" }}
        >
          Export as PNG
        </button>
      </div>
    </div>
  );
}