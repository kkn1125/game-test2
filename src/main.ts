import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import checkboard from "../assets/images/checkboard.png";

console.log(THREE);

const FOV = 75;
const ASPECT = innerWidth / innerHeight;
const NEAR = 0.1;
const FAR = 1000;

const BASIC = {
  Y: 7,
  Z: 5,
};
let cameraTemp = {
  x: 0,
  y: 0,
  z: 0,
};
const gravity = 0.05;
const users = new Map<
  number,
  THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>
>();
const velocity = {
  x: 0,
  y: 0,
  z: 0,
};

const direction = {
  w: false,
  s: false,
  a: false,
  d: false,
  " ": false,
};

window.addEventListener("keydown", handleKeydown);
window.addEventListener("keyup", handleKeyup);
function handleKeydown(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  if (key === "w" || key === "s" || key === "a" || key === "d" || key === " ") {
    direction[key] = true;
  }
}

function handleKeyup(e: KeyboardEvent) {
  const key = e.key.toLowerCase();
  if (key === "w" || key === "s" || key === "a" || key === "d" || key === " ") {
    direction[key] = false;
  }
}

class Game {
  clock: THREE.Clock;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  orbitControls: OrbitControls;
  domElement: HTMLCanvasElement;

  constructor() {
    const clock = new THREE.Clock();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV, ASPECT, NEAR, FAR);
    camera.position.y = BASIC.Y;
    camera.position.z = BASIC.Z;
    // camera.lookAt(scene.position);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    const orbitControls = new OrbitControls(camera, renderer.domElement);

    orbitControls.update();
    orbitControls.enablePan = false;
    orbitControls.enableDamping = true;

    document.body.appendChild(renderer.domElement);

    const hemisphereLight = new THREE.HemisphereLight(0x443333, 0x111122);
    const spotLight = new THREE.SpotLight();
    spotLight.angle = Math.PI / 16;
    spotLight.penumbra = 0.5;
    spotLight.castShadow = true;
    spotLight.position.set(-1, 1, 1);

    // const goal = new THREE.Object3D();
    // goal.add(camera);

    /* initial scene */
    scene.add(hemisphereLight);
    scene.add(spotLight);

    this.clock = clock;
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.orbitControls = orbitControls;
    this.domElement = renderer.domElement;

    this.sizingCanvas();
    window.addEventListener("resize", this.sizingCanvas.bind(this));
  }

  sizingCanvas() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  addToScene(model: any) {
    if (model.type === "Mesh" && model.geometry.type === "BoxGeometry") {
      users.set(1, model);
    }
    this.scene.add(model);
  }

  focusToModel() {
    for (let model of users.values()) {
      // const model = this.scene.children[i];
      console.log(model);
      if (
        model.type !== "Mesh" &&
        !model.geometry &&
        model.geometry &&
        model.geometry.type !== "BoxGeoMetry"
      )
        continue;

      // const modelPosition = new THREE.Vector3();
      // const model = this.scene.children[0];
      // model.getWorldPosition(modelPosition);
      // const { x, y, z } = modelPosition;
      // console.log(modelPosition);
      // // this.camera.lookAt(modelPosition);
      // this.camera.position.x = x;
      // this.camera.position.y = 7;
      // this.camera.position.z = z + 5;
      const delta = this.clock.getDelta(); // seconds.
      const moveDistance = 5 * delta; // 200 pixels per second
      const rotateAngle = (Math.PI / 2) * delta; // pi/2 radians (90 degrees) per secon

      // const model = this.box as THREE.Mesh;
      const dir = new THREE.Vector3();
      console.log(velocity.y, 1);
      model.position.y += velocity.y;
      if (model.position.y - 1 + velocity.y > 0) {
        velocity.y -= gravity;
      } else {
        velocity.y = 0;
        model.position.y = 0.5;
      }
      dir.sub(this.camera.position).normalize();
      if (
        direction.w ||
        direction.s ||
        direction.a ||
        direction.d ||
        direction[" "]
      ) {
        if (direction.w) {
          // model.position.z -= this.SPEED;
          model.translateZ(-moveDistance - 0.095);
        }
        if (direction.s) {
          // model.position.z += this.SPEED;
          model.translateZ(moveDistance + 0.095);
        }
        if (direction.a) {
          // model.rotateY(0.1);
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), rotateAngle + 0.05);
          // model.position.x -= this.SPEED;
        }
        if (direction.d) {
          // model.rotateY(-0.1);
          model.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle - 0.05);
          // model.position.x += this.SPEED;
        }
        if (direction[" "]) {
          direction[" "] = false;

          // model.rotateY(-0.1);
          console.log("jump");
          velocity.y = 0.5;
          // model.rotateOnAxis(new THREE.Vector3(0, 1, 0), -rotateAngle);
          // model.position.x += this.SPEED;
        }
      }

      const relativeCameraOffset = new THREE.Vector3(0, BASIC.Y, BASIC.Z);
      const cameraOffset = relativeCameraOffset.applyMatrix4(model.matrixWorld);

      const angleCameraDirectionAxisY =
        Math.atan2(
          this.camera.position.x + model.position.x,
          this.camera.position.z + model.position.z
        ) + Math.PI;
      const rotateQuarternion = new THREE.Quaternion();
      rotateQuarternion.setFromAxisAngle(
        new THREE.Vector3(0, 1, 0),
        angleCameraDirectionAxisY
      );
      model.quaternion.rotateTowards(
        rotateQuarternion,
        THREE.MathUtils.degToRad(5)
      );

      // this.camera.position.x = cameraOffset.x;
      // this.camera.position.y = cameraOffset.y;
      // this.camera.position.z = cameraOffset.z;
      // this.camera.lookAt(model.position);
    }
  }

  render() {
    function animate(this: any, time: number) {
      time *= 0.001;
      this.focusToModel();
      requestAnimationFrame(animate.bind(this));
      this.renderer.render(this.scene, this.camera);
      console.log("position", this.orbitControls.position0);
      cameraTemp.x = this.orbitControls.position0.x;
      cameraTemp.y = this.orbitControls.position0.y;
      cameraTemp.z = this.orbitControls.position0.z;
      this.camera.updateProjectionMatrix();
      this.orbitControls.update();
    }

    requestAnimationFrame(animate.bind(this));
  }
}

interface BaseOption {
  width: number;
  height: number;
  widthSeg?: number;
  heightSeg?: number;
  depth?: number;
  color: number;
}

interface ModelBase {
  create: () => THREE.Mesh;
}

class Plane implements ModelBase, BaseOption {
  width: number;
  height: number;
  widthSeg: number;
  heightSeg: number;
  color: number;
  geometry: THREE.PlaneGeometry | undefined;
  material: THREE.MeshBasicMaterial | undefined;

  constructor(
    width: number,
    height: number,
    widthSeg: number,
    heightSeg: number,
    color: number
  ) {
    this.width = width;
    this.height = height;
    this.widthSeg = widthSeg;
    this.heightSeg = heightSeg;
    this.color = color;
  }

  create() {
    const geometry = new THREE.PlaneGeometry(
      this.width,
      this.height,
      this.widthSeg,
      this.heightSeg
    );
    const checkTexture = new THREE.TextureLoader().load(checkboard);
    checkTexture.wrapS = THREE.RepeatWrapping;
    checkTexture.wrapT = THREE.RepeatWrapping;
    checkTexture.repeat.set(4, 4);

    const material = new THREE.MeshBasicMaterial({
      map: checkTexture,
      side: THREE.DoubleSide,
      color: this.color,
    });
    const plane = new THREE.Mesh(geometry, material);

    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;

    this.geometry = geometry;
    this.material = material;
    return plane;
  }
}

class Box implements ModelBase, BaseOption {
  // velocity: {
  //   x: number;
  //   y: number;
  //   z: number;
  // };
  width: number;
  height: number;
  depth: number;
  color: number;
  geometry: THREE.BoxGeometry | undefined;
  material: THREE.MeshBasicMaterial | undefined;
  // boxList: THREE.Mesh[] = [];
  // direction: {
  //   w: boolean;
  //   s: boolean;
  //   a: boolean;
  //   d: boolean;
  //   " ": boolean;
  // };
  SPEED: number = 0.5;
  box: THREE.Mesh | undefined;
  scene: THREE.Scene | undefined;
  camera: THREE.PerspectiveCamera | undefined;
  clock: THREE.Clock;

  constructor(width: number, height: number, depth: number, color: number) {
    this.clock = new THREE.Clock();
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.color = color;

    requestAnimationFrame(this.update.bind(this));
  }

  init(
    camera: THREE.PerspectiveCamera | undefined,
    scene: THREE.Scene | undefined
  ) {
    this.camera = camera;
    this.scene = scene;
  }

  update() {
    requestAnimationFrame(this.update.bind(this));
    // for (let i = 0; i < this.boxList.length; i++) {

    // console.log(model.position);
    // }
  }

  create() {
    const geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
    const material = new THREE.MeshBasicMaterial({ color: this.color });
    const box = new THREE.Mesh(geometry, material);
    box.position.y = box.geometry.parameters.height / 2;

    this.geometry = geometry;
    this.material = material;
    this.box = box;
    return box;
  }

  // move(pox: number, poy: number, poz: number, roy: number) {
  //   // for (let i = 0; i < this.boxList.length; i++) {
  //   const box = this.box as THREE.Mesh;
  //   box.position.set(pox, poy, poz);
  //   // }
  // }
}

const game = new Game();
game.render();
const box = new Box(1, 1, 1, 0x00ff00);
box.init(game.camera, game.scene);
const plane = new Plane(100, 100, 1, 1, 0xffffff);
game.addToScene(box.create());
game.addToScene(plane.create());
// let x = 0;
// let y = 0;
// setInterval(() => {
//   x += 1;
//   y += 0.5;
//   box.move(x, y, 0, 0);
// }, 16);
