"use client";

import React from "react";
import { uploadVideo } from "../firebase/functions";

const Upload = () => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.item(0);
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const response = await uploadVideo(file);
      alert(`Upload successful. Response: ${JSON.stringify(response)}`);
    } catch (error) {
      alert(`Upload failed. Error: ${error}`);
    }
  };

  return (
    <>
      <input
        onChange={handleFileChange}
        id="upload"
        className="hidden"
        type="file"
        accept="video/*"
      />
      <label
        className="flex justify-center items-center w-12 h-12 rounded-full text-black border-none cursor-pointer text-xs p-1.5 hover:bg-gray-200"
        htmlFor="upload"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </label>
    </>
  );
};

export default Upload;
