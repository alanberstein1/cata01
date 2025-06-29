import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Custom Template App</h1>
      <Link
        to="/build"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Start Family Template
      </Link>
    </div>
  );
}