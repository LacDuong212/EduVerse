import { useState, useEffect } from "react";

export default function useSection(show, initialSection, onSave) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (show) {
      if (initialSection) {
        setTitle(initialSection.title || "");
      } else {
        setTitle("");
      }
    }
  }, [show, initialSection]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim());
    setTitle("");
  };

  const handleChange = (e) => {
    setTitle(e.target.value);
  };

  return {
    title,
    setTitle,
    handleSave,
    handleChange,
    isEditMode: !!initialSection 
  };
}