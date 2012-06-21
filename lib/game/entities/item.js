ig.module(
  'game.entities.item'
)
.requires(
  'impact.entity'
)
.defines( function() {
  
  EntityItem = ig.Entity.extend({

    checkAgainst: ig.Entity.TYPE.A,
    
    draw3D: true,
    
    _drawZ: 0,
    counter: 0,
    
    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      this._drawZ = this.drawZ
    },
    
    update: function() {
      this.parent()
      
      this.drawZ = this._drawZ + Math.sin( this.counter ) * 60
      
      this.counter += 0.05
    }
    
  })

})