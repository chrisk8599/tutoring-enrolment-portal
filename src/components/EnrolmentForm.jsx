import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "../lib/supabase";
import {
  capitalizeWords,
  lowercaseEmail,
  validateMobile,
  formatMobile,
} from "../utils/formatters";

const GRADES = [
  "Kindy",
  "Year 1",
  "Year 2",
  "Year 3",
  "Year 4",
  "Year 5",
  "Year 6",
  "Year 7",
  "Year 8",
  "Year 9",
  "Year 10",
  "Year 11",
  "Year 12",
];

export default function EnrolmentForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  // Handle name capitalization on blur
  const handleNameBlur = (fieldName, value) => {
    const capitalized = capitalizeWords(value);
    setValue(fieldName, capitalized);
  };

  // Handle email lowercase on blur
  const handleEmailBlur = (fieldName, value) => {
    const lowercase = lowercaseEmail(value);
    setValue(fieldName, lowercase);
  };

  // Handle mobile format on blur
  const handleMobileBlur = (value) => {
    if (value && validateMobile(value)) {
      const formatted = formatMobile(value);
      setValue("parent_mobile", formatted);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Format data before submission
      const formattedData = {
        student_first_name: capitalizeWords(data.student_first_name),
        student_last_name: capitalizeWords(data.student_last_name),
        parent_first_name: capitalizeWords(data.parent_first_name),
        parent_last_name: capitalizeWords(data.parent_last_name),
        parent_mobile: formatMobile(data.parent_mobile),
        email_address: lowercaseEmail(data.email_address),
        secondary_email_address: data.secondary_email_address
          ? lowercaseEmail(data.secondary_email_address)
          : null,
        address: data.address.trim(),
        school: capitalizeWords(data.school),
        current_grade: data.current_grade,
        status: "pending",
      };

      // Insert into Supabase
      const { error } = await supabase
        .from("enrolments")
        .insert([formattedData]);

      if (error) throw error;

      // Success!
      setSubmitSuccess(true);
      reset();
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error.message ||
          "An error occurred while submitting your enrolment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enrolment Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Thank you for your enrolment. We'll review your submission and
            contact you shortly.
          </p>
          <button
            onClick={() => setSubmitSuccess(false)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Submit Another Enrolment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Tutoring Centre Enrolment.
            </h1>
            <p className="text-gray-600">
              Please fill in all details to enrol your child in our tutoring
              program
            </p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Student First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("student_first_name", {
                  required: "Student first name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                onBlur={(e) =>
                  handleNameBlur("student_first_name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter student's first name"
              />
              {errors.student_first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.student_first_name.message}
                </p>
              )}
            </div>

            {/* Student Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("student_last_name", {
                  required: "Student last name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                onBlur={(e) =>
                  handleNameBlur("student_last_name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter student's last name"
              />
              {errors.student_last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.student_last_name.message}
                </p>
              )}
            </div>

            {/* Parent First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent's First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("parent_first_name", {
                  required: "Parent first name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                onBlur={(e) =>
                  handleNameBlur("parent_first_name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter parent's first name"
              />
              {errors.parent_first_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.parent_first_name.message}
                </p>
              )}
            </div>

            {/* Parent Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent's Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("parent_last_name", {
                  required: "Parent last name is required",
                  minLength: {
                    value: 2,
                    message: "Name must be at least 2 characters",
                  },
                })}
                onBlur={(e) =>
                  handleNameBlur("parent_last_name", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter parent's last name"
              />
              {errors.parent_last_name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.parent_last_name.message}
                </p>
              )}
            </div>

            {/* Parent Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Mobile <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("parent_mobile", {
                  required: "Mobile number is required",
                  validate: (value) =>
                    validateMobile(value) ||
                    "Please enter a valid Australian mobile number",
                })}
                onBlur={(e) => handleMobileBlur(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0412 345 678 or +61 412 345 678"
              />
              {errors.parent_mobile && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.parent_mobile.message}
                </p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email_address", {
                  required: "Email address is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                onBlur={(e) => handleEmailBlur("email_address", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="parent@example.com"
              />
              {errors.email_address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email_address.message}
                </p>
              )}
            </div>

            {/* Secondary Email (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Secondary Email Address (Optional)
              </label>
              <input
                type="email"
                {...register("secondary_email_address", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Please enter a valid email address",
                  },
                })}
                onBlur={(e) =>
                  handleEmailBlur("secondary_email_address", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="secondary@example.com"
              />
              {errors.secondary_email_address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.secondary_email_address.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address <span className="text-red-500">*</span>
              </label>
              <textarea
                {...register("address", {
                  required: "Address is required",
                  minLength: {
                    value: 10,
                    message: "Please enter a complete address",
                  },
                })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your full address"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* School */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("school", {
                  required: "School name is required",
                  minLength: {
                    value: 3,
                    message: "School name must be at least 3 characters",
                  },
                })}
                onBlur={(e) => handleNameBlur("school", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter school name"
              />
              {errors.school && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.school.message}
                </p>
              )}
            </div>

            {/* Current Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Grade <span className="text-red-500">*</span>
              </label>
              <select
                {...register("current_grade", {
                  required: "Please select a grade",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">Select a grade</option>
                {GRADES.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
              {errors.current_grade && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.current_grade.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-medium text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Enrolment"
                )}
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-gray-600 text-sm mt-6">
          All fields marked with <span className="text-red-500">*</span> are
          required
        </p>
      </div>
    </div>
  );
}
