import React, { useState } from "react";
import { FaStar, FaPaperPlane, FaSmile, FaFrown, FaMeh } from "react-icons/fa";

/* --------------------------------------------------------------------------
   Feedback
   - Transparent page background (global background image shows through)
   - Minimal borders, neon accents, subtle blur/shadow
   - Validates rating (1–5) and feedback length; disables submit accordingly
   - Prevents double submit; shows success state and allows reset
   - Accessible labels, aria states, and keyboard-friendly stars
--------------------------------------------------------------------------- */

const STARS = 5;
const MIN_FEEDBACK_LEN = 10;
const MAX_FEEDBACK_LEN = 1000;

export default function Feedback() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Derived validation state
  const trimmedFeedback = feedback.trim();
  const isRatingValid =
    Number.isInteger(rating) && rating >= 1 && rating <= STARS;
  const isFeedbackValid =
    trimmedFeedback.length >= MIN_FEEDBACK_LEN &&
    trimmedFeedback.length <= MAX_FEEDBACK_LEN;
  const canSubmit = isRatingValid && isFeedbackValid && !isSubmitting;

  // Rating helper text
  const ratingText = (() => {
    if (!rating) return "Select your rating";
    if (rating <= 2) return "We're sorry to hear that";
    if (rating === 3) return "Thanks for your feedback";
    return "We're glad you enjoyed!";
  })();

  // Rating helper icon
  const ratingIcon = (() => {
    if (!rating) return <FaStar className="text-2xl text-[#2DE2E6]" />;
    if (rating <= 2) return <FaFrown className="text-2xl text-[#FF6EC7]" />;
    if (rating === 3) return <FaMeh className="text-2xl text-yellow-400" />;
    return <FaSmile className="text-2xl text-green-400" />;
  })();

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("http://localhost:4000/studentRoute/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, feedback: trimmedFeedback }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await res.json().catch(() => ({}));
      setIsSubmitted(true);
    } catch (err) {
      console.error("Error submitting feedback:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to initial state
  const resetForm = () => {
    setRating(0);
    setHover(0);
    setFeedback("");
    setIsSubmitted(false);
  };

  // Success view
  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-transparent">
        <div className="w-full max-w-md rounded-2xl p-8 bg-black/60 backdrop-blur shadow-xl animate-fade-in">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]">
            <FaPaperPlane className="h-10 w-10 text-white -rotate-45" />
          </div>
          <h2 className="mb-3 text-center text-3xl font-bold bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] bg-clip-text text-transparent">
            Thank You!
          </h2>
          <p className="mb-6 text-center text-[#2DE2E6]">
            Your feedback has been received and will help us improve our system.
          </p>
          <button
            type="button"
            onClick={resetForm}
            className="mx-auto block w-full rounded-xl bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] px-6 py-3 font-medium text-gray-900 transition hover:opacity-90 cursor-pointer"
          >
            Submit New Feedback
          </button>
        </div>

        {/* Animations */}
        <style>{`
          @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
          @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
          .animate-fade-in { animation: fade-in .5s ease-out both }
          .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
        `}</style>
      </div>
    );
  }

  // Form view
  return (
    <>
      <div className="p-8 bg-transparent animate-fade-in-up mt-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-center text-white bg-clip-text bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] drop-shadow">
            Feedback
          </h1>
          <p className="text-white/90 mt-4 text-lg">
            We value your input. Please share your feedback with us.
          </p>
        </div>
      </div>
      <div className="min-h-screen flex items-center justify-center p-8 bg-transparent">
        <div className="w-full max-w-md rounded-2xl bg-black/60 backdrop-blur shadow-xl overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7]">
              <FaStar className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] bg-clip-text text-transparent">
              Rate Our System
            </h2>
            <p className="text-sm text-[#2DE2E6]/80">
              Your opinion matters to us. Help us improve!
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="p-8 pt-0 space-y-2"
            noValidate
          >
            {/* Star Rating */}
            <fieldset aria-label="Rating" className="text-center">
              <div className="mb-4 flex justify-center gap-2">
                {Array.from({ length: STARS }, (_, i) => {
                  const val = i + 1;
                  const isActive = val <= (hover || rating);
                  return (
                    <label
                      key={val}
                      className={`cursor-pointer transition-transform ${
                        isActive ? "scale-110" : ""
                      }`}
                      onMouseEnter={() => setHover(val)}
                      onMouseLeave={() => setHover(0)}
                      title={`${val} star${val > 1 ? "s" : ""}`}
                    >
                      <input
                        type="radio"
                        name="rating"
                        value={val}
                        onChange={() => setRating(val)}
                        className="sr-only"
                        aria-checked={rating === val}
                      />
                      <FaStar
                        className={`text-4xl transition ${
                          isActive
                            ? "text-[#FF6EC7] drop-shadow-lg"
                            : "text-[#2DE2E6] opacity-40"
                        }`}
                      />
                    </label>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-2">
                {ratingIcon}
                <p className="text-sm font-medium text-[#2DE2E6]">
                  {ratingText}
                </p>
              </div>
              {!isRatingValid && (
                <p className="mt-2 text-xs text-[#FF6EC7]">
                  Please select a rating from 1 to 5.
                </p>
              )}
            </fieldset>

            {/* Feedback Textarea */}
            <div>
              <label
                htmlFor="feedback"
                className="mb-3 block text-sm font-medium text-[#2DE2E6]"
              >
                Your Feedback
              </label>
              <textarea
                id="feedback"
                name="feedback"
                value={feedback}
                onChange={(e) => {
                  const next = e.target.value.slice(0, MAX_FEEDBACK_LEN);
                  setFeedback(next);
                }}
                rows={4}
                className="w-full resize-none rounded-xl bg-white/10 px-4 py-3 text-white placeholder:text-white/60 focus:ring-2 focus:ring-[#FF6EC7] outline-none"
                placeholder="What did you like? What can we improve?..."
                aria-invalid={!isFeedbackValid}
                aria-describedby="feedback-help"
                required
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span
                  id="feedback-help"
                  className={` ${
                    isFeedbackValid ? "text-white/60" : "text-[#FF6EC7]"
                  }`}
                >
                  {trimmedFeedback.length < MIN_FEEDBACK_LEN
                    ? `Minimum ${MIN_FEEDBACK_LEN} characters.`
                    : "Looks good!"}
                </span>
                <span className="text-white/60">
                  {trimmedFeedback.length}/{MAX_FEEDBACK_LEN}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full rounded-xl px-4 py-4 font-semibold text-gray-900 transition flex items-center justify-center gap-2 cursor-pointer ${
                canSubmit
                  ? "bg-gradient-to-r from-[#2DE2E6] to-[#FF6EC7] hover:opacity-90"
                  : "bg-white/20 text-white/70 cursor-not-allowed"
              }`}
              aria-live="polite"
            >
              {isSubmitting ? (
                <>
                  <span className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900" />
                  Submitting...
                </>
              ) : (
                <>
                  <FaPaperPlane className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </button>
          </form>
        </div>

        {/* Animations */}
        <style>{`
        @keyframes fade-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(10px) } 100% { opacity: 1; transform: translateY(0) } }
        .animate-fade-in { animation: fade-in .5s ease-out both }
        .animate-fade-in-up { animation: fade-in-up .55s cubic-bezier(.2,.65,.2,1) both }
      `}</style>
      </div>
    </>
  );
}
