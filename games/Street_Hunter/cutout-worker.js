// Interactive segmentation runs away from the game UI. Photos stay on the device.
let modelPromise;
async function getModel(){
 if(!modelPromise)modelPromise=(async()=>{
  const {FilesetResolver,InteractiveSegmenter}=await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs');
  const files=await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm');
  const base={modelAssetPath:'https://storage.googleapis.com/mediapipe-models/interactive_segmenter/magic_touch/float32/1/magic_touch.tflite'};
  const opts={outputCategoryMask:true,outputConfidenceMasks:false};
  try{return await InteractiveSegmenter.createFromOptions(files,{...opts,baseOptions:{...base,delegate:'GPU'}})}
  catch{return await InteractiveSegmenter.createFromOptions(files,{...opts,baseOptions:{...base,delegate:'CPU'}})}
 })().catch(e=>{modelPromise=null;throw e});
 return modelPromise;
}
self.onmessage=async({data})=>{
 const {request,bitmap,x,y}=data;
 try{
  const model=await getModel();
  const result=model.segment(bitmap,{keypoint:{x,y}});
  try{
   const mask=result.categoryMask;
   if(!mask)throw Error('輪郭が取得できませんでした');
   // Copy before closing MediaPipe's native mask. Category IDs are not alpha values.
   const labels=new Uint8Array(mask.getAsUint8Array());
   const seed=Math.min(mask.height-1,Math.floor(y*mask.height))*mask.width+Math.min(mask.width-1,Math.floor(x*mask.width));
   const selected=labels[seed],binary=new Uint8Array(labels.length);
   for(let i=0;i<labels.length;i++)binary[i]=labels[i]===selected?1:0;
   self.postMessage({request,width:mask.width,height:mask.height,buffer:binary.buffer},[binary.buffer]);
  }finally{result.close()}
 }catch(e){self.postMessage({request,error:e.message||'輪郭処理を利用できません'})}
 finally{bitmap.close()}
};
