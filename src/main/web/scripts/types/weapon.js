/**
 * weapon.js
 * 
 * This object represents the launcher located in each fortress.
 * 
 */

$(function() {
    m3.types.Weapon = function() {
    	    	
        var Sprite = m3.types.Sprite,
            assets = m3.assets.sprites,
            b2Vec2 = Box2D.Common.Math.b2Vec2;
        
        var skins = {
            cannon: {
                grey: { s: assets.cannon, h: 60, w: 92, barrel_height: 41, wheel_radius: 21, 
        	            spriteOffset_left: m3.types.Vector.create(21,39), spriteOffset_right: m3.types.Vector.create(71,39) }
            }       
        };
        
        var details = {
            grey: { density: 20, restitution: 0.1, friction: 1.0, power: 250 }
        };
        
        return {
        	
            //Collision callback.
            contact: function(other, velocity) {
                if (other.type === 'fort_piece') {
                    if (velocity > other.minImpactVelocity) {
                        other.damage += (velocity * this.mass) / m3.config.damage_factor;
                        
                        m3.util.log('fort piece hit weapon: ' + velocity.toFixed(2) + ' m/s');
                        m3.util.log('fort piece damage: ' + other.damage.toFixed(2));
                    }
                    
                    if (other.damage > other.destroyThreshold) {
                        other.alive = false;
                        m3.score.playerDestroyed(other);
                        
                        m3.util.log('fort piece destroyed');
                    }
                }
                else if (other.type === 'enemy') {
                    if (velocity > other.minImpactVelocity) {
                        other.damage += (velocity * this.mass) / m3.config.damage_factor;
                        
                        m3.util.log('enemy hit weapon: ' + velocity.toFixed(2) + ' m/s');
                        m3.util.log('enemy damage: ' + other.damage.toFixed(2));
                    }
                    
                    if (other.damage > other.destroyThreshold) {
                        other.alive = false;
                        m3.score.playerDestroyed(other);
                        
                        m3.util.log('enemy destroyed');
                    }
                }
            },
            
            // Constructor.
            create: function(fort, skin, type, side, angle, axisOffset, launchOffset) {
                var s = skins[skin][type],
                    d = details[type],
                    scale = m3.config.scaling_factor,
                    x = 0,
                    y = m3.config.level_height - m3.config.ground_height - s.wheel_radius;
                    
                
                if (side === "left") {
                    x = m3.config.fort_width + m3.config.level_padding + 100;
                }
                else {
                    x = m3.config.level_width - m3.config.fort_width - m3.config.level_padding - s.w;
                }
                
                var object = Object.create(m3.types.PhysicsObject.create(x, y)),
                    
                    launcher = m3.world.createCircleBoxComposite(x / scale, y / scale, s.wheel_radius / scale,
                    		s.w / scale, s.barrel_height / scale, new b2Vec2(-1 * axisOffset.x / scale, -1 * axisOffset.y / scale), 0);
                
                launcher.body.SetUserData(object);
                object.contact      = this.contact;
                object.type         = 'weapon';
                object.fort         = fort;
                object.alive        = true;
                object.damage       = 0;
                object.body         = launcher.body;
                object.angle        = angle;
                object.barrel_height = s.barrel_height;
                object.facing       = fort.owner ? 'left' : 'right';
                object.axisOffset   = axisOffset;
                object.launchOffset = launchOffset;
                object.weapon       = 0;
                object.power        = d.power;                
                object.image        = s.s;
                object.pType        = "rock";
                object.pDetails     = "small";
                
                return object;
            }
        };
    }();
});