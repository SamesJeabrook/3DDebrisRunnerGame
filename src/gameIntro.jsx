import React, {Component} from 'react';

// styles

import './styles/gameIntro.css';

class GameIntro extends Component {
    render(){
        return(
            <div id="gameIntro">
                <div class="game_into_container">
                    <ul>
                        <li>
                            <div class="game_intro_container__block">
                                <h2>Controls</h2>
                                <ul>
                                    <li>Up : &uarr; </li>
                                    <li>Down : &darr;</li>
                                    <li>Left : &larr;</li>
                                    <li>Right : &rarr;</li>
                                    <li>Roll Left : A</li>
                                    <li>Roll Right : D</li>
                                </ul>
                            </div>
                        </li>
                        <li>
                            <div class="game_intro_container__block">
                                <h2>Play</h2>
                                <button class="game_intro_container__block-button" id="play">
                                    Start
                                </button>
                            </div>
                        </li>
                    </ul>
                </div>
                <span class="vertical_align"></span>
            </div>
        )
    }
}
export default GameIntro