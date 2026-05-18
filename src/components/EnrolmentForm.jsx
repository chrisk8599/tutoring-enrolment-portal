import { useState, useEffect } from "react";
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

export default function EnrolmentForm({ center }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showSecondaryParent, setShowSecondaryParent] = useState(false);
  const [centerId, setCenterId] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm();

  useEffect(() => {
    const fetchCenterId = async () => {
      const { data, error } = await supabase
        .from("tutoring_centers")
        .select("id")
        .eq("name", center)
        .single();
      if (!error && data) setCenterId(data.id);
    };
    fetchCenterId();
  }, [center]);
  const handleNameBlur = (fieldName, value) => {
    setValue(fieldName, capitalizeWords(value));
  };

  const handleEmailBlur = (fieldName, value) => {
    setValue(fieldName, lowercaseEmail(value));
  };

  const handleMobileBlur = (value) => {
    if (value && validateMobile(value)) {
      setValue("parent_mobile", formatMobile(value));
    }
  };

  const handleSecondaryMobileBlur = (value) => {
    if (value && validateMobile(value)) {
      setValue("secondary_parent_mobile", formatMobile(value));
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
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
        address_street: data.address_street.trim(),
        address_suburb: capitalizeWords(data.address_suburb),
        address_state: data.address_state,
        address_postcode: data.address_postcode,
        // Keep combined address for backwards compat
        address: `${data.address_street.trim()}, ${capitalizeWords(data.address_suburb)}, ${data.address_state} ${data.address_postcode}`,
        tutoring_center_id: centerId,
        school: capitalizeWords(data.school),
        current_grade: data.current_grade,
        status: "pending",
        source: "portal",
        // Secondary parent — only include if shown
        secondary_parent_first_name:
          showSecondaryParent && data.secondary_parent_first_name
            ? capitalizeWords(data.secondary_parent_first_name)
            : null,
        secondary_parent_last_name:
          showSecondaryParent && data.secondary_parent_last_name
            ? capitalizeWords(data.secondary_parent_last_name)
            : null,
        secondary_parent_mobile:
          showSecondaryParent && data.secondary_parent_mobile
            ? formatMobile(data.secondary_parent_mobile)
            : null,
      };

      const { data: insertedData, error } = await supabase
        .from("enrolments")
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;

      try {
        const { error: emailError } = await supabase.functions.invoke(
          "send-enrollment-notification",
          { body: { enrollmentId: insertedData.id } },
        );
        if (emailError) console.error("Email notification failed:", emailError);
      } catch (emailError) {
        console.error("Email notification error:", emailError);
      }

      setSubmitSuccess(true);
      reset();
      setShowSecondaryParent(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        error.message ||
          "An error occurred while submitting. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-2";
  const errorClass = "mt-1 text-sm text-red-600";

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
            Thank you for your enrolment at {center}. We'll review your
            submission and contact you shortly.
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
              Enrol at {center}
            </h1>
            <p className="text-gray-600">
              Please fill in all details to enrol your child at {center}
            </p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{submitError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* ── Student Information ── */}
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Student Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
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
                    className={inputClass}
                    placeholder="Enter student's first name"
                  />
                  {errors.student_first_name && (
                    <p className={errorClass}>
                      {errors.student_first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
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
                    className={inputClass}
                    placeholder="Enter student's last name"
                  />
                  {errors.student_last_name && (
                    <p className={errorClass}>
                      {errors.student_last_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Current Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("current_grade", {
                      required: "Please select a grade",
                    })}
                    className={inputClass}
                  >
                    <option value="">Select a grade</option>
                    {GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                  {errors.current_grade && (
                    <p className={errorClass}>{errors.current_grade.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
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
                    className={inputClass}
                    placeholder="Enter school name"
                  />
                  {errors.school && (
                    <p className={errorClass}>{errors.school.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Primary Parent ── */}
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Primary Parent / Guardian
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    First Name <span className="text-red-500">*</span>
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
                    className={inputClass}
                    placeholder="Enter parent's first name"
                  />
                  {errors.parent_first_name && (
                    <p className={errorClass}>
                      {errors.parent_first_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Last Name <span className="text-red-500">*</span>
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
                    className={inputClass}
                    placeholder="Enter parent's last name"
                  />
                  {errors.parent_last_name && (
                    <p className={errorClass}>
                      {errors.parent_last_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Mobile <span className="text-red-500">*</span>
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
                    className={inputClass}
                    placeholder="0412 345 678"
                  />
                  {errors.parent_mobile && (
                    <p className={errorClass}>{errors.parent_mobile.message}</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Email <span className="text-red-500">*</span>
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
                    onBlur={(e) =>
                      handleEmailBlur("email_address", e.target.value)
                    }
                    className={inputClass}
                    placeholder="parent@example.com"
                  />
                  {errors.email_address && (
                    <p className={errorClass}>{errors.email_address.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* ── Secondary Parent (toggle) ── */}
            <div className="border-b border-gray-100 pb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Secondary Parent / Guardian
                </h2>
                <button
                  type="button"
                  onClick={() => setShowSecondaryParent(!showSecondaryParent)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  {showSecondaryParent ? "− Remove" : "+ Add"}
                </button>
              </div>

              {showSecondaryParent && (
                <div className="space-y-4">
                  <div>
                    <label className={labelClass}>First Name</label>
                    <input
                      type="text"
                      {...register("secondary_parent_first_name")}
                      onBlur={(e) =>
                        handleNameBlur(
                          "secondary_parent_first_name",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Last Name</label>
                    <input
                      type="text"
                      {...register("secondary_parent_last_name")}
                      onBlur={(e) =>
                        handleNameBlur(
                          "secondary_parent_last_name",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Mobile</label>
                    <input
                      type="tel"
                      {...register("secondary_parent_mobile", {
                        validate: (value) =>
                          !value ||
                          validateMobile(value) ||
                          "Please enter a valid Australian mobile number",
                      })}
                      onBlur={(e) =>
                        e.target.value &&
                        handleSecondaryMobileBlur(e.target.value)
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                    {errors.secondary_parent_mobile && (
                      <p className={errorClass}>
                        {errors.secondary_parent_mobile.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      {...register("secondary_email_address", {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Please enter a valid email address",
                        },
                      })}
                      onBlur={(e) =>
                        handleEmailBlur(
                          "secondary_email_address",
                          e.target.value,
                        )
                      }
                      className={inputClass}
                      placeholder="Optional"
                    />
                    {errors.secondary_email_address && (
                      <p className={errorClass}>
                        {errors.secondary_email_address.message}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {!showSecondaryParent && (
                <p className="text-sm text-gray-400">
                  Click "+ Add" to include a second parent or guardian.
                </p>
              )}
            </div>

            {/* ── Address ── */}
            <div className="border-b border-gray-100 pb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Address
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>
                    Street <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("address_street", {
                      required: "Street address is required",
                    })}
                    onBlur={(e) =>
                      setValue("address_street", e.target.value.trim())
                    }
                    className={inputClass}
                    placeholder="123 Example Street"
                  />
                  {errors.address_street && (
                    <p className={errorClass}>
                      {errors.address_street.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Suburb <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("address_suburb", {
                      required: "Suburb is required",
                    })}
                    onBlur={(e) =>
                      handleNameBlur("address_suburb", e.target.value)
                    }
                    className={inputClass}
                    placeholder="Suburb"
                  />
                  {errors.address_suburb && (
                    <p className={errorClass}>
                      {errors.address_suburb.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register("address_state", {
                        required: "State is required",
                      })}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      {[
                        "NSW",
                        "VIC",
                        "QLD",
                        "WA",
                        "SA",
                        "TAS",
                        "ACT",
                        "NT",
                      ].map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.address_state && (
                      <p className={errorClass}>
                        {errors.address_state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      {...register("address_postcode", {
                        required: "Postcode is required",
                        pattern: {
                          value: /^\d{4}$/,
                          message: "Enter a valid 4-digit postcode",
                        },
                      })}
                      className={inputClass}
                      placeholder="2000"
                      maxLength={4}
                    />
                    {errors.address_postcode && (
                      <p className={errorClass}>
                        {errors.address_postcode.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Submit ── */}
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
