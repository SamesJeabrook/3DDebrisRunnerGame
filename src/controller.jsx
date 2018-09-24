import React, {Component} from 'react';

import OpenSocket from 'socket.io-client';
import ReactNipple from 'react-nipple';

import healthBar from './healthBar.jsx';

// styles

import './styles/controller.css';
import 'react-nipple/lib/styles.css';
import HealthBar from './healthBar.jsx';


class Controller extends Component {

    state = {
        controllerState: {},
        health: 100,
        controllerOrigPos: {}
    }

    setControllerStateLeftRight = this.setControllerStateLeftRight.bind(this);
    setControllerStateUpDown = this.setControllerStateUpDown.bind(this);
    setControllerState = this.setControllerState.bind(this);
    deviceMotion = this.deviceMotion.bind(this);
    startGame = this.startGame.bind(this);

    setControllerStateUpDown(distance, direction){
        let controllerState = this.state.controllerState;
        controllerState.distanceY = distance;
        controllerState.directionY = direction;
        console.log()
        
        this.setState({
            controllerState: controllerState
        });
        this.emitUpdates(controllerState)
    }

    setControllerStateLeftRight(distance, direction){
        let controllerState = this.state.controllerState;
        controllerState.distanceX = distance;
        controllerState.directionX = direction;
        this.setState({
            controllerState: controllerState
        });
        this.emitUpdates(controllerState)
    }

    setControllerState(data){
        let controllerState = this.state.controllerState;
        controllerState.x = data.position.x - this.state.controllerOrigPos.x;
        controllerState.y = data.position.y - this.state.controllerOrigPos.y;
        console.log(controllerState);
        this.setState({
            controllerState: controllerState
        });
        this.emitUpdates(controllerState);
    }

    deviceMotion(e){
        let controllerState = this.state.controllerState;
        controllerState.rotate = e.accelerationIncludingGravity.y / 5;
        this.setState({
            constrollerState: controllerState
        });
        this.emitUpdates(controllerState);
    }

    emitUpdates(controllerState){
        this.props.io.emit('controller_state_change', controllerState);
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
        this.setState({
            controllerOrigPos: {
                x: DirectionsController.offsetLeft,
                y: DirectionsController.offsetTop
            }
        });
        // lockOrientation = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation || screen.orientation.lock;
        // lockOrientation('landscape-primary');
    }

    render(){

        return(
            <div id="Controller">
                <div className="controller-instructions">
                    <p>Use the control sticks to move up-down, left-right. Tilt the phone to roll.</p>
                </div>

                <div className="controller-start">
                    <button id="startGame" onClick={this.startGame}>Start</button>
                </div>

                <div className="controller-wrapper left">
                    <ReactNipple
                        options={{ mode: 'static',  multitouch: true,  position: { bottom: '0', left: '0' } }}
                        onMove={(evt, data) => this.setControllerState(data)}
                    />
                </div>
                <div className="controller-wrapper right">
                    {/* <ReactNipple 
                        options={{ mode: 'static', lockX:true, multitouch: true, position: { bottom: '10%', right: '20%' } }}
                        onMove={(evt, data) => this.setControllerStateLeftRight(data.distance, data.direction.x)}
                        onEnd={(evt, data) => console.log(data)}
                    /> */}
                </div>
                <HealthBar health={this.props.health}/>
            </div>
        )
    }
}
export default Controller