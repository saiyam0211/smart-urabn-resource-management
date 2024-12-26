// src/components/ReportProblem.js
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { showToast } from "./ToastContainer";
import InteractiveMap from "./InteractiveMap";
import imageClassificationService from "../services/imageClassification";
import socketService from "../services/socketService";
import { OfflineStorage } from "../services/offlineStorage";
import { registerBackgroundSync } from "../services/offlineSync";

const ReportProblem = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "waste",
    photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [position, setPosition] = useState(null);
  const [step, setStep] = useState("details"); // details, location, review
  const imageRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      (error) => {
        showToast(
          "Error getting location. Please enable location services.",
          "error"
        );
      }
    );

    // Initialize socket connection
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("Image size should be less than 5MB", "error");
        return;
      }

      setIsUploading(true);
      setFormData((prev) => ({
        ...prev,
        photo: file,
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);

        // Create an image element for AI classification
        const img = new Image();
        img.onload = async () => {
          try {
            const predictedCategory =
              await imageClassificationService.classifyImage(img);
            setFormData((prev) => ({
              ...prev,
              category: predictedCategory,
            }));
            showToast("Category automatically detected!");
          } catch (error) {
            console.error("Classification error:", error);
          } finally {
            setIsUploading(false);
          }
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const validateFormData = () => {
    if (!formData.title.trim()) {
      showToast("Please enter a title", "error");
      return false;
    }
    if (!formData.description.trim()) {
      showToast("Please enter a description", "error");
      return false;
    }
    if (!formData.photo) {
      showToast("Please upload a photo", "error");
      return false;
    }
    if (!position) {
      showToast("Location is required", "error");
      return false;
    }
    return true;
  };

  const OfflineIndicator = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine);

    useEffect(() => {
      const handleOnline = () => setIsOffline(false);
      const handleOffline = () => setIsOffline(true);

      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);

      return () => {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      };
    }, []);

    if (!isOffline) return null;

    return (
      <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-yellow-800 text-sm font-medium">
            You're offline. Changes will sync when you're back online.
          </span>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormData()) return;

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      data.append("latitude", position.lat);
      data.append("longitude", position.lng);

      let response;
      try {
        response = await axios.post("/api/problems", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      } catch (error) {
        // If offline or request fails, store locally
        if (!navigator.onLine || error.message === "Network Error") {
          const savedOffline = await OfflineStorage.saveOfflineProblem({
            ...formData,
            latitude: position.lat,
            longitude: position.lng,
            timestamp: Date.now(),
          });

          if (savedOffline) {
            showToast("Problem saved offline. Will sync when online.", "info");
            await registerBackgroundSync();
            onSubmit({ ...formData, status: "pending_sync" });
            return;
          }
        }
        throw error;
      }

      // Notify nearby users through socket if online
      if (navigator.onLine) {
        socketService.emitProblemUpdate(response.data._id, "new");
      }

      showToast("Problem reported successfully!");
      onSubmit(response.data);
    } catch (error) {
      console.error("Error reporting problem:", error);
      showToast(
        error.response?.data?.error || "Failed to report problem",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case "details":
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Brief title of the problem"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Detailed description of the problem"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="waste">Waste</option>
                <option value="air_pollution">Air Pollution</option>
                <option value="water_pollution">Water Pollution</option>
                <option value="noise_pollution">Noise Pollution</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="photo-upload"
                required
              />
              <label
                htmlFor="photo-upload"
                className="w-full flex flex-col items-center justify-center px-4 py-6 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-emerald-500"
              >
                {isUploading ? (
                  <div className="flex items-center space-x-2">
                    <svg
                      className="animate-spin h-5 w-5 text-emerald-500"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Processing image...</span>
                  </div>
                ) : photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Click to upload a photo
                    </p>
                  </div>
                )}
              </label>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep("location")}
                disabled={
                  !formData.title || !formData.description || !formData.photo
                }
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Location
              </button>
            </div>
          </motion.div>
        );

      // In the location step of ReportProblem.js, replace the InteractiveMap with this:

      case "location":
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold">Location Details</h3>

            <div className="bg-gray-50 p-6 rounded-lg space-y-4">
              {position ? (
                <div className="space-y-4">
                  <div className="flex items-center text-green-600">
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">Location detected</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-600">
                        Latitude
                      </label>
                      <input
                        type="text"
                        value={position.lat.toFixed(6)}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600">
                        Longitude
                      </label>
                      <input
                        type="text"
                        value={position.lng.toFixed(6)}
                        readOnly
                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setPosition({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                          });
                          showToast("Location updated successfully");
                        },
                        (error) => {
                          showToast(
                            "Error getting location: " + error.message,
                            "error"
                          );
                        }
                      );
                    }}
                    type="button"
                    className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    Refresh Location
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <button
                    onClick={() => {
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setPosition({
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                          });
                          showToast("Location detected successfully");
                        },
                        (error) => {
                          showToast(
                            "Error getting location: " + error.message,
                            "error"
                          );
                        }
                      );
                    }}
                    type="button"
                    className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                  >
                    Detect My Location
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep("details")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={() => setStep("review")}
                disabled={!position}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50"
              >
                Next: Review
              </button>
            </div>
          </motion.div>
        );

      case "review":
        return (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold">Review Report</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-700">Problem Details</h4>
                  <p className="text-lg font-semibold">{formData.title}</p>
                  <p className="text-gray-600">{formData.description}</p>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Category</h4>
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    {formData.category.replace("_", " ")}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-gray-700">Location</h4>
                  <p className="text-gray-600">
                    Latitude: {position?.lat.toFixed(6)}
                    <br />
                    Longitude: {position?.lng.toFixed(6)}
                  </p>
                </div>
              </div>

              <div>
                {photoPreview && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Photo</h4>
                    <img
                      src={photoPreview}
                      alt="Problem preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setStep("location")}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 bg-emerald-500 text-white rounded-lg disabled:opacity-50 flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
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
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Report</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl max-w-2xl w-full p-6 relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">
                Report a Problem
              </h2>
              <div className="mt-2 flex items-center space-x-4">
                {["details", "location", "review"].map((stepName, index) => (
                  <React.Fragment key={stepName}>
                    <div className="flex items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          step === stepName
                            ? "bg-emerald-500 text-white"
                            : step === "review" &&
                              ["details", "location"].includes(stepName)
                            ? "bg-emerald-100 text-emerald-500"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-600">
                        {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                      </span>
                    </div>
                    {index < 2 && <div className="flex-1 h-0.5 bg-gray-200" />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {renderStepContent()}
          </motion.div>
        </div>
      </AnimatePresence>
      <OfflineIndicator />
    </>
  );
};

export default ReportProblem;
