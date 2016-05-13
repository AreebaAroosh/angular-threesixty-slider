'use strict';

/**
 * @ngdoc directive
 * @name reg.threeSixty:regThreesixty
 * @description
 * # regThreesixty
 */
angular.module('reg.threeSixty', [])
  .directive('threesixty', ['$document',function ($document) {
    return {
      template: '<div class="reg-threesixty"></div>',
      restrict: 'E',
      replace:true,
      scope:{
        images: '='
      },
      link: function(scope, element, attrs) {

        var img;
        var currentFrame = 0;
        var endFrame;
        var ticker = 0;
        var totalFrames;
        var loadedImages;
        var frames = [];
        var ready = false;
        var dragging;
        var pointerEndPosX;
        var pointerStartPosX;
        var pointerDistance;
        var monitorStartTime = 0;
        var monitorInt = 0;
        var speedMultiplier = -48;

        var adjustHeight = function(){
          if( loadedImages > 0 ){
            var elementW = element[0].offsetWidth;
            var imageW = frames[0].width;
            var h = frames[0].height * ( elementW / imageW );
            console.log( frames[0].height , element[0].offsetWidth, h );
            element.css( 'height' , h + 'px' );
          }
        };



        var load360Images = function(){

          for( var i = 1 ; i < scope.images.length ; i++ ){
            img = new Image();
            img.onload = imageReady;
            element.append( img );
            frames.push(img);
            img.src = scope.images[ i ];
          }

        };

        var imageReady = function( event ){
          loadedImages ++;
          if( loadedImages === totalFrames ){
            ready = true;
          }
        };

        var firstImageReady = function(){
          // Remove previous images.
          element.find('img').remove();
          loadedImages ++;
          var firstImage = frames[0];
          firstImage.className = 'current';
          adjustHeight();
          element.append( firstImage );
          element.removeClass('loading-first');
          load360Images();
        };

        var initImages = function(){

          element.addClass('loading-first');

          frames = [];
          totalFrames = scope.images.length;
          loadedImages = 0;

          if( totalFrames > 0 ){
            // Load first image
            img = new Image();
            img.onload = firstImageReady;
            img.src = scope.images[ 0 ];
            frames.push(img);
          }

        };

        initImages();

        // Update images on model change
        scope.$watchCollection('images', initImages );


        var refresh = function () {
          if (ticker === 0) {
            ticker = setInterval(render, Math.round(1000 / 10));
          }
        };

        var getNormalizedCurrentFrame = function() {
          var c = -Math.ceil(currentFrame % totalFrames);
          if (c < 0) {
            c += (totalFrames - 1);
          }
          return c;
        };

        var hidePreviousFrame = function() {
          frames[getNormalizedCurrentFrame()].className = '';
        };

        var showCurrentFrame = function() {
          frames[getNormalizedCurrentFrame()].className = 'current';
        };


        var render = function() {
          if(currentFrame !== endFrame)
          {
            var frameEasing = endFrame < currentFrame ?
              Math.floor((endFrame - currentFrame) * 0.1) :
              Math.ceil((endFrame - currentFrame) * 0.1);
            hidePreviousFrame();
            currentFrame += frameEasing;
            showCurrentFrame();
          } else {
            window.clearInterval(ticker);
            ticker = 0;
          }
        };

        // start
        endFrame = -totalFrames ;
        refresh();

        // Touch and Click events

        var getPointerEvent = function(event) {
            return event.targetTouches ? event.targetTouches[0] : event;
        };

        element.on('touchstart mousedown', mousedown);

        function mousedown (event) {
          event.preventDefault();
          pointerStartPosX = getPointerEvent(event).pageX;
          dragging = true;

          $document.on('touchmove mousemove', mousemove);
          $document.on('touchend mouseup', mouseup);
        };

        function trackPointer(event){
          if (ready && dragging) {

            pointerEndPosX = getPointerEvent(event).pageX;

            if(monitorStartTime < new Date().getTime() - monitorInt) {
              pointerDistance = pointerEndPosX - pointerStartPosX;
              endFrame = currentFrame + Math.ceil((totalFrames - 1) * speedMultiplier * (pointerDistance / 600 ));
              refresh();
              monitorStartTime = new Date().getTime();
              pointerStartPosX = getPointerEvent(event).pageX;
            }
          }
        }

        function mouseup(event){
          event.preventDefault();
          dragging = false;
          $document.off('touchmove mousemove', mousemove);
          $document.off('touchend mouseup', mouseup);
        }

        function mousemove(event){
          event.preventDefault();
          trackPointer(event);
        }

        scope.$on( '$destroy', function() {
          $document.off('touchmove mousemove', mousemove);
          $document.off('touchend mouseup', mouseup);
        });

      }
    };
  }]);
