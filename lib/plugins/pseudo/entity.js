ig.module(
  'plugins.pseudo.entity'
)
.requires(
  'impact.entity'
)
.defines(function() {

  ig.Entity.inject({

    _wmDrawBox: true,
    drawn: false,
    
    drawX: 0,
    drawSize: 0,
    drawDist: 0,
    
    drawY: 0,
    drawZ: 0,

    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      if ( this.drawY == 0 ) this.drawY = 8
      
      if ( this.animSheet && !ig.global.wm ) {
        this.animSheet.image.createShadowMap()
      }
    },

    update: function() {
      this.parent()
      
      this.drawn = false
    },

    draw: function() {
      if ( !ig.game.drawPseudo ) {
        ig.system.context.fillStyle = '#ff0000'
        ig.system.context.fillRect(
          ig.system.getDrawPos( -ig.game.screen.x + this.pos.x - this.size.x / 2 ), 
          ig.system.getDrawPos( -ig.game.screen.y + this.pos.y - this.size.y / 2 ),
          this.size.x * ig.system.scale, this.size.y * ig.system.scale
        )
      }
      else this.parent()
    },

    drawPseudo: function() {
      if ( this.currentAnim ) {
        var mod = this.drawSize * this.drawY / 2
        if ( this.drawY == 4 ) mod = 0.35
        else if ( this.drawY == 6 ) mod *= 0.67
        else if ( this.drawY == 12 ) mod *= 1.3
    
        ig.system.context.drawImage(
          this.currentAnim.sheet.image.data,
          this.currentAnim.tile * this.currentAnim.sheet.width * ig.system.scale, 0,
          this.currentAnim.sheet.width * ig.system.scale, this.currentAnim.sheet.height * ig.system.scale,
          
          ig.system.width * ig.system.scale / 2 + this.drawX - this.drawSize  * this.size.x / 2, 
          ig.system.height * ig.system.scale / 2 - mod * (1 - this.drawZ / 2),
          this.drawSize * this.size.x, this.drawSize * this.drawY
        )
    
        if ( !ig.global.wm ) {
          ig.system.context.globalAlpha = this.drawDist / 20
          
          ig.system.context.drawImage(
            this.currentAnim.sheet.image.shadowMap,
            this.currentAnim.tile * this.currentAnim.sheet.width * ig.system.scale, 0,
            this.currentAnim.sheet.width * ig.system.scale, this.currentAnim.sheet.height * ig.system.scale,
    
            ig.system.width * ig.system.scale / 2 + this.drawX - this.drawSize  * this.size.x / 2, 
            ig.system.height * ig.system.scale / 2 - mod * (1 - this.drawZ / 2),
            this.drawSize * this.size.x, this.drawSize * this.drawY
          )
          
          ig.system.context.globalAlpha = 1
        }
    
        this.drawn = true
       }
       else this.parent()
     },
     
     angleToCam: function( other ) {
       return Math.atan2(
         (ig.game.camera.pos.y + ig.game.camera.size.y / 2 + Math.sin( ig.game.camera.rotation ) * ig.game.camera.size.y / 2) - (this.pos.y + this.size.y/2),
         (ig.game.camera.pos.x + ig.game.camera.size.x / 2 + Math.cos( ig.game.camera.rotation ) * ig.game.camera.size.x / 2) - (this.pos.x + this.size.x/2)
       )
     },

  })
  
})