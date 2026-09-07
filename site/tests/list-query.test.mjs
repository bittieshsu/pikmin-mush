import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {listOrder,cursorPredicate,searchPredicate} from '../lib/list-query.mjs';

test('all global sorts paginate complete results with ties and low participant priority',()=>{
 const db=new DatabaseSync(':memory:');
 db.exec('CREATE TABLE mushrooms(id TEXT,level INTEGER,first_seen INTEGER,start_ms INTEGER,last_seen INTEGER,finish_ms INTEGER,challenger_count INTEGER,challenger_capacity INTEGER)');
 const insert=db.prepare('INSERT INTO mushrooms VALUES(?,?,?,?,?,?,?,?)');
 for(let i=0;i<53;i++)insert.run('id'+String(i).padStart(3,'0'),2+i%3,100+i%7,0,200-i,i%5?10000+i:0,i%7,35);
 for(const sort of ['updated','discovered','discovered-desc','level','remain','remain-desc'])for(const priority of ['0','1']){
  const order=listOrder(new URLSearchParams({sort,prioritize_low:priority}));
  const base=`SELECT *,${order.select} FROM mushrooms`;
  const expected=db.prepare(`${base} ORDER BY ${order.order}`).all().map(r=>r.id);
  const actual=[];let cursor=null;
  for(let n=0;n<30;n++){
   const p=cursorPredicate(order,cursor);
   const rows=db.prepare(`${base}${p.sql?' WHERE '+p.sql:''} ORDER BY ${order.order} LIMIT 4`).all(...p.bindings);
   actual.push(...rows.map(r=>r.id));if(rows.length<4)break;
   const last=rows.at(-1);cursor={low:last.query_low,value:last.query_value,id:last.id};
  }
  assert.deepEqual(actual,expected,sort+priority);
 }
 db.close();
});

test('search binds literal POI/GPS and catalog neighbourhoods without SQL injection',()=>{
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE mushrooms(id TEXT,lat REAL,lng REAL)');
 db.prepare('INSERT INTO mushrooms VALUES(?,?,?)').run('poi',25,121);
 const catalog=[{country:'台灣',city:'台北',lat:25,lng:121}];
 for(const [q,expected] of [['台北',1],['台灣',1],['25, 121',1],['poi',1],["' OR 1=1 --",0],['%',0]]){
  const p=searchPredicate(q,catalog);assert.equal(db.prepare('SELECT * FROM mushrooms WHERE '+p.sql).all(...p.bindings).length,expected);
 }
 assert.throws(()=>searchPredicate('x'.repeat(121),catalog));
 assert.throws(()=>listOrder(new URLSearchParams({sort:'id;DROP TABLE mushrooms'})));
 assert.throws(()=>cursorPredicate(listOrder(new URLSearchParams()),{low:0,value:NaN,id:'a'}));
 db.close();
});
