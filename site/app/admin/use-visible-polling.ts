import {useEffect} from 'react';
import {pollWhileVisible} from '../../lib/admin-view.mjs';
export function useVisiblePolling(task:()=>Promise<unknown>,delay:number,enabled=true){
  useEffect(()=>{
    if(!enabled)return;
    return pollWhileVisible(task,delay,document,window);
  },[task,delay,enabled]);
}
