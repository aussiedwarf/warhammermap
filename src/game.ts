/*******************************************************************************
Copyright (C) 2019 Eden Harris

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

import Mouse from './mouse';
import { vec3, vec4, mat4 } from 'gl-matrix';
import Map from './map';

/*
import * as imageCoin from './images/coin.png';
import * as imageCraft from './images/craft.png';
import * as imageCleric from './images/cleric.png';
import * as imageFighter from './images/fighter.png';
import * as imageRogue from './images/rogue.png';
import * as imageWizard from './images/wizard.png';
import * as imageClanmoot from './images/clanmoot.png';
import * as imageVillage from './images/village.png';
import * as imageStar from './images/star.png';
import * as imageWaterfall from './images/waterfall.png';
import * as imageSkull from './images/skullcrossbones.png';
import * as imagePOI from './images/pointofinterest.png';
import * as imageTotem from './images/totem.png';
import * as imageMonument from './images/monument.png';
import * as imageMonolith from './images/monolith.png';
import * as imageWorldMap from './images/WorldMap.jpg';
import * as imageCastle from './images/castle.png';
import * as imageLion from './images/lion.png';
import * as imageRuins from './images/ruins.png';
import * as imageTower from './images/tower.png';
import * as imageX from './images/x.png';
*/


//https://css-tricks.com/snippets/javascript/get-url-variables/
function getQueryVariable(variable: any)
{
	 const query = window.location.search.substring(1);
	 const vars = query.split("&");
	 for (let i=0;i<vars.length;i++) 
	 {
		 const pair = vars[i].split("=");
		 if(pair[0] == variable){return pair[1];}
	 }
	 return "";
}


export default class Game {
  
  mapLoaded: boolean = false;
  windowLoaded: boolean = false;
  loaded: number = 0;
  
  gl: boolean = false;
  
  mouse: Mouse = new Mouse();
  
  zoom: number = 1;
  zoomVel: number = 1.04;
  maxZoom: number = 20;
  minZoom: number = 1/100000;
  zoomIn: boolean = false;
  zoomOut: boolean = false;
  
  endTimeStart: number = 0;	//frame timing
  
  size: vec4;
  matrixProjection: mat4 = mat4.create();//new Mat4x4();
  matrixViewport: mat4 = mat4.create();//new Mat4x4();
  matrixView: mat4 = mat4.create();//new Mat4x4();
  mvp: mat4 = mat4.create();//new Mat4x4();
  invMvp: mat4 = mat4.create();//new Mat4x4();
  cameraPosition: vec4 = vec4.fromValues(0,0,0,1);//new Vec4(0,0,0,1);
  mouseWorldX: number = 0;
  mouseWorldY: number = 0;
  
  enabledIcons: boolean = true;
  enabledDrawHexCoords = false;
  enabledDrawAlliance = false;
  enabledDrawGrid = true;
  enabledDrawHexTypes = true;
  enabledDrawAlignment = false;
  enabledDrawControllingTowers = true;
  enabledDrawRegions = false;
  enabledDrawBorders = false;
  enabledDrawLandmarks: boolean = true;
  enabledDrawBulk = false;
  
  redraw: boolean = false;
  enabledDrawPaper = false;
  
  map: Map;
  
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;
  
  iconFighter: HTMLImageElement;
  iconCleric: HTMLImageElement;
  iconCoin: HTMLImageElement;
  iconRogue: HTMLImageElement;
  iconWizard: HTMLImageElement;
  iconCraft: HTMLImageElement;
  iconCastle: HTMLImageElement;
  iconLion: HTMLImageElement;
  iconRuins: HTMLImageElement;
  iconVillage: HTMLImageElement;
  iconX: HTMLImageElement;
  iconTower: HTMLImageElement;
  iconStar: HTMLImageElement;
  iconClanmoot: HTMLImageElement;
  iconPointOfInterest: HTMLImageElement;
  iconTotem: HTMLImageElement;
  iconSkullCrossbones: HTMLImageElement;
  iconMonument: HTMLImageElement;
  iconMonolith: HTMLImageElement;
  iconWaterfall: HTMLImageElement;
  
  constructor(a_canvas: HTMLCanvasElement){
    
    this.canvas = a_canvas;
    let canvas = a_canvas;
    let context = null;
  
    try {
      // Try to grab the standard context. If it fails, fallback to experimental.
      //context = canvas.getContext("webgl", {alpha:false}) || canvas.getContext("experimental-webgl", {alpha:false}) || canvas.getContext("3d", {alpha:false});
    	//this.gl = true;
    }
    catch(e) {}
    
    
    // If we don't have a GL context, give up now
    if (!context) 
    {
      context = canvas.getContext("2d");
      this.context2d = context;
    }
  
  
    this.map = new Map(canvas);

  
    /*todo
    this.size = new Vec4(window.innerWidth, window.innerHeight,0,1);
    */
    this.size = vec4.fromValues(window.innerWidth, window.innerHeight,0,1);
    
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    
    //get hex position as url variable
    
    const posxText = getQueryVariable("x");
    const posyText = getQueryVariable("y");
    const zoomText = getQueryVariable("zoom");
    let zoom: number = parseFloat(zoomText);


    this.iconFighter = new Image();
    this.iconCleric = new Image();
    this.iconCoin = new Image();
    this.iconRogue = new Image();
    this.iconWizard = new Image();
    this.iconCraft = new Image();
    this.iconCastle = new Image();
    this.iconLion = new Image();
    this.iconRuins = new Image();
    this.iconVillage = new Image();
    this.iconX = new Image();
    this.iconTower = new Image();
    this.iconStar = new Image();
    this.iconClanmoot = new Image();
    this.iconPointOfInterest = new Image();
    this.iconTotem = new Image();
    this.iconSkullCrossbones = new Image();
    this.iconMonument = new Image();
    this.iconMonolith = new Image();
    this.iconWaterfall = new Image();
    
    const self = this;
  
    canvas.onload = () => {
    	this.calculateMatricies();
    	//self.redraw = true;
    }
    

    /*
    window.onload=function()
    {
      this.windowLoaded = true;
      this.Init();
    }
    */
    
    this.loaded = 0;
  
  /*
    this.iconFighter.src = imageFighter;
    this.iconCleric.src = imageCleric;
    this.iconRogue.src = imageRogue;
    this.iconWizard.src = imageWizard;
    this.iconCraft.src = imageCraft;
    this.iconCoin.src = imageCoin;
    this.iconCastle.src = imageCastle;
    this.iconLion.src = imageLion;
    this.iconRuins.src = imageRuins;
    this.iconVillage.src = imageVillage;
    this.iconX.src = imageX;
    this.iconTower.src = imageTower;
    this.iconStar.src = imageStar;
    this.iconClanmoot.src = imageClanmoot;
    this.iconPointOfInterest.src = imagePOI;
    this.iconTotem.src = imageTotem;
    this.iconSkullCrossbones.src = imageSkull;
    this.iconMonument.src = imageMonument;
    this.iconMonolith.src = imageMonolith;
    this.iconWaterfall.src = imageWaterfall;
    */
    canvas.onselectstart = function(){return false};


    canvas.onmousedown = this.mouseDownEvent;
    canvas.onmouseup = this.mouseUpEvent;
    canvas.onmousemove = this.mouseMoveEvent;
    canvas.ondblclick = this.mouseDoubleClick;
    canvas.onkeydown = this.keyDown;
    canvas.onkeyup = this.keyUp;
    //c.addEventListener("keydown", this.KeyHandle.bind(this), false);
    //c.addEventListener("keyup", this.KeyHandle.bind(this), false);
    
    if(canvas.addEventListener)
    {
      canvas.addEventListener("mousewheel",this.mouseScrollEvent,false);
      canvas.addEventListener("DOMMouseScroll",this.mouseScrollEvent,false);
      
      canvas.addEventListener("touchmove", this.touchMoveEvent,false); 
      canvas.addEventListener("touchstart", this.touchStartEvent,false); 
      canvas.addEventListener("touchend", this.touchEndEvent,false); 
    }
    //else 
    //{
      //canvas.addEventListener("onmousewheel",this.mouseScrollEvent,false);
      //canvas.attachEvent("onmousewheel",this.mouseScrollEvent,false);
    //}
    
    window.addEventListener('resize', this.resize);
  

    
    this.init();
  
  }
  
  init = () => {

    
    this.calculateMatricies();
    
    this.render();
  }
  
  
  resize = () => {
    this.render();
  }
  
    
  update = () => {
	  const startTime = Date.now();
	  
	  let redraw = false;
	  
    const canvas = this.canvas;
    const context = this.context2d;
    
    if(this.zoomIn || this.zoomOut)
    	this.calculateZoom();
    
    if(this.size[0] != window.innerWidth || this.size[1] != window.innerHeight )
    {
    	canvas.width  = window.innerWidth;
    	canvas.height = window.innerHeight;
    	
    	this.size[0] = canvas.width;
    	this.size[1] = canvas.height;
    	
    	//this.calculateMatricies();
    }
    
    this.calculateMatricies();
    
    //if(!this.redraw)
    //  return;
    
    const t = Date.now();
    
    context.fillStyle = "rgb(255,255,255)"
    context.fillRect(0,0,canvas.width,canvas.height);
    

    this.drawText(context);
    
    
      
    

    	
    if(this.zoomIn || this.zoomOut)
    	redraw = true;
    
    this.redraw = false;
    
    context.setTransform(
      this.mvp[0], this.mvp[1], 
      this.mvp[4], this.mvp[5],
      this.mvp[12], this.mvp[13]);
      
    const p = vec4.fromValues(0,0,0,1);
    const v = vec4.create();
    vec4.transformMat4(v, p, this.invMvp);
    
    const boundingBox = vec4.create();
    boundingBox[0] = v[0];
    boundingBox[1] = v[1];
    
    p[0] = canvas.width;
    p[1] = canvas.height;
    
    vec4.transformMat4(v, p, this.invMvp);
    
    boundingBox[2] = v[0];
    boundingBox[3] = v[1];
    
    const ctx = context;
    // Define the points as {x, y}
    let start = { x: 50,    y: 20  };
    let cp1 =   { x: (230-50)*2/3+50,   y: 30  };
    let cp2 =   { x: (230-50)*2/3+50,   y: 30  };
    let end =   { x: 50,   y: 100 };
    
    
    context.lineWidth = 1.0/this.zoom * 2.0;

    if(0){
      // Cubic Bézier curve
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
      ctx.stroke();


      
      // Start and end points
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);  // Start point
      ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI);      // End point
      ctx.fill();

      // Control points
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(cp1.x, cp1.y, 5, 0, 2 * Math.PI);  // Control point one
      ctx.arc(cp2.x, cp2.y, 5, 0, 2 * Math.PI);  // Control point two
      ctx.fill();
      
      
      // Quadratic Bézier curve
      ctx.beginPath();
      ctx.moveTo(50, 20);
      ctx.quadraticCurveTo(230, 30, 50, 100);
      ctx.stroke();

      // Start and end points
      ctx.fillStyle = 'blue';
      ctx.beginPath();
      ctx.arc(50, 20, 5, 0, 2 * Math.PI);   // Start point
      ctx.arc(50, 100, 5, 0, 2 * Math.PI);  // End point
      ctx.fill();

      // Control point
      ctx.fillStyle = 'red';
      ctx.beginPath();
      ctx.arc(230, 30, 5, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.beginPath();
      ctx.moveTo(-100,-100);
      ctx.lineTo(100,100);
      ctx.stroke();
    }
    
    
    this.map.draw(this.zoom, boundingBox);
    
    context.lineWidth = 1;
    
    
    context.setTransform(
      1.0, 0.0, 
      0.0, 1.0,
      0.0, 0.0);
      
    context.font="10px Arial";
    
    context.fillStyle = 'black';
    
    context.fillText('' + this.mouseWorldX, canvas.width-100, canvas.height-80);
    context.fillText('' + this.mouseWorldY, canvas.width-100, canvas.height-70);
    context.fillText('' + this.zoom.toString(), canvas.width-100, canvas.height-60);
    context.fillText('' + this.mvp[0].toString() + ' ' + this.mvp[1].toString(), canvas.width-100, canvas.height-50);
    context.fillText('' + this.mvp[4].toString() + ' ' + this.mvp[5].toString(), canvas.width-100, canvas.height-40);
    context.fillText('' + this.mvp[12].toString() + ' ' + this.mvp[13].toString(), canvas.width-100, canvas.height-30);
    
    //time of this function
    const endTime = Date.now();
    let time = endTime - startTime;
    context.fillText(time.toString(), canvas.width-30, canvas.height-10);
    
    //time inbetween last frame
    time = startTime - this.endTimeStart;
    this.endTimeStart = endTime;
    context.fillText(time.toString(), canvas.width-30, canvas.height-20);
    
    //time to create paper
    //if(this.enabledDrawPaper)
    //	context.fillText(this.paperTime, canvas.width-30, canvas.height-30);
    
    if(redraw)
    {
    	this.render();
    }
    /*
    context.beginPath();
    context.strokeStyle = "rgba(255, 0, 0, 1.0)";
    context.rect(pos.x-1,pos.y-1,3,3);
    context.stroke();
    */

  }

  
  drawPaper = (a_context: any) => {
  }
  
  keyDown = (a_event) => {

  }

  keyUp = (a_event) => {

  }
  
  mouseDoubleClick = (a_eventData) => {
	  const canvas=this.canvas;
    const rect = canvas.getBoundingClientRect();
    const borderWidth = canvas.style.borderWidth;
    

    const x = a_eventData.clientX - rect.left;
    const y = a_eventData.clientY - rect.top;

    if (a_eventData.button == 0) 
    {
      let pos = vec4.fromValues(x,y,0,1);
		  pos = vec4.transformMat4(vec4.create(), pos, this.invMvp);

		  this.render();
    }
  }
  
  mouseDownEvent = (a_eventData) => {

    const canvas=document.getElementById("canvas");
    const rect = canvas.getBoundingClientRect();
    const borderWidth = canvas.style.borderWidth;

    const mouseX = a_eventData.clientX - rect.left;
    const mouseY = a_eventData.clientY - rect.top;

    if (a_eventData.button == 0) 
    {
      this.mouse.leftDown = true;
      this.mouse.leftDownX = mouseX;
      this.mouse.leftDownY = mouseY;
    }

    
    this.calculateMatricies();
  } 


  mouseUpEvent = (a_event) => {
    const canvas = this.canvas;
    
    if (a_event.button == 1) {
      this.mouse.middleDown = false;
    }
    
    if (a_event.button == 0) {
      this.mouse.leftDown = false;
    }
    
  }
  

  calculateZoom = () => {
	  const c=this.canvas;
    const rect = c.getBoundingClientRect();
    const borderWidth = c.style.borderWidth;

    const mouseX = c.width/2;
    const mouseY = c.height/2;
        
    const oldScale = mat4.create();
    oldScale[0] = this.zoom;
    oldScale[5] = this.zoom;
    
    const v = vec4.fromValues(mouseX, mouseY, 0, 1);
    const p = vec4.transformMat4(vec4.create(), v, this.invMvp); //model space point
    

    if(this.zoomIn)
	  {
		  this.zoom *= this.zoomVel;
      if(this.zoom > this.maxZoom)
        this.zoom = this.maxZoom;
	  }

	  if(this.zoomOut)
	  {
		  this.zoom *= 1.0/this.zoomVel;
      if(this.zoom < this.minZoom)
        this.zoom = this.minZoom;
	  }

    //v = R * P * S * V * p
    //v = T * V * p
    
    //v = s * (Vx +px)
    //v = t * (Wx +px)
    
    //s * (px + Vx) = t * (px + Wx)
    //s * px + s * Vx = t * px + t * Wx
    //s * px + s * Vx - t * px = t * Wx
    //s * (px + Vx) - t * px = t * Wx
    //s * (px + Vx) / t - px = Wx

    
    const scale = mat4.create();
    scale[0] = this.zoom;
    scale[1] = this.zoom;

    
    const view = mat4.create();
    view[12] = oldScale[0] * (p[0] + this.matrixView[12]) / this.zoom - p[0];
    view[13] = oldScale[5] * (p[1] + this.matrixView[13]) / this.zoom - p[1];
    
    const camera = mat4.invert(mat4.create(), view);
    this.cameraPosition[0] = camera[12];
    this.cameraPosition[1] = camera[13];
    this.cameraPosition[2] = camera[14];

    
    this.calculateMatricies();
  }

  touchMoveEvent = (a_event) => {
    a_event.preventDefault();
    
    let redraw = false;
    
    const canvas=this.canvas;
    const rect = canvas.getBoundingClientRect();
    const borderWidth = canvas.style.borderWidth;
    
    const touch = a_event.targetTouches[0];

    const x = touch.pageX - rect.left;
    const y = touch.pageY - rect.top;

    if(this.mouse.leftDown == true)
    {
      this.moveCamera(this.mouse.x, this.mouse.y, x, y);
      redraw = true;
    }
    
    let pos = vec4.fromValues(x,y,0,1);
    pos = vec4.transformMat4(vec4.create(), pos, this.invMvp);

    
    this.mouse.x = x;
    this.mouse.y = y;
    
    if(redraw)
	  {
		  this.render();
	  }
  }


  touchStartEvent = (a_event) => {
    const canvas=this.canvas;
    const rect = canvas.getBoundingClientRect();
    const borderWidth = canvas.style.borderWidth;
    
    const touch = a_event.targetTouches[0];

    this.mouse.x = touch.pageX - rect.left;
    this.mouse.y = touch.pageY - rect.top;
    
    this.mouse.leftDown = true;
  }


  touchEndEvent = (a_event) => {
    this.mouse.leftDown = false;
    
  }


  mouseMoveEvent = (a_eventData) => {
	  let redraw = false;
    const canvas=this.canvas;
    const rect = canvas.getBoundingClientRect();
    const borderWidth = canvas.style.borderWidth;
    
    const x = a_eventData.clientX - rect.left;
    const y = a_eventData.clientY - rect.top;
    
    
    if(this.mouse.leftDown == true)
    {
      this.moveCamera(this.mouse.x, this.mouse.y, x, y);
      redraw = true;
    }
    
    let pos = vec4.fromValues(x,y,0,1);
    pos = vec4.transformMat4(vec4.create(), pos, this.invMvp);

    this.mouseWorldX = pos[0];
    this.mouseWorldY = pos[1];

    this.mouse.x = x;
    this.mouse.y = y;
    
    //redraw = true;//hack to view text
    
    if(redraw)
	  {
		  this.render();
	  }
    
  }

  mouseScrollEvent = (a_eventData) => {
    a_eventData.preventDefault();
    
    const wheelData = a_eventData.detail ? a_eventData.detail * -1 : a_eventData.wheelDelta / 40;

    const c=this.canvas;
    const rect = c.getBoundingClientRect();
    const borderWidth = c.style.borderWidth;

    const mouseX = a_eventData.clientX - rect.left;
    const mouseY = a_eventData.clientY - rect.top;
        
    const oldScale = mat4.create();
    oldScale[0] = this.zoom;
    oldScale[5] = this.zoom;
    
    const v = vec4.fromValues(mouseX, mouseY, 0, 1);
    const p = vec4.transformMat4(vec4.create(), v, this.invMvp); //model space point
    

    if(wheelData > 0)
    {
      this.zoom *= this.zoomVel;
      if(this.zoom > this.maxZoom)
        this.zoom = this.maxZoom;
    }
    else if(wheelData < 0)
    {
      this.zoom *= 1.0/this.zoomVel;
      if(this.zoom < this.minZoom)
        this.zoom = this.minZoom;
    }

    //v = R * P * S * V * p
    //v = T * V * p
    
    //v = s * (Vx +px)
    //v = t * (Wx +px)
    
    //s * (px + Vx) = t * (px + Wx)
    //s * px + s * Vx = t * px + t * Wx
    //s * px + s * Vx - t * px = t * Wx
    //s * (px + Vx) - t * px = t * Wx
    //s * (px + Vx) / t - px = Wx

    
    const scale = mat4.create();
    scale[0] = this.zoom;
    scale[5] = this.zoom;
    /*todo
    scale.Scale(vec4.fromValues(this.zoom,this.zoom,1,1));
    */
    
    const view = mat4.create();
    view[12] = oldScale[0] * (p[0] + this.matrixView[12]) / this.zoom - p[0];
    view[13] = oldScale[5] * (p[1] + this.matrixView[13]) / this.zoom - p[1];
    
    const camera = mat4.invert(mat4.create(), view);//view.Inverse();
    this.cameraPosition[0] = camera[12];
    this.cameraPosition[1] = camera[13];
    this.cameraPosition[2] = camera[14];

    
    this.calculateMatricies();
    
    this.render();
    
  }



  screenToWorld = (a_in) => {
    const pos = vec4.transformMat4(vec4.create(), a_in, this.invMvp);
    return pos;
  }

  moveCamera = (a_px, a_py, a_nx, a_ny) => { //prev, new
    const start   = this.screenToWorld(vec4.fromValues(a_px, a_py, 0, 1));
    const finish  = this.screenToWorld(vec4.fromValues(a_nx, a_ny, 0, 1));
    
    const move = vec4.sub(vec4.create(), start, finish);//start.Sub(finish);
    
    this.cameraPosition = vec4.add(vec4.create(), this.cameraPosition, move);//this.cameraPosition.Add(move);
    this.cameraPosition[3]=1;
    
    this.calculateMatricies();
    
    
  }


  calculateMatricies = () => {
    const canvas = this.canvas;
    //const context = this.context2d;
    
    //canvas.width  = window.innerWidth;
    //canvas.height = window.innerHeight;
    /*todo
    this.matrixView.LookAt(new Vec4(this.cameraPosition.x,this.cameraPosition.y,1,1), new Vec4(this.cameraPosition.x,this.cameraPosition.y,0,1), new Vec4(0,1,0,1));
    */
    const center = vec4.clone(this.cameraPosition);
    this.cameraPosition[2] = 1;
    center[2] = 0;
    mat4.lookAt(this.matrixView, (this.cameraPosition as any), (center as any), vec3.fromValues(0,1,0));
    
    /*todo
    this.matrixViewport.SetIdentity();
    this.matrixViewport.v[0].x = canvas.width/2;
    this.matrixViewport.v[1].y = canvas.height/2;
    this.matrixViewport.v[3].x = canvas.width/2;
    this.matrixViewport.v[3].y = canvas.height/2;
    */
    mat4.identity(this.matrixViewport);
    this.matrixViewport[0] = canvas.width/2;
    this.matrixViewport[5] = canvas.height/2;
    this.matrixViewport[12] = canvas.width/2;
    this.matrixViewport[13] = canvas.height/2;
    
    
    //this.matrixProjection.OrthoProjection(canvas.width, canvas.height, 0.1, 10);
    mat4.ortho(this.matrixProjection, 0, canvas.width, 0, canvas.height, 0.1, 10);
    
    /*todo
    const scale = new Mat4x4();
    scale.v[0].x = this.zoom;
    scale.v[1].y = this.zoom;
    */
    const scale = mat4.create();
    scale[0] = this.zoom;
    scale[5] = this.zoom;
    
    /*todo
    this.mvp = this.matrixViewport.Multiply(this.matrixProjection);
    this.mvp = this.mvp.Multiply(scale);
    this.mvp = this.mvp.Multiply(this.matrixView);
    */
    

    mat4.mul(this.mvp, this.matrixViewport, this.matrixProjection);
    const temp = mat4.mul(mat4.create(), this.mvp, scale);
    mat4.mul(this.mvp, temp, this.matrixView);
    
    /*todo
    this.invMvp = this.mvp.Inverse();
    */
    mat4.invert(this.invMvp, this.mvp);
  }



  drawIcons = (a_settlement) => {
    let canvas = this.canvas;
    let context = this.context2d;
    

      
  }



  drawText = (a_context: CanvasRenderingContext2D) => {
    //const canvas = this.canvas;
    //const context = this.context2d;
    
    a_context.font="12px Arial";
    a_context.fillStyle = "rgba(255,255,255,1)";
    

  }
  
  render = () => {
    if(!this.redraw)
	  {
		  this.redraw = true;	
		  requestAnimationFrame(this.update);
	  }
	}


}

