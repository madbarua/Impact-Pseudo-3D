ig.module(
  'game.entities.itemAmmo'
)
.requires(
  'game.entities.item'
)
.defines( function() {
  
  EntityItemAmmo = EntityItem.extend({
    size: { x: 4, y: 4 },
    
    drawY: 4,
    
    animSheet: new ig.AnimationSheet( 'media/ammo.png', 128, 128 ),
    
    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      this.addAnim( 'idle', 1, [0] )
    },
    
    check: function( other ) {
      other.addAmmo( 10 )
      this.kill()
    }
    
  })
  
})