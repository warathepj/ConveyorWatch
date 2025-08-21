import * as THREE from 'three';
import { AxesHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const axesHelper = new AxesHelper( 5 ); // 5 units long axes
scene.add( axesHelper );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(5, 5, 5); // Initial camera position
camera.lookAt(0, 0, 0); // Point camera at the origin

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls( camera, renderer.domElement );
controls.target.set(0, 0, 0); // Set orbit target to the origin
controls.enableZoom = false; // Disable default OrbitControls zoom

// Custom scroll zoom logic
renderer.domElement.addEventListener('wheel', (event) => {
    event.preventDefault();

    const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(event.clientY / window.innerHeight) * 2 + 1;

    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);

    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.dot(dir) / dir.dot(dir);
    const point = camera.position.clone().add(dir.multiplyScalar(distance));

    const zoomFactor = 1.0 + (event.deltaY * -0.001); // Adjust zoom speed

    camera.position.sub(point).multiplyScalar(zoomFactor).add(point);
    controls.target.sub(point).multiplyScalar(zoomFactor).add(point);

    controls.update();
}, false);

const geometry = new THREE.BoxGeometry(60, .5, 4);
const material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
const cube = new THREE.Mesh( geometry, material );
scene.add( cube );
cube.position.set(-20, 0, 0);

// Green cube
// Function to create a green cube
function createGreenCube() {
    const greenCubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    const greenCubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00FF00 });
    const greenCube = new THREE.Mesh(greenCubeGeometry, greenCubeMaterial);
    greenCube.position.set(-45, 0.5, 0);
    scene.add(greenCube);
    return greenCube;
}

const activeGreenCubes = [];

let previousTime = 0;
const velocity = 5; // units per second, for cube movement
let conveyorSpeed = 0; // Default value, will be updated by server (products per minute)
let spawnInterval = Infinity; // seconds, initially no spawning
let lastSpawnTime = 0; // To track when the last cube was spawned

// Function to fetch conveyor speed from the server
async function fetchConveyorSpeed() {
    try {
        const response = await fetch('http://localhost:3000/conveyorSpeed');
        const data = await response.json();
        const newConveyorSpeed = data.conveyorSpeed;
        const conveyorSpeedDisplay = document.getElementById('conveyor-speed-display');

        if (!isNaN(newConveyorSpeed) && newConveyorSpeed >= 0) {
            conveyorSpeed = newConveyorSpeed;
            // Assuming conveyorSpeed directly relates to cubes per minute for spawning
            // If conveyorSpeed is 0, spawnInterval is Infinity (no spawning)
            // Otherwise, 60 units per minute / conveyorSpeed = seconds per unit
            spawnInterval = conveyorSpeed === 0 ? Infinity : 60 / conveyorSpeed;
            console.log(`Fetched conveyor speed: ${conveyorSpeed}, Spawn interval: ${spawnInterval} seconds`);
            if (conveyorSpeedDisplay) {
                conveyorSpeedDisplay.textContent = `Conveyor Speed: ${conveyorSpeed}`;
            }
        } else {
            console.warn('Invalid conveyorSpeed received from server:', newConveyorSpeed);
        }
    } catch (error) {
        console.error('Error fetching conveyor speed:', error);
        const conveyorSpeedDisplay = document.getElementById('conveyor-speed-display');
        if (conveyorSpeedDisplay) {
            conveyorSpeedDisplay.textContent = `Conveyor Speed: Error`;
        }
    }
}

// Fetch data every 2 seconds
setInterval(fetchConveyorSpeed, 2000);

// Initial fetch
fetchConveyorSpeed();

function animate(currentTime) {
    requestAnimationFrame(animate);

    currentTime *= 0.001; // convert to seconds
    const deltaTime = currentTime - previousTime;
    previousTime = currentTime;

    // Only spawn if conveyorSpeed is greater than 0
    if (conveyorSpeed > 0) {
        // Initialize lastSpawnTime on the first frame or if it was reset
        if (lastSpawnTime === 0) {
            lastSpawnTime = currentTime;
            activeGreenCubes.push(createGreenCube()); // Spawn the first cube immediately
            console.log('First green cube spawned!');
        }

        // Continuous spawn logic
        if ((currentTime - lastSpawnTime) >= spawnInterval) {
            activeGreenCubes.push(createGreenCube());
            lastSpawnTime = currentTime; // Reset timer for next spawn
            console.log('New green cube spawned!');
        }
    }

    // Update and manage all active green cubes
    for (let i = activeGreenCubes.length - 1; i >= 0; i--) {
        const cube = activeGreenCubes[i];
        // Only move cubes if conveyorSpeed is greater than 0 (meaning the conveyor is active)
        if (conveyorSpeed > 0) {
            cube.position.x += velocity * deltaTime;
        }

        // Check if the green cube has reached or passed x = 10
        if (cube.position.x >= 10 && cube.parent) {
            scene.remove(cube); // Remove from scene
            cube.geometry.dispose(); // Dispose geometry
            cube.material.dispose(); // Dispose material
            activeGreenCubes.splice(i, 1); // Remove from array
            console.log('Green cube destroyed!');
        }
    }

    controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
    renderer.render(scene, camera);
}

requestAnimationFrame(animate);
