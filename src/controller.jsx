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
        controllerState: {}
    }

    setControllerStateLeftRight = this.setControllerStateLeftRight.bind(this);
    setControllerStateUpDown = this.setControllerStateUpDown.bind(this);

    setControllerStateUpDown(posY){
        let controllerState = this.state.controllerState;
        controllerState.y = posY
        this.setState({
            controllerState: controllerState
        });
        this.emitUpdates(controllerState)
        console.log(this.state.controllerState);
    }

    setControllerStateLeftRight(posX){
        let controllerState = this.state.controllerState;
        controllerState.x = posX
        this.setState({
            controllerState: controllerState
        });
        this.emitUpdates(controllerState)
        console.log(this.state.controllerState);
    }

    deviceMotion(e){
        let controllerState = this.state.controllerState;
        controllerState.rotate = e.accelerationIncludingGravity.y / 100;
        this.setState({
            constrollerState: controllerState
        });
        this.emitUpdates(controllerState);
        console.log(this.state.controllerState)
    }

    emitUpdates(controllerState){
        this.props.io.emit('controller_state_change', controllerState);
    }

    componentDidMount(){
        console.log(this.props.io);
        window.addEventListener('devicemotion', this.deviceMotion, false);
        this.props.io.connect();
        this.props.io.emit('controller_connect', this.props.gameId)
    }

    render(){

        return(
            <div id="Controller">
                <div className="controller-instructions">
                    <p>Use the control sticks to move up-down, left-right. Tilt the phone to roll.</p>
                </div>

                <div className="controller-wrapper left">
                    <ReactNipple
                        options={{ mode: 'static', lockY:true, multitouch: true,  position: { bottom: '10%', left: '20%' } }}
                        onMove={(evt, data) => this.setControllerStateLeftRight(data.position.x)}
                    />
                </div>
                <div className="controller-wrapper right">
                    <ReactNipple 
                        options={{ mode: 'static', lockX:true, multitouch: true, position: { bottom: '10%', right: '20%' } }}
                        onMove={(evt, data) => this.setControllerStateUpDown(data.position.y)}
                    />
                </div>
                <HealthBar health={this.props.health}/>
            </div>
        )
    }
}
export default Controller