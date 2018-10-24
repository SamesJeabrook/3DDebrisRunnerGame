import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import OpenSocket from 'socket.io-client';

// const io = OpenSocket('https://orbitaldebris.herokuapp.com/');
const io = OpenSocket('http://localhost:5050/');
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
    targetState: {},
    runGame: false,
    health: 100,
    gameStarted: false
  }

  componentDidMount(){
    io.connect();
    io.on('connect', () => {
      this.setState({
        id: io.id
      })
    });
    io.on('controller_connected', (connected) => {
      console.log('controller connected')
      this.setState({
        controllerConnected: connected
      })
    });
    io.on('controller_state_change', (state) => {
      // console.log('controller state changed', state)
      this.setState({
        controllerState : state
      })
    });
    io.on('target_state_change', (state) => {
      this.setState({
        targetState : state
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
    io.on('game_started', () => {
      console.log("start game")
      this.setState({
        gameStarted: true
      })
    })
  }

  render(){

    let {
      id,
      runGame,
      controllerConnected,
      controllerState,
      targetState,
      health,
      gameStarted
    } = this.state;

    if(currentURL.indexOf('?id=') > 0){
      // render controller
      return(
        <Controller io={io} gameId={currentURL.split('?id=')[1]} gameStarted={gameStarted} health={health}/>
      )
    }else{
      // render game
      return(
        <Game io={io} id={id} runGame={runGame} gameStarted={gameStarted} controllerConnected={controllerConnected} controllerState={controllerState} targetState={targetState} health={health} />
      )
    }
  }
}

ReactDOM.render(
  <GameWrapper />,
  document.getElementById('app')
);
