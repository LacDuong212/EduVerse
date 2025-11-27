import { useState } from "react";
import axios from "axios";

export default function VideoUploadTest() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  // new state
  const [lookupKey, setLookupKey] = useState("");
  const [lookupMessage, setLookupMessage] = useState("");

  const maxSizeMB = 2048;
  const allowedTypes = [
    "video/mp4",
    "video/quicktime",
    "video/x-matroska",
    "video/x-msvideo",
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    if (!allowedTypes.includes(selected.type)) {
      setMessage("Please select a valid video file (mp4, mov, mkv, avi).");
      setFile(null);
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      setMessage(`File is too large. Max size is ${maxSizeMB} MB.`);
      setFile(null);
      return;
    }

    setMessage("");
    setFile(selected);
  };


  const uploadFile = async () => {
    if (!file) {
      setMessage("No file selected.");
      return;
    }

    try {
      setUploading(true);
      setMessage("Requesting upload URL...");

      const { data } = await axios.post(
        `${backendUrl}/api/instructor/videos/upload-url`,
        {
          fileName: file.name,
          contentType: file.type,
          tags: [{ Key: "status", Value: "boss" }],
        },
        { withCredentials: true }
      );

      if (!data.success) {
        setMessage("Failed to get upload URL");
        setUploading(false);
        return;
      }

      setMessage("Uploading file...");

      await axios.put(data.uploadUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setMessage(`Uploading: ${percent}%`);
        },
      });

      setMessage("Upload successful! File key: " + data.key);
    } catch (error) {
      console.error(error);
      setMessage("Upload failed: " + (error.message || "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  // NEW: test getObject route
  const testGetObject = async () => {
    if (!lookupKey.trim()) {
      setLookupMessage("Please enter a key.");
      return;
    }

    try {
      setLookupMessage("Fetching object...");
      const { data } = await axios.get(
        `${backendUrl}/api/instructor/videos/object`,
        {
          params: { key: lookupKey },
          withCredentials: true,
        }
      );

      if (data.success) {
        setLookupMessage("Object exists! Size: " + data.size + " bytes");
      } else {
        setLookupMessage("Not found");
      }
    } catch (err) {
      setLookupMessage("Error: " + err.response?.data?.message || err.message);
    }
  };


  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h3>Test Video Upload to S3</h3>

      <input
        type="file"
        accept="video/mp4,video/quicktime,video/x-matroska,video/x-msvideo"
        onChange={handleFileChange}
        disabled={uploading}
        className="mt-2"
      />

      <button
        onClick={uploadFile}
        disabled={uploading || !file}
        style={{ marginTop: 20 }}
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>

      {message && <p className="mt-1 text-danger">{message}</p>}

      {/* NEW: Test getObject */}
      <hr className="my-4" />

      <h4>Test getObject()</h4>

      <input
        type="text"
        placeholder="Enter S3 key"
        className="form-control"
        value={lookupKey}
        onChange={(e) => setLookupKey(e.target.value)}
      />

      <button
        style={{ marginTop: 10 }}
        className="btn btn-primary"
        onClick={testGetObject}
      >
        Check Object
      </button>

      {lookupMessage && <p className="mt-2">{lookupMessage}</p>}
    </div>
  );
}
