// Candidate errors come from mathematical operations, not numeric offsets.
const AnswerChoices=(()=>{
 function unique(values,key=v=>JSON.stringify(v,(_,x)=>typeof x==='number'?Math.round(x*1e9)/1e9:x)){const seen=new Set();return values.filter(v=>{const k=key(v);if(seen.has(k))return false;seen.add(k);return true})}
 function numbers(value,coefficient=1,rhs=value){return unique([value,-value,rhs,coefficient?rhs*coefficient:NaN,rhs?coefficient/rhs:NaN,rhs+coefficient,rhs-coefficient,0,coefficient,-coefficient]).filter(Number.isFinite).slice(0,3)}
 function polynomials(v,source=''){
  const out=[v],push=p=>{if(!out.some(q=>C1.equal(p,q)))out.push(p)};
  for(const [key,n] of Object.entries(v)){
   push(C1.add(v,{[key]:-2*n})); // sign error
   push(C1.add(v,{[key]:-n})); // term omitted
   if(key){push(C1.add(C1.add(v,{[key]:-n}),{'':n}));if(key.length>1)push(C1.add(C1.add(v,{[key]:-n}),{[key.slice(0,-1)]:n}))}
  }
  for(const term of source.match(/[a-z]|\d+(?:\.\d+)?/g)||[])try{push(C1.parse(term));push(C1.parse('-'+term))}catch{}
  if(out.length<3){for(const n of numbers(v['']||0))push({'':n})}
  return out.slice(0,3);
 }
 function pairCandidates(eq){
  const answer=solve(eq),out=[answer],push=pair=>{if(pair.every(Number.isFinite)&&!out.some(p=>p.every((v,i)=>same(v,pair[i]))))out.push(pair)};
  // Candidates correspond to sign, correspondence, or omitted final division.
  push(answer.slice().reverse());push([-answer[0],answer[1]]);push([answer[0],-answer[1]]);
  for(let axis=0;axis<2;axis++){const other=1-axis,g=(a,b)=>b?g(b,a%b):Math.abs(a)||1,u=Math.abs(eq[1][other])/g(eq[0][other],eq[1][other]),v=Math.abs(eq[0][other])/g(eq[0][other],eq[1][other]),sign=eq[0][other]*eq[1][other]<0?1:-1,rhs=eq[0][2]*u+eq[1][2]*v*sign;const pair=answer.slice();pair[axis]=rhs;push(pair);}
  // Solve plausible models with a sign/transposition/constant omission error.
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
   const model=eq.map(e=>e.slice());model[row][col]*=-1;push(solve(model));
  }
  push(answer.slice().reverse());push(answer.map(v=>-v));
  for(let row=0;row<2;row++){const model=eq.map(e=>e.slice());model[row][2]=0;push(solve(model))}
  return out;
 }
 return {unique,numbers,polynomials,pairCandidates};
})();
