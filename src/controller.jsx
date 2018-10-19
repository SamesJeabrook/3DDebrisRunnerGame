import React, {Component} from 'react';

import OpenSocket from 'socket.io-client';
import ReactNipple from 'react-nipple';

import healthBar from './healthBar.jsx';

// styles

import './styles/controller.css';
import 'react-nipple/lib/styles.css';
import HealthBar from './healthBar.jsx';

import Crack1Img from './images/crack1.png';
import Crack2Img from './images/crack2.png';
import Crack3Img from './images/crack3.png';


class Controller extends Component {

    state = {
        controllerState: {},
        targetState: {},
        health: 100,
        controllerOrigPos: {},
        targetOrigPos: {}
    }
    setControllerState = this.setControllerState.bind(this);
    setTargetState = this.setTargetState.bind(this);
    deviceMotion = this.deviceMotion.bind(this);
    startGame = this.startGame.bind(this);

    setControllerState(data){
        let controllerState = this.state.controllerState;
        controllerState.x = data.position.x - this.state.controllerOrigPos.x;
        controllerState.y = data.position.y - this.state.controllerOrigPos.y;
        this.setState({
            controllerState: controllerState
        });
        this.emitControllerUpdates(controllerState);
    }

    setTargetState(data){
        let targetState = this.state.targetState;
        targetState.x = data.position.x - this.state.targetOrigPos.x;
        targetState.y = data.position.y - this.state.targetOrigPos.y;
        this.setState({
            targetState: targetState
        });
        this.emitTargetUpdates(targetState);
    }

    deviceMotion(e){
        let controllerState = this.state.controllerState;
        controllerState.rotate = e.accelerationIncludingGravity.y / 5;
        this.setState({
            constrollerState: controllerState
        });
        this.emitControllerUpdates(controllerState);
    }

    emitControllerUpdates(controllerState){
        this.props.io.emit('controller_state_change', controllerState);
    }

    emitTargetUpdates(targetState){
        this.props.io.emit('target_state_change', targetState);
    }

    startGame(){
        this.props.io.emit('start_game', true);
    }

    componentDidMount(){
        console.log(this.props.io);
        window.addEventListener('devicemotion', this.deviceMotion, false);
        this.props.io.connect();
        this.props.io.emit('controller_connect', this.props.gameId);
        const DirectionsController = document.querySelector('.controller-wrapper.left');
        const TargetController = document.querySelector('.controller-wrapper.right');
        this.setState({
            controllerOrigPos: {
                x: DirectionsController.offsetLeft,
                y: DirectionsController.offsetTop
            },
            targetOrigPos: {
                x: TargetController.offsetLeft,
                y: TargetController.offsetTop
            }
        });
        // lockOrientation = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.orientation.lock;
        // lockOrientation('landscape-primary');
    }

    render(){

        let {gameStarted, health} = this.props;

        return(
            <div id="Controller">

                {health < 75 ? <div className="crack1"><img src={Crack1Img} alt=""/></div> : null }
                {health < 50 ? <div className="crack2"><img src={Crack2Img} alt=""/></div> : null }
                {health < 25 ? <div className="crack3"><img src={Crack3Img} alt=""/></div> : null }

                { !gameStarted ? <div className="controller-start">
                    <button id="startGame" onClick={this.startGame}>Start</button>
                </div> : null }

                { health <= 0 ? <h1 className="game-over"> Game Over </h1> : null }

                <div className="controller-wrapper left">
                    <ReactNipple
                        options={{ mode: 'static',  multitouch: true,  position: { bottom: '0', left: '0' } }}
                        onMove={(evt, data) => this.setControllerState(data)}
                    />
                </div>
                <div className="controller-wrapper right">
                    <ReactNipple 
                        options={{ mode: 'static', multitouch: true, position: { bottom: '0', right: '0' } }}
                        onMove={(evt, data) => this.setTargetState(data)}
                    />
                </div>
                <HealthBar health={health}/>
            </div>
        )
    }
}
export default Controller