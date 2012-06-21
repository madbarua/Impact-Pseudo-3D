ig.module(
  'plugins.pseudo.camera'
)
.requires(
  'impact.entity'
)
.defines(function() {
  
  Flash = {
    Health: 1,
    Damage: 2,
    Ammo: 3
  }
  
  EntityCamera = ig.Entity.extend({
    name: 'camera',
    
    size: { x: 6, y: 6 },
    posZ: 1,
    
    rotation: 0,
    rotSpeed: 6 * Math.PI / 180,
    moveSpeed : 50,
    
    mouseMove: false,
    movementX: 0,
    
    twoPI: Math.PI * 2,
    
    type: ig.Entity.TYPE.A,
    checkAgainst: ig.Entity.TYPE.NONE,
    collides: ig.Entity.COLLIDES.ACTIVE,

    init: function( x, y, s ) {
      ig.input.bind( ig.KEY.W, 'up' )
      ig.input.bind( ig.KEY.S, 'down' )
      ig.input.bind( ig.KEY.A, 'left' )
      ig.input.bind( ig.KEY.D, 'right' )
      
      ig.input.bind( ig.KEY.Q, 'rot_left' )
      ig.input.bind( ig.KEY.E, 'rot_right' )
      
      if ( !ig.global.wm ) {
        ig.input.bind( ig.KEY.SPACE, 'shoot' )
        document.addEventListener( 'mousemove', this.mousemove.bind( this ) )
      }

      this.parent( x, y, s )
    },

    mousemove: function( e ) {
      var movementX = e.movementX
        || e.mozMovementX
        || e.webkitMovementX
        || 0

      this.mouseMove = true
      this.movementX = movementX * 1.3
    },

    update: function() {
      var speed = 0
      var dir = 0
      
      if ( ig.input.state( 'left' ) ) {
        dir = -1
      }
      else if ( ig.input.state( 'right' ) ) {
        dir = 1
      }
      else dir = 0
      
      if ( ig.input.state( 'up' ) ) {
        speed = 1
      }
      else if ( ig.input.state( 'down' ) ) {
        speed = -1
      }
      else speed = 0

      if ( ig.input.state( 'rot_left' ) ) {
        this.movementX = -12
      }
      else if ( ig.input.state( 'rot_right' ) ) {
        this.movementX = 12
      }
      else if ( !this.mouseMove ) this.movementX = 0

      this.rotation += this.movementX * this.rotSpeed * 0.04
      
      this.rotation += this.twoPI
      this.rotation %= this.twoPI
      
      var moveStep = speed * this.moveSpeed
      var rad = ( speed != 0 && dir != 0 ) ? 4 : 2
      
      if ( speed != 0 ) dir *= speed
      if ( moveStep == 0 && dir != 0 ) moveStep = this.moveSpeed * .5
      if ( speed != 0 && dir != 0 ) moveStep *= .75

      this.vel.x = Math.cos( this.rotation + (Math.PI / rad) * dir ) * moveStep
      this.vel.y = Math.sin( this.rotation + (Math.PI / rad) * dir ) * moveStep

      if ( ( ig.input.state( 'click' ) || ig.input.state( 'shoot' ) ) && this.weapon ) {
        this.weapon.shoot()
      }

      this.parent()
      
      this.mouseMove = false
    },
    
    shoot: function() {},

    draw: function() {
      ig.system.context.fillStyle = '#ff0000'
      ig.system.context.strokeStyle = '#ffff00'
      
      ig.system.context.save()
      ig.system.context.translate( 
        ig.system.getDrawPos( -ig.game.screen.x + this.pos.x + this.size.x / 2 ), 
        ig.system.getDrawPos( -ig.game.screen.y + this.pos.y + this.size.y / 2 )
      )
      
      ig.system.context.fillRect( 
        -this.size.x / 2 * ig.system.scale, -this.size.y / 2 * ig.system.scale, 
        this.size.x * ig.system.scale, this.size.y * ig.system.scale
      )
      
      ig.system.context.beginPath()
      
      ig.system.context.moveTo( 0, 0 )
      ig.system.context.lineTo(
        Math.cos( this.rotation ) * this.size.x * 4 * ig.system.scale,
        Math.sin( this.rotation ) * this.size.y * 4 * ig.system.scale
      )
      
      ig.system.context.closePath()
      ig.system.context.stroke()
      
      ig.system.context.restore()
    },
    
    drawPseudo: function() {
      this.drawHud()
    },
    
    drawHud: function() {},
    
    kill: function() {
      console.log( 'game over' )
    }
  })
})