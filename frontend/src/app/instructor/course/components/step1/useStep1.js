import _ from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/utils/api";
import { parseCurrency, toCurrency } from "@/utils/currency";
import { handleRequest } from "@/utils/request";
import { useCourseEditor } from "../../CourseEditorContext";
import { step1Fields, validateStep1 } from "../../schemas";

export default function useStep1(stepperInstance) {
  const [options, setOptions] = useState({
    categories: [],
    languages: ["english", "vietnamese", "others"],
    levels: ["all", "beginner", "intermedidate", "advanced"],
  });
  const [optionLoading, setOptionLoading] = useState(true);

  const {
    currentCourse: course,
    changes,
    updateField: onUpdateField,
    onUpdate,
    errors: serverErrors,
    setErrors,
  } = useCourseEditor();

  useEffect(() => {
    const fetchFilterData = async () => {
      setOptionLoading(true);

      const response = await handleRequest(api.get("/courses/filters"));
      if (response.success && response.result) {
        setOptions(prev => ({
          ...prev,
          categories: response.result.categories || [],
          // languages: response.result.languages || [],
          levels: response.result.levels || [],
        }));
      }

      setOptionLoading(false);
    };
    fetchFilterData();
  }, []);

  const displayData = {
    ...course,
    price: toCurrency(course?.price),
    discountPrice: toCurrency(course?.discountPrice),
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "price" || name === "discountPrice") {
      finalValue = parseCurrency(value);
    }

    onUpdateField(name, finalValue);

    if (serverErrors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCustomChange = (name, value) => {
    if (name === "description") {
      const plainText = value.replace(/<(.|\n)*?>/g, "").trim();
      if (plainText.length === 0 && !value.includes("<img")) {
        value = "";
      }
    }

    onUpdateField(name, value);
    if (serverErrors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success: validateSuccess, errors: newErrors } = validateStep1(course);

    if (!validateSuccess) {
      setErrors(prev => {
        const cleanedErrors = _.omit(prev, step1Fields);
        return { ...cleanedErrors, ...newErrors };
      });
    }

    const step1Changes = _.pick(changes, step1Fields);

    if (_.isEmpty(step1Changes)) return stepperInstance?.next();

    const success = await onUpdate(step1Changes);

    if (success) {
      toast.success("Progress saved!");
      stepperInstance?.next();
    }
  };

  return {
    ...options,
    optionLoading,
    formData: displayData,
    errors: serverErrors,
    handleChange,
    handleCustomChange,
    handleSubmit,
  };
}