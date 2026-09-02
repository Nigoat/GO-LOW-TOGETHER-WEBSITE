"use client";

import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";

const LANGUAGES = ["C", "C++", "Rust", "Zig", "Assembly", "Other"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced", "Wizard"];

interface VerifyFlowProps {
  token: string;
  discordUserId: string;
  guildId: string;
}

type Step =
  | { type: "turnstile" }
  | { type: "languages" }
  | { type: "other-input" }
  | { type: "skill"; language: string }
  | { type: "complete" };

export default function VerifyFlow({ token, discordUserId, guildId }: VerifyFlowProps) {
  const [step, setStep] = useState<Step>({ type: "turnstile" });
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [skillAnswers, setSkillAnswers] = useState<Record<string, string>>({});
  const [turnstileToken, setTurnstileToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [customLanguage, setCustomLanguage] = useState("");

  const handleTurnstileSuccess = async (turnstileTokenValue: string) => {
    setTurnstileToken(turnstileTokenValue);
    setIsVerifying(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, turnstileToken: turnstileTokenValue }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Verification failed");
        setIsVerifying(false);
        return;
      }

      setStep({ type: "languages" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const toggleLanguage = (lang: string) => {
    setSelectedLanguages((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleLanguagesSubmit = () => {
    if (selectedLanguages.length === 0) return;
    if (selectedLanguages.includes("Other")) {
      setStep({ type: "other-input" });
    } else {
      setStep({ type: "skill", language: selectedLanguages[0] });
    }
  };

  const handleOtherInputSubmit = () => {
    if (!customLanguage.trim()) return;
    const nonOtherLanguages = selectedLanguages.filter((l) => l !== "Other");
    if (nonOtherLanguages.length > 0) {
      setStep({ type: "skill", language: nonOtherLanguages[0] });
    } else {
      submitRoles({});
    }
  };

  const handleSkillAnswer = async (level: string) => {
    const currentStep = step as { type: "skill"; language: string };
    const newAnswers = { ...skillAnswers, [currentStep.language]: level };
    setSkillAnswers(newAnswers);

    const nonOtherLanguages = selectedLanguages.filter((l) => l !== "Other");
    const currentIndex = nonOtherLanguages.indexOf(currentStep.language);
    if (currentIndex < nonOtherLanguages.length - 1) {
      setStep({ type: "skill", language: nonOtherLanguages[currentIndex + 1] });
    } else {
      submitRoles(newAnswers);
    }
  };

  const submitRoles = async (finalSkillAnswers: Record<string, string>) => {
    try {
      await fetch("/api/submit-roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordUserId,
          guildId,
          languages: selectedLanguages,
          skillAnswers: finalSkillAnswers,
        }),
      });
    } catch {
    }
    setStep({ type: "complete" });
  };

  const nonOtherLanguages = selectedLanguages.filter((l) => l !== "Other");
  const hasOther = selectedLanguages.includes("Other");
  const currentSkillIndex = step.type === "skill" ? nonOtherLanguages.indexOf(step.language) : 0;
  const totalSteps = 1 + (hasOther ? 1 : 0) + nonOtherLanguages.length;
  const progress = step.type === "turnstile"
    ? 0
    : step.type === "languages"
    ? 1
    : step.type === "other-input"
    ? 2
    : step.type === "skill"
    ? (hasOther ? 3 : 2) + currentSkillIndex
    : totalSteps;

  if (step.type === "turnstile") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">Verify Your Account</h1>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        {isVerifying ? (
          <p className="text-gray-400">Verifying...</p>
        ) : (
          <div className="flex justify-center">
            <Turnstile
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              onSuccess={handleTurnstileSuccess}
            />
          </div>
        )}
      </div>
    );
  }

  if (step.type === "complete") {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4 text-green-400">You&apos;re done!</h1>
        <p className="text-gray-400">You can close this tab now and go back to the Discord server. Enjoy!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className="h-1 flex-1 rounded-full transition-colors duration-300"
              style={{
                backgroundColor: i < progress ? "#ffffff" : i === progress ? "#e5e5e5" : "#333333",
              }}
            />
          ))}
        </div>
      </div>

      {step.type === "languages" && (
        <div className="animate-fadeIn">
          <h2 className="text-xl font-bold mb-6">What coding languages do you code?</h2>
          <div className="space-y-3">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => toggleLanguage(lang)}
                className="w-full p-4 rounded-lg border-2 text-left transition-all"
                style={{
                  borderColor: selectedLanguages.includes(lang) ? "#ffffff" : "#333333",
                  backgroundColor: selectedLanguages.includes(lang) ? "#1a1a1a" : "#111111",
                }}
              >
                {lang}
              </button>
            ))}
          </div>
          <button
            onClick={handleLanguagesSubmit}
            disabled={selectedLanguages.length === 0}
            className="w-full mt-6 p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: selectedLanguages.length > 0 ? "#ffffff" : "#333333", color: selectedLanguages.length > 0 ? "#000000" : "#888888" }}
          >
            Continue
          </button>
        </div>
      )}

      {step.type === "other-input" && (
        <div className="animate-fadeIn">
          <h2 className="text-xl font-bold mb-6">What coding language do you know?</h2>
          <input
            type="text"
            value={customLanguage}
            onChange={(e) => setCustomLanguage(e.target.value)}
            placeholder="Type your language..."
            className="w-full p-4 rounded-lg border-2 text-left transition-all outline-none"
            style={{ borderColor: "#333333", backgroundColor: "#111111", color: "#ffffff" }}
          />
          <button
            onClick={handleOtherInputSubmit}
            disabled={!customLanguage.trim()}
            className="w-full mt-6 p-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: customLanguage.trim() ? "#ffffff" : "#333333", color: customLanguage.trim() ? "#000000" : "#888888" }}
          >
            Continue
          </button>
        </div>
      )}

      {step.type === "skill" && (
        <div className="animate-fadeIn">
          <h2 className="text-xl font-bold mb-2">What is your level in {step.language}?</h2>
          <p className="text-gray-400 mb-6">
            ({currentSkillIndex + 1} of {nonOtherLanguages.length})
          </p>
          <div className="space-y-3">
            {SKILL_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => handleSkillAnswer(level)}
                className="w-full p-4 rounded-lg border-2 text-left transition-all border-gray-700 bg-gray-800 hover:border-white hover:bg-gray-900"
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
