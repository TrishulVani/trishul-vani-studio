(() => {
  const root = document.querySelector('.arrival');
  const image = document.querySelector('.arrival-weapon');
  const body = document.querySelector('.arrival-weapon-body');
  const canvas = document.querySelector('.arrival-weapon-3d');
  if (!root || !image || !body || !canvas) return;
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'high-performance' });
  if (!gl) return;

  const vertexSource = `
    attribute vec3 aPosition; attribute vec3 aColor; attribute vec3 aNormal;
    uniform vec3 uRotation; uniform float uAspect;
    varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
    void main(){
      vec3 p=aPosition;
      float cx=cos(uRotation.x),sx=sin(uRotation.x),cy=cos(uRotation.y),sy=sin(uRotation.y),cz=cos(uRotation.z),sz=sin(uRotation.z);
      p=vec3(p.x,cx*p.y-sx*p.z,sx*p.y+cx*p.z);
      p=vec3(cy*p.x+sy*p.z,p.y,-sy*p.x+cy*p.z);
      p=vec3(cz*p.x-sz*p.y,sz*p.x+cz*p.y,p.z);
      vec3 n=aNormal;
      n=vec3(n.x,cx*n.y-sx*n.z,sx*n.y+cx*n.z);
      n=vec3(cy*n.x+sy*n.z,n.y,-sy*n.x+cy*n.z);
      n=vec3(cz*n.x-sz*n.y,sz*n.x+cz*n.y,n.z);
      float depth=4.6-p.z; float focal=3.0/depth;
      gl_Position=vec4(p.x*focal/uAspect,p.y*focal,(depth-3.4)/5.0,1.0);
      vColor=aColor; vNormal=n; vView=normalize(vec3(-p.x,-p.y,4.0-p.z));
    }`;
  const fragmentSource = `
    precision mediump float; varying vec3 vColor; varying vec3 vNormal; varying vec3 vView;
    void main(){
      vec3 n=normalize(vNormal); vec3 lightA=normalize(vec3(-0.48,0.68,0.95)); vec3 lightB=normalize(vec3(0.7,0.05,0.5));
      float diffuse=max(dot(n,lightA),0.0)*0.82+max(dot(n,lightB),0.0)*0.24;
      vec3 halfA=normalize(lightA+normalize(vView));
      float specular=pow(max(dot(n,halfA),0.0),30.0)*0.9;
      float rim=pow(1.0-max(dot(n,normalize(vView)),0.0),2.0)*0.22;
      vec3 color=vColor*(0.56+diffuse)+vec3(0.98,0.77,0.43)*specular+vec3(0.22,0.55,0.36)*rim;
      gl_FragColor=vec4(min(color,vec3(1.0)),1.0);
    }`;
  const compile = (type, source) => { const shader=gl.createShader(type); gl.shaderSource(shader,source); gl.compileShader(shader); if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)); return shader; };
  let program;
  try { program=gl.createProgram(); gl.attachShader(program,compile(gl.VERTEX_SHADER,vertexSource)); gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragmentSource)); gl.linkProgram(program); if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)); }
  catch (_) { return; }
  gl.useProgram(program);
  const position=gl.getAttribLocation(program,'aPosition'), colorLoc=gl.getAttribLocation(program,'aColor'), normalLoc=gl.getAttribLocation(program,'aNormal');
  const rotationLoc=gl.getUniformLocation(program,'uRotation'), aspectLoc=gl.getUniformLocation(program,'uAspect');

  // Build a genuine volumetric trident from separate blade, tine, shaft and fitting meshes.
  const positions=[], colors=[], normals=[];
  const gold=[0.79,0.52,0.2], goldLight=[0.98,0.77,0.39], green=[0.035,0.19,0.12], greenLight=[0.08,0.35,0.22];
  function triangle(a,b,c,ca,cb=ca,cc=ca){
    const ab=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],ac=[c[0]-a[0],c[1]-a[1],c[2]-a[2]];
    const n=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]],l=Math.hypot(...n)||1;
    for(const [p,col] of [[a,ca],[b,cb],[c,cc]]){positions.push(...p);colors.push(...col);normals.push(n[0]/l,n[1]/l,n[2]/l);}
  }
  function prism(points,depth,faceColor,edgeColor=gold){
    const center=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length], [0,0]);
    for(let i=0;i<points.length;i++){
      const a=points[i],b=points[(i+1)%points.length];
      triangle([center[0],center[1],depth/2],[a[0],a[1],depth/2],[b[0],b[1],depth/2],goldLight,faceColor,gold);
      triangle([center[0],center[1],-depth/2],[b[0],b[1],-depth/2],[a[0],a[1],-depth/2],faceColor,gold,faceColor);
      triangle([a[0],a[1],depth/2],[a[0],a[1],-depth/2],[b[0],b[1],-depth/2],edgeColor,edgeColor,edgeColor);
      triangle([a[0],a[1],depth/2],[b[0],b[1],-depth/2],[b[0],b[1],depth/2],edgeColor,edgeColor,edgeColor);
    }
  }
  function tube(points,radius,color,sides=10){
    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1],t=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],tl=Math.hypot(...t)||1;
      t[0]/=tl;t[1]/=tl;t[2]/=tl;
      let u=[-t[1],t[0],0],ul=Math.hypot(...u)||1;u=u.map(v=>v/ul);
      const v=[t[1]*u[2]-t[2]*u[1],t[2]*u[0]-t[0]*u[2],t[0]*u[1]-t[1]*u[0]];
      const ra=typeof radius==='function'?radius(i/(points.length-1)):radius,rb=typeof radius==='function'?radius((i+1)/(points.length-1)):radius;
      for(let j=0;j<sides;j++){
        const aa=j/sides*Math.PI*2,ab=(j+1)/sides*Math.PI*2;
        const ring=(p,r,ang)=>[p[0]+r*(u[0]*Math.cos(ang)+v[0]*Math.sin(ang)),p[1]+r*(u[1]*Math.cos(ang)+v[1]*Math.sin(ang)),p[2]+r*(u[2]*Math.cos(ang)+v[2]*Math.sin(ang))];
        const p0=ring(a,ra,aa),p1=ring(a,ra,ab),p2=ring(b,rb,aa),p3=ring(b,rb,ab);
        const metal=j%sides<2?goldLight:color;
        triangle(p0,p2,p1,metal,metal,metal);triangle(p1,p2,p3,metal,metal,metal);
      }
    }
  }
  function cylinder(y0,y1,r0,r1,color,sides=24){
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2,b=(j+1)/sides*Math.PI*2;
      const p0=[Math.cos(a)*r0,y0,Math.sin(a)*r0],p1=[Math.cos(b)*r0,y0,Math.sin(b)*r0],p2=[Math.cos(a)*r1,y1,Math.sin(a)*r1],p3=[Math.cos(b)*r1,y1,Math.sin(b)*r1];
      const c=j%6===0?goldLight:color;triangle(p0,p2,p1,c,c,c);triangle(p1,p2,p3,c,c,c);
    }
  }
  function sphere(cx,cy,cz,r,color,lat=10,lon=18){
    for(let y=0;y<lat;y++)for(let x=0;x<lon;x++){
      const v0=-Math.PI/2+y/lat*Math.PI,v1=-Math.PI/2+(y+1)/lat*Math.PI,u0=x/lon*Math.PI*2,u1=(x+1)/lon*Math.PI*2;
      const p=(v,u)=>[cx+r*Math.cos(v)*Math.cos(u),cy+r*Math.sin(v),cz+r*Math.cos(v)*Math.sin(u)];
      const a=p(v0,u0),b=p(v0,u1),c=p(v1,u0),d=p(v1,u1);triangle(a,c,b,color,color,color);triangle(b,c,d,color,color,color);
    }
  }
  function cubic(p0,p1,p2,p3,n=28){
    return Array.from({length:n+1},(_,i)=>{const t=i/n,q=1-t;return [0,1,2].map(k=>q*q*q*p0[k]+3*q*q*t*p1[k]+3*q*t*t*p2[k]+t*t*t*p3[k]);});
  }

  // Central spear and two swept, tapered side blades are distinct raised forms.
  prism([[0.0,1.36],[0.12,1.08],[0.105,0.82],[0.19,0.48],[0.07,0.60],[0,0.49],[-0.07,0.60],[-0.19,0.48],[-0.105,0.82],[-0.12,1.08]],.16,greenLight,goldLight);
  for(const side of [-1,1]){
    const path=cubic([side*.075,.56,0],[side*.28,.42,.015],[side*.58,.58,0],[side*.49,.91,.015],32)
      .concat(cubic([side*.49,.91,.015],[side*.44,1.07,.015],[side*.34,1.20,.01],[side*.31,1.29,.02],24).slice(1));
    tube(path,t=>.064*(1-t)+.014, gold,12);
    const inner=cubic([side*.08,.55,.055],[side*.25,.48,.055],[side*.42,.67,.055],[side*.40,.91,.055],22);
    tube(inner,t=>.018*(1-t)+.004,greenLight,8);
  }
  // Beveled collars, a turned green-metal grip, and a gold spiral make the shaft read in depth.
  cylinder(.42,.50,.11,.085,gold,24); cylinder(.35,.42,.082,.082,green,24); cylinder(.29,.35,.105,.082,goldLight,24);
  cylinder(-.99,.28,.055,.065,green,20); cylinder(-1.08,-.98,.10,.09,gold,24); cylinder(-1.18,-1.08,.075,.075,green,24);
  cylinder(-1.24,-1.18,.105,.075,goldLight,24); cylinder(-1.34,-1.24,.018,.105,green,24);
  sphere(0,.34,0,.095,greenLight); sphere(0,.34,.08,.035,goldLight,8,12);
  for(const y of [-1.02,-.98,.28,.32,.42,.47])cylinder(y,y+.025,.082,.082,y%2===0?goldLight:gold,24);
  const wrap=Array.from({length:121},(_,i)=>{const t=i/120,y=-.91+t*1.08,a=t*Math.PI*10;return [Math.cos(a)*.061,y,Math.sin(a)*.061];});
  tube(wrap,.009,goldLight,7);
  // A faceted pommel finishes the lower grip as a real object, not a flat graphic.
  sphere(0,-1.28,0,.115,greenLight,12,20); cylinder(-1.38,-1.34,.08,.08,gold,24);
  prism([[0,-1.52],[.10,-1.36],[.06,-1.28],[-.06,-1.28],[-.10,-1.36]],.12,green,goldLight);

  const vertexCount=positions.length/3;
  const buffers=[];
  const upload=(values,loc,size)=>{const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);buffers.push(buffer);};
  upload(positions,position,3);upload(colors,colorLoc,3);upload(normals,normalLoc,3);
  body.dataset.modelType='volumetric-mesh';body.dataset.modelParts='3-blades,curved-tines,turned-shaft,raised-fittings';body.dataset.modelVertices=String(vertexCount);body.classList.add('has-3d');
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.enable(gl.CULL_FACE);gl.frontFace(gl.CCW);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.clearColor(0,0,0,0);
  function resize(){const rect=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5),width=Math.max(1,Math.round(rect.width*ratio)),height=Math.max(1,Math.round(rect.height*ratio));if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}}
  function draw(now){
    resize();gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(program);
    const pose=window.tvArrivalPose||{};const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const yaw=reduce?0:root.classList.contains('is-moving')&&Number.isFinite(pose.y)?pose.y:now*.0007;
    gl.uniform3f(rotationLoc,Number(pose.x)||0,yaw,Number(pose.z)||0);gl.uniform1f(aspectLoc,canvas.width/Math.max(1,canvas.height));
    gl.drawArrays(gl.TRIANGLES,0,vertexCount);
    if(!root.classList.contains('is-exiting'))requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
