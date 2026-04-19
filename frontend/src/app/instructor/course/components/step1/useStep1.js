import _ from "lodash";
import { useState } from "react";
import { toast } from "react-toastify";
import { useCategories } from "@/hooks/useCategories";
import { useCourseEditor } from "../../CourseEditorContext";

export const useStep1 = (stepperInstance) => {
  const [errors, setErrors] = useState({});
  const { categories, loading: categoriesLoading } = useCategories();
  const {
    currentCourse: course,
    courseDraft: draft,
    updateField: onUpdateField,
    onSaveDraft
  } = useCourseEditor();

  // utils
  const formatCurrency = (val) => {
    if (val === 0) return '0';
    if (!val) return '';
    const num = String(val).replace(/[^0-9.-]/g, '');
    return new Intl.NumberFormat("en-US").format(Number(num));
  };

  const parseCurrency = (str) => {
    const digits = String(str || '').replace(/[^0-9.-]/g, '');
    return digits === '' ? 0 : Number(digits);
  };

  const displayData = {
    ...course,
    price: formatCurrency(course?.price),
    discountPrice: formatCurrency(course?.discountPrice),
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "price" || name === "discountPrice") {
      finalValue = parseCurrency(value);
    }

    onUpdateField(name, finalValue);

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCustomChange = (name, value) => {
    if (name === "description") {
      // check if the HTML contains any real text or images
      const plainText = value.replace(/<(.|\n)*?>/g, '').trim();
      if (plainText.length === 0 && !value.includes('<img')) {
        value = "";
      }
    }

    onUpdateField(name, value);
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const errs = {};
    const p = course?.price || 0;
    const d = course?.discountPrice || 0;

    if (!course.title?.trim()) errs.title = "Title is required";
    if (!course.categoryId) errs.categoryId = "Category is required";
    if (!course.level) errs.level = "Level is required";
    if (!course.language) errs.language = "Language is required";
    if (p < 0) errs.price = "Valid price is required";

    if (course?.enableDiscount) {
      if (d <= 0) errs.discountPrice = "Valid discount required";
      else if (d >= p) errs.discountPrice = "Must be less than price";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return toast.error("Please recheck the form for errors");

    if (course?.status?.toUpperCase() === "DRAFT") {
      try {
        const step1Fields = [
          "title", "subtitle",
          "categoryId",
          "level", "language",
          "price", "discountPrice", "enableDiscount",
          "description",
          "isPrivate",
        ];

        // pick only existing step1 fields
        const step1Data = _.pick(draft, step1Fields);

        if (!_.isEmpty(step1Data)) {
          await onSaveDraft(step1Data);
          toast.success("Course details saved!");
        }
      } catch (err) {
        console.error("Save course details error:", err);
        toast.error(err?.message || "Failed to save course details");
        return;
      }
    } else {
      toast.info("Details updated locally.");
    }

    stepperInstance?.next();
  };

  return {
    formData: displayData,
    errors,
    categories,
    categoriesLoading,
    handleChange,
    handleCustomChange,
    handleSubmit
  };
};