/**
 * ui/shots.js
 * 
 * Displays how many shots each player has taken
 * 
 */

$(function() {
    m3.ui.shots = function() {
        var context   = m3.game.context,
            ui        = m3.ui,
            camera    = m3.camera.position;
        
        return {
            update: function() {
                var state   = m3.game.state,
                    starter = state.starter,
                    shots   = state.shots,
                    x       = camera.x + (m3.game.width / 2) - 30,
                    y       = camera.y + 15,
                    left    = Math.floor(shots / 2),
                    right   = left,
                    max     = state.max_shots / 2;
                    infinite_shots = m3.game.state.game_mode === "last_monkey_standing";
                    
                // Keeps track of who went first and adjusts
                // their number of shots accordingly
            	if (shots % 2 !== 0) starter === 0 ? left+=1 : right+=1;
                
                // Draws the text to keep track of the shots
                context.fillStyle   = "rgba(240, 255, 245, 0.95)";
                context.font        = "15px Tahoma, Geneva, sans-serif";
                context.textAlign   = "right";
                context.strokeStyle = "rgba(0, 25, 0, 0.75)";
                
                ui.drawStrokedText("Shots", x, y);
                ui.drawStrokedText("" + left + (!infinite_shots ? "/" + max : ""), x, y + 15);
                
                context.textAlign = "left";
                ui.drawStrokedText("Shots", x + 60, y);
                ui.drawStrokedText("" + right + (!infinite_shots ? "/" + max : ""), x + 60, y + 15);
            }
        };
    }();
});
