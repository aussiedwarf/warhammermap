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
import { saveAs } from 'file-saver';
import { vec4 } from 'gl-matrix';
import * as rawMapData from './data/raw.json';
//import * as xmlData from './data/raw.txt';

function isNumeric(val: any): boolean {
  return !(val instanceof Array) && (val - parseFloat(val) + 1) >= 0;
}

function isAlphaNumeric(inputtxt){
  let letterNumber = /^[0-9a-zA-Z]+$/;
  if(inputtxt.value.match(letterNumber)){
    return true;
  } 
  else{ 
    return false; 
  }
}

class VertexLod {
  points: Array<Array<number>> = [];
  boundingBox: vec4 = vec4.create();
  longestEdge: number = 0;
  complete: boolean = false;
}

class MapRef {
  image: HTMLImageElement;
  loaded: boolean = false;
  loading: boolean = false;
  show: boolean = false;
  name: string = "";
  link: string = "";
  width: number = 0;
  height: number = 0;
  x: number = 0;
  y: number = 0;
}

class MapData {
  ref: Array<MapRef> = [];
  vertexLods: Array<Array<VertexLod>> = [];
}

export default class Map {
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;
  mapData: MapData;
  redraw: () => void;
  //text: string = xmlData.default;
  
  constructor(a_canvas: HTMLCanvasElement, a_redraw: () => void){
    this.canvas = a_canvas;
    this.context2d = a_canvas.getContext("2d");
    
    this.mapData = new MapData;
    
    this.redraw = a_redraw;
    
    
    this.importMap();
  }  
  
  
  toggleRefImage = (a_show: boolean, a_index: number) => {
    const ref = this.mapData.ref[a_index];
    ref.show = a_show;
  
    if(a_show && !ref.loaded && !ref.loading){
      ref.image = new Image;
      ref.loading = true;
      
      ref.image.onload = () => {
        ref.loaded = true;
        this.redraw();
      };
      ref.image.onerror = () => {alert("error loading image");};
      ref.image.src = ref.link;
    }
    this.redraw();

  }
  
  drawBezierLine = (data: Array<number>, a_zoom: number) => {
    const context = this.context2d;
  
    context.beginPath();
    context.moveTo(data[0], data[1]);
    
    for(let j = 2; j < data.length/* - offset*/; j+= 6){
      context.bezierCurveTo(data[j], data[j+1], data[j+2], data[j+3], data[j+4], data[j+5]);
    }
    
    context.stroke();
  }
  
  drawBezier = (data: Array<number>, a_complete: boolean, a_prevComplete: boolean, a_zoom: number) => {
    const context = this.context2d;
  
    if(a_prevComplete){
      context.beginPath();
    }
    context.moveTo(data[0], data[1]);
    
    //const offset = (data.length-2) % 6;
    
    for(let j = 2; j < data.length/* - offset*/; j+= 6){
      context.bezierCurveTo(data[j], data[j+1], data[j+2], data[j+3], data[j+4], data[j+5]);
    }
    
    if(a_complete){
      context.fill();
      context.stroke();
    }
    /*
    context.lineWidth = 1.0/a_zoom;
    context.fillStyle = 'red';
    for(let j = 0; j < data.length; j+= 6){
      context.beginPath();
      context.arc(data[j], data[j+1], 3/a_zoom, 0, 2 * Math.PI);
      context.stroke();
    }
    
    const s = 10 / a_zoom;
    const t = '' + s.toString();
    context.font= t + "px Arial";
    
    context.fillStyle = 'blue';
    for(let j = 0; j < data.length; j+= 6){
      context.fillText('' + j, data[j]+s, data[j+1]);
    }
    */
  }

  
  draw = (a_zoom: number, a_boundingBox: vec4) => {
    const context = this.context2d;
    const mapData = this.mapData;
    
    const stroke = ['rgb(0,0,0)','rgb(0,0,0)','rgb(0,0,0)', 'rgb(0,0,255)'];
    const fill = ['rgb(127,255,127)', 'rgb(127,127,127)', 'rgb(0,127,0)', 'rgb(0,0,0)'];
    
    //polys
    for(let j = 0; j < 3; ++j){
      context.strokeStyle = stroke[j];
      context.fillStyle = fill[j]
      let prevComplete = true;
      let prevDrawn = false;
      
      for(let i = 0; i < mapData.vertexLods[j].length; ++i){
        const  vertexLod = mapData.vertexLods[j][i];
        
        const outside = 
          vertexLod.boundingBox[0] > a_boundingBox[2] || 
          vertexLod.boundingBox[2] < a_boundingBox[0] || 
          vertexLod.boundingBox[1] > a_boundingBox[3] || 
          vertexLod.boundingBox[3] < a_boundingBox[1];
        if(!outside || (prevDrawn && !prevComplete)){
          prevDrawn = true;
          this.drawBezier(vertexLod.points[0], vertexLod.complete, prevComplete, a_zoom);
        }
        else{
          prevDrawn = false;
        }
          
        prevComplete = vertexLod.complete;
      }    
    }
    
    //lines
    for(let j = 3; j < 4; ++j){
      context.strokeStyle = stroke[j];
      context.fillStyle = fill[j]
      let prevComplete = true;
      let prevDrawn = false;
      
      for(let i = 0; i < mapData.vertexLods[j].length; ++i){
        const  vertexLod = mapData.vertexLods[j][i];
        
        const outside = 
          vertexLod.boundingBox[0] > a_boundingBox[2] || 
          vertexLod.boundingBox[2] < a_boundingBox[0] || 
          vertexLod.boundingBox[1] > a_boundingBox[3] || 
          vertexLod.boundingBox[3] < a_boundingBox[1];
        if(!outside || (prevDrawn && !prevComplete)){
          prevDrawn = true;
          this.drawBezierLine(vertexLod.points[0], a_zoom);
        }
        else{
          prevDrawn = false;
        }
          
        prevComplete = vertexLod.complete;
      }    
    }
    
    context.globalAlpha = 0.5;
    
    for(let i = 0; i < this.mapData.ref.length;++i){
      const ref = this.mapData.ref[i];
    
      if(ref.loaded && ref.show){
        context.drawImage(ref.image, ref.x, ref.y, ref.width, ref.height);
      }
    }
    
    context.globalAlpha = 1.0;
  }
  
  importMap = () => {
    
    const mapData = this.mapData;
    mapData.vertexLods.push([]);
    
    //const parser = new DOMParser();
    //const xmlDoc = parser.parseFromString(this.text,"text/xml");
    const coast = rawMapData.coast;
    for(let i = 0; i < coast.length; ++i){
      this.importSvg(coast[i], mapData.vertexLods[0]);
    }
    
    mapData.vertexLods.push([]);
    const mountains = rawMapData.mountains;
    for(let i = 0; i < mountains.length; ++i){
      this.importSvg(mountains[i], mapData.vertexLods[1]);
    }
    
    mapData.vertexLods.push([]);
    const forest = rawMapData.forest;
    for(let i = 0; i < forest.length; ++i){
      this.importSvg(forest[i], mapData.vertexLods[2]);
    }
    
    mapData.vertexLods.push([]);
    const rivers = rawMapData.rivers;
    for(let i = 0; i < rivers.length; ++i){
      this.importSvg(rivers[i], mapData.vertexLods[3]);
    }
    
    
    for(let i = 0; i < rawMapData.ref.length; ++i){
      const ref = new MapRef;
      const src = rawMapData.ref[i];
      
      ref.name = src.name;
      ref.link = src.link;
      ref.width= src.width;
      ref.height = src.height;
      ref.x = src.x;
      ref.y = src.y;
      
      mapData.ref.push(ref);
    }    
  }
  
  /*
  parseXml = (data: string) => {
    const obj = {};
    let word = "";
    for(let i = 0; i < data.length; ++i){
      if(data[i] == '<'){
        word = "";
        for(; i < data.length; ++i){
          if(isAlphaNumeric(data[i]))
            word += data[i];
          else
            break;
        }
        
        obj[word] = {};
      }
    }
  }
  */
  
  //importSvg = (a_data: string, a_buffer: Array<Array<number>>, a_boundingBox: Array<vec4>, a_complete: Array<boolean>) => {
  importSvg = (a_data: string, a_vertexLods: Array<VertexLod>) => {
    let vertexLod = new VertexLod;
    const points = [];
    let num = false;
    let value = "";
    let e = false;
    const relative = [];
    let rel = false;
    let type = 'c';
    let pointCount = 0;
    let complete = true;
    
    for(let i = 0; i < a_data.length; ++i){
      
      if(a_data[i] == 'M' || a_data[i] == 'm' || a_data[i] == 'c'){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          
          num = false;
          value = "";
        }
        
        if(a_data[i] == 'm' || a_data[i] == 'c')
          rel = true;
        else
          rel = false;
        
        type = a_data[i];
        pointCount = 0;
      }
      else if(a_data[i] == ' ' || a_data[i] == ','){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          pointCount++;
          
          num = false;
          value = "";
        }
        else if(e){
          const p = parseFloat(value);
          points[points.length-1] = points[points.length-1] * Math.pow(10, p);
          e = false;
          value = ""
        }
        
        
      }
      else if(isNumeric(a_data[i]) || a_data[i] == '-' || a_data[i] == '.'){
        if(!num && !e){
          if(pointCount == 6)
            pointCount = 0;
          
          if(type == 'l' && pointCount == 0){
            points.push(0);
            points.push(0);
            points.push(0);
            points.push(0);
            relative.push(rel);
            relative.push(rel);
            relative.push(rel);
            relative.push(rel);
            pointCount = 4;
          }
          else if(type == 'L' && pointCount == 0){
            points.push(0);
            points.push(0);
            points.push(0);
            points.push(0);
            relative.push(true);
            relative.push(true);
            relative.push(true);
            relative.push(true);
            pointCount = 4;
          }
        }
        
        value += a_data[i];
        if(!e)
          num = true;
      }
      else if(a_data[i] == 'e'){
        points.push(parseFloat(value));
        relative.push(rel);
        pointCount++;
        
        num = false;
        value = "";
        e = true;
      }
      //close
      else if(a_data[i] == 'z'){
        
      }
      else if(a_data[i] == 'Z'){
        complete = false;
      }
      else if(a_data[i] == 'l'){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          
          num = false;
          value = "";
        }
        
        rel = true;
        points.push(0);
        points.push(0);
        points.push(0);
        points.push(0);
        relative.push(rel);
        relative.push(rel);
        relative.push(rel);
        relative.push(rel);
        
        type = a_data[i];
        pointCount = 4;
      }
      else if(a_data[i] == 'L'){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          
          num = false;
          value = "";
        }
        
        rel = false;
        points.push(0);
        points.push(0);
        points.push(0);
        points.push(0);
        relative.push(true);
        relative.push(true);
        relative.push(true);
        relative.push(true);
        
        type = a_data[i];
        pointCount = 4;
      }
      else{
        alert(a_data[i]);
      }
      
    }
    
    if(num){
      points.push(parseFloat(value));
      relative.push(rel);
      
      num = false;
      value = "";
    }
    else if(e){
      const p = parseFloat(value);
      points[points.length-1] = Math.pow(points[points.length-1], p);
      e = false;
    }
    
    const offset = (points.length-2) % 6;
    if(offset != 0){
      console.warn("incorrect size");
    }
    
    for(let i = 2; i < points.length; i+=6){
      if(relative[i])
        points[i] += points[i-2];
      if(relative[i+1])
        points[i+1] += points[i-1];
      if(relative[i+2])
        points[i+2] += points[i-2];
      if(relative[i+3])  
        points[i+3] += points[i-1];
      if(relative[i+4])
        points[i+4] += points[i-2];
      if(relative[i+5])
        points[i+5] += points[i-1];
    }
    
    vec4.set(vertexLod.boundingBox, points[0], points[1], points[2], points[3]);
    
    for(let i = 6; i < points.length; i+=6){
      vertexLod.boundingBox[0] = Math.min(vertexLod.boundingBox[0], points[i]);
      vertexLod.boundingBox[1] = Math.min(vertexLod.boundingBox[1], points[i+1]);
      vertexLod.boundingBox[2] = Math.max(vertexLod.boundingBox[2], points[i]);
      vertexLod.boundingBox[3] = Math.max(vertexLod.boundingBox[3], points[i+1]);
    }
    vertexLod.points.push(points);
    vertexLod.complete = complete;
    vertexLod.longestEdge = Math.max(vertexLod.boundingBox[2] - vertexLod.boundingBox[0], vertexLod.boundingBox[3] - vertexLod.boundingBox[1]);
    
    a_vertexLods.push(vertexLod);
  }
  
  exportJson = () => {
    /*
    const map = {
    coast: this.mapData.coast, 
    mountains: this.mapData.mountains,
    forest: this.mapData.forest,
    rivers: this.mapData.rivers,
    complete: this.mapData.complete};
  
    const data = JSON.stringify(map);
    
    const filename = "map.json";
    const blob = new Blob([data], {type: "application:json;charset=utf-8"});
    saveAs(blob, filename);
    */
  }
  
}


