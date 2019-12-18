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
  
  draw = () => {
    const context = this.context2d;
    for(let i = 0; i < this.mapData.coast.length; ++i){
      const data = this.mapData.coast[i];
      
      context.beginPath();
      context.moveTo(data[0], data[1]);
      
      const offset = (data.length-2) % 6
      //if( != 0){
      //  alert("Error in " + i);
      //}
      
      for(let j = 2; j < data.length - offset; j+= 6){
        context.bezierCurveTo(data[j], data[j+1], data[j+2], data[j+3], data[j+4], data[j+5]);
      }
      
      context.stroke();
    }
  }
  
  importMap = () => {
    
    
    //const parser = new DOMParser();
    //const xmlDoc = parser.parseFromString(this.text,"text/xml");
    const coast = rawMapData.coast;
    for(let i = 0; i < coast.length; ++i){
      this.importSvg(coast[i]);
    }
    //this.importSvg(coast[96]);
    
    console.log("hi");

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
  
  importSvg = (data: string) => {
    
    const points = [];
    let num = false;
    let value = "";
    let e = false;
    const relative = [];
    let rel = false;
    
    for(let i = 0; i < data.length; ++i){
      if(data[i] == 'm' || data[i] == 'c'){
        if(num){
          points.push(parseFloat(value));
          relative.push(rel);
          
          num = false;
          value = "";
        }
        rel = true;
      }
      else if(data[i] == ' ' || data[i] == ','){
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
      }
      else if(isNumeric(data[i]) || data[i] == '-' || data[i] == '.'){
        value += data[i];
        if(!e)
          num = true;
      }
      else if(data[i] == 'e'){
        points.push(parseFloat(value));
        relative.push(rel);
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
    
    this.mapData.coast.push(points);
  }
  
  exportJson = () => {
    
  
    const data = JSON.stringify(this.mapData);
    
    const filename = "map.json";
    const blob = new Blob([data], {type: "application:json;charset=utf-8"});
    saveAs(blob, filename+".txt");
  }
  
}


