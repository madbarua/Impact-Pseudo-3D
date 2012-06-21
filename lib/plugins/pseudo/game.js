ig.module(
  'plugins.pseudo.game'
)
.requires(
  'impact.game'
 ,'impact.entity'
  
 ,'plugins.pseudo.camera'
)
.defines( function() {
  
  var Strip = function( x, dist, face, bit, height ) {
    this.x = x
    this.dist = dist
    this.face = face
    this.bit = bit
    this.height = height
    
    this.num = 1
  }

  Strip.prototype.set = function( x, dist, face, bit, height ) {
    this.x = x
    this.dist = dist
    this.face = face
    this.bit = bit
    this.height = height
    
    this.num = 1
  }
  
  ig.Game.inject({
    strips: null,
    numRays: 0,
    
    fovMin: -Math.PI / 4,
    fovMax: Math.PI / 4,
    fov: 60 * Math.PI / 180,
    viewDist: 0,
    
    wallHeight: 8,
    
    init: function() {
      this.numRays = ig.system.width * ig.system.scale / this.stripWidth | 0
      this.strips = new Array( this.numRays )

      for ( var i = this.numRays; i--; ) {
        this.strips[i] = new Strip( 0, 0, 0, 0, 0 )
      }

      this.viewDist = ( ig.system.width * ig.system.scale / 2 ) / Math.tan( this.fov / 2 )
      
      // bottom floor
      this.lingrad = ig.system.context.createLinearGradient( 0, ig.system.height / 2 * ig.system.scale, 0, ig.system.height * ig.system.scale )
      this.lingrad.addColorStop( 0, '#000' )
      this.lingrad.addColorStop( 1, '#222' )
    },
    
    update: function() {
      this.parent()

      if ( this.camera ) {
        this.castMapRays()
        
        this.strips.sort( this.sortDist )
      }
    },
    
    sortDist: function( a, b ) {
      return b.dist - a.dist
    },
    
    // thanks to: http://www.benjoffe.com/code/demos/canvascape/textures
    castMapRays: function() {
      var theta = this.camera.rotation - Math.PI / 6
      
      var x = ( this.camera.pos.x + this.camera.size.x / 2 ) - (Math.cos( this.camera.rotation ) * 3)
      var y = ( this.camera.pos.y + this.camera.size.y / 2 ) - (Math.sin( this.camera.rotation ) * 3)
      
      x /= this.collisionMap.tilesize
      y /= this.collisionMap.tilesize
      
      var deltaX, deltaY
      var distX, distY
      var stepX, stepY
      var mapX, mapY

      var atX = x | 0
      var atY = y | 0
      
      var t_theta = 0
      var old_theta = theta
      
      var h = 0
      var d = 0

      for ( var i = 0; i < this.numRays; i++ ) {
        theta += Math.PI / ( 3 * this.numRays ) + 2 * Math.PI
        theta %= 2 * Math.PI
        
        t_theta = old_theta + ( Math.PI / ( 3 * this.numRays ) * i )

        mapX = atX
        mapY = atY

        deltaX = 1 / Math.cos( theta )
        deltaY = 1 / Math.sin( theta )

        if ( deltaX > 0 ) {
          stepX = 1
          distX = ( mapX + 1 - x ) * deltaX
        }
        else {
          stepX = -1
          distX = ( x - mapX ) * ( deltaX *= -1 )
        }
        
        if ( deltaY > 0 ) {
          stepY = 1
          distY = ( mapY + 1 - y ) * deltaY
        }
        else {
          stepY = -1
          distY = ( y - mapY ) * ( deltaY *= -1 )
        }

        while ( true ) {
          if ( distX < distY ) {
            mapX += stepX
            
            if ( this.collisionMap.data[mapY][mapX] > 0 ) {
              d = distX * Math.cos( this.camera.rotation - t_theta )
              h = this.viewDist / d
              
              this.strips[i].set( 
                i,
                distX,
                this.backgroundMaps[0].data[mapY][mapX] - 2,
                ( y + distX / deltaY * stepY ) % 1,
                h
              )
              
              break
            }
            
            distX += deltaX
          }
          else {
            mapY += stepY
            
            if ( this.collisionMap.data[mapY][mapX] > 0 ) {
              d = distY * Math.cos( this.camera.rotation - t_theta )
              h = this.viewDist / d
              
              this.strips[i].set( 
                i,
                distY,
                this.backgroundMaps[0].data[mapY][mapX] - 2,
                ( x + distY / deltaX * stepX ) % 1,
                h
              )
              
              break
            }
            
            distY += deltaY
          }
        }
      }
    },
    
    castPlayerRay: function( theta, x, y ) {
      var distX, distY
      var stepX, stepY

      var mapX = x | 0
      var mapY = y | 0

      var deltaX = 1 / Math.cos( theta )
      var deltaY = 1 / Math.sin( theta )

      if ( deltaX > 0 ) {
        stepX = 1
        distX = ( mapX + 1 - x ) * deltaX
      }
      else {
        stepX = -1
        distX = ( x - mapX ) * ( deltaX *= -1 )
      }
      
      if ( deltaY > 0 ) {
        stepY = 1
        distY = ( mapY + 1 - y ) * deltaY
      }
      else {
        stepY = -1
        distY = ( y - mapY ) * ( deltaY *= -1 )
      }

      while ( true ) {
        if ( distX < distY ) {
          mapX += stepX

          if ( 
            mapX >= this.camera.pos.x - this.camera.size.x && mapX <= this.camera.pos.x + this.camera.size.x &&
            mapY >= this.camera.pos.y - this.camera.size.y && mapY <= this.camera.pos.y + this.camera.size.y
          ) {
            return true
          }
          else if ( this.collisionMap.data[mapY/8|0][mapX/8|0] > 0 ) {
            return false
          }
          
          distX += deltaX
        }
        else {
          mapY += stepY
          
          if ( 
            mapX >= this.camera.pos.x - this.camera.size.x && mapX <= this.camera.pos.x + this.camera.size.x &&
            mapY >= this.camera.pos.y - this.camera.size.y && mapY <= this.camera.pos.y + this.camera.size.y
           ) {
            return true
          }
          else if ( this.collisionMap.data[mapY/8|0][mapX/8|0] > 0 ) {
            return false
          }
          
          distY += deltaY
        }
      }
    },
    
    castEntityRay: function() {
      var theta = this.camera.rotation
      
      var distX, distY
      var stepX, stepY
      
      var x = ( this.camera.pos.x + this.camera.size.x / 2 ) - (Math.cos( this.camera.rotation ) * 3)
      var y = ( this.camera.pos.y + this.camera.size.y / 2 ) - (Math.sin( this.camera.rotation ) * 3)

      var mapX = x | 0
      var mapY = y | 0

      var deltaX = 1 / Math.cos( theta )
      var deltaY = 1 / Math.sin( theta )

      if ( deltaX > 0 ) {
        stepX = 1
        distX = ( mapX + 1 - x ) * deltaX
      }
      else {
        stepX = -1
        distX = ( x - mapX ) * ( deltaX *= -1 )
      }
      
      if ( deltaY > 0 ) {
        stepY = 1
        distY = ( mapY + 1 - y ) * deltaY
      }
      else {
        stepY = -1
        distY = ( y - mapY ) * ( deltaY *= -1 )
      }

      while ( true ) {
        if ( distX < distY ) {
          mapX += stepX

          if ( this.collisionMap.data[mapY/8|0][mapX/8|0] > 0 ) {
            return false
          }
          else {
            for ( var i = this.entities.length; i--; ) {
              var entity = this.entities[i]
              
              if ( entity.enemy && !entity._killed ) {
                if ( 
                  mapX >= entity.pos.x && mapX <= entity.pos.x + entity.size.x &&
                  mapY >= entity.pos.y && mapY <= entity.pos.y + entity.size.y
                ) {
                  return entity
                }
              }
            }
          }
          
          distX += deltaX
        }
        else {
          mapY += stepY
          
          if ( this.collisionMap.data[mapY/8|0][mapX/8|0] > 0 ) {
            return false
          }
          else {
            for ( var i = this.entities.length; i--; ) {
              var entity = this.entities[i]
              
              if ( entity.enemy && !entity._killed ) {
                if ( 
                  mapX >= entity.pos.x && mapX <= entity.pos.x + entity.size.x &&
                  mapY >= entity.pos.y && mapY <= entity.pos.y + entity.size.y
                ) {
                  return entity
                }
              }
            }
          }
          
          distY += deltaY
        }
      }
    },
    
    draw: function() {
      if ( this.drawPseudo && this.camera ) {
        // top
        ig.system.context.fillStyle = 'rgb(0, 0, 0)'
        ig.system.context.fillRect( 0, 0, ig.system.width * ig.system.scale, ig.system.height / 2 * ig.system.scale )
        // bottom
        ig.system.context.fillStyle = this.lingrad
        ig.system.context.fillRect( 0, ig.system.height / 2 * ig.system.scale, ig.system.width * ig.system.scale, ig.system.height * ig.system.scale )

        var drawEntities = []

        var camVecX = Math.cos( this.camera.rotation )
        var camVecY = Math.sin( this.camera.rotation )

        for ( var i = this.entities.length; i--; ) {
          var entity = this.entities[i]
         
          if ( entity.draw3D ) {
            var dirX = (entity.pos.x + entity.size.x / 2) - (this.camera.pos.x + this.camera.size.x / 2);
            var dirY = (entity.pos.y + entity.size.y / 2) - (this.camera.pos.y + this.camera.size.y / 2);

            var angle = this.getAngle( camVecX, camVecY, dirX, dirY );

            if ( angle > this.fovMin && angle < this.fovMax ) {
              var dist = Math.sqrt( dirX * dirX + dirY * dirY )
              entity.drawDist = dist / 8

              if ( entity.drawDist < this.strips[0].dist ) {
                entity.drawX = Math.tan( angle ) * this.viewDist
                entity.drawSize = this.viewDist / ( Math.cos( angle ) * dist )

                drawEntities.push( entity )
              }
            }
          }
        }

        drawEntities.sort( this.sortEntitiesDist )

        var theta = this.camera.rotation - Math.PI / 6
        var z = 1 - this.camera.posZ / 2

        for ( var i = 0; i < this.numRays; i++ ) {
         var strip = this.strips[i]
         
         for ( var e = 0; e < drawEntities.length; e++ ) {
            if ( !drawEntities[e].drawn && drawEntities[e].drawDist >= strip.dist ) {
              drawEntities[e].drawPseudo()
            }
          }
         
         var texX = strip.bit * (this.textureSizeX - ig.system.scale) * ig.system.scale + strip.face * this.textureSizeX * ig.system.scale

         ig.system.context.drawImage(
           this.texture.data, 
           texX, 
           0, 
           this.stripWidth * ig.system.scale * strip.num, this.texture.height * ig.system.scale, 
           strip.x * this.stripWidth, 
           ig.system.height * ig.system.scale / 2 - strip.height * z - this.wallHeight * strip.height, 
           this.stripWidth * strip.num, strip.height * (this.wallHeight + 1)
         )

         ig.system.context.globalAlpha = strip.dist / 20
         ig.system.context.fillStyle = 'rgb(0,0,0)'
         ig.system.context.fillRect(
           strip.x * this.stripWidth, ig.system.height * ig.system.scale / 2 - strip.height * z - this.wallHeight * strip.height,
           this.stripWidth * strip.num, strip.height * (this.wallHeight + 1)
         )
         ig.system.context.globalAlpha = 1

         i += strip.num - 1

         ig.Image.drawCount++
        }

        // draw the rest
        for ( var e = 0; e < drawEntities.length; e++ ) {
          if ( !drawEntities[e].drawn ) {
            drawEntities[e].drawPseudo()
          }
        }

        this.camera.drawPseudo()
      }
      else this.parent()
    },
    
    sortEntitiesDist: function( a, b ) {
      return b.drawDist - a.drawDist
    },
    
    getAngle: function( aX, aY, bX, bY ) {
      var angle = Math.atan2( aX, aY ) - Math.atan2( bX, bY )

      if ( angle >  Math.PI) angle -= 2 * Math.PI
      if ( angle < -Math.PI) angle  = 2 * Math.PI + angle

      return angle
    }
    
  })
  
})