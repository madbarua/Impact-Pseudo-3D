ig.module( 
  'game.main' 
)
.requires(
  'impact.game'
 ,'impact.font'
 
 ,'plugins.pseudo.pseudo'
 
 ,'game.entities.dummy'
 
 ,'game.levels.first'
 
 ,'impact.debug.debug'
)
.defines(function(){

MyGame = ig.Game.extend({
  // The texture for the Walls
  // Note that in weltmeister, you only choose the index of the wall texture
  texture: new ig.Image( 'media/walls.png' ),
  // The size of the wall-texture
  textureSizeX: 128,
  
  // The width of a strip. 
  // A Strip is equivalent to a part of your screen, going from top to bottom.
  // The bigger the strip, the less rays must be casted. Changes the resolution.
  stripWidth: 4,
  // The Height of the wall
  // Normal Heigth would be 0
  // // Keep in mind that the texture will be streched 
  wallHeight: 6,

  // Sometimes it's good to draw in 2D for debeugging purpose
  drawPseudo: true,
  
  fullscreen: false,
  mouseLock: false,

  init: function() {
    this.parent()
    
    document.addEventListener( 'keyup', this.requestFullscreen.bind( this ) )
    
    document.addEventListener( 'fullscreenchange', this.fullscreenChange.bind( this ) )
    document.addEventListener( 'pointerlockchange', this.pointerLockChange.bind( this ) )
    
    ig.input.bind( ig.KEY.MOUSE1, 'click' )

    this.loadLevel( LevelFirst )
  },
  
  loadLevel: function( level ) {
    this.parent( level )
    
    // there must always be an entity named camera that is of Type EntityCamera
    this.camera = this.getEntityByName( 'camera' )
  },
  
  requestFullscreen: function( e ) {
    if ( e.which == 70 ) {
      if ( !this.fullscreen ) {
        ig.system.canvas.requestFullscreen()
      }
      
      this.fullscreen = true
    }
    else if ( e.which == 27 ) {
      this.fullscreen = false
    }
  },
  
  fullscreenChange: function( e ) {
    ig.system.canvas.requestPointerLock()
  },
  
  pointerLockChange: function( e ) {
    this.mouseLock = !this.mouseLock
  }
})

ig.main( '#canvas', MyGame, 60, 480, 320, 1 )

})
