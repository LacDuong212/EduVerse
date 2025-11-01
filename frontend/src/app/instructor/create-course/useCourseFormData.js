import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function useCourseFormData() {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('course-form-draft');
    return saved ? JSON.parse(saved) : {};
  });

  const [courseId, setCourseId] = useState(() => formData.courseId || null);

  useEffect(() => {
    localStorage.setItem('course-form-draft', JSON.stringify(formData));
  }, [formData]);

  const updateStepData = async (step, data) => {
    let endpoint = '';
    switch (step) {
      case 'step1':
        endpoint = '/api/courses/save-step1';
        break;
      case 'step2':
        endpoint = '/api/courses/save-step2';
        break;
      case 'step3':
        endpoint = '/api/courses/save-step3';
        break;
      default:
        return;
    }

    try {
      const payload = {
        courseId,
        ...data,
      };

      const { data: res } = await axios.post(
        `${backendUrl}${endpoint}`,
        payload,
        { withCredentials: true }
      );

      if (!res.success) throw new Error(res.message || `Failed to save ${step}`);

      if (!courseId && res.data?._id) {
        setCourseId(res.data._id);
        setFormData(prev => ({ ...prev, courseId: res.data._id }));
      }

      toast.success('Progress saved!');
      setFormData(prev => ({ ...prev, ...data }));
      return res.data;
    } catch (err) {
      console.error(`Error saving ${step}:`, err);
      toast.error('Failed to save progress');
      throw err;
    }
  };

  const clearDraft = () => {
    localStorage.removeItem('course-form-draft');
    setFormData({});
    setCourseId(null);
    toast('Draft cleared 🗑️');
  };

  return { formData, setFormData, updateStepData, clearDraft, courseId };
}
