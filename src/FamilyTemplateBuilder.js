return (
  <div className="p-4 border rounded shadow-sm bg-white">
    <h2 className="text-lg font-bold mb-4">Family Template Builder</h2>

    {step === 1 && (
      <div>
        <label className="block mb-2 font-medium">Step 1: Choose a Template Style</label>
        <select
          className="p-2 border rounded w-full mb-4"
          value={selectedStyle?.id || ""}
          onChange={(e) =>
            setSelectedStyle(availableStyles.find(style => style.id === e.target.value))
          }
        >
          <option value="">-- Select a Style --</option>
          {availableStyles.map(style => (
            <option key={style.id} value={style.id}>{style.name}</option>
          ))}
        </select>
        <button
          disabled={!selectedStyle}
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setStep(2)}
        >
          Next
        </button>
      </div>
    )}

    {step === 2 && (
      <div>
        <label className="block mb-2 font-medium">Step 2: Number of Family Members</label>
        <input
          type="number"
          min={1}
          value={numMembers}
          onChange={(e) => setNumMembers(parseInt(e.target.value))}
          className="p-2 border rounded w-full mb-4"
        />
        <div className="flex gap-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setStep(1)}>
            Back
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => {
              setMembers(Array(numMembers).fill({ name: "", libraryItem: "" }));
              setStep(3);
            }}
          >
            Next
          </button>
        </div>
      </div>
    )}

    {step === 3 && (
      <div>
        <label className="block mb-2 font-medium">Step 3: Enter Family Member Info</label>
        {members.map((member, index) => (
          <div key={index} className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Name"
              value={member.name}
              onChange={(e) => handleChange(e, index, "name")}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <select
              value={member.libraryItem}
              onChange={(e) => handleChange(e, index, "libraryItem")}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">-- Select Library Item --</option>
              {selectedStyle?.libraryItems?.map(item => (
                <option key={item.url} value={item.url}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <div className="flex gap-2">
          <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setStep(2)}>
            Back
          </button>
          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={saveTemplate}
          >
            Save Template
          </button>
        </div>
      </div>
    )}
  </div>
);