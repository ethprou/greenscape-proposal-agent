import { getAppUrl } from "./config";
import type { ProposalRecord } from "./schema";

type SlackResult = {
  status: string;
};

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

export async function notifySlackProposalReady(proposal: ProposalRecord): Promise<SlackResult> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return { status: "skipped_missing_webhook" };
  }

  const reviewUrl = `${getAppUrl()}?proposal=${encodeURIComponent(proposal.id)}`;
  const renderLine = proposal.guardrails?.requiresRender
    ? "\n*Render:* Carlos 3D render required before send."
    : "";
  const blockerCount =
    proposal.guardrails?.flags.filter((flag) => flag.severity === "blocker").length ?? 0;

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: `Proposal draft ready for ${proposal.input.customerName}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Proposal draft ready:* ${proposal.input.customerName}\n*Project:* ${proposal.input.projectType}\n*Status:* ${statusLabel(proposal.status)}\n*Blockers:* ${blockerCount}${renderLine}`
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<${reviewUrl}|Review the draft in the proposal agent>`
          }
        }
      ]
    })
  });

  if (!response.ok) {
    return { status: `slack_error_${response.status}` };
  }

  return { status: "sent" };
}

export async function notifySlackProposalApproved(proposal: ProposalRecord): Promise<SlackResult> {
  if (!process.env.SLACK_WEBHOOK_URL) {
    return { status: "skipped_missing_webhook" };
  }

  const response = await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      text: `Proposal approved for ${proposal.input.customerName}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Proposal approved:* ${proposal.input.customerName}\nJenna can now move this into the GHL proposal send workflow.`
          }
        }
      ]
    })
  });

  if (!response.ok) {
    return { status: `slack_error_${response.status}` };
  }

  return { status: "sent" };
}

