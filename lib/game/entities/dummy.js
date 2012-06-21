ig.module(
  'game.entities.dummy'
)
.requires(
  'plugins.pseudo.entity'
)
.defines( function() {
  
  EntityDummy = ig.Entity.extend({
    //important for weapon collision
    enemy: true,
    // Will only draw this in 3D when this is true
    draw3D: true,
    
    size: { x: 5, y: 5 },
    
    animSheet: new ig.AnimationSheet( 'media/guard.png', 128, 128 ),
    
    type: ig.Entity.TYPE.B,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.ACTIVE,
    friction: {
      x: 50,
      y: 50
    },
    
    speed: 15,
    
    reloadTimer: null,
    reloadTime: 2,
    
    health: 20,
    
    // The draw Height of the entity
    drawY: 6,
    
    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      this.addAnim( 'idle', 1, [0] )
      this.addAnim( 'walking', .5, [1, 2] )
      this.addAnim( 'hit', .3, [3] )
      this.addAnim( 'shooting', 1, [7, 8] )
      this.addAnim( 'dead', .1, [3, 4, 5, 6], true )
      
      this.reloadTimer = new ig.Timer()
    },
    
    update: function() {
      if ( this.dead ) return
      
      this.parent()

      var dist = this.distanceTo( ig.game.camera )
      
      if ( dist < 60 ) {
        var angle = this.angleToCam()
        var sees_player = ig.game.castPlayerRay( angle, this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2 )

        if ( sees_player && dist > 25 ) {
          this.vel.x = Math.cos( angle ) * this.speed
          this.vel.y = Math.sin( angle ) * this.speed

          this.changeAnimation( this.anims.walking )
        }
        else if ( sees_player && dist <= 30 ) {
          if ( this.reloadTimer.delta() > this.reloadTime ) {
            ig.game.spawnEntity( EntityBullet, 
              this.pos.x + this.size.x / 2 + Math.cos( angle ) * this.size.x, 
              this.pos.y + this.size.y / 2 + Math.sin( angle ) * this.size.y, {
                angle: angle
            })
            
            this.reloadTimer.set( 0 )
          }

          this.changeAnimation( this.anims.shooting )
        }
      }
      else {
        this.changeAnimation( this.anims.idle )
      }
    },
    
    changeAnimation: function( to ) {
      if ( this.currentAnim == this.anims.hit ) {
        if ( this.currentAnim.loopCount > 0 ) {
          this.currentAnim = to
        }
      }
      else {
        this.currentAnim = to
      }
    },
    
    receiveDamage: function( amount ) {
      this.parent( amount )
      
      this.currentAnim = this.anims.hit.rewind()
    },

    kill: function() {
      ig.game.spawnEntity( EntityDead, this.pos.x, this.pos.y, {
        anim: this.anims.dead,
        deadTime: 1,
        size: this.size,
        drawY: this.drawY
      })
      
      this.parent()
    }
    
  })
  
  EntityDead = ig.Entity.extend({
    
    deadTimer: null,
    deadTime: 0,
    
    draw3D: true,
    drawY: 6,
    
    size: { x: 5, y: 5 },
    
    init: function( x, y, s ) {
      this.parent( x, y, s)

      this.currentAnim = s.anim.rewind()
      this.deadTimer = new ig.Timer( this.deadTime )
    },
    
    update: function() {
      this.parent()

      if ( this.deadTimer.delta() > 0 ) this.kill()
    }
  })
  
  EntityBullet = ig.Entity.extend({
    size: { x: 1, y: 1 },
    
    type: ig.Entity.TYPE.NONE,
    checkAgainst: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,
    
    animSheet: new ig.AnimationSheet( 'media/bullet.png', 128, 128 ),
    
    speed: 45,
    
    draw3D: true,
    drawY: 1,
    
    init: function( x, y, s ) {
      this.parent( x, y, s )
      
      this.vel.x = Math.cos( this.angle ) * this.speed
      this.vel.y = Math.sin( this.angle ) * this.speed
      
      this.addAnim( 'idle', 1, [0] )
    },
    
    draw: function() {
      ig.system.context.fillStyle = '#00ff00'
      ig.system.context.fillRect(
        ig.system.getDrawPos( this.pos.x ), 
        ig.system.getDrawPos( this.pos.y ),
        this.size.x, this.size.y
      )
    },
    
    handleMovementTrace: function( res ) {
      this.parent( res )
      
      if ( res.collision.x || res.collision.y ) {
        this.kill()
      }
    },
    
    check: function( other ) {
      other.receiveDamage( 15, this )
      this.kill()
    }
    
  })
  
})