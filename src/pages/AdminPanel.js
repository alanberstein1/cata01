import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import { collection, addDoc, getDocs, doc } from "firebase/firestore";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [itemName, setItemName] = useState("");
  const [itemFile, setItemFile] = useState(null);

  // Fetch styles from Firestore and update styles state
  useEffect(() => {
    const fetchStyles = async () => {
      const stylesCol = collection(db, "templateStyles");
      const stylesSnapshot = await getDocs(stylesCol);
      const styleList = stylesSnapshot.docs.map(doc => doc.data().name);
      setStyles(styleList);
    };
    fetchStyles();
  }, []);

  const addStyle = async () => {
    if (!newStyle) return;
    try {
      await addDoc(collection(db, "templateStyles"), {
        name: newStyle
      });
      setNewStyle("");
      // Refetch styles
      const stylesCol = collection(db, "templateStyles");
      const stylesSnapshot = await getDocs(stylesCol);
      const styleList = stylesSnapshot.docs.map(doc => doc.data().name);
      setStyles(styleList);
    } catch (e) {
      alert("Failed to add style: " + e.message);
    }
  };

  // Handle file input change
  const handleFileChange = (e) => {
    setItemFile(e.target.files[0]);
  };

  // Add item: upload file to Storage and add doc to Firestore
  const handleAddItem = async () => {
    if (!selectedStyle || !itemName || !itemFile) return alert("Missing fields");

    // Upload file to Firebase Storage
    const storageRef = ref(storage, `library-items/${selectedStyle}/${itemFile.name}`);
    await uploadBytes(storageRef, itemFile);
    const imageUrl = await getDownloadURL(storageRef);

    // Find the style doc by name
    const stylesCol = collection(db, "templateStyles");
    const styleDocs = await getDocs(stylesCol);
    const styleDoc = styleDocs.docs.find(doc => doc.data().name === selectedStyle);

    if (styleDoc) {
      const itemsCol = collection(doc(db, "templateStyles", styleDoc.id), "items");
      await addDoc(itemsCol, { name: itemName, imageUrl });
      alert("Item added!");
    } else {
      alert("Style not found in Firestore.");
    }

    setItemName("");
    setItemFile(null);
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
            onChange={e => setSelectedStyle(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          >
            <option value="">-- Select Style --</option>
            {styles.map(style => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. 🌸 Wrench"
            value={itemName}
            onChange={e => setItemName(e.target.value)}
            className="p-2 border rounded w-full mb-2"
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-2"
          />
          {itemFile && (
            <div className="mb-2">
              <span className="text-gray-700">{itemFile.name}</span>
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
            <li key={style}>{style}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}