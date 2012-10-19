(function($)
{
  var DefaultSettings = {
    // Wrapper's width
    width: 500,
    // Wrapper's height
    height: 100,
    // The axis in wich the panneable object will move
    // use 'x', 'y' or 'xy'
    axis: 'x',
    // The element's selector wich will turn on the pan task or mousewheel event
    pan_dispatcher: null,
    // Called when the panneable object is updated to their new position
    onPan: function (new_x, new_y) {}
  };

  var methods = {
    init: function(Settings){
      Settings = $.extend({}, DefaultSettings, Settings);

      return this.each(function(i, Wrapper)
      {
        var $Wrapper = $(Wrapper);
        var $Panneable = $Wrapper.find('div:first');
        // Flag para mover solo cuando este mousedown
        var mousedown = false;
        // Punto de origen, donde se hace el click
        var ClickOrigin = {y: 0, x: 0};
        // Top & left del elemento paneable al hacer click
        var PanneableOrigin = {x: 0, y: 0};

        // Calcular el valor menor de 'x' y 'y'
        var min_x = Settings.width - $Panneable.width();
        var min_y = Settings.height - $Panneable.height();
        
        /**
         * Update the panneable object position using the values
         * of the variables declared above.
         */
        function pan(new_x, new_y)
        {
          // Avoid offset panning.
          if(new_x > 0) new_x = 0;
          if(new_y > 0) new_y = 0;
          if(new_x < min_x) new_x = min_x;
          if(new_y < min_y) new_y = min_y;
          
          $Panneable.css({
            top: new_y + 'px',
            left: new_x + 'px'
          });
          
          // Trigger on move event
          Settings.onPan(new_x, new_y);
        }

        // Configurar el estilo del panner wrapper
        $Wrapper.css({
          width: Settings.width + 'px',
          height: Settings.height + 'px',
          overflow: 'hidden',
          position: 'relative'
        });
        
        if (Settings.pan_dispatcher == null) {
          // The wrapper turns on the pan task by default
          $PanDispatcher = $Wrapper;
        } else {
          $PanDispatcher = $(Settings.pan_dispatcher);
        }
        
        // Configurar el estilo del elemento panneable
        $Panneable.css('position', 'absolute');
        
        // Configurar el estilo del pan dispatcher
        $PanDispatcher.css({
          'user-select': 'none',
          '-ms-user-select': 'none',
          '-moz-user-select': 'none',
          '-khtml-user-select': 'none',
          '-webkit-user-select': 'none',
          '-webkit-touch-callout': 'none',
          'cursor': 'move'
        }).attr('unselectable', 'on').on('selectstart', false);
        
        $PanDispatcher.on('mousedown', function(e)
        {
          mousedown = true;
          ClickOrigin.y  = e.pageY;
          ClickOrigin.x  = e.pageX;
          PanneableOrigin.x = $Panneable.position().left;
          PanneableOrigin.y = $Panneable.position().top;
          $('body').css('cursor', 'move');
        });

        $(document).on('mouseup', function(e)
        {
          mousedown = false;
          $('body').css('cursor', '');
        }).on('mousemove', function(e)
        {
          if(mousedown && $Panneable.width() > $Wrapper.width()){
            var new_x = PanneableOrigin.x;
            var new_y = PanneableOrigin.y;

            if(Settings.axis == 'xy' || Settings.axis == 'x'){
              new_x = PanneableOrigin.x + (e.pageX - ClickOrigin.x);
            }

            if(Settings.axis == 'xy' || Settings.axis == 'y'){
              new_y = PanneableOrigin.y + (e.pageY - ClickOrigin.y);
            }
            
            // Pan the object
            pan(new_x, new_y);
          }
        });

        // Implement mousewheel event if Mousewheel plugin is detected.
        // only scroll in Y axis is used.
        if ($.fn.mousewheel) {
          $PanDispatcher.on('mousewheel', function (e, delta, delta_x, delta_y)
          {
            // Work only when mousedown is off.
            if (!mousedown) {
              
              // Save the panneable's position, like in 'mousedown' event.
              PanneableOrigin.y = $Panneable.position().top;
              PanneableOrigin.x = $Panneable.position().left;
              
              var new_y = PanneableOrigin.y;
              
              if (delta_y < 0) {
                // Scroll down
                new_y -= 20;
              } else {
                // Scroll up
                new_y += 20;
              }
              
              // Pan the object with the same X, but new Y
              pan(PanneableOrigin.x, new_y);
            }
          });
        }
        
      });
    }
  };

  $.fn.sahibpanner = function( method ) {
    // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.sahibpanner' );
    }    
  };
})(jQuery);
