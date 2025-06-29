import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [itemName, setItemName] = useState("");
  const [file, setFile] = useState(null);

  // Fetch styles from Firestore
  useEffect(() => {
    const fetchStyles = async () => {
      const stylesCol = collection(db, "templateStyles");
      const styleSnapshot = await getDocs(stylesCol);
      const styleList = styleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStyles(styleList);
    };
    fetchStyles();
  }, []);

  const addStyle = async () => {
    if (!newStyle) return;
    await addDoc(collection(db, "templateStyles"), {
      name: newStyle
    });
    setNewStyle("");
    window.location.reload();
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Add item to Firestore under selected style's subcollection, with error handling
  const handleAddItem = async () => {
    if (!selectedStyle || !itemName || !file) {
      alert("Please fill in all fields and upload a file.");
      return;
    }
    try {
      const fileRef = ref(storage, `objects/${file.name}`);
      await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(fileRef);

      const itemRef = collection(db, "templateStyles", selectedStyle, "libraryItems");
      await addDoc(itemRef, {
        name: itemName,
        url: downloadURL
      });

      alert("Item added successfully!");
      setItemName("");
      setFile(null);
      setSelectedStyle("");
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Failed to add item.");
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

      <div className="mb-6">
        <div>
          <label className="block mb-2 font-medium">Add Library Item</label>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          >
            <option value="">-- Select Style --</option>
            {styles.map(style => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 🌸 Wrench"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          {file && (
            <div className="mb-2">
              <span className="text-gray-700">{file.name}</span>
            </div>
          )}
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
              {style.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}