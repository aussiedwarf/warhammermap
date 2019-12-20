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

class MapData {
  coast: Array<Array<number>> = [];
  mountains:Array<Array<number>> = [];
  forest: Array<Array<number>> = [];
  rivers: Array<Array<number>> = [];
  boundingBox: Array<Array<vec4>> = [];
}

export default class Game {
  canvas: HTMLCanvasElement;
  context2d: CanvasRenderingContext2D;
  mapData: MapData;
  //text: string = xmlData.default;
  
  constructor(a_canvas: HTMLCanvasElement){
    this.canvas = a_canvas;
    this.context2d = a_canvas.getContext("2d");
    
    this.mapData = new MapData;
    
    
    this.importMap();
  }  
  
  drawBezier = (data: Array<number>, a_zoom: number) => {
    const context = this.context2d;
  
    context.beginPath();
    context.moveTo(data[0], data[1]);
    
    const offset = (data.length-2) % 6;
    
    for(let j = 2; j < data.length - offset; j+= 6){
      context.bezierCurveTo(data[j], data[j+1], data[j+2], data[j+3], data[j+4], data[j+5]);
    }
    
    context.fill();
    context.stroke();
    /*
    context.lineWidth = 1.0/a_zoom;
    context.fillStyle = 'red';
    for(let j = 0; j < data.length - offset; j+= 6){
      context.beginPath();
      context.arc(data[j], data[j+1], 3, 0, 2 * Math.PI);
      context.stroke();
    }
    
    context.fillStyle = 'blue';
    for(let j = 0; j < data.length - offset; j+= 6){
      context.fillText('' + j, data[j]+5, data[j+1]);
    }
    */
  }
  /*
  a<x && b>y
  a<x && b>x
  a<y && b>y
  */
  
  draw = (a_zoom: number, a_boundingBox: vec4) => {
    const context = this.context2d;
    const mapData = this.mapData;
    
    context.fillStyle = 'rgb(127,255,127)';
    for(let i = 0; i < mapData.coast.length; ++i){
      const outside = 
        mapData.boundingBox[0][i][0] > a_boundingBox[2] || 
        mapData.boundingBox[0][i][2] < a_boundingBox[0] || 
        mapData.boundingBox[0][i][1] > a_boundingBox[3] || 
        mapData.boundingBox[0][i][3] < a_boundingBox[1];
      if(!outside)
        this.drawBezier(mapData.coast[i], a_zoom);
    }
    
    context.fillStyle = 'rgb(127,127,127)';
    for(let i = 0; i < mapData.mountains.length; ++i){
      const outside = 
        mapData.boundingBox[1][i][0] > a_boundingBox[2] || 
        mapData.boundingBox[1][i][2] < a_boundingBox[0] || 
        mapData.boundingBox[1][i][1] > a_boundingBox[3] || 
        mapData.boundingBox[1][i][3] < a_boundingBox[1];
      if(!outside)
        this.drawBezier(mapData.mountains[i], a_zoom);
    }
    
    context.fillStyle = 'rgb(0,127,0)';
    for(let i = 0; i < mapData.forest.length; ++i){
      const outside = 
        mapData.boundingBox[2][i][0] > a_boundingBox[2] || 
        mapData.boundingBox[2][i][2] < a_boundingBox[0] || 
        mapData.boundingBox[2][i][1] > a_boundingBox[3] || 
        mapData.boundingBox[2][i][3] < a_boundingBox[1];
      if(!outside)
        this.drawBezier(mapData.forest[i], a_zoom);
    }
    
  }
  
  importMap = () => {
    this.mapData.boundingBox.push([]);
    
    //const parser = new DOMParser();
    //const xmlDoc = parser.parseFromString(this.text,"text/xml");
    const coast = rawMapData.coast;
    for(let i = 0; i < coast.length; ++i){
      this.importSvg(coast[i], this.mapData.coast, this.mapData.boundingBox[0]);
    }
    //this.importSvg(coast[96]);
    
    this.mapData.boundingBox.push([]);
    const mountains = rawMapData.mountains;
    for(let i = 0; i < mountains.length; ++i){
      this.importSvg(mountains[i], this.mapData.mountains, this.mapData.boundingBox[1]);
    }
    
    this.mapData.boundingBox.push([]);
    const forest = rawMapData.forest;
    for(let i = 0; i < forest.length; ++i){
      this.importSvg(forest[i], this.mapData.forest, this.mapData.boundingBox[2]);
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
  
  importSvg = (a_data: string, a_buffer: Array<Array<number>>, a_boundingBox: Array<vec4>) => {
    
    const points = [];
    let num = false;
    let value = "";
    let e = false;
    const relative = [];
    let rel = false;
    let type = 'c';
    let pointCount = 0;
    
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
    
    const boundingBox = vec4.fromValues(points[0], points[1], points[2], points[3]);
    
    for(let i = 6; i < points.length; i+=6){
      boundingBox[0] = Math.min(boundingBox[0], points[i]);
      boundingBox[1] = Math.min(boundingBox[1], points[i+1]);
      boundingBox[2] = Math.max(boundingBox[2], points[i]);
      boundingBox[3] = Math.max(boundingBox[3], points[i+1]);
    }
    
    a_buffer.push(points);
    a_boundingBox.push(boundingBox);
  }
  
  exportJson = () => {
    
  
    const data = JSON.stringify(this.mapData);
    
    const filename = "map.json";
    const blob = new Blob([data], {type: "application:json;charset=utf-8"});
    saveAs(blob, filename+".txt");
  }
  
}


