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
  
  draw = (a_zoom: number) => {
    const context = this.context2d;
    
    context.fillStyle = 'rgb(127,255,127)';
    for(let i = 0; i < this.mapData.coast.length; ++i){
      this.drawBezier(this.mapData.coast[i], a_zoom);
    }
    
    context.fillStyle = 'rgb(127,127,127)';
    for(let i = 0; i < this.mapData.mountains.length; ++i){
      this.drawBezier(this.mapData.mountains[i], a_zoom);
    }
    
  }
  
  importMap = () => {
    
    
    //const parser = new DOMParser();
    //const xmlDoc = parser.parseFromString(this.text,"text/xml");
    const coast = rawMapData.coast;
    for(let i = 0; i < coast.length; ++i){
      this.importSvg(coast[i], this.mapData.coast);
    }
    //this.importSvg(coast[96]);
    
    const mountains = rawMapData.mountains;
    for(let i = 0; i < mountains.length; ++i){
      this.importSvg(mountains[i], this.mapData.mountains);
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
  
  importSvg = (data: string, buffer: Array<Array<number>>) => {
    
    const points = [];
    let num = false;
    let value = "";
    let e = false;
    const relative = [];
    let rel = false;
    let type = 'c';
    let pointCount = 0;
    
    for(let i = 0; i < data.length; ++i){
      
      if(data[i] == 'M' || data[i] == 'm' || data[i] == 'c'){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          
          num = false;
          value = "";
        }
        
        if(data[i] == 'm' || data[i] == 'c')
          rel = true;
        else
          rel = false;
        
        type = data[i];
        pointCount = 0;
      }
      else if(data[i] == ' ' || data[i] == ','){
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
      else if(isNumeric(data[i]) || data[i] == '-' || data[i] == '.'){
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
        
        value += data[i];
        if(!e)
          num = true;
      }
      else if(data[i] == 'e'){
        points.push(parseFloat(value));
        relative.push(rel);
        pointCount++;
        
        num = false;
        value = "";
        e = true;
      }
      //close
      else if(data[i] == 'z'){
        
      }
      else if(data[i] == 'l'){
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
        
        type = data[i];
        pointCount = 4;
      }
      else if(data[i] == 'L'){
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
        
        type = data[i];
        pointCount = 4;
      }
      else{
        alert(data[i]);
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
    
    buffer.push(points);
  }
  
  exportJson = () => {
    
  
    const data = JSON.stringify(this.mapData);
    
    const filename = "map.json";
    const blob = new Blob([data], {type: "application:json;charset=utf-8"});
    saveAs(blob, filename+".txt");
  }
  
}


