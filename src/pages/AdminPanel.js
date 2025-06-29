import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [templateStyles, setTemplateStyles] = useState([]);
  const [selectedStyle, setSelectedStyle] = useState("");
  const [newItemName, setNewItemName] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    const fetchStyles = async () => {
      const colRef = collection(db, "templateStyles");
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStyles(list);
      setTemplateStyles(list);
    };
    fetchStyles();
  }, []);

  const addStyle = async () => {
    if (!newStyle) return;
    await addDoc(collection(db, "templateStyles"), {
      name: newStyle,
      libraryItems: []
    });
    setNewStyle("");
    window.location.reload();
  };

  const handleAddItem = async () => {
    if (!selectedStyle || !newItemName || !file) {
      alert("Please fill all fields and select an image.");
      return;
    }

    const storage = getStorage();
    const storageRef = ref(storage, `objects/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedStyles = styles.map(style => {
        if (style.id === selectedStyle) {
          return {
            ...style,
            items: [
              ...(style.items || []),
              { name: newItemName, url: downloadURL }
            ]
          };
        }
        return style;
      });

      const styleDoc = doc(db, "templateStyles", selectedStyle);
      await updateDoc(styleDoc, {
        libraryItems: updatedStyles.find(s => s.id === selectedStyle).items
      });

      setStyles(updatedStyles);
      setNewItemName("");
      setFile(null);
    } catch (error) {
      console.error("Error uploading item:", error);
      alert("Error uploading item");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold">Add Template Style</h2>
        <input
          className="border p-2 w-full mb-2"
          placeholder="e.g. Cars, Tools"
          value={newStyle}
          onChange={(e) => setNewStyle(e.target.value)}
        />
        <button onClick={addStyle} className="bg-blue-600 text-white px-4 py-2 rounded">
          Add Style
        </button>
      </div>

      {/* Add Library Item section with file upload */}
      <div className="mb-6">
        <div>
          <label className="block mb-2 font-medium">Add Library Item</label>
          <select
            className="p-2 border rounded w-full mb-2"
            value={selectedStyle}
            onChange={e => setSelectedStyle(e.target.value)}
          >
            <option value="">-- Select a Style --</option>
            {templateStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 🌸 Wrench"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={e => setFile(e.target.files[0])}
            className="mb-2"
          />
          <button
            onClick={handleAddItem}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add Item
          </button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Current Styles</h2>
        <ul className="list-disc pl-5">
          {styles.map(style => (
            <li key={style.id}>
              {style.name} ({style.libraryItems?.length || 0} items)
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}