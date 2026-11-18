/* Prepare a real PNG before the share tap, preserving iPhone user activation. */
(function(root){'use strict';let current=null,url=null,generation=0;
function clear(){generation++;current=null;if(url)URL.revokeObjectURL(url);url=null;}
function prepare(canvas){clear();const token=generation;return new Promise(resolve=>{try{canvas.toBlob(blob=>{if(token!==generation)return resolve(null);if(!blob)return resolve(null);const file=new File([blob],'inkstrike-flight-report.png',{type:'image/png'});url=URL.createObjectURL(blob);current={file,url};resolve(current);},'image/png');}catch(_){resolve(null);}});}
function payload(text){return current?{title:'INKSTRIKE',text,files:[current.file]}:null;}
function canShare(navigator,p){try{return !!p&&typeof navigator.share==='function'&&typeof navigator.canShare==='function'&&navigator.canShare({files:p.files});}catch(_){return false;}}
root.InkResultImage=Object.freeze({clear,prepare,payload,canShare,get ready(){return !!current;}});
})(globalThis);
