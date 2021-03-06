/**
 * enemy.js
 *
 * This object represents the enemy monkeys found in the fort.
 *
 */

$(function() {
    m3.types.Enemy = function() {
        var Enemy = Object.create(m3.types.PhysicsObject);
        Enemy.Enemy = Enemy;

        // Private members.
        var Sprite = m3.types.Sprite,
            assets = m3.assets.sprites,
            b2Vec2 = Box2D.Common.Math.b2Vec2;

        var enemies = {
            monkey: {
                small: { s: assets.monkey, h: 53, w: 50 },
                medium:{ s: assets.monkey_helmet, h: 55, w: 50 },
                large: { s: assets.monkey_spike, h: 62, w: 50}
            }
        };

        var details = {
            small: { density: 1.25, restitution: 0.25, friction: 0.85, minImpactVelocity: 0.2, destroyThreshold: 1.5 },
            medium:{ density: 1.25, restitution: 0.25, friction: 0.85, minImpactVelocity: 0.3, destroyThreshold: 2.75 },
            large: { density: 1.25, restitution: 0.25, friction: 0.85, minImpactVelocity: 0.3, destroyThreshold: 4.5 }
        };

        /**
         * Processes the collision between this enemy and some other object, which could be
         * a projectile, fort piece, enemy, etc.
         */
        Enemy.contact = function (other, velocity) {
            if (velocity > this.minImpactVelocity) {
                m3.assets.sfx.monkeyGrunt.play();
            }

            //m3.util.log("ENEMY contact (" + this + ") with " + other.type + " (" + other + ")");

            if (other.type === "projectile") {
                m3.camera.stopFollowing();

//                if (m3.launcher.currentLauncher().pType === "watermelon") {
//                    other.type = "broken";
//                    other.body.SetLinearVelocity(new b2Vec2(0,0));
//                    other.sprite.play("ticking");
//
//                    setTimeout(function () {
//                        other.sprite.play("explode");
//                        m3.world.explode(new b2Vec2(other.x, other.y));
//                        m3.assets.sfx.splat.play();
//
//                        setTimeout(function () {
//                            other.type = "done";
//                            other.alive = false;
//                        }, 1000);
//                    }, 1000);
//                }
            }
            else if (other.type === 'fort_piece') {
                if (velocity > this.minImpactVelocity) {
                    other.damage += (velocity * this.mass) / m3.config.damage_factor;
                }

                if (other.damage >= other.destroyThreshold / 3 && other.damage < other.destroyThreshold * 2 / 3 && other.sprites.damaged) {
                    other.sprite = other.sprites.damaged;
                }
                else if (other.damage >= other.destroyThreshold * 2 / 3 && other.damage < other.destroyThreshold && other.sprites.destroyed) {
                    other.sprite = other.sprites.destroyed;
                }
                else if (other.damage > other.destroyThreshold) {
                    other.alive = false;
                    m3.score.playerDestroyed(other);
                }
            }
            else if (other.type === 'enemy') {
                if (velocity > other.minImpactVelocity) {
                    other.damage += (velocity * this.mass) / m3.config.damage_factor;
                }

                if (other.damage > other.destroyThreshold) {
                    other.alive = false;
                }
            }
        };

        // When an enemy is destroyed, we check to see if the game has ended.
        Enemy.destroy = function() {
            this.PhysicsObject.destroy.call(this);

            if (this.fort && this.fort.enemies.length <= 0) {
                m3.game.state.endRound((this.fort.owner + 1) % 2);
            }
        };

        Enemy.update = function() {
            this.PhysicsObject.update.call(this);

            var context = m3.game.context;

            if (m3.game.state.EditLevelState) {
                context.fillStyle = (this.out_of_bounds) ? "rgba(255, 20, 10, 0.6)" : "rgba(100, 180, 255, 0.6)";
                context.beginPath();
                context.arc(this.x, this.y, m3.config.grabber_radius, 0.0, Math.PI * 2, false);
                context.fill();
                context.closePath();
            }
        };

        // Constructor.
        Enemy.create = function(fort, character, type, x, y, angle, container, fixed, stop_animation) {
            var e     = m3.types.PhysicsObject.create(x, y, container, this),
                t     = enemies[character][type],
                d     = details[type],
                scale = m3.config.scaling_factor,
                piece = m3.world.createBox(x / scale, y / scale, t.w / scale, t.h / scale, angle,
                                           fixed, d.density, d.restitution, d.friction);

                piece.body.SetUserData(e);
                e.destroyThreshold  = d.destroyThreshold;
                e.minImpactVelocity = d.minImpactVelocity;

                e.enemy_type = character;
                e.enemy_size = type;
                e.body          = piece.body;
                e.shape         = piece.shape;
                e.fort          = fort;
                e.type          = "enemy";
                e.subtype       = character + '_' + type;
                e.angle         = angle;
                e.alive         = true;
                e.damage        = 0;
                e.sprite        = Sprite.create(t.s, t.h, t.w);
                e.out_of_bounds = false;

                if (!stop_animation) {
                    if (type === "small") {
                        e.sprite.addAnimation(e.subtype, [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 2, 3, 3, 2, 2, 3, 3, 2, 2, 0, 0], 0.12);
                        e.sprite.addAnimation("death", [4, 4, 5, 6, 7], 0.25);
                    }
                    else if (type === "medium") {
                        e.sprite.addAnimation(e.subtype, [0, 0, 0, 0, 1, 1, 2, 2, 2, 3, 3, 3, 2, 2, 2, 3, 3, 3], 0.12);
                        e.sprite.addAnimation("death", [4, 4, 5, 6], 0.25);
                    }
                    else if (type === "large") {
                        e.sprite.addAnimation(e.subtype, [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 2, 2, 3, 3, 2, 2, 3, 3, 2, 2, 0, 0], 0.12);
                        e.sprite.addAnimation("death", [4, 4, 5, 6, 7], 0.25);
                    }

                    e.sprite.play(e.subtype);
                }

                return e;
        };

        return Enemy;
    }();
});
