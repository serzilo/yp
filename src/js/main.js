//= ../js/jquery.js
//= ../js/data.js

(function($){
	function Presentation(el, data){
		this.element = $(el);
		this.slides = data.slides;
		this.slidesLength = this.slides.length;
		this.slidesDir = data.dir;
		this.current = 0;
		this.bodyScrollTop = 0;
		this.loadedImages = {};

		this.tmpl = {
			main:   '#presentation-main_tmpl'
		}

		this._init();
		tooltips.init();
	}

	$.extend(Presentation.prototype, {
		_init: function(){
			var self = this,
				templateData = {
					slide: self._setSrc(),
					slidesLength: self.slidesLength,
					previousDisabled: 1
				};

			if (self.slidesLength < 2){
				templateData.nextDisabled = 1;
			}

			self.element.html(Presentation.render($(self.tmpl.main).html(), templateData));

			self.loadedImages[self.current] = 1;

			self._addListners();
		},
		_addListners: function(){
			var self = this;

			// кнопки вперёд-назад
			self.element.on('click', '.js-request-slide', function(e){
				e.preventDefault();
				e.stopPropagation();

				self._requestSlide($(this).data('direction'));
			});

			self.element.on('click', '.js-toolbar__search-page-btn', function(e){
				e.preventDefault();
				e.stopPropagation();

				self._searchSlide();
			});

			self.element.on('keydown', '.js-input-text_num', function(e){
				var allowedKey = self._validateKeys(e);

				if (allowedKey.allow === false){
					e.preventDefault();
					e.stopPropagation();
				} else {
					if (allowedKey.type == 'enter'){
						self._searchSlide();
					}
				}
			}).on('blur', '.js-input-text_num', function(e){
				var $this = $(this);

				if ($this.val() == ''){
					$this.val(self.current+1);
				}
			});


			self.element.on('click', '.js-btn-link_fullscreen', function(e){
				e.preventDefault();
				e.stopPropagation();

				self._openWindow();
			});

			self.element.on('click', '.js-btn-link_exit_fullscreen', function(e){
				e.preventDefault();
				e.stopPropagation();

				self._closeWindow();
			});
		},
		_requestSlide: function(direction){
			var changeSlide = false;

			if (direction === 'start'){
				this.current = 0;
				changeSlide = true;
			} else if (direction === 'finish'){
				this.current = this.slidesLength - 1;
				changeSlide = true;
			} else if (this.slides[this.current+direction]){
				this.current += direction;
				changeSlide = true;
			}

			if (changeSlide === true){
				this._setSlide();
				this._setControlsStatements();
			}
		},
		_setSrc: function(){
			var self = this,
				src = self.slides[self.current];

			if (self.slides[self.current].search('http://') == -1){
				src = self.slidesDir + src;
			}

			return src;
		},
		_setSlide: function(){
			var self = this,
				preloader = self.element.find('.pres__preloader'),
				src = self._setSrc();

			preloader.addClass('hide');

			if (self.loadedImages[self.current]){
				setImageSrc(src);
			} else {
				console.log('start loading image ' + self.current);

				var img = new Image(),
					loaderDelay = setTimeout(function(){
						preloader.removeClass('hide');
					},500);

				img.src = src;

				img.onload = function(){
					console.log('stop loading image ' + self.current);

					clearTimeout(loaderDelay);

					setImageSrc(src);
					self.loadedImages[self.current] = 1;
					preloader.addClass('hide');
				}
			}

			function setImageSrc(src){
				self.element.find('.js-pres__slide').attr({'src': src});
			}
		},
		_setControlsStatements: function(){
			var btnSlidePrev   = this.element.find('.js-request-slide_prev'),
				btnSlideNext   = this.element.find('.js-request-slide_next'),
				presNavPrev    = this.element.find('.js-pres__nav_prev'),
				presNavNext    = this.element.find('.js-pres__nav_next');

			// поле для ввода номера страницы
			this.element.find('.js-input-text_num').val(this.current + 1);

			// проверка, можно ли листать вперед
			if (this.slides[this.current + 1]){
				btnSlideNext.removeClass('btn-link_disabled');
				presNavNext.removeClass('pres__nav_disabled');
			} else {
				btnSlideNext.addClass('btn-link_disabled');
				presNavNext.addClass('pres__nav_disabled');
			}

			// проверка, можно ли листать назад
			if (this.slides[this.current - 1]){
				btnSlidePrev.removeClass('btn-link_disabled');
				presNavPrev.removeClass('pres__nav_disabled');
			} else {
				btnSlidePrev.addClass('btn-link_disabled');
				presNavPrev.addClass('pres__nav_disabled');
			}
		},
		_searchSlide: function(){
			var self = this,
				slideNumInputVal = self.element.find('.js-input-text_num').val() - 1;

			if (self.slides[slideNumInputVal] && slideNumInputVal != self.current){
				self.current = slideNumInputVal;

				self._setSlide();
				self._setControlsStatements();
			}
		},
		_validateKeys: function(e) {
			var keyCode = e.keyCode,
				obj = {};

			obj.allow = false;

			console.log(keyCode);

			// цифры (48-57)
			// стереть - 8
			// enter - 13
			if ((keyCode >= 48 && keyCode <= 57) || keyCode == 8 || keyCode == 13){
				obj.allow = true;

				if (keyCode == 13){
					obj.type = 'enter';
				}
			} 

			return obj;
		},
		_openWindow: function(){
			var self = this;

			self.bodyScrollTop = Presentation.getBodyScrollTop();

			$('body').css({'overflow':'hidden'});

			self.element.addClass('fullscreen');

			self.element.find('.js-btn-link_fullscreen').addClass('hide').end().find('.js-btn-link_exit_fullscreen').removeClass('hide');

			$(window).on('keydown.presentationWindow', function(e){
				self._windowKeysHandler(e);
			});

		},
		_closeWindow: function(){
			var self = this;

			$(window).off('.presentationWindow');

			self.element.removeClass('fullscreen');

			self.element.find('.js-btn-link_exit_fullscreen').addClass('hide').end().find('.js-btn-link_fullscreen').removeClass('hide');

			$('body').css({'overflow':'auto'}).scrollTop(self.bodyScrollTop);
		},
		_windowKeysHandler: function(e){
			// esc - 27
			// назад - 37
			// вперед - 39

			var self = this,
				keyCode = e.keyCode,
				keys = {
					27: {method: '_closeWindow',  param: ''},
					37: {method: '_requestSlide', param: -1},
					39: {method: '_requestSlide', param: 1}
				};

			if (keys[keyCode]){
				e.preventDefault();
				e.stopPropagation();

				self[keys[keyCode]['method']].call(self, keys[keyCode]['param']);
			} else {
				console.log('unknown key');
			}
			
		}
	});

	$.extend(Presentation, {
		render: function(tmpl, data){
			var html = tmpl,
				value, 
				reg1,
				reg2;

			if (data){
				for (key in data) {
					if (data.hasOwnProperty(key)) {
						value = data[key];

						// add varibales
						reg1 = new RegExp("{{ " + key + " }}", "g");

						// if
						reg2 = new RegExp('\{if ' + key + '\}(.*?)\{/if\}', 'gim');

						html = html.replace(reg1, value).replace(reg2, '$1');
					}
				}
			} 

			reg1 = new RegExp("{{ (.*?)}}", "g");
			reg2 = new RegExp('\{if (.*?)\}(.*?)\{/if\}', 'gim');

			html = html.replace(reg1, '').replace(reg2, '');

			return html;
		},
		getBodyScrollTop: function(){
			return (document.body && document.body.scrollTop) || (document.documentElement && document.documentElement.scrollTop);
		}
	});


	$.fn.presentation = function(options){
		return this.each(function(i){
			new Presentation(this, options[i]);
		});
	}

	var tooltips = {
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
			if ( (selfOffsetX + (tWidth / 2) ) <  documentWidth - 20){
				tOffsetX = selfOffsetX - (tWidth / 2) + (selfWidth / 2);
				tOffsetY = selfOffsetY - tHeight - 15;

				classes = tClassName + '_top';
			// сбоку
			} else {
				tOffsetX = selfOffsetX - tWidth - 15;
				tOffsetY = selfOffsetY -(tHeight / 2) + (selfHeight / 2);

				classes = tClassName + '_left';
			}

			return {'css': {'left': parseInt(tOffsetX) + 'px', 'top': parseInt(tOffsetY) + 'px'}, 'classes': classes};
		},
		destroy: function(){
			$('body').off('.tooltips');
			tooltips.inited = false;
		}
	};



	$(function(){
		$('#presentation1, #presentation2, #presentation3').presentation(PRESENTATIONS_DATA);
	})

}(jQuery));