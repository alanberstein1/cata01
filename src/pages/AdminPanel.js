import React, { useEffect, useState } from "react";
import { db, storage } from "../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";


export default function AdminPanel() {
  // Template styles state
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [editedStyleName, setEditedStyleName] = useState("");

  // Library items state (for new logic)
  const [file, setFile] = useState(null);
  const [shortDescEN, setShortDescEN] = useState("");
  const [shortDescES, setShortDescES] = useState("");
  const [longDescEN, setLongDescEN] = useState("");
  const [longDescES, setLongDescES] = useState("");
  const [selectedStyleIds, setSelectedStyleIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);
  // Handler for multi-select
  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedStyleIds(options);
  };

  // Fetch template styles from Firestore
  const fetchStyles = async () => {
    const snapshot = await getDocs(collection(db, "templateStyles"));
    setStyles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  // Fetch library items from Firestore
  const fetchLibraryItems = async () => {
    const snapshot = await getDocs(collection(db, "libraryItems"));
    setLibraryItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchStyles();
    fetchLibraryItems();
    // eslint-disable-next-line
  }, []);

  // Template Styles CRUD
  const handleAddStyle = async () => {
    if (!newStyleName) return;
    await addDoc(collection(db, "templateStyles"), { name: newStyleName });
    setNewStyleName("");
    fetchStyles();
  };

  const handleDeleteStyle = async (styleId) => {
    await deleteDoc(doc(db, "templateStyles", styleId));
    fetchStyles();
  };

  const handleSaveStyleEdit = async (styleId) => {
    try {
      const docRef = doc(db, "templateStyles", styleId);
      await updateDoc(docRef, { name: editedStyleName });
      setEditingStyleId(null);
      setEditedStyleName("");
      fetchStyles();
    } catch (error) {
      console.error("Failed to update style name:", error);
      alert("Could not save changes.");
    }
  };

  // Library Items CRUD
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Save function for library item (new logic)
  const handleSaveLibraryItem = async () => {
    if (
      !file ||
      !shortDescEN ||
      !shortDescES ||
      !longDescEN ||
      !longDescES ||
      selectedStyleIds.length === 0
    ) {
      alert("Please fill all fields and select styles.");
      return;
    }

    setSaving(true);

    try {
      const storageRef = ref(storage, `Library Items/${file.name}`);

      // Check if file already exists in storage
      try {
        await getDownloadURL(storageRef);
        alert("File already exists in storage.");
        setSaving(false);
        return;
      } catch (e) {
        // File doesn't exist, proceed to upload
      }

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        null,
        (error) => {
          console.error("Upload error:", error);
          alert("Upload failed");
          setSaving(false);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

          await addDoc(collection(db, "libraryItems"), {
            imageUrl: downloadURL,
            shortDescription: {
              en: shortDescEN,
              es: shortDescES,
            },
            longDescription: {
              en: longDescEN,
              es: longDescES,
            },
            associatedStyles: selectedStyleIds,
            createdAt: serverTimestamp(),
          });

          alert("Library Item saved!");

          // Reset form
          setFile(null);
          setShortDescEN("");
          setShortDescES("");
          setLongDescEN("");
          setLongDescES("");
          setSelectedStyleIds([]);
          setSaving(false);
        }
      );
    } catch (err) {
      console.error("Save error:", err);
      alert("Error saving item.");
      setSaving(false);
    }
  };

  // Edit library item
  const handleEditItem = (item) => {
    setShortDescEN(item.shortDescription?.en || "");
    setShortDescES(item.shortDescription?.es || "");
    setLongDescEN(item.longDescription?.en || "");
    setLongDescES(item.longDescription?.es || "");
    setSelectedStyleIds(item.associatedStyles || []);
    setFile(null);
  };

  // Delete library item
  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Delete this library item?")) return;
    await deleteDoc(doc(db, "libraryItems", itemId));
    fetchLibraryItems();
  };


  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>

      {/* Current Template Styles Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Current Template Styles</h3>
        <div className="mb-6">
          {styles.map((style) => (
            <div key={style.id} className="flex items-center justify-between py-1 border-b">
              {editingStyleId === style.id ? (
                <>
                  <input
                    type="text"
                    value={editedStyleName}
                    onChange={(e) => setEditedStyleName(e.target.value)}
                    className="border p-1 mr-2 flex-1"
                  />
                  <button
                    onClick={() => handleSaveStyleEdit(style.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingStyleId(null)}
                    className="bg-gray-400 text-white px-3 py-1 rounded"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{style.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingStyleId(style.id);
                        setEditedStyleName(style.name);
                      }}
                      className="bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStyle(style.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6">
          <label className="block mb-2 font-medium">Add Template Style</label>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. Cars, Tools"
              value={newStyleName}
              onChange={(e) => setNewStyleName(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
            <button
              onClick={handleAddStyle}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow-sm"
            >
              Add Style
            </button>
          </div>
        </div>
      </div>

      {/* Add Library Item Section */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <label className="block mb-2 font-medium">
          Add Library Item
        </label>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block mb-1 font-medium">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full mb-2"
            />
            {file && (
              <div className="mb-2">
                <span className="text-gray-700">{file.name}</span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Short Description</label>
            <input
              className="w-full border p-2 mb-2"
              placeholder="English"
              value={shortDescEN}
              onChange={e => setShortDescEN(e.target.value)}
            />
            <input
              className="w-full border p-2"
              placeholder="Español"
              value={shortDescES}
              onChange={e => setShortDescES(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Long Description</label>
            <textarea
              className="w-full border p-2 mb-2"
              placeholder="English"
              value={longDescEN}
              onChange={e => setLongDescEN(e.target.value)}
            />
            <textarea
              className="w-full border p-2"
              placeholder="Español"
              value={longDescES}
              onChange={e => setLongDescES(e.target.value)}
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Associate Template Styles</label>
            <select
              multiple
              value={selectedStyleIds}
              onChange={handleMultiSelect}
              className="w-full p-2 border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              required
            >
              {styles.map(style => (
                <option key={style.id} value={style.id}>
                  {style.name}
                </option>
              ))}
            </select>
            <div className="text-xs text-gray-500 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple.
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow-sm"
              disabled={saving}
              onClick={handleSaveLibraryItem}
            >
              {saving ? "Saving..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>

      {/* Library Items Table */}
      <div className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
        <h3 className="text-lg font-semibold mb-4">Library Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1">Image</th>
                <th className="border px-2 py-1">Short Description</th>
                <th className="border px-2 py-1">Long Description</th>
                <th className="border px-2 py-1">Template Styles</th>
                <th className="border px-2 py-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {libraryItems.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    No items found.
                  </td>
                </tr>
              )}
              {libraryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">
                    <img
                      src={item.imageUrl}
                      alt="Library"
                      className="w-14 h-14 object-cover rounded border"
                    />
                  </td>
                  <td className="border px-2 py-1">
                    {item.shortDescription
                      ? `${item.shortDescription.en || ""}${item.shortDescription.es ? " / " + item.shortDescription.es : ""}`
                      : ""}
                  </td>
                  <td className="border px-2 py-1 max-w-xs break-words">
                    {item.longDescription
                      ? `${item.longDescription.en || ""}${item.longDescription.es ? " / " + item.longDescription.es : ""}`
                      : ""}
                  </td>
                  <td className="border px-2 py-1">
                    {(item.associatedStyles || [])
                      .map(
                        (sid) =>
                          styles.find((s) => s.id === sid)?.name || sid
                      )
                      .join(", ")}
                  </td>
                  <td className="border px-2 py-1">
                    <button
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                      onClick={() => handleEditItem(item)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}