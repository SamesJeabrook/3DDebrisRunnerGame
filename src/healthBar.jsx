import React, {Component} from 'react';

// styles

import './styles/healthBar.css';

class HealthBar extends Component {
    render(){
        let {health} = this.props;
        return(
            <div id="healthBarContainer">
                <p>Health</p>
                <div className="health_bar">
                    <span style={{"width": `${health}%`}}></span>
                </div>
            </div>
        )
    }
}
export default HealthBar;