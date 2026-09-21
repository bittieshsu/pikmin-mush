import {adminAuthorized,controllerAuthorized,noStoreJson} from '../../../../lib/cloud';
import {powerPauseHistory} from '../../../../lib/power-pauses';
export async function GET(request:Request) {
  if(!adminAuthorized(request)&&!controllerAuthorized(request))return noStoreJson({error:'forbidden'},403);
  const url=new URL(request.url),to=Number(url.searchParams.get('to')??Date.now()),from=Number(url.searchParams.get('from')??to-86400000);
  if(!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||from<0||to<from||to-from>31*86400000)return noStoreJson({error:'invalid window'},400);
  return noStoreJson(await powerPauseHistory(from,to));
}
