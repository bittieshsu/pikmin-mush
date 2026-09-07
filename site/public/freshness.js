(function(root){
  function validCount(m){return m.challenger_count!==null&&m.challenger_count!==undefined&&Number.isInteger(Number(m.challenger_count))&&Number(m.challenger_count)>=0&&Number(m.challenger_capacity)>0&&Number(m.challenger_count)<=Number(m.challenger_capacity)}
  function age(seconds,now){if(!Number.isFinite(Number(seconds))||Number(seconds)<=0)return'時間未知';const minutes=Math.floor(Math.max(0,now/1000-Number(seconds))/60);return minutes<1?'剛剛':minutes<60?`${minutes} 分鐘前`:`${Math.floor(minutes/60)} 小時前`}
  function label(m,now=Date.now()){
    const count=validCount(m)?`${Number(m.challenger_count)}/${Number(m.challenger_capacity)} 人`:'人數未知';
    return `${count}・${age(m.last_observed_at,now)}收到更新${m.last_verified_at>0?'・'+age(m.last_verified_at,now)+'複查':''}`;
  }
  root.MushroomFreshness={validCount,age,label};
})(globalThis);
