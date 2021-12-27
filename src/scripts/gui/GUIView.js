import ControlKit from '@brunoimbrizi/controlkit';
import TweenLite from 'gsap/TweenLite';
import Stats from 'stats.js';

export default class GUIView {

	constructor(app) {
		this.app = app;

		this.particlesHitArea = false;
		this.particlesRandom = -700;
		this.particlesDepth = 650;
		this.particlesSize = 1.5;
		
		this.touchRadius = 0.15;

		this.range = [0, 1];
		this.rangeRandom = [1, 300];
		this.rangeSize = [0, 3];
		this.rangeDepth = [1, 1000];
		this.rangeRadius = [0, 0.5];

		this.initControlKit();
		this.addwheellistener();
		// this.initStats();

		// this.disable();
	}

	initControlKit() {
		this.controlKit = new ControlKit();
		this.controlKit.addPanel({ width: 300, enable: false })

		.addGroup({label: 'Touch', enable: false })
		.addCanvas({ label: 'trail', height: 64 })
		.addSlider(this, 'touchRadius', 'rangeRadius', { label: 'radius', onChange: this.onTouchChange.bind(this) })
		
		.addGroup({label: 'Particles', enable: false })
		// .addCheckbox(this, 'particlesHitArea', { label: 'hit area', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesRandom', 'rangeRandom', { label: 'random', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesDepth', 'rangeDepth', { label: 'depth', onChange: this.onParticlesChange.bind(this) })
		.addSlider(this, 'particlesSize', 'rangeSize', { label: 'size', onChange: this.onParticlesChange.bind(this) })

		.addGroup({label: 'Website Folds', enable: true })
		.addButton('Fold 1', this.onParticlesFold1.bind(this) )
		.addButton('Fold 2', this.onParticlesFold2.bind(this) )

		// store reference to canvas
		const component = this.controlKit.getComponentBy({ label: 'trail' });
		if (!component) return;

		this.touchCanvas = component._canvas;
		this.touchCtx = this.touchCanvas.getContext('2d');
	}

	initStats() {
		this.stats = new Stats();

		document.body.appendChild(this.stats.dom);
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update() {
		// draw touch texture
		if (this.touchCanvas) {
			if (!this.app.webgl) return;
			if (!this.app.webgl.particles) return;
			if (!this.app.webgl.particles.touch) return;
			const source = this.app.webgl.particles.touch.canvas;
			const x = Math.floor((this.touchCanvas.width - source.width) * 0.5);
			this.touchCtx.fillRect(0, 0, this.touchCanvas.width, this.touchCanvas.height);
			this.touchCtx.drawImage(source, x, 0);
		}
	}

	enable() {
		this.controlKit.enable();
		if (this.stats) this.stats.dom.style.display = '';
	}

	disable() {
		this.controlKit.disable();
		if (this.stats) this.stats.dom.style.display = 'none';
	}

	toggle() {
		if (this.controlKit._enabled) this.disable();
		else this.enable();
	}

	onTouchChange() {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;

		this.app.webgl.particles.touch.radius = this.touchRadius;
	}
	
	onParticlesChange() {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;

		this.app.webgl.particles.object3D.material.uniforms.uRandom.value = this.particlesRandom;
		this.app.webgl.particles.object3D.material.uniforms.uDepth.value = this.particlesDepth;
		this.app.webgl.particles.object3D.material.uniforms.uSize.value = this.particlesSize;

		this.app.webgl.particles.hitArea.material.visible = this.particlesHitArea;
	}

	addwheellistener(){
		window.addEventListener("wheel", event => {
			const delta = Math.sign(event.deltaY);
			if(event.deltaY > 0)
			{
				this.onParticlesFold2(1);
			}
			else 
			{
				this.onParticlesFold1(0);
			}
			// console.info(delta);
		});
	}

	removewheellistener(){
		window.removeEventListener("wheel", event => {
		});
	}

	onParticlesFold1(currSample) {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;

		if(this.currSample != 1)
		{
			clearTimeout(this.onlytimeout);
			this.app.webgl.goto(0);
			this.currSample = 1;
		}
		else
		{
			return;
		}

		// this.app.webgl.particles.object3D.material.uniforms.uRandom.value = 1;
		// this.app.webgl.particles.object3D.material.uniforms.uDepth.value = 1000;
		// this.app.webgl.particles.object3D.material.uniforms.uSize.value = this.particlesSize;
		// let time = 1;
		// TweenLite.to(this.app.webgl.particles.object3D.material.uniforms.uRandom, time, { value: -700.0 });
		// TweenLite.to(this.app.webgl.particles.object3D.material.uniforms.uDepth, time * 1.5, { value: 1000.0 });

		this.app.webgl.particles.hitArea.material.visible = this.particlesHitArea;

		document.getElementById('textcontainer').style.display = 'block';
		TweenLite.to(document.getElementById('mainbody').style,2,{backgroundColor:'#fff'});
	}

	onParticlesFold2(currSample) {
		if (!this.app.webgl) return;
		if (!this.app.webgl.particles) return;

		if(this.currSample != 0)
		{
			this.app.webgl.goto(1);
			this.currSample = 0;

			this.onlytimeout = setTimeout(() => {
				let time = 1.5;
			TweenLite.to(this.app.webgl.particles.object3D.material.uniforms.uRandom, time, { value: 1.0 });
			TweenLite.to(this.app.webgl.particles.object3D.material.uniforms.uDepth, time * 1.0, { value: 1.0 });
			}, 200);
			

			this.app.webgl.particles.hitArea.material.visible = this.particlesHitArea;

			document.getElementById('textcontainer').style.display = 'none';
			TweenLite.to(document.getElementById('mainbody').style,2,{backgroundColor:'#111'});
		}
		else
		{
			return;
		}
		// this.app.webgl.particles.object3D.material.uniforms.uRandom.value = 1;
		// this.app.webgl.particles.object3D.material.uniforms.uDepth.value = 1;
		// this.app.webgl.particles.object3D.material.uniforms.uSize.value = this.particlesSize;
		
		
	}

	onPostProcessingChange() {
		if (!this.app.webgl.composer) return;
		this.app.webgl.composer.enabled = this.postProcessing;
	}
}
