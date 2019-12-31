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

import Game from './game';

import Navbar from './navbar';

import * as React from 'react';

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
*/

import './game.scss';

type StateCheckBoxMap = {
  checked: boolean
}

type PropsCheckBoxMap = {
  index: number,
  game: () => Game
}

type PropsCheckBoxArray = {
  game: () => Game
}

class CheckBoxMap extends React.Component<PropsCheckBoxMap, StateCheckBoxMap> {
  //state: StateCheckBoxMap;
  index: number;
  game: () => Game;
  
  constructor(props: PropsCheckBoxMap){
    super(props); 
    this.state = {
      checked: false
      };
    this.game = props.game;
    this.index = props.index;
  }
  
  checked = (a_event: React.ChangeEvent<HTMLInputElement>) => {
    const game = this.game();
    game.map.toggleRefImage(!this.state.checked, this.index);
  
    this.setState({checked: !this.state.checked});
    
    
  }
  
  render = () => {
    const game = this.game();
    
    const ref = game.map.mapData.ref[this.index];
    const name = ref.name;
    
    return(
      <div>
        <input type="checkbox" 
          id="cbViewTypes" 
          name="viewTypes" 
          value="viewTypes" 
          checked={this.state.checked} 
          onChange={this.checked}/> {name}<br />
      </div>
    )
  }
}

class CheckBoxArray extends React.Component<PropsCheckBoxArray, {}> {
  game: () => Game;
  
  constructor(props: PropsCheckBoxArray){
    super(props);
    this.game = props.game;
  }
  
  update = () => {
    this.forceUpdate();
  }

  render = () => {
    const boxes = [];
    const game = this.game();
    if(game){
      const ref = game.map.mapData.ref;
      
      for (var i = 0; i < ref.length; i++) {
        boxes.push(<CheckBoxMap key={i} game={this.game} index={i} />);
      }
    }
    return boxes;
  }
}

export class ExternalLinks extends React.Component {
  render = () => {
    return(
      <div>
        <Navbar />
        <div id="fullbody">
          <a href="https://gamesworkshop.com/">Games Workshop</a> Official Warhammer website.
          <p /><a href="http://paizo.com/">Paizo</a> Warhammer armies project.
          <p /><a href="http://goblinary.com/">9th Age</a> .
        </div>
      </div>
      
    )
  }
}

export class CommunityResources extends React.Component {
  render = () => {
    return(
      <div>
        <Navbar />
      </div>
    )
  }
}

type StateApp = {
  viewLandmarksState: boolean,
  viewRegionsState: boolean
};

export default class App extends React.Component {
  state: StateApp;

  game: Game = null;
  canvas: HTMLCanvasElement;
  checkBoxArray: React.RefObject<CheckBoxArray>;

  constructor(props: any){
    super(props);
    this.state = {
      viewLandmarksState: true,
      viewRegionsState: true
    }
    
    this.checkBoxArray = React.createRef();
  }
  
  getGame = () => {
    return this.game;
  }
  
  
  componentDidMount = () => {
    this.game = new Game(this.canvas);
    this.checkBoxArray.current.update();
  }
  
  setCanvas = (a_canvas: HTMLCanvasElement) => {
    this.canvas = a_canvas;
  }




  zoomInOnDown = () => {
    this.game.zoomIn = true;
    this.game.render();
  }

  zoomInOnUp = () => {
    this.game.zoomIn = false;
    this.game.render();
  }

  zoomOutOnDown = () => {
    this.game.zoomOut = true;
    this.game.render();
  }

  zoomOutOnUp = () => {
    this.game.zoomOut = false;
    this.game.render();
  }
  
  getSvg = () => {
    this.game.map.exportJson();
  }
  
  render = () => {
    return(
      <div>
        
        <div id="myDiv">
          <div id="menu">
            Warhammer Map
            <p />Last Update: 9th June, 2017
            <p />Left click and drag to scroll, use the scroll wheel to zoom and double click on an item to keep it highlighted.
            <p />


            <button type="button" onClick={this.getSvg}>
              Export json
            </button>
            
            <br />
            <CheckBoxArray game={this.getGame} ref={this.checkBoxArray} />
          </div>
        </div>
        
        
		    
		    <Navbar />
		  
		    <div id="copyright">
		    Warhammer Map is a fan made site.</div>
		    <div id="navigation">
          <div className="alignRight">
            <button type="button" className="button" id="bZoomIn" onMouseDown={this.zoomInOnDown} onMouseUp={this.zoomInOnUp} onTouchStart={this.zoomInOnDown} onTouchEnd={this.zoomInOnUp}>Zoom In</button>
            <button type="button" className="button" id="bZoomOut" onMouseDown={this.zoomOutOnDown} onMouseUp={this.zoomOutOnUp} onTouchStart={this.zoomOutOnDown} onTouchEnd={this.zoomOutOnUp}>Zoom Out</button>
          </div>
        </div>
      
        <div id="legendouter">
          <canvas id="canvas" tabIndex={1} 
          ref={this.setCanvas}>
			      Your browser does not support the canvas element. Please upgrade to the latest version of your browser or use Google Chrome or Firefox.
		      </canvas>
		    
          <div id="legend">
		        <div id="legendhead">
		          <div id="legendvert">
		            Legend
		          </div>
		        </div>
		        <div id="legendcontent">
		          {/*
		          <img src={imageCoin} /> Auction House
		          <br /><img src={imageCraft} /> Crafting
		          <br /><img src={imageCleric} /> Cleric Training
		          <br /><img src={imageFighter} /> Fighter Training
		          <br /><img src={imageRogue} /> Rogue Training
		          <br /><img src={imageWizard} /> Wizard Training
		          <br /><img src={imageClanmoot} /> PC Settlement
		          <br /><img src={imageVillage} /> NPC Settlement
		          <br /><img src={imageStar} /> NPC Town
		          <br /><img src={imageWaterfall} /> Unclaimed Settlement Hex
		          <br /><img src={imageSkull} /> Inactive Settlement
		          <br /><img src={imagePOI} /> Protected Hex
		          <br /><img src={imageTotem} /> Fanes
		          <br /><img src={imageMonument} /> Location Achievement
		          <br /><img src={imageMonolith} /> Unmarked Achievement
		          */}
		        </div>
		      </div>
		    </div>
		    
        
        
        

      </div>
    )
  }
}

