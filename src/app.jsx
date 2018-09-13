import React from 'react';
import ReactDOM from 'react-dom';

// components

import GameIntro from './gameIntro.jsx';
import GameOver from './gameOver.jsx';
import HealthBar from './healthBar.jsx';

class Game extends Component{
  render(){
    return(
      <div>
        <GameOver />
        <GameIntro />
        <HealthBar />
        <div id="gameWrapper"></div>
      </div>
    )
  }
}

ReactDOM.render(
  <Game />,
  document.getElementById('app')
);
