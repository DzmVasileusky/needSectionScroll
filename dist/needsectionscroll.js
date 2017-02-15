/*********************************************** 
  needSectionScroll 
  - Version 1.0.0
  - Copyright 2015 Dzmitry Vasileuski
	- Licensed under MIT (http://opensource.org/licenses/MIT)
***********************************************/

// plugin object
var needSectionScroll = (function() {

	// namespace
	var plugin = {};

	// cached nodes
	plugin.html = document.documentElement,
  plugin.body = document.body,
  plugin.window = window;

  // check if viewport units are supported
  plugin.isVhSupported = function() {
		var vhChecker = document.createElement('vhchecker');
	  vhChecker.setAttribute('style','position:absolute;bottom:100%;display:block;height: 50vh;');
	  document.body.appendChild(vhChecker);
	  var height = parseInt( plugin.window.innerHeight/2,10 ),
	      compStyle = parseInt( (plugin.window.getComputedStyle ? getComputedStyle(vhChecker, null) : vhChecker.currentStyle)['height'], 10 );
	  return compStyle == height;
	};

	// scroll to function
	plugin.scrollTo = function(to, duration, callback) {
		var scrollTop = ( plugin.window.pageYOffset !== undefined ) ? plugin.window.pageYOffset : document.documentElement.scrollTop,
		    scrollChange = to - scrollTop,
		    increment = 20;

		var animateScroll = function(elapsedTime) {        
      elapsedTime += increment;
      var position = easeInOut(elapsedTime, scrollTop, scrollChange, duration);

      plugin.window.scrollTo(0, position);

      if (elapsedTime < duration) {
        setTimeout(function() {
          animateScroll(elapsedTime);
        }, increment);
      } else {
        // update position after Safari bottom bar disappeared
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        	iosAnimateAfterScroll(0, callback, 50, plugin.currentSection.offsetTop - to);
        } else {
      		callback();
      	}
      }
    };

    // ios after scroll additional animation becouse of bottom bar disapperance
    var iosAnimateAfterScroll = function(elapsedTime, callback, iosDuration, iosScrollChange) {
    	elapsedTime += 5;
    	var position = to + iosScrollChange * ( elapsedTime / iosDuration );

      plugin.window.scrollTo(0, position);

			if (elapsedTime < iosDuration) {
        setTimeout(function() {
          iosAnimateAfterScroll(elapsedTime, callback, iosDuration, iosScrollChange);
        }, increment);
      } else {
      	callback();
      }
    }

    // animate scroll
    animateScroll(0);
	}

	// easing
	function easeInOut(currentTime, start, change, duration) {
    currentTime /= duration / 2;
    if (currentTime < 1) {
      return change / 2 * currentTime * currentTime + start;
    }
    currentTime -= 1;
    return -change / 2 * (currentTime * (currentTime - 2) - 1) + start;
	}

	// check if element is in viewport
	plugin.isInViewport = function(elem, mode) {
    var scrollTop = ( plugin.window.pageYOffset !== undefined ) ? plugin.window.pageYOffset : document.documentElement.scrollTop,
        scrollBottom = scrollTop + plugin.window.innerHeight,
        elemTop = elem.offsetTop,
        elemBottom = elemTop + elem.offsetHeight;

    if ( mode == 'contain' )
      return ( ((elemBottom <= scrollBottom) && (elemTop >= scrollTop)) || 
               ((elemBottom >= scrollBottom) && (elemTop <= scrollTop)) );
    else if ( mode == 'intersect' )
      return ( ((elemTop < scrollBottom) && (elemTop > scrollTop)) ||
               ((elemBottom < scrollBottom) && (elemBottom > scrollTop)) ||
               ((elemBottom >= scrollBottom) && (elemTop <= scrollTop)) );
  }

	// add css class
	plugin.addClass = function(elem, className) {
    if (elem.className.search(className) == '-1') {
      elem.className = elem.className ? elem.className + ' ' + className : className;
    }
  }

	// remove css class
	plugin.removeClass = function(elem, className) {
    var classPattern = '(^|\\s)' + className,
        re = new RegExp(classPattern, 'g');
    elem.className = elem.className.replace(re, '');
  }

  // lock scroll durin movement functions
  plugin.lockscroll = {};
  plugin.lockscroll.keys = {37: 1, 38: 1, 39: 1, 40: 1};

	plugin.lockscroll.preventDefault = function(e) {
	  e = e || plugin.window.event;
	  if (e.preventDefault)
	    e.preventDefault();
	  e.returnValue = false;  
	}

	plugin.lockscroll.preventDefaultForScrollKeys = function(e) {
    if (plugin.lockscroll.keys[e.keyCode]) {
	    plugin.lockscroll.preventDefault(e);
	    return false;
    }
	}

	plugin.lockscroll.disableScroll = function() {
	  if (plugin.window.addEventListener) // older FF
	    plugin.window.addEventListener('DOMMouseScroll', plugin.lockscroll.preventDefault, false);
	  plugin.window.onwheel = plugin.lockscroll.preventDefault; // modern standard
	  plugin.window.onmousewheel = document.onmousewheel = plugin.lockscroll.preventDefault; // older browsers, IE
	  plugin.window.ontouchmove  = plugin.lockscroll.preventDefault; // mobile
	  document.onkeydown  = plugin.lockscroll.preventDefaultForScrollKeys;
	}

	plugin.lockscroll.enableScroll = function() {
    if (plugin.window.removeEventListener)
      plugin.window.removeEventListener('DOMMouseScroll', plugin.lockscroll.preventDefault, false);
    plugin.window.onmousewheel = document.onmousewheel = null; 
    plugin.window.onwheel = null; 
    plugin.window.ontouchmove = null;  
    document.onkeydown = null;  
	}

	// global methods and properties
	return {

		/* Initialization of plugin
		***********************************************/
		init : function() {

			// set default config
			plugin.options = needSectionScroll.config['default'];

			// breake if lesser then device resolution in options
			if (plugin.window.innerWidth <= plugin.options.mobileOff)
				return

			// create and fill sections object
			plugin.sections = {};
			plugin.sectionsList = document.querySelectorAll('[data-sectionscroll]');
			for (var i = 0; i < plugin.sectionsList.length; i++) {
				var section = plugin.sectionsList[i],
				    name = section.getAttribute('data-sectionscroll');
				plugin.sections[name] = section;
				
				plugin.addClass(section, 'needsectionscroll_section');
				
				// verticalize
				if (plugin.options.verticalize) {
					var sectionContent =  document.createElement('div'),
							sectionVerticalizer =  document.createElement('div');
					plugin.addClass(sectionContent, 'needsectionscroll_section_content');
					plugin.addClass(sectionVerticalizer, 'needsectionscroll_section_verticalizer');
					sectionContent.innerHTML = section.innerHTML;
					section.innerHTML = '';
					section.appendChild(sectionContent);
					section.appendChild(sectionVerticalizer);

					plugin.addClass(section, 'needsectionscroll_section-verticalize');
				}
			}

			// create dotted nav
			if (plugin.options.pager) {
				plugin.pager = document.createElement('nav');
				plugin.pager.className = 'needsectionscroll_pager';

				for (var name in plugin.sections) {
					var pagerLink = document.createElement('span');
					pagerLink.setAttribute('data-sectionscroll-link', name);
					plugin.pager.appendChild(pagerLink);
				}

				switch(plugin.options.pagerPosition) {
          case 'top':
            plugin.addClass(plugin.pager, 'needsectionscroll_pager-top');
          break;
          case 'right':
            plugin.addClass(plugin.pager, 'needsectionscroll_pager-right');
          break;
          case 'bottom':
            plugin.addClass(plugin.pager, 'needsectionscroll_pager-bottom');
          break;
          case 'left':
            plugin.addClass(plugin.pager, 'needsectionscroll_pager-left');
          break;
          default:
            plugin.addClass(plugin.pager, 'needsectionscroll_pager-right');
        }

        plugin.sections['1'].parentNode.appendChild(plugin.pager);
			}

			// set fullheight to sections
			if (plugin.isVhSupported()) {
				for (var name in plugin.sections) {
					plugin.sections[name].style.minHeight = '100vh';
				}
			} else {
				// throttle timeouts
				plugin.resizeTimeout = 0;
      	plugin.finishTimeout = 0;

      	// set initial height to sections
				updateHeight();
				
				// update height on window resize event
				plugin.window.addEventListener('resize',function() {
	        // throttling
	        clearTimeout(plugin.finishTimeout);
	        if (!plugin.resizeTimeout) {
	          updateHeight();
	        } else {
	          plugin.finishTimeout = setTimeout(function() {
	            updateHeight();
	          }, 100);
	        }
	      });
			}

			// update section height on window resize function
			function updateHeight() {
				// set resize timeout
        plugin.resizeTimeout = setTimeout(function() {
          plugin.resizeTimeout = 0;
        }, 100);

				var windowHeight = plugin.window.innerHeight;

				for (var name in plugin.sections) {
					plugin.sections[name].style.minHeight = windowHeight + 'px';
				}

				if (plugin.options.verticalize) {
					plugin.verticalizers = document.querySelectorAll('.needsectionscroll_section_verticalizer');
					for (var i = 0; i < plugin.verticalizers.length; i++) {
						plugin.verticalizers[i].style.minHeight = windowHeight + 'px';
					}
				}
			}

			// bind scroll on default scroll
			plugin.window.addEventListener('scroll', function(event) {

				// move to next section if not moving already
				if (!plugin.moving) {
					var scrollTop = ( plugin.window.pageYOffset !== undefined ) ? plugin.window.pageYOffset : document.documentElement.scrollTop,
	        		scrollBottom = scrollTop + plugin.window.innerHeight,
	        		sectionTop = plugin.currentSection.offsetTop,
	        		sectionBottom = sectionTop + plugin.currentSection.offsetHeight;

	        // check if we reach the end or start of section
					if (scrollBottom > sectionBottom) {
						needSectionScroll.moveNext();
					} else if (scrollTop < sectionTop) {
						needSectionScroll.movePrev();
					}
				} else {
					event.preventDefault();
				}
			});

			// bind scroll to controls
			plugin.navLinks = document.querySelectorAll('[data-sectionscroll-link]');
			for (var i = 0; i < plugin.navLinks.length; i++) {
				var link = plugin.navLinks[i];

				link.addEventListener('click',function() {
					if (!plugin.moving) {
						var sectionName = this.getAttribute('data-sectionscroll-link');
						needSectionScroll.move(plugin.sections[sectionName]);
					}
	      });
			}

			// bind to arrows
			if (plugin.options.useArrows) {
	      document.addEventListener('keydown', function(event) {
	      	if (!plugin.moving) {

		        var tag = event.target.tagName.toLowerCase();

	          switch(event.which) {
	            case 38:
	              if (tag != 'input' && tag != 'textarea') {
	            		event.preventDefault();
	              	needSectionScroll.movePrev();
	              }
	            break;
	            case 40:
	              if (tag != 'input' && tag != 'textarea') {
	            		event.preventDefault();
	              	needSectionScroll.moveNext();
	              }
	            break;
	            case 33:
	              if (tag != 'input' && tag != 'textarea') {
	            		event.preventDefault();
	              	needSectionScroll.movePrev();
	              }
	            break;
	            case 34:
	              if (tag != 'input' && tag != 'textarea') {
	            		event.preventDefault();
	              	needSectionScroll.moveNext();
	              }
	            break;
	            case 36:
	            	event.preventDefault();
	              needSectionScroll.move(plugin.sections['1']);
	            break;
	            case 35:
	            	event.preventDefault();
	              needSectionScroll.move(plugin.sections[plugin.sectionsList.length]);
	            break;
	            default: return;
	          }
	      	}

	      });
	    }
			
			// set current section and current link
			needSectionScroll.setCurrentSection();

			// on initializing callback
			plugin.options.onInit.call(plugin);
		},

		/* Move to next section
		***********************************************/
		moveNext : function() {
			var nextSectionName = plugin.currentSectionName * 1 + 1;
			if (!!plugin.sections[nextSectionName]) {
				needSectionScroll.move(plugin.sections[nextSectionName]);
			}
		},

		/* Move to previous section
		***********************************************/
		movePrev : function() {
			var nextSectionName = plugin.currentSectionName * 1 - 1;
			if (!!plugin.sections[nextSectionName]) {
				needSectionScroll.move(plugin.sections[nextSectionName]);
			}
		},

		/* Move to section
		***********************************************/
		move : function(_section) {
			// lock scroll
			plugin.moving = true;
			plugin.lockscroll.disableScroll();

			// set current section
			plugin.currentSection = _section;
			plugin.currentSectionName = _section.getAttribute('data-sectionscroll');

			// on move starts callback
			plugin.options.onMoveStart.call(plugin, _section);

			// modeEnd callback
			function moveEnd() {
	 			// reset classes
	 			for (var name in plugin.sections) {
					// remove current class
					plugin.removeClass(plugin.sections[name], plugin.options.currentSectionClass);
				}
				// add current class
				plugin.addClass(_section, plugin.options.currentSectionClass);

				// update links
				needSectionScroll.updateNavLinks();

				// unlock scroll when timeout ends
				setTimeout(function() {
					plugin.moving = false;
					plugin.lockscroll.enableScroll();
				}, plugin.options.moveTimeout);

				// on move ends callback
				plugin.options.onMoveEnd.call(plugin, _section);
			}

			// scroll to element
			plugin.scrollTo(_section.offsetTop, 1000, moveEnd);

		},

		/* Update state of navigation links
		***********************************************/
		updateNavLinks: function() {
			for (var i = 0; i < plugin.navLinks.length; i++) {
				var link = plugin.navLinks[i];

				if (link.getAttribute('data-sectionscroll-link') == plugin.currentSectionName) {
					// add current class
					plugin.addClass(link, plugin.options.currentNavLinkClass);
				} else {
					// remove current class
					plugin.removeClass(link, plugin.options.currentNavLinkClass);
				}

			}
		},

		/* Set current section
		***********************************************/
		setCurrentSection: function() {
			for (var name in plugin.sections) {
				if (plugin.isInViewport(plugin.sections[name],'intersect')) {
					plugin.currentSection = plugin.sections[name];
					plugin.currentSectionName = name;

					// add current class
					plugin.addClass(plugin.currentSection, plugin.options.currentSectionClass);

					// update links
					needSectionScroll.updateNavLinks();
				} else {
					// remove current class
					plugin.removeClass(plugin.sections[name], plugin.options.currentSectionClass);
				}
			}
		},

		/* Configuration object which contains all options sets
		***********************************************/
		'config': {
			'default' : {
				// verticalize align to middle
				'verticalize': true,
				// default scrolling for screens with resolution lesser than option value 
				'mobileOff': false,
				// create pager
				'pager': true,
				// pager position ( top, botom, right, left )
				'pagerPosition': 'right',
				// control sections scrolling with arrows
				'useArrows': true,
				// timeout for the next move ( ms )
				'moveTimeout': 300,
				// classname for current section
				'currentSectionClass': 'current',
				// classname for current nav link
				'currentNavLinkClass': 'current',
				// on plugin initializing
				onInit: function() {},
				// on start of moving to section callback
				onMoveStart: function() {},
				// on finish of moving to section callback
				onMoveEnd: function() {}
			}
		}

	}

})();