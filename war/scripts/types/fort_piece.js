/**
 * fort_piece.js
 *
 * This object represents a chunk of a fort.
 */

$(function () {
    m3.types.FortPiece = function () {
        var FortPiece = Object.create(m3.types.PhysicsObject);
        FortPiece.FortPiece = FortPiece;

        // Private members.
        var Sprite = m3.types.Sprite,
            Vector = m3.types.Vector,
            b2Vec2 = Box2D.Common.Math.b2Vec2,
            assets = m3.assets.sprites.fort_pieces;


        var pieces = {
            box: {
                long: {
                    wood: { s: assets.box_long_wood, h: 100, w: 10, cost: 20 },
                    rock: { s: assets.box_long_rock, h: 100, w: 10, cost: 40 }
                },
                short: {
                    wood: { s: assets.box_short_wood, h: 50, w: 10, cost: 8 },
                    rock: { s: assets.box_short_rock, h: 50, w: 10, cost: 16 }
                },
                square: {
                    wood: { s: assets.box_square_wood, h: 25, w: 25, cost: 5 },
                    rock: { s: assets.box_square_rock, h: 25, w: 25, cost: 10 }
                },
                wide: {
                    wood: { s: assets.box_wide_wood, h: 40, w: 20, cost: 8 },
                    rock: { s: assets.box_wide_rock, h: 40, w: 20, cost: 16 }
                }
            },

            triangle: {
                small: {
                    wood: { s: assets.triangle_wood, h: 18, w: 36, cost: 5,
                            vertices: [[0,-12], [18, 6], [-18,6]], spriteOffset: Vector.create(18,12)},
                    rock: { s: assets.triangle_rock, h: 18, w: 37, cost: 10,
                            vertices: [[0,-12], [19, 6], [-19,5]], spriteOffset: Vector.create(19,12) }
                }
            }
        };

        var materials = {
            wood: { density: 3.0,  restitution: 0.25, friction: 0.8, minImpactVelocity: 0.5,  destroyThreshold: 4.0 },
            rock: { density: 13.0, restitution: 0.5,  friction: 0.9, minImpactVelocity: 0.65, destroyThreshold: 8.0 }
        };

        /**
         * Processes the collision between this fort piece and some other object, which could be
         * a projectile, fort piece, enemy, etc.
         */
        FortPiece.contact = function (other, velocity) {

            //m3.util.log("FORT PIECE contact (" + this + ") with " + other.type + " (" + other + ")");

//            if (m3.launcher.currentLauncher().pType === "watermelon" && other.type === "projectile") {
//                other.type = "broken";
//                other.body.SetLinearVelocity(new b2Vec2(0,0));
//                other.sprite.play("ticking");
//
//                setTimeout(function () {
//                    other.sprite.play("explode");
//                    m3.world.explode(new b2Vec2(other.x, other.y));
//                    m3.assets.sfx.splat.play();
//
//                    setTimeout(function () {
//                        other.type = "done";
//                        other.alive = false;
//                    }, 1000);
//                }, 1000);
//            }

            if (other.type === 'fort_piece') {
                if (velocity > this.minImpactVelocity) {
                    other.damage += (velocity * this.mass) / m3.config.damage_factor;
                }

                if (other.damage >= other.destroyThreshold / 3 && other.damage < other.destroyThreshold * 2 / 3 && other.sprites.damaged) {
                    other.sprite = other.sprites.damaged;
                }
                else if (other.damage > other.destroyThreshold) {
                    other.alive = false;
                    m3.score.playerDestroyed(other);
                }
            }
            else if (other.type === 'enemy') {
                if (velocity > this.minImpactVelocity) {
//                    m3.util.log('fort piece hit enemy at: ' + velocity.toFixed(2) + ' m/s');
                    other.damage += (velocity * this.mass) / m3.config.damage_factor;
//                    m3.util.log('fort piece damage: ' + this.damage.toFixed(2));
//                    m3.util.log('enemy damage: ' + other.damage.toFixed(2));
                }

                if (other.damage > other.destroyThreshold) {
                    other.alive = false;
//                    m3.util.log('enemy destroyed');
//                    m3.score.playerDestroyed(other);
                }
            }
        };

        // Override update so we can draw a circle on the piece if we're in the edit level state.
        FortPiece.update = function () {
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
        FortPiece.create = function(fort, shape, size, material, x, y, angle, container, fixed) {
            var f     = m3.types.PhysicsObject.create(x, y, container, this),
                t     = pieces[shape][size][material],
                m     = materials[material],
                scale = m3.config.scaling_factor,
                piece = t.vertices ? m3.world.createPoly(x / scale, y / scale, m3.util.pixelsToMeters(t.vertices), angle,
                                           fixed, m.density, m.restitution, m.friction)
                                   : m3.world.createBox(x / scale, y / scale, t.w / scale, t.h / scale, angle,
                                           fixed, m.density, m.restitution, m.friction);

            piece.body.SetUserData(f);
            f.sprites = {};
            f.sprites.normal    = Sprite.create(t.s.normal, t.h, t.w);
            f.sprites.damaged   = t.s.damaged ? Sprite.create(t.s.damaged, t.h, t.w) : null;
            f.destroyThreshold  = m.destroyThreshold;
            f.minImpactVelocity = m.minImpactVelocity;

            if (t.spriteOffset) f.spriteOffset = t.spriteOffset;

            f.piece_shape    = shape;
            f.piece_size     = size;
            f.piece_material = material;
            f.fort           = fort;
            f.body           = piece.body;
            f.shape          = piece.shape;
            f.sprite         = f.sprites.normal;
            f.type           = "fort_piece";
            f.cost           = t.cost;
            f.alive          = true;
            f.damage         = 0;
            f.out_of_bounds  = false;

            return f;
        };

        return FortPiece;
    }();
});
