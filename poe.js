/**
 * Potree Class
 */

export default class {

    constructor(setup) {
        this.clock = new THREE.Clock();
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        // this.sceneForeGround = new THREE.Scene();
        this.referenceFrame = new THREE.Object3D();
        this.pointcloud = null;
        this.controls = null;
        this.raycaster = new THREE.Raycaster();
        // this.mouseVector = new THREE.Vector3();
        this.group = new THREE.Group();
        this.mapC = null;
        this.camera = null;
        this.data = setup;
        this.textureLoader = new THREE.TextureLoader();
        this.width = _pad + window.innerWidth / 2;
        this.onLoad = false;
        this.showChildren = true;
        this.viewportFull = false;
    }

    init(loaded) {
        let width = this.width,
            height = window.innerHeight,
            aspect = width / height,
            clip = .1, // clipping plane
            far = 10,
            grid = Potree.utils.createGrid(4, 4, .25);

        this.onLoad = loaded;

        this.scene.add(grid);
        this.scene.add(this.referenceFrame);
        this.scene.add(this.group);
        // this.sceneForeGround.add(this.group); // for no clipping pointcloud

        this.camera = new THREE.PerspectiveCamera(this.data.fov, aspect, clip, far);
        this.camera.rotation.order = 'ZYX';
        this.camera.position.set(this.data.start.x, this.data.start.y, this.data.start.z)

        this.controls = new Potree.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.maxPolarAngle = Math.PI/2;
        this.controls.minDistance = this.data.min;
        this.controls.maxDistance = this.data.max;

        this.renderer.setSize(width, height);
        this.renderer.autoClear = false;

        this.textureLoader.load( "/assets/img/poi-eye.png", texture => this.addSprites(texture));

        loadPointCloud.call(this);
    }
    addSprites(texture) {

        let textureMaterial = new THREE.SpriteMaterial({ map: texture, useScreenCoordinates: false, color: 0xffffff }),
            poi = this.data.poi,
            material = textureMaterial.clone();
        for(let i=0; i<poi.length; i++) {

            let sprite = new THREE.Sprite(material),
                pv = poi[i].vector;
            sprite.position.set(pv.x, pv.y, pv.z);
            sprite.scale.set(.1, .1, 1); // imageWidth, imageHeight
            // sprite.name = `poi--${i}` // irrelevant
            sprite.index = i;
            this.group.add(sprite)
            // return sprite
        }
    }
    intersect(e, hit) {
        if(this.pointcloud && this.group.children.length > 0) {
            let mouse = {
                x: (e.x / this.width) * 2 - 1,
                y: - (e.y / window.innerHeight) * 2 + 1
            }
            this.raycaster.setFromCamera(mouse, this.camera);
            let intersects = this.raycaster.intersectObjects(this.group.children);
            hit(intersects);
        }
    }
    cycle() {
        update.call(this);
        render.call(this);
        requestAnimationFrame(this.cycle.bind(this));
    }
    setViewportFull(bool) {
        this.viewportFull = bool;
        this.width = (bool) ? window.innerWidth : _pad + window.innerWidth / 2;
    }
    toggleChildren() {
        this.showChildren = !this.showChildren;
    }
    resize() {        
        this.width = (this.viewportFull) ? window.innerWidth : _pad + window.innerWidth / 2
    }
}

/**
 * Private methods
 */

function loadPointCloud() {
    // let progressBar = new ProgressBar();
    let path = `${this.data.path}/cloud.js`;
    Potree.POCLoader.load(path, geometry => {

        this.pointcloud = new Potree.PointCloudOctree(geometry);
        this.pointcloud.material.pointSizeType = Potree.PointSizeType.ADAPTIVE;
        // this.pointcloud.material.size = 1;
        this.referenceFrame.add(this.pointcloud);
        this.referenceFrame.updateMatrixWorld(true);

        let sg = this.pointcloud.boundingSphere.clone().applyMatrix4(this.pointcloud.matrixWorld);
        this.referenceFrame.position.copy(sg.center).multiplyScalar(-1);
        this.referenceFrame.updateMatrixWorld(true);

        this.referenceFrame.applyMatrix(new THREE.Matrix4().set(
            1,0,0,0,
            0,0,1,0,
            0,-1,0,0,
            0,0,0,1
        ));
        this.cycle()
        return this
    })
    return this
}
function update() {
    // console.log(`loading: ${~~(pointcloud.progress*100)}%`)
    if(typeof this.onLoad === 'function') {
        this.pointcloud.update(this.camera, this.renderer);
        if(this.pointcloud.progress > 0.99) {
            this.onLoad();
            this.onLoad = true;
        }
    }
    if(this.onLoad === true) { 
        for(var i=0;i<this.group.children.length;i++){
            let vz = this.camera.position.distanceTo(this.group.children[i].position),
                v = this.group.children[i].position,
                scale = 0.1 * vz / (1 + 0.9 * vz);
            this.group.children[i].scale.set(scale,scale,scale);
            this.group.children[i].visible = this.showChildren;
        }
        this.pointcloud.update(this.camera, this.renderer);
    }
    this.controls.update(this.clock.getDelta());
}
function render() {

    let width = this.width,
        height = window.innerHeight,
        aspect = width / height;

    this.renderer.setSize(width, height);

    this.camera.aspect = aspect;
    this.camera.updateProjectionMatrix();

    this.renderer.render(this.scene, this.camera);
    this.renderer.clearDepth();
    // this.renderer.render(this.sceneForeGround, this.camera);
}
