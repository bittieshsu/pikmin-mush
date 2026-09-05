import { noStoreJson } from "../../../lib/cloud";
import { QUERY_CONTRACT_VERSION } from "../../../lib/query-contract.mjs";
import { CATALOGUE_REVISION } from "../../../lib/catalogue-seed.mjs";

export async function GET() {
  return noStoreJson({release:"reliability-2026-09-05",query_contract:QUERY_CONTRACT_VERSION,
    catalogue_revision:CATALOGUE_REVISION,observation_schema:2,allocation_mode:"shadow"});
}
