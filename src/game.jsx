import React, {Component} from 'react';

// components

import GameIntro from './gameIntro.jsx';
import GameOver from './gameOver.jsx';
import HealthBar from './healthBar.jsx';
import ControllerDisconnected from './controllerDisconnected.jsx';

import * as THREE from '../three.min.js';

import CrossHairImg from './images/crossHair.png';


let sceneWidth;
let sceneHeight;
let camera;
let scene;
let renderer;
let dom;
let sun;

let rollingGroundSphere;
let hero;
let crossHair;
let enemy;
let enemyDirection = 'right';
let wallVertObsticals;
let wallHorzObsticals;
let currentVertObsticals;
let currentHorzObsticals;
let collidableMeshList;
let particles;
let particleGeometry;
const particleCount=20;
let explosionPower =1.06;
const rollingSpeed = 0.007;
const worldRadius = 50;
const wallReleaseInterval=0.5;
let sphericalHelper;
let pathAnglesValues;
let clock;
let gameRunning = false;

let crossHairImg = new Image();
crossHairImg.src = CrossHairImg;

let bulletsMax = 50;
let bullets = [];
let enemyBullets = [];


class Game extends Component {

    state = {
        gameOver: false
    }

    
    runVertObsticalLogic = this.runVertObsticalLogic.bind(this);
    runHorzObsticalLogic = this.runHorzObsticalLogic.bind(this);
    handleGameRestart = this.handleGameRestart.bind(this);
    explosionLogic = this.explosionLogic.bind(this);
    addObsticals= this.addObsticals.bind(this);
    update = this.update.bind(this);


    runGame(){
        
        this.createScene();
        this.update();
    };

    createScene(){
        clock = new THREE.Clock;
        clock.start();
        wallVertObsticals = [];
        wallHorzObsticals = [];
        currentVertObsticals = [];
        currentHorzObsticals = [];
        collidableMeshList = [];
        sphericalHelper = new THREE.Spherical();
        pathAnglesValues = [1.47,1.52,1.57,1.62,1.67];
        sceneWidth = window.innerWidth;
        sceneHeight = window.innerHeight;
        scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2(0xf0fff0, 0.05);
        camera = new THREE.PerspectiveCamera(100, sceneWidth / sceneHeight, 0.1, 1000);
        camera.position.z = 6.5;
        camera.position.y = 30;
        renderer = new THREE.WebGLRenderer({alpha:true});
        renderer.setClearColor(0xfffafa, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(sceneWidth, sceneHeight);
        dom = document.getElementById('gameWrapper');
        dom.appendChild(renderer.domElement)
        this.createHorzObsticals();
        this.createVertObsticals();
        this.createHero();
        this.createWorld();
        this.createLight();
        this.addExplosion();
        this.createEnemy();
        this.addEnemyAi();
        this.enemyShot(hero.position);
        crossHairImg.onLoad = this.createCrossHair();
        

        // camera.position.z = 6.5;
        // camera.position.y = 30; //27.5;
        // camera.lookAt(scene.position)

        window.addEventListener('resize', this.onWindowResize, false);
    }

    createWorld(){
        var sides=40;
        var tiers=40;
        var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
        var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xfffafa ,shading:THREE.FlatShading /*wireframe: true */} )
    
        rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        rollingGroundSphere.recieveShadow = true;
        rollingGroundSphere.castShadow = false;
        rollingGroundSphere.rotation.z = -Math.PI/2;

        scene.add(rollingGroundSphere);
        rollingGroundSphere.position.y = -24;
        rollingGroundSphere.position.z = 2;
        this.createBoundingWalls();
    }

    createLight(){
        var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.9);
        scene.add(hemisphereLight);

        sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
        sun.position.set(12,6,-1);
        sun.castShadow = true;
        scene.add(sun);

        sun.shadow.mapSize.width = 256;
        sun.shadow.mapSize.height = 256;
        sun.shadow.camera.near = 0.5;
        sun.shadow.camera.far = 50.;
    }

    addObsticals(){
        var options = [0,1,2,3,4]
        var lane = Math.floor(Math.random()*5);
        this.addVertWall(lane);
        options.splice(lane, 1);
        if(Math.random()>0.5){
            lane=Math.floor(Math.random()*2);
            this.addVertWall(options[lane])
        }

        var min = 0;
        var max = 9;
        var heightInt = Math.floor(Math.random() * (max - min) + min);
        this.addHorzWall(heightInt);
    }

    createVertObsticals(){
        var maxObsticals = 50;
        var newVertObstical;
        for(var i=0; i<maxObsticals; i++){
            newVertObstical = this.createVertWall();
            wallVertObsticals.push(newVertObstical);
        }
    }

    createHorzObsticals(){
        var maxObsticals = 5;
        var newHorzObstical;
        for(var i=0; i<maxObsticals; i++){
            newHorzObstical = this.createHorzWall();
            wallHorzObsticals.push(newHorzObstical);
        }
    }

    createBoundingWalls(){
        var areaAngle = 1.68+Math.random()*0.1 
        var leftWallGeo = new THREE.BoxGeometry(10, 50, 250);
        var leftWallMat = new THREE.MeshStandardMaterial({color: 0x0fffafa, wireframe: false});
        var leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
        var leftWallHelper = new THREE.Spherical();
        leftWallHelper.set(worldRadius-0.3, areaAngle, 1)
        leftWall.recieveShadow = true;
        leftWall.castShadow = true;
        leftWall.position.y = 20;
        leftWall.position.x = -20;
        scene.add(leftWall)

        var areaAngle = 1.46-Math.random()*0.1
        var rightWallGeo = new THREE.BoxGeometry(10, 50, 250);
        var rightWallMat = new THREE.MeshStandardMaterial({color: 0x0fffafa});
        var rightWall = new THREE.Mesh(rightWallGeo, rightWallMat);
        var rightWallHelper = new THREE.Spherical();
        rightWallHelper.set(worldRadius-0.3, areaAngle, 5)
        rightWall.recieveShadow = true;
        rightWall.castShadow = true;
        rightWall.position.y = 20;
        rightWall.position.x = 20;
        scene.add(rightWall)
    }

    createVertWall(){
        var wallGeo = new THREE.BoxGeometry(1,10,2);
        var wallMat = new THREE.MeshStandardMaterial({color: 0xfffafa})
        var wall = new THREE.Mesh(wallGeo, wallMat);
        wall.recieveShadow = false;
        wall.castShadow = true;
        wall.position.y = 0.9;
        wall.health = 50;
        // wall.rotation.y = (Math.random() * (Math.PI));
        return wall;
    }

    createHorzWall(){
        var wallGeo = new THREE.BoxGeometry(2,10,1);
        var wallMat = new THREE.MeshStandardMaterial({color: 0xfffafa})
        var wall = new THREE.Mesh(wallGeo, wallMat);
        wall.recieveShadow = false;
        wall.castShadow = true;
        wall.position.x = 52; // handles how high of the ground this needs to be, no less than 50 no more than 60
        wall.rotation.x = 110;
        wall.health = 50;
        return wall;
    }

    createCrossHair(){
        var texture = new THREE.Texture();
        texture.image = crossHairImg;
        texture.needsUpdate = true;
        var material = new THREE.SpriteMaterial({ map : texture });
        crossHair = new THREE.Sprite( material );
        scene.add( crossHair );
        crossHair.position.set(0,30,0);
    }

    createEnemy(){
        var enemyGeo = new THREE.BoxGeometry(2,1,2);
        var enemyMat = new THREE.MeshStandardMaterial({color: 0xFF0000})
        enemy = new THREE.Mesh(enemyGeo, enemyMat);
        enemy.position.y = 30;
        enemy.position.x = -7;
        enemy.position.z = -7;
        enemy.health = 100;
        enemy.name="Bad Guy"
        scene.add( enemy )
    }

    setEnemyDirection(){
        const Directions = ['left', 'right', 'up', 'down'];
        const Direction = Directions[Math.floor(Math.random() * Directions.length)]
        return (Direction);
    }

    addEnemyAi(){
        setInterval(() => {
            enemyDirection = this.setEnemyDirection();
        }, 3000);
    }

    drawRaycastLine(raycaster) {
        let material = new THREE.LineBasicMaterial({
          color: 0xff0000,
          linewidth: 10
        });
        let geometry = new THREE.Geometry();
        let startVec = new THREE.Vector3(
          raycaster.ray.origin.x,
          raycaster.ray.origin.y,
          raycaster.ray.origin.z);
    
        let endVec = new THREE.Vector3(
          raycaster.ray.direction.x,
          raycaster.ray.direction.y,
          raycaster.ray.direction.z);
        
        // could be any number
        endVec.multiplyScalar(5000);
        
        // get the point in the middle
        let midVec = new THREE.Vector3();
        midVec.lerpVectors(startVec, endVec, 0.5);
    
        geometry.vertices.push(startVec);
        geometry.vertices.push(midVec);
        geometry.vertices.push(endVec);
    
    
        let line = new THREE.Line(geometry, material);
        scene.add(line);
      }

    addVertWall(row){
        var newWall;
        if(wallVertObsticals.length == 0) return;
        newWall = wallVertObsticals.pop();
        newWall.visible = true;
        currentVertObsticals.push(newWall);
        sphericalHelper.set( worldRadius+4, pathAnglesValues[row], -rollingGroundSphere.rotation.x+4 );
        
        newWall.position.setFromSpherical( sphericalHelper );
        var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
        var wallVector = newWall.position.clone().normalize();
        newWall.quaternion.setFromUnitVectors(wallVector,rollingGroundVector);
        collidableMeshList.push(newWall);
        // newWall.rotation.x += (Math.random() * (2*Math.PI/10)) +- Math.PI/10;
        rollingGroundSphere.add(newWall);

        var horzWall = this.createHorzWall();
        rollingGroundSphere.add(horzWall);
    }

    addHorzWall(){
        var newWall;
        var baseHeight = 50;
        if(wallHorzObsticals.length == 0) return;
        newWall = wallHorzObsticals.pop();
        newWall.visible = true;
        currentHorzObsticals.push(newWall);
        sphericalHelper.set( worldRadius+8, 20, -rollingGroundSphere.rotation.x+4 );
        newWall.position.setFromSpherical( sphericalHelper );
        var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
        var wallVector = newWall.position.clone().normalize();
        newWall.quaternion.setFromUnitVectors(wallVector,rollingGroundVector);
        newWall.position.y = 0
        newWall.rotation.x = 110;
        newWall.rotation.z = 10;
        collidableMeshList.push(newWall);
        rollingGroundSphere.add(newWall);
    }

    addExplosion(){
        particleGeometry = new THREE.Geometry();
        for (var i = 0; i < particleCount; i++){
            var vertex = new THREE.Vector3();
            particleGeometry.vertices.push(vertex);
        }
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: 0xff0000,
            size: 0.2
        });
        particles = new THREE.Points(particleGeometry, pMaterial);
        scene.add(particles);
        particles.visible = false;
    }

    createHero(){
        var heroGeo = new THREE.BoxGeometry(1.5,0.2,0.5);
        var heroMat = new THREE.MeshStandardMaterial({color: 0xff0000});
        hero = new THREE.Mesh(heroGeo, heroMat);
        hero.recieveShadow= false;
        hero.castShadow = true;
        hero.name = "Hero"
        scene.add( hero );
        hero.position.y = 50; /*28.5*/
        hero.position.z = 1.5;
        hero.position.x = 0;
    }

    explode(object){
        particles.position.y = object.position.y;
        particles.position.z = object.position.z;
        particles.position.x = object.position.x;
        for(var i = 0; i < particleCount; i++){
            var vertex = new THREE.Vector3();
            vertex.x = -0.2+Math.random() * 0.4;
            vertex.y = -0.2+Math.random() * 0.4 ;
            vertex.z = -0.2+Math.random() * 0.4;
            particleGeometry.vertices[i] = vertex;
        }
        explosionPower = 1.07;
        particles.visible = true;
    }

    update(){
        // animate
        rollingGroundSphere.rotation.x += rollingSpeed;
        
        var delta = clock.getDelta();
        var movingDistance = delta;

        let {controllerState, targetState} = this.props;

        // controller state
        if(controllerState.y > 0){ //left
            if(hero.position.y < 32){
                hero.position.y += movingDistance * (Math.abs(controllerState.y)/5)
            }
        }
        if (controllerState.y < 0){ // right
            if(hero.position.y > 26.5){
                hero.position.y -= movingDistance * (Math.abs(controllerState.y)/5)
            }
        }

        if(controllerState.x > 0){
            if(hero.position.x < 6){
                hero.position.x += movingDistance * (Math.abs(targetState.x)/5)
            }
        }

        if(controllerState.x < 0){
            if(hero.position.x > -6){
                hero.position.x -= movingDistance * (Math.abs(targetState.x)/5)
            }
        }
        if(controllerState && controllerState.rotate){
            hero.rotation.z = controllerState.rotate;
        }

        // Target State
        if(targetState.y > 0){ //left
            if(crossHair.position.y < 32){
                crossHair.position.y += movingDistance * (Math.abs(targetState.y)/5)
            }
        }
        if (targetState.y < 0){ // right
            if(crossHair.position.y > 26.5){
                crossHair.position.y -= movingDistance * (Math.abs(targetState.y)/5)
            }
        }

        if(targetState.x > 0){
            if(crossHair.position.x < 6){
                crossHair.position.x += movingDistance * (Math.abs(targetState.x)/5)
            }
        }

        if(targetState.x < 0){
            if(crossHair.position.x > -6){
                crossHair.position.x -= movingDistance * (Math.abs(targetState.x)/5)
            }
        }

        if(enemyDirection == 'left' && enemy.position.x > -6){
            enemy.position.x -= movingDistance + 0.05;
        }else if(enemyDirection == 'right' && enemy.position.x < 6){
            enemy.position.x += movingDistance + 0.05;
        }else if(enemyDirection == 'up' && enemy.position.y < 32){
            enemy.position.y += movingDistance + 0.05;
        }else if(enemyDirection == 'down' && enemy.position.y > 26.5){
            enemy.position.y -= movingDistance + 0.05;
        }else{
            enemyDirection = this.setEnemyDirection();
        }

        // collisions with walls for hero

        for (var vertexIndex = 0; vertexIndex < hero.geometry.vertices.length; vertexIndex++){      
            var localVertex = hero.geometry.vertices[vertexIndex].clone();
            var globalVertex = hero.matrix.multiplyVector3(localVertex);
            var directionVector = globalVertex.sub( hero.position );

            var ray = new THREE.Raycaster( hero.position, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( collidableMeshList );
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
            {
                console.log('BANG!')
                this.explode(hero);
                this.props.io.emit('update_health', this.props.health -1);
            }
        }

        var vector = new THREE.Vector3(crossHair.position.x, crossHair.position.y, crossHair.position.z);
        var targetRay = new THREE.Raycaster(camera.position, vector.sub(camera.position).normalize());
        this.drawRaycastLine(targetRay);
        var enemyHit = targetRay.intersectObject( enemy );
        // var wallHit = targetRay.intersectObjects( collidableMeshList );
        scene.updateMatrixWorld();

        if ( enemyHit.length > 0 ) {
            this.shoot(enemyHit[0].point);
        }

        

        enemyBullets.forEach(enemyBullet => {
            enemyBullet.position.addScaledVector(enemyBullet.userData.direction, enemyBullet.userData.speed * delta);
            var bulletBB = new THREE.Box3().setFromObject(enemyBullet);
            var heroBB = new THREE.Box3().setFromObject(hero);
            var bulletCollision = bulletBB.isIntersectionBox(heroBB);
            
            if(bulletCollision){
                enemyBullets.splice(enemyBullets.indexOf(enemyBullet), 1);
                scene.remove(enemyBullet);
                this.explode(hero)
                this.props.io.emit('update_health', this.props.health -5);
                console.log('Hit Hero!', this.props.health);
            }
        })

        bullets.forEach(bullet => {
            // bullet speed and direction
            bullet.position.addScaledVector(bullet.userData.direction, bullet.userData.speed * delta);
            // bullet collision
            var bulletBB = new THREE.Box3().setFromObject(bullet);
            var enemyBB = new THREE.Box3().setFromObject(enemy);
            var bulletCollision = bulletBB.isIntersectionBox(enemyBB);
            
            if(bulletCollision && scene.getObjectByName('Bad Guy')){
                bullets.splice(bullets.indexOf(bullet), 1);
                scene.remove(bullet);
                this.explode(enemy)
                enemy.health -= 5;
                console.log('Hit Enemy!', enemy.health);
            }
        });

        // remove enemy when dead
        if(enemy.health <= 0){
            scene.remove(enemy);
        }
        
        if(clock.getElapsedTime()>wallReleaseInterval){
            clock.start();
            this.addObsticals();
        }

        this.runVertObsticalLogic();
        this.runHorzObsticalLogic();
        this.explosionLogic();
        
        renderer.render(scene, camera);
        
        
        var game = requestAnimationFrame(this.update);
        if(this.props.health <= 0){
            cancelAnimationFrame( game );
            this.setState({
                gameOver: true
            });
        }
    }

    runVertObsticalLogic(){
        var oneWall;
        var wallPos = new THREE.Vector3();
        var wallsToRemove = [];
        currentVertObsticals.forEach(function(elem, i){
            oneWall = currentVertObsticals[i];
            wallPos.setFromMatrixPosition(oneWall.matrixWorld);
            if(wallPos.z > 6 && oneWall.visible){
                wallsToRemove.push(oneWall);
            }
        });
        var fromWhere;
        wallsToRemove.forEach(function(elem, i){
            oneWall = wallsToRemove[i];
            fromWhere=currentVertObsticals.indexOf(oneWall);
            currentVertObsticals.splice(fromWhere, 1);
            wallVertObsticals.push(oneWall);
            oneWall.visible=false;
            collidableMeshList.splice(collidableMeshList.indexOf(oneWall));
        })
    }

    runHorzObsticalLogic(){
        var oneWall;
        var wallPos = new THREE.Vector3();
        var wallsToRemove = [];
        currentHorzObsticals.forEach(function(elem, i){
            oneWall = currentHorzObsticals[i];
            wallPos.setFromMatrixPosition(oneWall.matrixWorld);
            if(wallPos.z > 6 && oneWall.visible){
                wallsToRemove.push(oneWall);
            }
        });
        var fromWhere;
        wallsToRemove.forEach(function(elem, i){
            oneWall = wallsToRemove[i];
            fromWhere=currentHorzObsticals.indexOf(oneWall);
            currentHorzObsticals.splice(fromWhere, 1);
            wallHorzObsticals.push(oneWall);
            oneWall.visible=false;
            collidableMeshList.splice(collidableMeshList.indexOf(oneWall));
        })
    }

    explosionLogic(){
        if(!particles.visible) return;
        for(var i=0; i < particleCount; i++){
            particleGeometry.vertices[i].multiplyScalar(explosionPower);
        }
        if(explosionPower>1.005){
            explosionPower-=0.001;
        }else{
            particles.visible=false;
        }
        particleGeometry.verticesNeedUpdate = true;
    }

    shoot(target){
        var bulletGeo = new THREE.SphereGeometry(0.05, 8, 8);
        var bulletMat = new THREE.MeshBasicMaterial({color: 0Xff0000})
        var bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.recieveShadow = false;
        bullet.castShadow = true;
        bullet.position.copy(hero.position);
        bullet.userData.direction = target.sub(hero.position).normalize();
        bullet.userData.speed = 50;
        if(bullets.length < 10){
            bullets.push(bullet);
            scene.add(bullet);
            setTimeout(() => {
                scene.remove(bullet);
                bullets.splice(bullets.indexOf(bullet), 1)
            }, 10000);
        }
    }

    enemyShot(target){
        setInterval(() => {
            var targetClone = target.clone()
            var enemyBulletGeo = new THREE.SphereGeometry(0.05, 8, 8);
            var enemyBulletMat = new THREE.MeshBasicMaterial({color: 0Xff0000})
            var enemyBullet = new THREE.Mesh(enemyBulletGeo, enemyBulletMat);
            enemyBullet.recieveShadow = false;
            enemyBullet.castShadow = true;
            enemyBullet.position.copy(enemy.position);
            console.log(enemyBullet.position)
            let point = hero.position.clone();
            enemyBullet.userData.direction = targetClone.sub(enemy.position).normalize();
            enemyBullet.userData.speed = 20;
            enemyBullets.push(enemyBullet);
            scene.add(enemyBullet);
            setTimeout(() => {
                scene.remove(enemyBullet);
                enemyBullets.splice(enemyBullets.indexOf(enemyBullet), 1)
            }, 10000);
        }, 500)
    }

    onWindowResize(){
        sceneHeight = window.innerHeight;
        sceneWidth = window.innerWidth;
        renderer.setSize(sceneWidth, sceneHeight);
        camera.aspect = sceneWidth/sceneHeight;
        camera.updateProjectionMatrix();
    }

    componentDidMount(){
        this.props.io.emit('game_connect')
        this.runGame();
    }

    handleGameRestart(e){
        e.preventDefault();
        health = 100;
        hero.position.y = 28.5;
        this.update();
    }

    render(){
        let {id,
            controllerConnected,
            health,
            gameStarted
        } = this.props;
        let {gameOver} = this.state;

        const renderGameIntro = () => {
            if(gameStarted && !gameRunning){
                hero.position.y = 28.5;
                gameRunning = true;
            }
            if(gameStarted){
                return null;
            }
            // return <GameIntro id={id} controllerConnected={controllerConnected}/>;
            return null
        }
        return(
            <div id="GameContainer">
                {gameOver ? <GameOver /> : null}
                {id ? renderGameIntro() : null}
                <HealthBar health={health} />
                {!controllerConnected && gameStarted ? <ControllerDisconnected /> : null}
                <div id="gameWrapper"></div>
            </div>
        )
    }
}
export default Game;