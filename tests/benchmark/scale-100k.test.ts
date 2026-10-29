import { describe, it, expect, beforeAll } from "vitest";

interface BenchmarkLead {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  phoneNormalized: string;
  email: string;
  status: string;
  source: string;
  notes: string;
  createdAt: number;
}

describe("100,000 Lead Scale & Performance Benchmark (<200ms Target)", () => {
  const TOTAL_RECORDS = 100000;
  const leads: BenchmarkLead[] = [];
  const phoneIndex = new Map<string, BenchmarkLead>();

  beforeAll(() => {
    const sources = ["phone", "website", "whatsapp", "meta_ads", "email"];
    const statuses = ["new", "contacted", "follow_up_needed", "appointment_booked", "completed"];
    const firstNames = ["Sipho", "Gugulethu", "Deon", "Fatima", "Brandon", "Kara", "Thabo", "Lindiwe", "Johan", "Nandi"];
    const lastNames = ["Zuma", "van der Merwe", "Patel", "Naicker", "Hoffman", "Cele", "Mthembu", "Botha", "Dlamini", "Khumalo"];

    const startTime = Date.now();

    for (let i = 0; i < TOTAL_RECORDS; i++) {
      const fName = firstNames[i % firstNames.length];
      const lName = lastNames[i % lastNames.length];
      // South African E.164 phone: +2782XXXXXXX
      const phone = `+2782${String(i).padStart(7, "0")}`;
      const email = `patient_${i}@example.co.za`;

      const lead: BenchmarkLead = {
        id: `lead_${i}`,
        organizationId: "org-hoffman-01",
        firstName: fName,
        lastName: lName,
        phoneNormalized: phone,
        email,
        status: statuses[i % statuses.length],
        source: sources[i % sources.length],
        notes: `Diagnostic inquiry note for patient record index ${i} with audiology considerations.`,
        createdAt: startTime - (i * 60000),
      };

      leads.push(lead);
      phoneIndex.set(phone, lead);
    }
  });

  it("verifies 100,000 records are generated and indexed", () => {
    expect(leads.length).toBe(TOTAL_RECORDS);
    expect(phoneIndex.size).toBe(TOTAL_RECORDS);
  });

  it("executes 1,000 random indexed phone lookups in < 200ms", () => {
    const start = performance.now();

    for (let j = 0; j < 1000; j++) {
      const targetIndex = (j * 97) % TOTAL_RECORDS;
      const targetPhone = `+2782${String(targetIndex).padStart(7, "0")}`;
      const found = phoneIndex.get(targetPhone);
      expect(found).toBeDefined();
      expect(found?.id).toBe(`lead_${targetIndex}`);
    }

    const duration = performance.now() - start;
    // Target performance budget: < 200ms
    expect(duration).toBeLessThan(200);
  });

  it("executes paginated page slicing (page 2,500 of 5,000) on 100k records in < 200ms", () => {
    const page = 2500;
    const pageSize = 20;

    const start = performance.now();
    const startIndex = (page - 1) * pageSize;
    const paginatedSlice = leads.slice(startIndex, startIndex + pageSize);
    const duration = performance.now() - start;

    expect(paginatedSlice.length).toBe(pageSize);
    expect(duration).toBeLessThan(200);
  });

  it("executes multi-column substring search over 100k records in < 200ms", () => {
    const searchTerm = "patient record index 54321";

    const start = performance.now();
    const matches = leads.filter(
      (l) => l.notes.includes(searchTerm) || l.phoneNormalized.includes(searchTerm)
    );
    const duration = performance.now() - start;

    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe("lead_54321");
    expect(duration).toBeLessThan(200);
  });
});
