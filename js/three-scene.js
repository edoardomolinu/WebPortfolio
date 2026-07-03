window.ProductViewer = class ProductViewer {
  constructor(containerElement, modelPath = null, accentColorHex = '#00ff66') {
    this.container = containerElement;
    this.modelPath = modelPath;
    this.accentColor = new THREE.Color(accentColorHex);
    
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    this.model = null;
    this.controls = null;
    this.renderer = null;
    this.camera = null;
    this.scene = null;
    this.animationFrameId = null;
    
    this.init();
  }
  
  init() {
    // 1. Scene Creation
    this.scene = new THREE.Scene();
    
    // 2. Camera Setup (Perspective suited for industrial product display)
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0, 5);
    
    // 3. Renderer Setup (High-fidelity studio settings)
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    
    this.container.appendChild(this.renderer.domElement);
    
    // 4. Orbit Controls (Constrained rotation to keep a high-end feel)
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = false; // Disable scroll zoom so users can scroll past the canvas
    this.controls.minDistance = 2;
    this.controls.maxDistance = 10;
    this.controls.minPolarAngle = Math.PI / 6; // Limit vertical rotation
    this.controls.maxPolarAngle = Math.PI / 1.8;
    
    // 5. Studio Lighting Setup
    this.setupLighting();
    
    // 6. Model Loading or Decorative Tech Placeholder
    if (this.modelPath) {
      this.loadModel();
    } else {
      this.createFallbackMesh();
    }
    
    // 7. Event Listeners
    this.resizeBound = this.onResize.bind(this);
    window.addEventListener('resize', this.resizeBound);
    
    // 8. Run Animation Loop
    this.animate();
  }
  
  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    // Main Studio Softbox Light (top-front-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.5);
    keyLight.position.set(5, 8, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0001;
    this.scene.add(keyLight);
    
    // Fill Light (bottom-back-left) with a soft tint from the accent color
    const fillLight = new THREE.DirectionalLight(this.accentColor, 0.5);
    fillLight.position.set(-5, -3, -5);
    this.scene.add(fillLight);
    
    // Rim Light (behind the model to separate it from the background)
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(0, 5, -8);
    this.scene.add(rimLight);
  }
  
  loadModel() {
    const loader = new THREE.GLTFLoader();
    loader.load(
      this.modelPath,
      (gltf) => {
        this.model = gltf.scene;
        
        // Optimize materials & enable shadows
        this.model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            
            // If the material has metallic/roughness properties, enhance them
            if (child.material) {
              child.material.envMapIntensity = 1.0;
              child.material.needsUpdate = true;
            }
          }
        });
        
        // Auto-center and fit model size inside the camera view
        this.centerAndScaleModel();
        
        this.scene.add(this.model);
        this.onModelReady();
      },
      undefined,
      (error) => {
        console.warn(`Could not load GLTF model at ${this.modelPath}. Using stylized technical placeholder.`, error);
        this.createFallbackMesh();
      }
    );
  }
  
  centerAndScaleModel() {
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    
    // Recenter
    this.model.position.x += (this.model.position.x - center.x);
    this.model.position.y += (this.model.position.y - center.y);
    this.model.position.z += (this.model.position.z - center.z);
    
    // Scale fittingly
    const maxDim = Math.max(size.x, size.y, size.z);
    const targetScale = 2.4 / maxDim;
    this.model.scale.set(targetScale, targetScale, targetScale);
  }
  
  createFallbackMesh() {
    // Generate a sleek technical wireframe product shape (CAD Box)
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    
    // Double layered material: solid physical metal + colored glowing wireframe overlay
    const physicalMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x111111,
      roughness: 0.1,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
    });
    
    const baseMesh = new THREE.Mesh(geometry, physicalMaterial);
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    
    // Wireframe overlay to represent the CAD mesh
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const wireframeMat = new THREE.LineBasicMaterial({
      color: this.accentColor,
      linewidth: 1,
      transparent: true,
      opacity: 0.45
    });
    
    const wireframeLine = new THREE.LineSegments(wireframeGeo, wireframeMat);
    
    this.model = new THREE.Group();
    this.model.add(baseMesh);
    this.model.add(wireframeLine);
    
    this.scene.add(this.model);
    this.onModelReady();
  }
  
  onModelReady() {
    this.container.classList.add('loaded');
  }
  
  onResize() {
    if (!this.container) return;
    this.width = this.container.clientWidth;
    this.height = this.container.clientHeight;
    
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(this.width, this.height);
  }
  
  animate() {
    this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
    
    if (this.controls) this.controls.update();
    
    // Idle rotation (only rotates when user is not actively interacting)
    if (this.model && this.controls && !this.controls.state === -1) {
      this.model.rotation.y += 0.003;
      this.model.rotation.x += 0.001;
    } else if (this.model && (!this.controls || this.controls.state === -1)) {
      // Rotating smoothly on standby
      this.model.rotation.y += 0.004;
    }
    
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
  
  destroy() {
    // Clean up animation thread & event listeners to optimize memory leaks
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    
    window.removeEventListener('resize', this.resizeBound);
    
    if (this.controls) {
      this.controls.dispose();
    }
    
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
    }
    
    // Traversal cleanup of textures/geometries
    if (this.scene) {
      this.scene.traverse((object) => {
        if (!object.isMesh) return;
        
        if (object.geometry) object.geometry.dispose();
        
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach((mat) => this.cleanMaterial(mat));
          } else {
            this.cleanMaterial(object.material);
          }
        }
      });
    }
  }
  
  cleanMaterial(material) {
    material.dispose();
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value.dispose === 'function') {
        value.dispose();
      }
    }
  }
}
