import React, {Component} from 'react';

// styles

import './styles/gameOver.css';

class GameOver extends Component {
    render(){
        return(
            <div id="gameOver">
                <div class="game_over_container">
                    <h3>Game Over</h3><br/>
                    <button id="playAgain">Play Again</button>
                </div>
                <span class="vertical_align"></span>
            </div>
        )
    }
}
export default GameOver;