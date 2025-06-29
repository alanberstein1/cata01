import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { db } from "./firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import FamilyTemplateBuilder from "./FamilyTemplateBuilder";

export default function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [nameTextObj, setNameTextObj] = useState(null);
  const [name, setName] = useState("");
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showFamilyBuilder, setShowFamilyBuilder] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const templatesCol = collection(db, "templates");
      const templateSnapshot = await getDocs(templatesCol);
      const templateList = templateSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(templateList);
    };

    fetchTemplates();
  }, []);

  const libraryItems = [
    { name: "Flower", url: "/objects/flower.png" },
    { name: "Car", url: "/objects/car.png" },
    { name: "Star", url: "/objects/star.png" }
  ];

  return (
    <div className="App">
      <h1 className="text-xl font-bold mb-4">Custom Template App</h1>

      {/* Other parts of your UI */}

      {showFamilyBuilder && (
        <FamilyTemplateBuilder
          libraryItems={libraryItems}
        />
      )}
    </div>
  );
}