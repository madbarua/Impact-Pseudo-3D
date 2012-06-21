ig.module(
  'game.entities.player'
)
.requires(
  'plugins.pseudo.camera'
 )
.defines( function() {

  EntityPlayer = EntityCamera.extend({

    health: 100,
    maxHealth: 100,

    // hud
    healthImage: new ig.Image( 'media/hud_health.png' ),
    ammoImage: new ig.Image( 'media/hud_ammo.png' ),

    init: function( x, y, s ) {
      this.parent( x, y, s )

      if ( !ig.global.wm ) {
        this.weapon = ig.game.spawnEntity( WeaponPistol, 0, 0 )
      }
    },

    drawHud: function() {
      this.weapon.drawPseudo()

      this.healthImage.draw( 10, 10 )
      ig.game.font.draw( this.health, 45, 17 )
      
      this.ammoImage.draw( ig.system.width - 42, 10 )
      ig.game.font.draw( this.weapon.ammo, ig.system.width - 45, 17, ig.Font.ALIGN.RIGHT )
    },

    addHealth: function( amount ) {
      this.health = Math.max( this.health + amount, this.maxHealth )
    },

    addAmmo: function( amount ) {
      this.weapon.ammo += amount
    }

  })

  Weapon = ig.Entity.extend({
    
    reloadTimer: null,
    reloadTime: 0,
    
    init: function() {
      this.reloadTimer = new ig.Timer( this.reloadTime )
    },
    
    update: function() {
      this.parent()
      
      if ( 
        this.currentAnim != this.anims.idle &&
        this.currentAnim.frame == this.currentAnim.sequence.length-1
      ) {
        this.currentAnim = this.anims.idle
      }
    },
    
    drawPseudo: function() {
      ig.system.context.drawImage(
        this.currentAnim.sheet.image.data,
        this.currentAnim.tile * this.currentAnim.sheet.width * ig.system.scale, 0,
        this.currentAnim.sheet.width * ig.system.scale, this.currentAnim.sheet.height * ig.system.scale,
        ig.system.width * ig.system.scale / 2 - this.currentAnim.sheet.width * ig.system.scale / 2,
        ig.system.height * ig.system.scale - this.currentAnim.sheet.height * ig.system.scale,
        this.currentAnim.sheet.width * ig.system.scale, this.currentAnim.sheet.height * ig.system.scale
      )
    },
    
    shoot: function() {
      this.currentAnim = ( this.ammo > 0 ) ? this.anims.shoot : this.anims.empty
      this.currentAnim.rewind()
      
      this.ammo -= 1
      this.ammo = Math.max( this.ammo, 0 )

      this.reloadTimer.set( this.reloadTime )
    }
    
  })
  
  WeaponPistol = Weapon.extend({
    ammo: 20,
    reloadTime: .4,
    damage: 10,
    
    animSheet: new ig.AnimationSheet( 'media/pistol.png', 256, 256 ),
    
    init: function() {
      this.parent()
      
      this.addAnim( 'idle', 1, [0] )
      this.addAnim( 'shoot', .05, [1, 2, 0], false )
      this.addAnim( 'empty', .05, [1, 0], false )
    },
    
    shoot: function() {
      if ( this.reloadTimer.delta() < 0 ) return

      if ( this.ammo > 0 ) {
        var hit = ig.game.castEntityRay()

        if ( hit ) {
          hit.receiveDamage( this.damage, this )
        }
      }

      this.parent()
    }
    
  })

})