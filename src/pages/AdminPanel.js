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
  serverTimestamp,
} from "firebase/firestore";


export default function AdminPanel() {
  // Template styles state
  const [styles, setStyles] = useState([]);
  const [newStyleName, setNewStyleName] = useState("");
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [editedStyleName, setEditedStyleName] = useState("");

  // Library items state
  const [file, setFile] = useState(null);
  const [shortDescEN, setShortDescEN] = useState("");
  const [shortDescES, setShortDescES] = useState("");
  const [longDescEN, setLongDescEN] = useState("");
  const [longDescES, setLongDescES] = useState("");
  const [selectedStyleIds, setSelectedStyleIds] = useState([]);
  const [saving, setSaving] = useState(false);
  const [libraryItems, setLibraryItems] = useState([]);

  // Inline edit states for library items
  const [editingItemId, setEditingItemId] = useState(null);
  // For editing in-table, reuse main add form states for simplicity
  const [currentImageURL, setCurrentImageURL] = useState("");

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

  // Handler for multi-select in add form
  const handleMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setSelectedStyleIds(options);
  };

  // Handler for multi-select in edit form
  const handleEditMultiSelect = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => o.value);
    setEditSelectedStyleIds(options);
  };

  // When "Edit" is clicked for a library item
  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setShortDescEN(item.shortDescription?.en || "");
    setShortDescES(item.shortDescription?.es || "");
    setLongDescEN(item.longDescription?.en || "");
    setLongDescES(item.longDescription?.es || "");
    setSelectedStyleIds(item.associatedStyles || []);
    setFile(null);
    setCurrentImageURL(item.imageUrl || "");
  };

  // Cancel editing a library item
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditFile(null);
    setEditShortDescEN("");
    setEditShortDescES("");
    setEditLongDescEN("");
    setEditLongDescES("");
    setEditSelectedStyleIds([]);
    setEditImageUrl("");
  };

  // Update library item (with optional image upload)
  const handleUpdateItem = async () => {
    if (!editingItemId) {
      alert("No item selected for update.");
      return;
    }

    setSaving(true);

    try {
      const docRef = doc(db, "libraryItems", editingItemId);

      const updatedData = {
        shortDescription: { en: shortDescEN, es: shortDescES },
        longDescription: { en: longDescEN, es: longDescES },
        associatedStyles: selectedStyleIds,
      };

      if (file) {
        const storageRef = ref(storage, `Library Items/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            null,
            reject,
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              updatedData.imageUrl = downloadURL;
              resolve();
            }
          );
        });
      }

      await updateDoc(docRef, updatedData);

      alert("Item updated successfully!");
      setEditingItemId(null);
      setFile(null);
      setShortDescEN("");
      setShortDescES("");
      setLongDescEN("");
      setLongDescES("");
      setSelectedStyleIds([]);
      fetchLibraryItems();
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update item.");
    } finally {
      setSaving(false);
    }
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
              disabled={editingItemId !== null}
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
              disabled={editingItemId !== null}
            />
            <input
              className="w-full border p-2"
              placeholder="Español"
              value={shortDescES}
              onChange={e => setShortDescES(e.target.value)}
              disabled={editingItemId !== null}
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Long Description</label>
            <textarea
              className="w-full border p-2 mb-2"
              placeholder="English"
              value={longDescEN}
              onChange={e => setLongDescEN(e.target.value)}
              disabled={editingItemId !== null}
            />
            <textarea
              className="w-full border p-2"
              placeholder="Español"
              value={longDescES}
              onChange={e => setLongDescES(e.target.value)}
              disabled={editingItemId !== null}
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
              disabled={editingItemId !== null}
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
              disabled={saving || editingItemId !== null}
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
              {libraryItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="border px-2 py-1">
                    {editingItemId === item.id ? (
                      <>
                        {currentImageURL && (
                          <div className="mb-2">
                            <img src={currentImageURL} alt="Current" className="w-14 h-14 object-cover rounded border" />
                            <div className="text-xs text-gray-500">Current image</div>
                          </div>
                        )}
                        <input type="file" onChange={handleFileChange} />
                      </>
                    ) : (
                      <img
                        src={item.imageUrl}
                        alt="Library"
                        className="w-14 h-14 object-cover rounded border"
                      />
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingItemId === item.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label>
                          <strong>Short Description (EN):</strong>
                          <textarea
                            style={{ minWidth: "200px", minHeight: "40px" }}
                            value={shortDescEN}
                            onChange={(e) => setShortDescEN(e.target.value)}
                          />
                        </label>
                        <label>
                          <strong>Short Description (ES):</strong>
                          <textarea
                            style={{ minWidth: "200px", minHeight: "40px" }}
                            value={shortDescES}
                            onChange={(e) => setShortDescES(e.target.value)}
                          />
                        </label>
                      </div>
                    ) : (
                      `${item.shortDescription?.en || ""} / ${item.shortDescription?.es || ""}`
                    )}
                  </td>
                  <td className="border px-2 py-1 max-w-xs break-words">
                    {editingItemId === item.id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <label>
                          <strong>Long Description (EN):</strong>
                          <textarea
                            style={{ minWidth: "200px", minHeight: "60px" }}
                            value={longDescEN}
                            onChange={(e) => setLongDescEN(e.target.value)}
                          />
                        </label>
                        <label>
                          <strong>Long Description (ES):</strong>
                          <textarea
                            style={{ minWidth: "200px", minHeight: "60px" }}
                            value={longDescES}
                            onChange={(e) => setLongDescES(e.target.value)}
                          />
                        </label>
                      </div>
                    ) : (
                      `${item.longDescription?.en || ""} / ${item.longDescription?.es || ""}`
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingItemId === item.id ? (
                      <select
                        multiple
                        value={selectedStyleIds}
                        onChange={handleMultiSelect}
                        className="w-full p-1"
                      >
                        {styles.map(style => (
                          <option key={style.id} value={style.id}>
                            {style.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      (item.associatedStyles || [])
                        .map(id => styles.find(s => s.id === id)?.name || id)
                        .join(", ")
                    )}
                  </td>
                  <td className="border px-2 py-1">
                    {editingItemId === item.id ? (
                      <>
                        <button
                          onClick={handleUpdateItem}
                          className="bg-green-600 text-white px-2 py-1 rounded mr-2"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="bg-gray-400 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-yellow-500 text-white px-2 py-1 rounded mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="bg-red-600 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </>
                    )}
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