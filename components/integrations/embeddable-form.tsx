"use client";

import React, { useState, useEffect } from "react";
import { leadService } from "@/lib/services/lead-service";

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
  const [honeypot, setHoneypot] = useState(""); // Bot trap
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

    // Honeypot check: If filled, bot detected. Return fake success.
    if (honeypot.trim() !== "") {
      setIsSubmitted(true);
      return;
    }

    if (!popiaConsent) {
      setErrorMessage("Please accept the POPIA privacy consent to submit your inquiry.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Ingest directly via lead service
      const orgId = "org-hoffman-01";
      const tags = ["Website Web Form", serviceNeeded];
      if (utmParams.utm_campaign) {
        tags.push(`Campaign: ${utmParams.utm_campaign}`);
      }

      leadService.createLead({
        organization_id: orgId,
        first_name: firstName,
        last_name: lastName,
        email: email || null,
        phone: phone || null,
        location_id: locationId,
        source: "website",
        priority: "medium",
        notes: `Service Needed: ${serviceNeeded}. Patient message: ${message || "None provided"}`,
        tags,
        customFields: {
          utm: utmParams,
          serviceNeeded,
          popiaConsented: true,
          submittedAt: new Date().toISOString(),
        },
        staffName: "Website Embed Form",
      });

      setIsSubmitted(true);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit inquiry. Please try again or call the clinic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-slate-900/90 p-8 text-center shadow-2xl backdrop-blur-md">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white">Inquiry Received!</h3>
        <p className="mt-2 text-sm text-slate-300">
          Thank you, <strong>{firstName}</strong>. Our clinical team at {practiceName} has received your inquiry.
        </p>
        <p className="mt-1 text-xs text-slate-400">
          We will contact you within our 2-hour business hours response window to confirm your appointment.
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
          className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950 p-6 sm:p-8 shadow-2xl text-slate-100">
      <div className="mb-6">
        <span className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-400">
          Book An Appointment
        </span>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          {practiceName}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Comprehensive Hearing Healthcare in Durban (Musgrave) and Ballito
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Anti-Spam Honeypot (hidden from human visitors) */}
        <div className="hidden" aria-hidden="true">
          <label htmlFor="website_hp">Leave this empty</label>
          <input
            id="website_hp"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              First Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="e.g. Sindi"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Last Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="e.g. Khumalo"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="082 123 4567"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="sindi.khumalo@example.co.za"
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Clinic Location
            </label>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="loc-dbn-01">Durban Clinic (Musgrave)</option>
              <option value="loc-blt-01">Ballito Clinic</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Service Requested
            </label>
            <select
              value={serviceNeeded}
              onChange={(e) => setServiceNeeded(e.target.value)}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Diagnostic Hearing Assessment">Diagnostic Hearing Assessment</option>
              <option value="Hearing Aid Fitting / Upgrade">Hearing Aid Fitting / Upgrade</option>
              <option value="Microsuction Wax Removal">Microsuction Wax Removal</option>
              <option value="Tinnitus Evaluation">Tinnitus Evaluation</option>
              <option value="Pediatric Hearing Screening">Pediatric Hearing Screening</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300">
            Tell us about your hearing concerns (optional)
          </label>
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Difficulty hearing conversation in noisy restaurants, blocked feeling in right ear..."
            className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* POPIA Consent */}
        <div className="flex items-start gap-2.5 pt-1">
          <input
            id="popia"
            type="checkbox"
            checked={popiaConsent}
            onChange={(e) => setPopiaConsent(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="popia" className="text-xs text-slate-400">
            I consent to {practiceName} storing and processing my contact details to respond to this appointment request, in compliance with the South African Protection of Personal Information Act (POPIA).
          </label>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 disabled:opacity-50 transition"
        >
          {isSubmitting ? "Submitting Inquiry..." : "Submit Appointment Inquiry"}
        </button>

        <p className="text-center text-[11px] text-slate-500">
          Powered by Kuro Solutions CRM SaaS • Secure & POPIA Compliant
        </p>
      </form>
    </div>
  );
}
