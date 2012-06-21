ig.module(
  'game.entities.itemHealth'
)
.requires(
  'game.entities.item'
)
.defines( function() {
  
  EntityItemHealth = EntityItem.extend({
    
    size: {
      x: 4,
      y: 4
    },
    
    drawY: 4,
    
    animSheet: new ig.AnimationSheet( 'media/health.png', 128, 128 ),
    
    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      this.addAnim( 'idle', 1, [0] )
    },
    
    check: function( other ) {
      if ( other.health < 100 ) {
        other.addHealth( 10 )
        this.kill()
      }
    }
    
  })
  
})