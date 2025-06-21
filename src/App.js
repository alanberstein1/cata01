import React, { useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function App() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      width: 800,
      height: 600,
      backgroundColor: "#fff"
    });

    const nameText = new fabric.Textbox("Your Name", {
      left: 200,
      top: 100,
      width: 300,
      fontSize: 30
    });
    canvas.add(nameText);

    window.addLibraryObject = (url) => {
      fabric.Image.fromURL(url, (img) => {
        img.left = 400;
        img.top = 200;
        img.scaleToWidth(100);
        canvas.add(img);
      });
    };
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <canvas ref={canvasRef} />
      <div style={{ marginTop: 20 }}>
        <button onClick={() => window.addLibraryObject("/objects/flower.png")}>Add Flower</button>
        <button onClick={() => window.addLibraryObject("/objects/car.png")}>Add Car</button>
        <button onClick={() => window.addLibraryObject("/objects/star.png")}>Add Star</button>
      </div>
    </div>
  );
}