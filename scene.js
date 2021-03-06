var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var ground;

var rollingGroundSphere;
var hero;
var wallVertObsticals;
var wallHorzObsticals;
var currentVertObsticals;
var currentHorzObsticals;
var collidableMeshList;
var particles;
var particleGeometry;
var particleCount=20;
var explosionPower =1.06;
var rollingSpeed = 0.007;
var worldRadius = 50;
var wallReleaseInterval=0.5;
var sphericalHelper;
var pathAnglesValues;
var heroBaseY = 1.8;
var clock;
var debris;
var health = 100;
var game;

var keyboard = new THREEx.KeyboardState();

gameScene ={
    createScene : function(){
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
        

        camera.position.z = 6.5;
        camera.position.y = 30; //27.5;
        // camera.lookAt(scene.position)

        window.addEventListener('resize', this.onWindowResize, false);
    },

    createWorld : function(){
        var sides=40;
        var tiers=40;
        var sphereGeometry = new THREE.SphereGeometry( worldRadius, sides,tiers);
        var sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xfffafa ,shading:THREE.FlatShading /*wireframe: true */} )
    
        rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        rollingGroundSphere.recieveShadow = true;
        rollingGroundSphere.castShadow = false;
        rollingGroundSphere.rotation.z = -Math.PI/2;
        // rollingGroundSphere.rotation.y = -Math.PI/2;

        scene.add(rollingGroundSphere);
        rollingGroundSphere.position.y = -24;
        rollingGroundSphere.position.z = 2;
        this.createBoundingWalls();
        // this.addWorldWalls();
    },

    createLight : function(){
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
    },

    addObsticals : function (){
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
    },

    createVertObsticals : function(){
        var maxObsticals = 50;
        var newVertObstical;
        for(var i=0; i<maxObsticals; i++){
            newVertObstical = this.createVertWall();
            wallVertObsticals.push(newVertObstical);
        }
    },

    createHorzObsticals : function(){
        var maxObsticals = 5;
        var newHorzObstical;
        for(var i=0; i<maxObsticals; i++){
            newHorzObstical = this.createHorzWall();
            wallHorzObsticals.push(newHorzObstical);
        }
    },

    createBoundingWalls : function(){
        areaAngle = 1.68+Math.random()*0.1 
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

        areaAngle = 1.46-Math.random()*0.1
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

    },

    createVertWall : function(){
        var wallGeo = new THREE.BoxGeometry(1,10,2);
        var wallMat = new THREE.MeshStandardMaterial({color: 0xfffafa})
        var wall = new THREE.Mesh(wallGeo, wallMat);
        wall.recieveShadow = false;
        wall.castShadow = true;
        wall.position.y = 0.9;
        // wall.rotation.y = (Math.random() * (Math.PI));
        return wall;
    },

    createHorzWall : function(){
        var wallGeo = new THREE.BoxGeometry(2,10,1);
        var wallMat = new THREE.MeshStandardMaterial({color: 0xfffafa})
        var wall = new THREE.Mesh(wallGeo, wallMat);
        wall.recieveShadow = false;
        wall.castShadow = true;
        wall.position.x = 52; // handles how high of the ground this needs to be, no less than 50 no more than 60
        wall.rotation.x = 110;
        return wall;
    },

    addVertWall : function(row){
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
    },

    addHorzWall : function(heightInt){
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
        // newWall.rotation.y = 10;

        // newWall.position.x = baseHeight + heightInt;
        // newWall.position.z = Math.random() * 1000;
        // console.log('added Horz wall to array' ,currentHorzObsticals);
        rollingGroundSphere.add(newWall);
    },

    addExplosion(){
        particleGeometry = new THREE.Geometry();
        for (var i = 0; i < particleCount; i++){
            var vertex = new THREE.Vector3();
            particleGeometry.vertices.push(vertex);
        }
        var pMaterial = new THREE.ParticleBasicMaterial({
            color: 0xfffafa,
            size: 0.2
        });
        particles = new THREE.Points(particleGeometry, pMaterial);
        scene.add(particles);
        particles.visible = false;
    },

    createHero : function(){
        var heroGeo = new THREE.BoxGeometry(1.5,0.2,0.5);
        var heroMat = new THREE.MeshStandardMaterial({color: 0xff0000});
        hero = new THREE.Mesh(heroGeo, heroMat);
        hero.recieveShadow= false;
        hero.castShadow = true;
        scene.add(hero);
        hero.position.y = 50; /*28.5*/
        hero.position.z = 1.5;
        hero.position.x = 0;
    },

    explode: function(){
        particles.position.y = hero.position.y;
        particles.position.z = hero.position.z;
        particles.position.x = hero.position.x;
        for(var i = 0; i < particleCount; i++){
            var vertex = new THREE.Vector3();
            vertex.x = -0.2+Math.random() * 0.4;
            vertex.y = -0.2+Math.random() * 0.4 ;
            vertex.z = -0.2+Math.random() * 0.4;
            particleGeometry.vertices[i] = vertex;
        }
        explosionPower = 1.07;
        particles.visible = true;
    },

    update : function(){
        // animate
        rollingGroundSphere.rotation.x += rollingSpeed;
        
        var delta = clock.getDelta();
        var movingDistance = 10 * delta;
        if(keyboard.pressed('left')){ //left
            if(hero.position.x > -6){
                hero.position.x -= movingDistance
            }
        }
        if (keyboard.pressed('right')){ // right
            if(hero.position.x < 6){
                hero.position.x += movingDistance
            }
        }
        if(keyboard.pressed('up')){ // up
            if(hero.position.y < 32){
                hero.position.y += movingDistance
            }
        }
        if (keyboard.pressed('down')){ // down
            if(hero.position.y > 26.5){
                hero.position.y -= movingDistance
            }
        }if(keyboard.pressed('A')){
            hero.rotation.z += movingDistance
        }
        if(keyboard.pressed('D')){
            hero.rotation.z -= movingDistance
        }

        for (var vertexIndex = 0; vertexIndex < hero.geometry.vertices.length; vertexIndex++){      
            var localVertex = hero.geometry.vertices[vertexIndex].clone();
            var globalVertex = hero.matrix.multiplyVector3(localVertex);
            var directionVector = globalVertex.sub( hero.position );

            var ray = new THREE.Raycaster( hero.position, directionVector.clone().normalize() );
            var collisionResults = ray.intersectObjects( collidableMeshList );
            if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
            {
                console.log('BANG!')
                health = health -1;
                console.log(health);
                gameScene.explode();
                var healthBar = document.querySelector('#healthBarContainer span');
                healthBar.style.width = health+'%';
            }
        }
        

        if(clock.getElapsedTime()>wallReleaseInterval){
            clock.start();
            gameScene.addObsticals();
        }

        gameScene.runVertObsticalLogic();
        gameScene.runHorzObsticalLogic();
        gameScene.explosionLogic();
        
        renderer.render(scene, camera);
        
        
        var game = requestAnimationFrame(gameScene.update);
        if(health <= 0){
            cancelAnimationFrame( game );
            document.getElementById('gameOver').style.display = 'block';
        }
    },

    gameOver: function() {
        if(health <= 0){
            cancelAnimationFrame( game );
        }
    },

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
        })
    
    },

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
        })
    
    },

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
    },

    onWindowResize : function() {
        //resize & align
        sceneHeight = window.innerHeight;
        sceneWidth = window.innerWidth;
        renderer.setSize(sceneWidth, sceneHeight);
        camera.aspect = sceneWidth/sceneHeight;
        camera.updateProjectionMatrix();
    }

}

gameScene.createScene();
gameScene.update();

document.getElementById('play').onclick = function() {
    hero.position.y = 28.5;
    document.getElementById('gameInto').style.display = 'none'
}
document.getElementById('playAgain').onclick = function() {
    document.getElementById('gameOver').style.display = 'none'
    health = 100;
    hero.position.y = 28.5;
    gameScene.update();
}