import {authorizeFleetAgent} from '../../../../lib/fleet';
import {noStoreJson,readBoundedUtf8} from '../../../../lib/cloud';
import {parsePowerPause,savePowerPause} from '../../../../lib/power-pauses';
export async function POST(request:Request) {
  const agent=await authorizeFleetAgent(request);
  if(!agent)return noStoreJson({error:'unauthorized'},401);
  const body=await readBoundedUtf8(request,2048);
  if('error' in body)return noStoreJson({error:'invalid body'},413);
  let input;try{input=JSON.parse(body.text);}catch{return noStoreJson({error:'invalid json'},400);}
  const event=parsePowerPause(input);
  if(!event)return noStoreJson({error:'invalid power pause'},400);
  await savePowerPause(agent.id,event);
  return noStoreJson({ok:true});
}
