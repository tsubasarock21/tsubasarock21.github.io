/* 王が雇う現場リーダー。能力は募集の小さな偏りだけ。 */
(function(root){'use strict';
const M=root.PyramidModel;
const data=root.PyramidLeaderData,REGULAR_LIMIT=50,MAX=REGULAR_LIMIT+1,BONUS_ID='neb';
// Earlier card archives numbered the same bonus card 100. Saved ownership uses its ID.
const bonusCard=data?.bonus?.number===100?{...data.bonus,number:MAX}:data?.bonus;
function validCard(c,bonus=false){const text=k=>typeof c?.[k]==='string'&&c[k].length>0&&c[k].length<=500;
 return c&&/^[a-z][a-z0-9_-]{0,63}$/.test(c.id)&&!['constructor','prototype'].includes(c.id)&&Number.isInteger(c.number)&&c.number>0&&c.number<=(bonus?MAX:REGULAR_LIMIT)&&(!bonus||c.number===MAX&&c.id===BONUS_ID)&&['name','origin','job','action','line','letter'].every(text)&&Number.isInteger(c.age)&&c.age>=18&&c.age<=10000&&Number.isInteger(c.charm)&&c.charm>=60&&c.charm<=100&&/^#[a-f0-9]{6}$/i.test(c.color)&&(!c.skin||/^#[a-f0-9]{6}$/i.test(c.skin))&&['lift','gather','measure','greet','story'].includes(c.gesture)&&['card','full'].includes(c.imageLayout)&&/^cards\/images\/[a-zA-Z0-9_-]+\.(png|jpg|jpeg|webp)$/.test(c.image)&&Array.isArray(c.story)&&c.story.length>0&&c.story.length<=8&&c.story.every(t=>typeof t==='string'&&t.length<=2000)&&Array.isArray(c.facts)&&c.facts.length<=8&&c.facts.every(a=>Array.isArray(a)&&a.length===2&&a.every(t=>typeof t==='string'&&t.length<=500));}
if(!data||data.schema!==1||!Array.isArray(data.cards)||data.cards.length<1||data.cards.length>REGULAR_LIMIT||!data.cards.every(c=>validCard(c))||!validCard(bonusCard,true)||new Set(data.cards.map(c=>c.id)).size!==data.cards.length||new Set(data.cards.map(c=>c.number)).size!==data.cards.length||data.cards.some(c=>c.id===BONUS_ID))throw Error('カードデータの形式を確認してください');
const REGULAR=data.cards,CARDS=[...REGULAR,bonusCard];
const validId=id=>/^[a-z][a-z0-9_-]{0,63}$/.test(id)&&!['constructor','prototype'].includes(id);
const find=id=>CARDS.find(c=>c.id===id)||null;
function normalize(s,legacy=false){
 if(legacy){s.leaderCards={};s.leaderId=null;s.leaderDrawn=false;s.leaderEvent=null;}
 if(!s.leaderCards||typeof s.leaderCards!=='object'||Array.isArray(s.leaderCards)||Object.entries(s.leaderCards).some(([id,n])=>!validId(id)||!Number.isInteger(n)||n<1||n>1e6))return false;
 if(typeof s.leaderDrawn!=='boolean'||s.leaderId!==null&&(!validId(s.leaderId)||!s.leaderCards[s.leaderId])||s.siteNumber===1&&(s.leaderId!==null||s.leaderDrawn))return false;
 if(s.leaderEvent!==null&&(!s.leaderEvent||!validId(s.leaderEvent.id)||typeof s.leaderEvent.isNew!=='boolean'||s.leaderEvent.bonus!==undefined&&typeof s.leaderEvent.bonus!=='boolean'||s.leaderEvent.site!==s.siteNumber||!s.leaderDrawn&&!s.leaderEvent.bonus||!s.leaderCards[s.leaderEvent.id]))return false;
 return true;
}
function charm(s){return find(s.leaderId)?.charm??50;}
function hireRoll(s,random=Math.random){
 const draw=()=>1+Math.floor(Math.max(0,Math.min(.999999999999,random()))*1000);
 const first=draw(),value=charm(s),chance=Math.max(0,Math.min(.12,(value-50)/50*.12));
 if(value>50&&random()<chance){const second=draw();return {base:Math.max(first,second),charm:value,boosted:second>first}}
 return {base:first,charm:value,boosted:false};
}
function drawLeader(s){if(!s.started||M.completed(s)||s.siteNumber<2||s.elapsed<12||s.leaderDrawn||s.leaderEvent?.bonus)return null;
 const unowned=REGULAR.filter(card=>!s.leaderCards[card.id]);
 if(!unowned.length)return null;
 const index=Math.min(unowned.length-1,Math.floor(M.hash(s.seed^Math.imul(s.siteNumber,0x45d9f3b))*unowned.length));
 const {id}=unowned[index];
 s.leaderDrawn=true;
 s.leaderCards[id]=1;
 s.leaderEvent={id,isNew:true,site:s.siteNumber};
 return s.leaderEvent;
}
function awardBonus(s){if(s.leaderCards[BONUS_ID]||REGULAR.length!==REGULAR_LIMIT||!REGULAR.every(c=>(s.leaderCards[c.id]||0)>0))return null;s.leaderCards[BONUS_ID]=1;const event={id:BONUS_ID,isNew:true,site:s.siteNumber,bonus:true};if(!s.leaderEvent)s.leaderEvent=event;else s.pendingBonus=true;return event;}
function nextBonusEvent(s){if(!s.pendingBonus)return false;s.pendingBonus=false;s.leaderEvent={id:BONUS_ID,isNew:true,site:s.siteNumber,bonus:true};return true;}
function ownedCount(s){return CARDS.filter(c=>s.leaderCards[c.id]>0).length;}
function appoint(s,id){if(!s.started||s.siteNumber<2||M.completed(s)||s.leaderId!==null||!s.leaderCards[id]||!find(id))return false;s.leaderId=id;return true;}
function stage(s){const q=s.stones/M.TARGET;return q>=1?4:q>=.75?3:q>=.5?2:q>=.25?1:0;}
Object.assign(M,{LEADERS:CARDS,REGULAR_LEADERS:REGULAR,CARD_LIMIT:MAX,REGULAR_CARD_LIMIT:REGULAR_LIMIT,CATALOG_REVISION:String(data.revision||'1'),awardLeaderBonus:awardBonus,nextBonusEvent,ownedLeaderCount:ownedCount,leader:find,normalizeLeadership:normalize,leaderCharm:charm,hireRoll,drawLeader,appointLeader:appoint,constructionStage:stage});
if(typeof module!=='undefined'&&module.exports)module.exports=M;
})(globalThis);
