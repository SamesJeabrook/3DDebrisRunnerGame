import React, {Component} from 'react';

// styles

import './styles/gameOver.css';

class GameOver extends Component {
    render(){
        return(
            <div id="gameOver">
                <div className="game_over_container">
                    <h3>Game Over</h3><br/>
                </div>
                <span className="vertical_align"></span>
            </div>
        )
    }
}
export default GameOver;