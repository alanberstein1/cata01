import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";

export default function App() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [nameTextObj, setNameTextObj] = useState(null);
  const [nameInput, setNameInput] = useState("Your Name");

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
  }, []);

  // Update canvas text live
  useEffect(() => {
    if (nameTextObj) {
      nameTextObj.text = nameInput;
      canvas.renderAll();
    }
  }, [nameInput, nameTextObj, canvas]);

  return (
    <div style={{ padding: 20 }}>
      <canvas ref={canvasRef} />
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
        <div>
          <button onClick={() => window.addLibraryObject("/objects/flower.png")}>Add Flower</button>
          <button onClick={() => window.addLibraryObject("/objects/car.png")}>Add Car</button>
          <button onClick={() => window.addLibraryObject("/objects/star.png")}>Add Star</button>
        </div>
      </div>
    </div>
  );
}