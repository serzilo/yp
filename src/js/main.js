//= ../js/jquery.js
//= ../js/data.js

(function($){
	function Presentation(el, data){
		this.element = $(el);
		this.slides = data.slides;
		this.slidesLength = this.slides.length;
		this.slidesDir = data.dir;
		this.current = 0;

		this._init();
	}

	$.extend(Presentation.prototype, {
		_init: function(){
			this.element.html(Presentation._render($('#presentation-main').html(), {
				slide: this.slidesDir + this.slides[0],
				slidesLength: this.slidesLength,
				previousDisabled: 1
			}));

			this._addListners();
		},
		_addListners: function(){
			var self = this;

			// кнопки вперёд-назад
			this.element.on('click', '.js-request-slide', function(e){
				e.preventDefault();
				e.stopPropagation();

				self._requestSlide($(this).data('direction'));
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
				this._setControlsStatuses();
			}
		},
		_setSlide: function(){
			this.element.find('.js-pres__slide').attr({'src': this.slidesDir + this.slides[this.current]});
		},
		_setControlsStatuses: function(){
			// поле для ввода номера страницы
			this.element.find('.js-input-text_num').val(this.current+1);

		}
	});

	$.extend(Presentation, {
		_render: function(tmpl, data){
			var html = tmpl,
				value, 
				reg,
				reg2;

			if (data){
				for (key in data) {
					if (data.hasOwnProperty(key)) {
						value = data[key];

						// add varibales
						reg = new RegExp("{{ " + key + " }}", "g");
						html = html.replace(reg, value);

						// if
						reg2 = new RegExp("{if " + key +"}([\s\w\d_-]+){/if}", "gim");
						html = html.replace(reg2, '');
						//html = html.replace(/\{if previousDisabled\}([\s\w\d_-]+)\{\/if\}/gim, '\1')
					}
				}
			} else {
				html = html.replace(/\{+(.*?)\}+/g, "");
			}

			return html;
		}
	});


	$.fn.presentation = function(options){
		return this.each(function(i){
			new Presentation(this, options[i]);
		});
	}


	$(function(){
		$('#presentation1, #presentation2, #presentation3').presentation(PRESENTATIONS_DATA);
	})

}(jQuery));