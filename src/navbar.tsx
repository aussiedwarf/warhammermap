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

import * as React from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";



import './game.scss';

export default class Navbar extends React.Component {
  render = () => {
    return(
      <div id="topbar">
        <table id="navBarTable">
          <tbody>
            <tr>
              <td><Link to="/">Map</Link></td>	
              {/*<td><Link to="/settlements">Settlements</Link></td>	*/}	
              {/*<td><Link to="tutorial.html">Tutorial</Link></td>*/}
              <td><Link to="/links">Links</Link></td>	
              {/*<td><Link to="/communityresources">Community Resources</Link></td>*/}
            </tr>
          </tbody>
        </table>
        
        
        
	    </div>
	  )
	}
}

