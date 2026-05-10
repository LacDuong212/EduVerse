import _ from "lodash";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api } from "@/utils/api";
import { handleRequest } from "@/utils/request";
import { useCourseEditor } from "../../CourseEditorContext";
import { step1Fields, validateStep1 } from "../../schemas";

export default function useStep1(stepperInstance) {
  const { changes, currentCourse, updateField, onUpdate, errors: globalErrors } = useCourseEditor();

  const [options, setOptions] = useState({
    categories: [],
    languages: ["english", "vietnamese", "others"],
    levels: ["all", "beginner", "intermedidate", "advanced"],
  });
  const [optionLoading, setOptionLoading] = useState(true);

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

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const relevantErrors = _.pick(globalErrors, step1Fields);
    if (!_.isEqual(errors, relevantErrors)) {
      setErrors(relevantErrors);
    }
  }, [globalErrors]);

  const formData = {
    ...currentCourse,
    price: currentCourse?.price?.toString(),
    discountPrice: currentCourse?.discountPrice?.toString(),
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    updateField(name, finalValue);

    if (globalErrors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleCustomChange = (name, value) => {
    // if (name === "description") { }
    // if (name === "price" || name === "discountPrice") { }
    updateField(name, value);
    if (globalErrors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { success: validateSuccess, errors: newErrors } = validateStep1(currentCourse);
    if (!validateSuccess) {
      setErrors(prev => {
        const cleanedErrors = _.omit(prev, step1Fields);
        return { ...cleanedErrors, ...newErrors };
      });
      return toast.error("Please make sure all the fields are correct..");
    }

    const step1Changes = _.pick(changes, step1Fields);
    if (_.isEmpty(step1Changes)) return stepperInstance?.next();

    const success = await onUpdate(step1Changes);

    if (success) {
      setErrors({});
      toast.success("Progress saved!");
      stepperInstance?.next();
    } else {
      if (globalErrors?.general) toast.error("Unable to save changes, try adjusting the fields..");
      else toast.error("Failed to save progress..");
    }
  };

  return {
    ...options,
    optionLoading,
    formData,
    errors,
    handleChange,
    handleCustomChange,
    handleSubmit,
  };
}