import React, {Component} from 'react';

// styles

import './styles/healthBar.css';

class HealthBar extends Component {
    render(){
        return(
            <div id="healthBarContainer">
                <p>Health</p>
                <div className="health_bar">
                    <span></span>
                </div>
            </div>
        )
    }
}
export default HealthBar;