$(document).ready(function() {
	m3.util = function() {
		var log_count = 0;
		var max_log_count = 1000;
		
		return {
			log: function(text) {
				$("#console_items").append("<p>" + text + "</p>");
				log_count++;
				
				if (log_count > max_log_count) {
					$("#console_items").children("p").first().remove();
				}
			},
		};
	}();
});