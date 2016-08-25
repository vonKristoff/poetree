#Potree ES6 Class

Deploys a nicely wrapped instance of a Potree Pointcloud rendered using Three JS.

**Prerequisites**

In all oldschool practice, include the following as Globals on the HTML head:


	"vendor/three.js"
	"vendor/BinaryHeap.js"
	"vendor/OrbitControls.js"
	"vendor/potree.js"


###Setup

The config object to pass to constructor.

	{
        path: `path/to/folder`,
        start: { x:1, y:.5, z:1 },
        min: .3,
        max: 1,
        fov: 50,
        poi: [{                        
            vector: { x:0.11, y:0.40, z:0.35 },
            target: 'name to reference'
        }]
    }
    
    
Create an instance in app.

	import PointCloud from './poe';
	
	let pc = new PointCloud(config);
	
	// load and render, with callback where you must add the canvas element returned
	pc.init((el) => {
		document.body.append(el);
	})
	

---

### API

core

* `camera` : returns a threejs v3. Can be directly manipulated.
* `scene`
* `controls` : Using OrbitControls
* `group` : where POIs are kept.

extensions

* `resize` : Use in sync with the window resize Event Listener.
* `toggleChildren` : show | hide any POI's
* `intersect( {x,y}, callback )`: test a hit on a POI. Will pass back an `Array`.


### TODO

* More options
* Stop/Start rendering
* rendering is currently fullscreen
* Connect transition Engine
* Extend API cleanly

---

### Extending

With ES6, you should be able to do the following:
	
	class myPointCloud extends PointCloud {
	
		constructor(setup) {
			super(setup)
		}
		
		newFunction() {
			console.log(this.camera.x)
		}
	
	}
	
	let p = new myPointCloud();
	p.init(); // business as usual
	p.newFunction();