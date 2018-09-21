import React, {Component} from 'react';

// components

import QRCode from 'qrcode.react'

// styles

import './styles/gameIntro.css';

class GameIntro extends Component {
    render(){

        let controllerConnected = (isConnected) => {
            if(isConnected){
                return(
                        <div>
                            <h2>Controller is Connected</h2>
                            <span>You can now play with your phone</span>
                        </div>
                    )
            }else{
                return(
                        <div>
                            <h2>Control with phone</h2>
                            <span>Scan the QR code below to connect to the game with your phone and take control</span>
                            {/* <QRCode level={"L"} fgColor={"#000000"} value={`https://orbitaldebris.herokuapp.com/?id=${this.props.id}`} /> */}
                            <QRCode level={"L"} fgColor={"#000000"} value={`http://localhost:5050/?id=${this.props.id}`} />
                        </div>
                    )
            }
        }
        return(
            <div id="gameIntro">
                <div className="game_into_container">
                    <div className="game_intro_container__block">
                        {controllerConnected(this.props.controllerConnected)}
                    </div>
                </div>
                <span className="vertical_align"></span>
            </div>
        )
    }
}
export default GameIntro