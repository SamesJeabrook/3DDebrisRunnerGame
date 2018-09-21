import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import OpenSocket from 'socket.io-client';

const io = OpenSocket('https://orbitaldebris.herokuapp.com/');
const currentURL = window.location.href;

// components

import Game from './game.jsx';

import Controller from './controller.jsx';

// styles

import './styles/utils.css';

class GameWrapper extends Component{

  state = {
    id: null,
    controllerConnected: false,
    controllerState: {},
    runGame: false,
    health: 100
  }

  componentDidMount(){
    io.connect();
    io.on('connect', () => {
      this.setState({
        id: io.id
      })
    });
    io.on('controller_connected', () => {
      console.log('controller connected')
      this.setState({
        controllerConnected: true
      })
    });
    io.on('controller_state_change', (state) => {
      console.log('controller state changed')
      this.setState({
        controllerState : state
      })
    });
    io.on('game_connected', () => {
      console.log("game connected")
      this.setState({
        runGame: true
      })
    })
    io.on('health_update', (health) =>{
      console.log(health)
      this.setState({
        health: health
      })
    });
  }

  render(){

    let {
      id,
      runGame,
      controllerConnected,
      controllerState,
      health
    } = this.state;

    if(currentURL.indexOf('?id=') > 0){
      // render controller
      return(
        <Controller io={io} gameId={currentURL.split('?id=')[1]} health={health}/>
      )
    }else{
      // render game
      return(
          <Game io={io} id={id} runGame={runGame} controllerConnected={controllerConnected} controllerState={controllerState} health={health} />
      )
    }
  }
}

ReactDOM.render(
  <GameWrapper />,
  document.getElementById('app')
);
