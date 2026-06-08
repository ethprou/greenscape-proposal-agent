import { ProposalWorkspace } from "@/components/proposal-workspace";
import { getConfigStatus } from "@/lib/config";
import { listProposals } from "@/lib/repository";
import { toErrorMessage } from "@/lib/errors";

export const dynamic = "force-dynamic";

async function loadInitialProposals(databaseConfigured: boolean) {
  try {
    return {
      proposals: databaseConfigured ? await listProposals() : [],
      error: null
    };
  } catch (error) {
    return {
      proposals: [],
      error: toErrorMessage(error)
    };
  }
}

export default async function Home() {
  const configStatus = getConfigStatus();
  const initial = await loadInitialProposals(configStatus.database);

  return (
    <ProposalWorkspace
      configStatus={configStatus}
      initialError={initial.error}
      initialProposals={initial.proposals}
    />
  );
}
