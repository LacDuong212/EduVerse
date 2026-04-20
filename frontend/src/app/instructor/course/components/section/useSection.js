import { useState, useEffect } from "react";

const useSection = (show, initialSection, onSave) => {
  const [title, setTitle] = useState('');

  // init
  // when modal is shown/hidden or check if edit mode
  useEffect(() => {
    if (show) {
      if (initialSection) {
        setTitle(initialSection.title || ''); // edit mode: populate
      } else {
        setTitle(''); // add mode: clear
      }
    }
  }, [show, initialSection]);

  // --- Handlers ---
  const handleSave = () => {
    if (!title.trim()) return;
    
    onSave(title.trim());
    
    setTitle(''); // optional
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
};

export default useSection;