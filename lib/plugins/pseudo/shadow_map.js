ig.module(
  'plugins.pseudo.shadow_map'
)
.requires(
  'impact.image'
)
.defines(function() {

  ig.Image.inject({
    shadowMap: false,
    
    createShadowMap: function() {
      if ( !this.shadowMap && this.width != 0 && this.height != 0 ) {
        var offscreen_canvas = ig.$new( 'canvas' )
        offscreen_canvas.width = this.width * ig.system.scale
        offscreen_canvas.height = this.height * ig.system.scale
        var offscreen = offscreen_canvas.getContext( '2d' )
        offscreen.drawImage( this.data, 0, 0, this.width * ig.system.scale, this.height * ig.system.scale, 0, 0, this.width * ig.system.scale, this.height * ig.system.scale )
        var data = offscreen.getImageData( 0, 0, this.width * ig.system.scale, this.height * ig.system.scale )
        var pixel = data.data

        for ( var i = 0; i < pixel.length; i += 4 ) {
          if ( pixel[i+3] != 0 ) {
            pixel[i] = 0
            pixel[i+1] = 0
            pixel[i+2] = 0
            pixel[i+3] = 255
          }
        }
        
        offscreen.putImageData( data, 0, 0 )
        this.shadowMap = offscreen_canvas
      }
    }
  })
  
})