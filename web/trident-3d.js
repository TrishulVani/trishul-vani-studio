(() => {
  const root = document.querySelector('.arrival');
  const image = document.querySelector('.arrival-weapon');
  const body = document.querySelector('.arrival-weapon-body');
  const canvas = document.querySelector('.arrival-weapon-3d');
  if (!root || !image || !body || !canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!gl) return;

  const vertexSource = `
    attribute vec3 aPosition; attribute vec2 aUv; attribute vec3 aColor;
    uniform vec3 uRotation; uniform float uAspect;
    varying vec2 vUv; varying vec3 vColor;
    void main(){
      vec3 p=aPosition;
      float cx=cos(uRotation.x),sx=sin(uRotation.x),cy=cos(uRotation.y),sy=sin(uRotation.y),cz=cos(uRotation.z),sz=sin(uRotation.z);
      p=vec3(p.x, cx*p.y-sx*p.z, sx*p.y+cx*p.z);
      p=vec3(cy*p.x+sy*p.z, p.y, -sy*p.x+cy*p.z);
      p=vec3(cz*p.x-sz*p.y, sz*p.x+cz*p.y, p.z);
      float depth=3.45-p.z; float focal=2.45/depth;
      gl_Position=vec4(p.x*focal/uAspect,p.y*focal,(depth-2.5)/4.0,1.0);
      vUv=aUv; vColor=aColor;
    }`;
  const fragmentSource = `
    precision mediump float; varying vec2 vUv; varying vec3 vColor;
    uniform sampler2D uImage; uniform float uTextured;
    void main(){
      if(uTextured>0.5){vec2 uv=vUv;if(!gl_FrontFacing)uv.x=1.0-uv.x;vec4 tex=texture2D(uImage,uv);if(tex.a<0.035)discard;gl_FragColor=vec4(tex.rgb,tex.a);}
      else gl_FragColor=vec4(vColor,1.0);
    }`;
  const compile = (type, source) => { const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader); if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)); return shader; };
  let program;
  try { program=gl.createProgram(); gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource)); gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)); }
  catch (_) { return; }
  gl.useProgram(program);
  const position=gl.getAttribLocation(program,'aPosition'), uvLoc=gl.getAttribLocation(program,'aUv'), colorLoc=gl.getAttribLocation(program,'aColor');
  const rotationLoc=gl.getUniformLocation(program,'uRotation'), aspectLoc=gl.getUniformLocation(program,'uAspect'), imageLoc=gl.getUniformLocation(program,'uImage'), texturedLoc=gl.getUniformLocation(program,'uTextured');
  const texture=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const floats=(values,loc,size)=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);return buffer;};
  const w=.64,h=2.72,d=.105;
  const facePositions=[-w/2,-h/2,d/2,w/2,-h/2,d/2,-w/2,h/2,d/2,w/2,h/2,d/2];
  const faceUvs=[0,1,1,1,0,0,1,0];
  const faceColors=[1,1,1,1,1,1,1,1,1,1,1,1];
  const facePositionBuffer=floats(facePositions,position,3),faceUvBuffer=floats(faceUvs,uvLoc,2),faceColorBuffer=floats(faceColors,colorLoc,3);
  const sideBuffers=[];
  function buildSide(){
    const grid=document.createElement('canvas'),gw=96,gh=400;grid.width=gw;grid.height=gh;
    const ctx=grid.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0,gw,gh);
    const pixels=ctx.getImageData(0,0,gw,gh).data,solid=(x,y)=>x>=0&&x<gw&&y>=0&&y<gh&&pixels[(y*gw+x)*4+3]>30;
    const vertices=[],colors=[];
    const add=(x,y,z)=>vertices.push((x/gw-.5)*w,(.5-y/gh)*h,z);
    const edge=(x1,y1,x2,y2)=>{
      const dx=(x2-x1)/gw,dy=-(y2-y1)/gh;
      const shade=Math.max(.22,Math.min(.9,.48+.29*Math.abs(dy)+.22*Math.abs(dx)));
      const c=[.48*shade,.34*shade,.17*shade];
      add(x1,y1,d/2);add(x2,y2,d/2);add(x2,y2,-d/2);add(x1,y1,d/2);add(x2,y2,-d/2);add(x1,y1,-d/2);
      for(let i=0;i<6;i++)colors.push(...c);
    };
    for(let y=0;y<gh;y++)for(let x=0;x<gw;x++)if(solid(x,y)){
      if(!solid(x,y-1))edge(x,y,x+1,y);
      if(!solid(x+1,y))edge(x+1,y,x+1,y+1);
      if(!solid(x,y+1))edge(x+1,y+1,x,y+1);
      if(!solid(x-1,y))edge(x,y+1,x,y);
    }
    const pb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,pb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);sideBuffers.push({buffer:pb,loc:position,size:3});
    const cb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,cb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(colors),gl.STATIC_DRAW);sideBuffers.push({buffer:cb,loc:colorLoc,size:3});
    return vertices.length/3;
  }
  let sideCount=0;
  function uploadImage(){
    if(!image.complete||!image.naturalWidth)return;
    try{gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);sideCount=buildSide();body.classList.add('has-3d');}
    catch(_){return;}
  }
  if(image.complete)uploadImage();else image.addEventListener('load',uploadImage,{once:true});
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  function resize(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}}
  function draw(now){
    resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    const pose=window.tvArrivalPose||{};const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const yaw=reduce?0:root.classList.contains('is-moving')&&Number.isFinite(pose.y)?pose.y:now*.0007;
    gl.uniform3f(rotationLoc,Number(pose.x)||0,yaw,Number(pose.z)||0);gl.uniform1f(aspectLoc,canvas.width/Math.max(1,canvas.height));gl.uniform1i(imageLoc,0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
    if(sideCount){gl.uniform1f(texturedLoc,0);for(const item of sideBuffers){gl.bindBuffer(gl.ARRAY_BUFFER,item.buffer);gl.enableVertexAttribArray(item.loc);gl.vertexAttribPointer(item.loc,item.size,gl.FLOAT,false,0,0);}gl.drawArrays(gl.TRIANGLES,0,sideCount);}
    gl.uniform1f(texturedLoc,1);
    gl.bindBuffer(gl.ARRAY_BUFFER,facePositionBuffer);gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,3,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,faceUvBuffer);gl.enableVertexAttribArray(uvLoc);gl.vertexAttribPointer(uvLoc,2,gl.FLOAT,false,0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER,faceColorBuffer);gl.enableVertexAttribArray(colorLoc);gl.vertexAttribPointer(colorLoc,3,gl.FLOAT,false,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
    if(!root.classList.contains('is-exiting'))requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
