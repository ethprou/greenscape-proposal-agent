"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  DollarSign,
  FileText,
  Loader2,
  Send,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { ConfigStatus } from "@/lib/config";
import type { ProposalRecord, QuoteInput } from "@/lib/schema";

type Props = {
  configStatus: ConfigStatus;
  initialError: string | null;
  initialProposals: ProposalRecord[];
};

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  leadSource: string;
  projectType: string;
  budgetMin: string;
  budgetMax: string;
  desiredTimeline: string;
  siteWalkNotes: string;
  internalNotes: string;
};

const exampleNotes =
  "Walked the backyard with homeowner and captured photos in CompanyCam. They want to replace the cracked concrete patio with pavers, add a modern shade pergola, install pet-friendly turf, improve drainage near the back wall, and add low-voltage lighting along the new walkway. HOA likely required because pergola height may be visible from the street. Access is through a narrow side gate, so material staging needs planning. Customer cares most about clean finished look, reliable communication, and having the space ready before Thanksgiving.";

const emptyForm: FormState = {
  customerName: "Nina Patel",
  phone: "(704) 555-0184",
  email: "nina@example.com",
  address: "5530 Providence Rd, Charlotte, NC",
  leadSource: "Meta lead form",
  projectType: "Paver patio, pergola, turf, drainage, lighting",
  budgetMin: "22000",
  budgetMax: "36000",
  desiredTimeline: "Before Thanksgiving if HOA approvals move quickly",
  siteWalkNotes: exampleNotes,
  internalNotes: "Qualified lead. Mention premium finish, communication, HOA dependency, access planning, and that Marcus will verify measurements/pricing before final proposal."
};

function money(value: number | null) {
  if (value === null) {
    return "Not set";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function statusCopy(status: ProposalRecord["status"]) {
  const map = {
    generating: "Generating",
    ready_for_review: "Ready for review",
    approved: "Approved",
    revision_requested: "Revision requested",
    failed: "Failed"
  };

  return map[status];
}

function formToPayload(form: FormState): QuoteInput {
  return {
    ...form,
    budgetMin: form.budgetMin ? Number(form.budgetMin) : null,
    budgetMax: form.budgetMax ? Number(form.budgetMax) : null
  };
}

function ConfigPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={ok ? "config-pill config-pill-ok" : "config-pill"}>
      {ok ? <CheckCircle2 aria-hidden="true" /> : <AlertTriangle aria-hidden="true" />}
      {label}
    </span>
  );
}

function ProposalListItem({
  proposal,
  selected,
  onSelect
}: {
  proposal: ProposalRecord;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={selected ? "proposal-list-item selected" : "proposal-list-item"}
      onClick={onSelect}
      type="button"
    >
      <span>
        <strong>{proposal.input.customerName}</strong>
        <small>{proposal.input.projectType}</small>
      </span>
      <em>{statusCopy(proposal.status)}</em>
    </button>
  );
}

function DraftPanel({
  proposal,
  onProposalUpdated
}: {
  proposal: ProposalRecord | null;
  onProposalUpdated: (proposal: ProposalRecord) => void;
}) {
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState<"approve" | "revision" | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!proposal) {
    return (
      <section className="draft-panel empty-state">
        <FileText aria-hidden="true" />
        <h2>No proposal selected</h2>
        <p>Create a draft or choose one from the queue.</p>
      </section>
    );
  }

  async function submitDecision(kind: "approve" | "revision") {
    if (!proposal) {
      return;
    }

    setSubmitting(kind);
    setError(null);

    try {
      const response = await fetch(`/api/proposals/${proposal.id}/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ approvalNotes: notes })
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Decision failed.");
      }

      onProposalUpdated(data.proposal);
      setNotes("");
    } catch (decisionError) {
      setError(decisionError instanceof Error ? decisionError.message : "Decision failed.");
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <section className="draft-panel">
      <div className="draft-header">
        <div>
          <span className="eyebrow">Founder review</span>
          <h2>{proposal.draft?.proposalTitle || proposal.input.projectType}</h2>
        </div>
        <span className={`status-badge status-${proposal.status}`}>
          {statusCopy(proposal.status)}
        </span>
      </div>

      <div className="metric-strip">
        <span>
          <DollarSign aria-hidden="true" />
          {money(proposal.input.budgetMin)}-{money(proposal.input.budgetMax)}
        </span>
        <span>
          <Clock3 aria-hidden="true" />
          {proposal.input.desiredTimeline || "Timeline missing"}
        </span>
        <span>
          <ShieldCheck aria-hidden="true" />
          {proposal.guardrails?.requiresVisualReview ? "Review required" : "No review flag"}
        </span>
      </div>

      {proposal.errorMessage ? <div className="error-box">{proposal.errorMessage}</div> : null}

      {proposal.draft ? (
        <div className="draft-content">
          <section>
            <h3>Executive Summary</h3>
            <p>{proposal.draft.executiveSummary}</p>
          </section>

          <section>
            <h3>Scope</h3>
            <div className="scope-grid">
              {proposal.draft.scopeSections.map((section) => (
                <article key={`${proposal.id}-${section.heading}`} className="scope-item">
                  <strong>{section.heading}</strong>
                  <small>{section.pricingCategory}</small>
                  <ul>
                    {section.details.map((detail) => (
                      <li key={detail}>{detail}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section>
            <h3>Pricing Review Items</h3>
            <div className="line-item-table">
              {proposal.draft.lineItems.map((item) => (
                <div key={`${proposal.id}-${item.item}`} className="line-item-row">
                  <span>{item.item}</span>
                  <span>{item.quantityAssumption}</span>
                  <span>{item.pricingCategory}</span>
                  <span>{item.needsHumanPrice ? "Verify" : "Catalog match"}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3>Guardrails</h3>
            <div className="flag-list">
              {proposal.guardrails?.flags.length ? (
                proposal.guardrails.flags.map((flag) => (
                  <span key={`${flag.code}-${flag.message}`} className={`flag flag-${flag.severity}`}>
                    {flag.message}
                  </span>
                ))
              ) : (
                <span className="flag flag-info">No guardrail flags beyond required human approval.</span>
              )}
            </div>
          </section>

          <section>
            <h3>Quote Review Brief</h3>
            <p>{proposal.draft.quoteReviewBrief}</p>
          </section>

          <section>
            <h3>Marcus Follow-up Draft</h3>
            <p>{proposal.draft.followUpMessage}</p>
          </section>

          <section className="two-col">
            <div>
              <h3>Assumptions</h3>
              <ul>
                {proposal.draft.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Customer Questions</h3>
              <ul>
                {proposal.draft.customerQuestions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h3>Internal Handoff</h3>
            <p>{proposal.draft.internalHandoff}</p>
          </section>

          <div className="approval-box">
            <label htmlFor="approval-notes">Approval or revision notes</label>
            <textarea
              id="approval-notes"
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Example: Verify drainage allowance, CompanyCam measurements, and spreadsheet pricing before sending."
              value={notes}
            />
            {error ? <div className="error-box">{error}</div> : null}
            <div className="approval-actions">
              <button
                className="secondary-button"
                disabled={Boolean(submitting)}
                onClick={() => submitDecision("revision")}
                type="button"
              >
                {submitting === "revision" ? <Loader2 className="spin" /> : <AlertTriangle />}
                Request revision
              </button>
              <button
                className="primary-button"
                disabled={Boolean(submitting)}
                onClick={() => submitDecision("approve")}
                type="button"
              >
                {submitting === "approve" ? <Loader2 className="spin" /> : <CheckCircle2 />}
                Approve draft
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="empty-state compact">
          <Loader2 className={proposal.status === "generating" ? "spin" : ""} />
          <p>{proposal.status === "generating" ? "Draft generation is running." : "No draft available."}</p>
        </div>
      )}
    </section>
  );
}

export function ProposalWorkspace({ configStatus, initialError, initialProposals }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [proposals, setProposals] = useState(initialProposals);
  const [selectedId, setSelectedId] = useState(initialProposals[0]?.id ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(initialError);

  const selectedProposal = useMemo(
    () => proposals.find((proposal) => proposal.id === selectedId) ?? proposals[0] ?? null,
    [proposals, selectedId]
  );

  function updateField(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function upsertProposal(nextProposal: ProposalRecord) {
    setProposals((current) => {
      const exists = current.some((proposal) => proposal.id === nextProposal.id);
      if (exists) {
        return current.map((proposal) => (proposal.id === nextProposal.id ? nextProposal : proposal));
      }
      return [nextProposal, ...current];
    });
    setSelectedId(nextProposal.id);
  }

  async function submitProposal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/proposals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formToPayload(form))
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Proposal generation failed.");
      }

      upsertProposal(data.proposal);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Proposal generation failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main>
      <section className="top-band">
        <div className="top-content">
          <div>
            <span className="eyebrow">Stoneridge Outdoor Living</span>
            <h1>Quote-to-Proposal Agent</h1>
            <p>
              Turn site-walk notes into a review-ready proposal package, with pricing guardrails,
              quote-review handoff, persistent history, and Slack review notifications.
            </p>
          </div>
          <div className="config-panel" aria-label="Configuration status">
            <ConfigPill ok={configStatus.database} label="Postgres" />
            <ConfigPill ok={configStatus.openai} label="OpenAI" />
            <ConfigPill ok={configStatus.slack} label="Slack" />
            <span className="model-pill">
              <Sparkles aria-hidden="true" />
              {configStatus.model}
            </span>
          </div>
        </div>
      </section>

      <section className="workspace-shell">
        <form className="intake-panel" onSubmit={submitProposal}>
          <div className="panel-heading">
            <div>
              <span className="eyebrow">New site walk</span>
              <h2>Draft a proposal</h2>
            </div>
            <button className="icon-button" title="Use sample Stoneridge notes" type="button" onClick={() => setForm(emptyForm)}>
              <FileText aria-hidden="true" />
            </button>
          </div>

          {error ? <div className="error-box">{error}</div> : null}

          <div className="form-grid">
            <label>
              Customer
              <input value={form.customerName} onChange={(event) => updateField("customerName", event.target.value)} />
            </label>
            <label>
              Phone
              <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </label>
            <label>
              Email
              <input value={form.email} onChange={(event) => updateField("email", event.target.value)} />
            </label>
            <label>
              Lead source
              <input value={form.leadSource} onChange={(event) => updateField("leadSource", event.target.value)} />
            </label>
          </div>

          <label>
            Project address
            <input value={form.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>

          <label>
            Project type
            <input value={form.projectType} onChange={(event) => updateField("projectType", event.target.value)} />
          </label>

          <div className="form-grid">
            <label>
              Budget min
              <input inputMode="numeric" value={form.budgetMin} onChange={(event) => updateField("budgetMin", event.target.value)} />
            </label>
            <label>
              Budget max
              <input inputMode="numeric" value={form.budgetMax} onChange={(event) => updateField("budgetMax", event.target.value)} />
            </label>
          </div>

          <label>
            Desired timeline
            <input value={form.desiredTimeline} onChange={(event) => updateField("desiredTimeline", event.target.value)} />
          </label>

          <label>
            Site-walk notes
            <textarea
              className="notes-input"
              value={form.siteWalkNotes}
              onChange={(event) => updateField("siteWalkNotes", event.target.value)}
            />
          </label>

          <label>
            Internal notes
            <textarea
              value={form.internalNotes}
              onChange={(event) => updateField("internalNotes", event.target.value)}
            />
          </label>

          <button className="primary-button full-width" disabled={isSubmitting} type="submit">
            {isSubmitting ? <Loader2 className="spin" aria-hidden="true" /> : <Send aria-hidden="true" />}
            Generate review draft
          </button>
        </form>

        <aside className="queue-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Proposal queue</span>
              <h2>Review history</h2>
            </div>
            <span className="count-pill">{proposals.length}</span>
          </div>

          <div className="proposal-list">
            {proposals.length ? (
              proposals.map((proposal) => (
                <ProposalListItem
                  key={proposal.id}
                  proposal={proposal}
                  selected={selectedProposal?.id === proposal.id}
                  onSelect={() => setSelectedId(proposal.id)}
                />
              ))
            ) : (
              <div className="empty-state compact">
                <FileText aria-hidden="true" />
                <p>No proposals yet.</p>
              </div>
            )}
          </div>
        </aside>

        <DraftPanel proposal={selectedProposal} onProposalUpdated={upsertProposal} />
      </section>
    </main>
  );
}
