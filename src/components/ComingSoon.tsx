import React from "react";

export default function ComingSoon() {
  return (
    <div className="max-w-2xl mx-auto p-8">
      <div className="bg-white rounded-2xl shadow-lg border p-8 text-center">
        <div className="text-6xl mb-4">🤖</div>

        <h1 className="text-3xl font-bold text-green-700">
          Mshauri wa AI
        </h1>

        <p className="text-xl mt-4 font-semibold">
          🚧 Coming Soon
        </p>

        <p className="mt-4 text-gray-600">
          Tunafanya maboresho ili kukupa mshauri bora wa kilimo
          unaotumia AI.
        </p>

        <p className="mt-2 text-gray-600">
          Kipengele hiki kitapatikana kwenye sasisho lijalo.
        </p>
      </div>
    </div>
  );
}
