import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import FamilyTemplateBuilder from "./FamilyTemplateBuilder";

export default function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [templates, setTemplates] = useState([]);
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
    { name: "🌸 Flower", url: "/objects/flower.png" },
    { name: "🚗 Car", url: "/objects/car.png" },
    { name: "⭐ Star", url: "/objects/star.png" }
  ];

  return (
    <div className="App p-6">
      <h1 className="text-2xl font-bold mb-4">Custom Template App</h1>

      <button
        onClick={() => setShowFamilyBuilder(true)}
        className="bg-blue-600 text-white px-4 py-2 rounded mb-4"
      >
        Start Family Template
      </button>

      {showFamilyBuilder && <FamilyTemplateBuilder />}
    </div>
  );
}