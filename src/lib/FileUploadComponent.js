import React, { useState } from "react";
import upload from "./upload";

const FileUploadComponent = () => {
  const [progress, setProgress] = useState(0);
  const [downloadURL, setDownloadURL] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    try {
      const url = await upload(file, setProgress); // Pass setProgress to track progress
      setDownloadURL(url);
      console.log("File uploaded successfully:", url);
    } catch (error) {
      console.error("Upload failed:", error.message);
      alert("Failed to upload the file. Please try again.");
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileUpload} />
      {progress > 0 && progress < 100 && <p>Uploading: {Math.round(progress)}%</p>}
      {downloadURL && (
        <p>
          Upload Complete!{" "}
          <a href={downloadURL} target="_blank" rel="noopener noreferrer">
            View Uploaded File
          </a>
        </p>
      )}
    </div>
  );
};

export default FileUploadComponent;
