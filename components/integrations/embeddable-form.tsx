"use client";

import React, { useState, useEffect } from "react";

interface EmbeddableFormProps {
  orgSlug: string;
  practiceName?: string;
}

export function EmbeddableForm({
  orgSlug,
  practiceName = "Hoffman Audiology Inc.",
}: EmbeddableFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [locationId, setLocationId] = useState("loc-dbn-01");
  const [serviceNeeded, setServiceNeeded] = useState("Diagnostic Hearing Assessment");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState(""); // Anti-spam bot trap
  const [popiaConsent, setPopiaConsent] = useState(false);

  const [utmParams, setUtmParams] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const utm: Record<string, string> = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content"].forEach((key) => {
        const val = params.get(key);
        if (val) utm[key] = val;
      });
      setUtmParams(utm);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!popiaConsent) {
      setErrorMessage("Please accept the POPIA privacy consent to submit your inquiry.");
      return;
    }

    if (!phone && !email) {
      setErrorMessage("Please provide either a phone number or email address so we can contact you.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/v1/public/forms/${orgSlug}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone: phone || null,
          email: email || null,
          locationId,
          serviceNeeded,
          message,
          popiaConsent,
          honeypot,
          utmParams,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit inquiry. Please try again.");
      }

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit inquiry. Please call the clinic directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Inquiry Received</h3>
        <p className="mt-2 text-sm text-slate-300 leading-relaxed">
          Thank you for reaching out to <span className="font-semibold text-white">{practiceName}</span>.
          Our clinical reception has received your details and will contact you shortly to confirm your appointment.
        </p>
        <button
          onClick={() => {
            setIsSubmitted(false);
            setFirstName("");
            setLastName("");
            setPhone("");
            setEmail("");
            setMessage("");
            setPopiaConsent(false);
          }}
          className="mt-6 rounded-lg bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition-colors"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 sm:p-8 text-slate-100 shadow-2xl backdrop-blur-md">
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400 border border-blue-500/20 mb-2">
          <span>Appointment Request</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{practiceName}</h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-400">
          Book a hearing assessment or consultation at our Durban or Ballito clinic.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-spam honeypot - hidden from human users */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_url_hp">Leave this empty</label>
          <input
            id="website_url_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              First Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Sipho"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Dlamini"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Phone Number <span className="text-slate-400 font-normal">(WhatsApp / Call)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 082 123 4567"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. patient@example.co.za"
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Clinic</label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="loc-dbn-01">Durban Clinic (Musgrave)</option>
              <option value="loc-blt-01">Ballito Clinic (The Well)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Service Needed</label>
            <select
              value={serviceNeeded}
              onChange={(e) => setServiceNeeded(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="Diagnostic Hearing Assessment">Diagnostic Hearing Assessment</option>
              <option value="Hearing Aid Fitting & Consultation">Hearing Aid Consultation</option>
              <option value="Microsuction Ear Wax Removal">Microsuction Wax Removal</option>
              <option value="Tinnitus Evaluation">Tinnitus Evaluation</option>
              <option value="Pediatric Hearing Screening">Pediatric Screening</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Message or Specific Questions <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Let us know any specific symptoms, days of the week, or times that suit you..."
            className="w-full rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex items-start gap-2 pt-1">
          <input
            id="popiaConsent"
            type="checkbox"
            required
            checked={popiaConsent}
            onChange={(e) => setPopiaConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-400"
          />
          <label htmlFor="popiaConsent" className="text-[11px] text-slate-400 leading-normal">
            I consent to {practiceName} storing and processing my contact details in accordance with the Protection of Personal Information Act (POPIA) for the sole purpose of scheduling my clinical appointment.
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? "Submitting Inquiry..." : "Submit Appointment Request"}
        </button>
      </form>
    </div>
  );
}
