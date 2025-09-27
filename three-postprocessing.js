// Fallback post-processing for psychedelic effects
if (!THREE.EffectComposer) {
    THREE.EffectComposer = function(renderer) {
        this.renderer = renderer;
        this.passes = [];
    };
    
    THREE.EffectComposer.prototype = {
        addPass: function(pass) {
            this.passes.push(pass);
        },
        render: function() {
            // Fallback to normal rendering
            this.renderer.render(this.passes[0].scene, this.passes[0].camera);
        }
    };
    
    THREE.RenderPass = function(scene, camera) {
        this.scene = scene;
        this.camera = camera;
    };
    
    THREE.ShaderPass = function(shader) {
        this.uniforms = shader.uniforms || {};
    };
}