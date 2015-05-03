(function($){
	window.tooltips = {
			elements: '[data-tooltip]',
			inited: false,
			init: function(){
				if (tooltips.inited === false){
					var $body = $('body');

					$body.on('mouseenter.tooltips', tooltips.elements, function(e){
						var self = $(this),
							tClassName = 'tooltip',
							tText = self.data('tooltip'),
							tHtml = $('<div class="' + tClassName + '">' + tText + '</div>'),
							tooltipSettings;

						$body.prepend(tHtml);

						tooltipSettings = tooltips._positionTooltip(self, tHtml, tClassName);

						tHtml.css(tooltipSettings.css).addClass(tooltipSettings.classes);

						setTimeout(function(){
							tHtml.addClass(tClassName + '_show');
						}, 0);

						self.one('mousedown.tooltips mouseleave.tooltips', function(){
							tHtml.remove();
							self.off('.tooltips');
						});
					});

					tooltips.inited = true;
				}
			},
			_positionTooltip: function(self, tHtml, tClassName){
				var selfWidth = self.outerWidth(),
					selfHeight = self.outerHeight(),
					offset = self.offset(),
					selfOffsetX = offset.left,
					selfOffsetY = offset.top,
					tWidth = 0,
					tHeight = 0,
					tOffsetX = 0,
					tOffsetY = 0,
					$document = $(document),
					documentHeight = $document.height(),
					documentWidth  = $document.width(),
					classes;

				tWidth  = tHtml.outerWidth();
				tHeight = tHtml.outerHeight();

				// сверху
				if (( (selfOffsetX + (tWidth / 2) ) <  documentWidth - 20) && ( (selfOffsetX - (tWidth / 2)) > 20 )){
					tOffsetX = selfOffsetX - (tWidth / 2) + (selfWidth / 2);
					tOffsetY = selfOffsetY - tHeight - 15;

					classes = tClassName + '_top';
				// сбоку
				} else {
					// слева от эклемента
					tOffsetX = selfOffsetX - tWidth - 10;
					classes = tClassName + '_left';

					if (tOffsetX < 10){
						//  справа от элемента
						tOffsetX = selfOffsetX + selfWidth + 10;
						classes = tClassName + '_right';
					}

					tOffsetY = selfOffsetY -(tHeight / 2) + (selfHeight / 2);
				}

				return {'css': {'left': parseInt(tOffsetX) + 'px', 'top': parseInt(tOffsetY) + 'px'}, 'classes': classes};
			},
			destroy: function(){
				$('body').off('.tooltips');
				tooltips.inited = false;
			}
		};
}(jQuery));