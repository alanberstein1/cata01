import React, { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection, addDoc, getDocs, updateDoc, doc, arrayUnion
} from "firebase/firestore";

export default function AdminPanel() {
  const [styles, setStyles] = useState([]);
  const [newStyle, setNewStyle] = useState("");
  const [newItem, setNewItem] = useState({ name: "", url: "", styleId: "" });

  useEffect(() => {
    const fetchStyles = async () => {
      const colRef = collection(db, "templateStyles");
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStyles(list);
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

  const addLibraryItem = async () => {
    if (!newItem.styleId || !newItem.name || !newItem.url) return;

    const styleRef = doc(db, "templateStyles", newItem.styleId);
    await updateDoc(styleRef, {
      libraryItems: arrayUnion({
        name: newItem.name,
        url: newItem.url
      })
    });
    setNewItem({ name: "", url: "", styleId: "" });
    window.location.reload();
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
        <h2 className="text-lg font-semibold">Add Library Item</h2>
        <select
          className="border p-2 w-full mb-2"
          value={newItem.styleId}
          onChange={(e) => setNewItem({ ...newItem, styleId: e.target.value })}
        >
          <option value="">-- Select Style --</option>
          {styles.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <input
          className="border p-2 w-full mb-2"
          placeholder="e.g. 🔧 Wrench"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
        />
        <input
          className="border p-2 w-full mb-2"
          placeholder="/objects/wrench.png"
          value={newItem.url}
          onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
        />
        <button onClick={addLibraryItem} className="bg-green-600 text-white px-4 py-2 rounded">
          Add Item
        </button>
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