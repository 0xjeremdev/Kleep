module.exports = {
	openAnnotationListener: function() {
		const modal = $("#modal-fullclip");
		let selector = null;

		// Event listener for colors selection
		modal.find(".colors > div").click(function() {
			modal.find(".colors > div").removeClass("selected");
			$(this).addClass("selected");
		});

		// Event listener for modal selection before close
		modal.on($.modal.BEFORE_OPEN, function() {
			$(".colors > div").removeClass("selected");
			modal.removeAttr("type");
			selector = null;
		});

		// Event listeners for color code
		$(document).on("click", '[href="#modal-color-selection"]', function() {
			modal.attr("type", $(this).attr("value"));
			selector = $(this);
		});

		$(document).on(
			"dblclick",
			"#list-scrollbar .item .details .CircularCheckbox .query-name",
			function() {
				var fullclip = shortenedClips[$(this).text()];
				var annot;

				if (fullclip in annotations) {
					annot = annotations[fullclip];
				} else {
					annot = "";
				}

				if (isValidUrl(fullclip)) {
					electron.shell.openExternal(fullclip);
				} else {
					new PerfectScrollbar("#modal-fullclip .message", {
						wheelPropagation: false
					});
					$("#modal-fullclip .message").text(fullclip);
					$("#modal-fullclip .actions #annotation").val(annot);
					$("#modal-fullclip").modal();
				}
			}
		);

		$(document).on("click", ".modal-annotation-button", function() {
			// Log data
			var annotItem = $(this)
				.parent()
				.parent()
				.parent()
				.parent()
				.parent()
				.parent();
			var annotText = annotItem
				.find(".details .CircularCheckbox .query-name")
				.text();
			var fullclip = shortenedClips[annotText];
			var annot;

			if (fullclip in annotations) {
				annot = annotations[fullclip];
			} else {
				annot = "";
			}

			$("#modal-fullclip .message").text(fullclip);
			$("#modal-fullclip .actions #annotation").val(annot);
			$("#modal-fullclip").modal();
		});
	},
	annotateKleepListener: function() {
		$(".btn-annotate").click(function() {
			var text = $("#modal-fullclip .message").text();
			var ant = $("#modal-fullclip #annotation").val();
			ipc.send("annotate", fnameglobal, text, ant);

			$("#modal-fullclip .message").val("");
			$("#modal-fullclip #annotation").val("");
		});

		$(".btn-copy-annot").click(function() {
			var text = $("#modal-fullclip .message").text();
			clipboard.writeText(text);
		});
	}
};
