'use strict';

angular.module('famousAngularStarter')
  .directive('faSvg', function ($famous, $famousDecorator) {
    return {
      template: '<div></div>',
      transclude: true,
      scope: true,
      restrict: 'EA',
      compile: function(tElement, tAttrs, transclude){
        var Surface = $famous['famous/core/Surface'];
        var Modifier = $famous['famous/core/Modifier'];
        var RenderNode = $famous['famous/core/RenderNode'];
        var View = $famous['famous/core/View'];
        var Transform = $famous['famous/core/Transform']
        var Transitionable = $famous['famous/transitions/Transitionable']

        return {
          pre: function(scope, element, attrs){
            var isolate = $famousDecorator.ensureIsolate(scope);


            isolate.renderNode = new View({
              size: scope.$eval(attrs.faSize) || [undefined, undefined]
            });


            element.append('<div class="fad3-container"></div>');


          },
          post: function(scope, element, attrs){
            var isolate = $famousDecorator.ensureIsolate(scope);
            var svg;
            transclude(scope, function(clone) {
              var svg = clone;
              window.clone = clone;
              svg.attr('opacity', 0)
              angular.element('body').append(clone);

              var _state = false;
              window.onclick = function(){
                _state = true;
              }



              window.svg = svg;
              window.elem = element;

              // var viewBox = svg[0].attributes['viewBox'].value.split(' ');
              // var _width = viewBox[2];
              // var _height = viewBox[3];

              var children = svg.children();
              console.log('children', children)

              var surfaces = _.map(children, function(child){
                var bbox = child.getBBox();
                console.log('bbox', bbox)

                // var bound = child.getBBox();
                // console.log('bound', child)
                // var origPoints = child.attributes['points'].value.split(' ');
                // var newPoints = _.map(origPoints, function(ordPair){
                //   var nums = ordPair.split(',');
                //   var newNums = [_width - nums[0], _height - nums[1]];
                //   return newNums;
                // });
                // var newPointsStrings = _.map(newPoints, function(pt){
                //   return pt[0] + ',' + pt[1];
                // });
                // var finalString = newPointsStrings.join(' ');
                // console.log('origString', origPoints);
                // console.log('finalString', finalString);

                var t = new Transitionable(0);
                var reset = function(){
                  t.set(0)
                  setTimeout(function(){
                    t.set(6.28, reset);
                  }, 0);
                }
                var transition = {
                  duration: 2000,
                  curve: 'linear'
                }
                t.set(6.28,  reset);
                var v = new Modifier({size: [bbox.width, bbox.height]})
                var mod = new Modifier({origin: [.5, .5]});

                var acc = 0;

                mod.transformFrom(function(){
                  if(_state){
                    acc += .05;
                    var posX = this.posX || (this.posX = bbox.x)
                    var posY = this.posY || (this.posY = bbox.y)
                    var posT = this.posT || (this.posT = 0)
                    var velX = this.velX || (this.velX = 0)
                    var velY = this.velY || (this.velY = 0)
                    var velT = this.velT || (this.velT = 0)
                    this.posX += this.velX
                    this.posY += this.velY
                    this.posT += this.velT
                    this.velY += Math.random()
                    this.velX += Math.random()
                    this.velT += (Math.random() - .5) / 150 
                    if(this.posX > window.innerWidth - bbox.width) this.velX *= -1
                    if(this.posY > window.innerHeight - bbox.height) this.velY *= -1
                    // if(this.posX < 0 ) this.velX *= -1
                    // if(this.posY < 0) this.velY *= -1
                    return Transform.multiply(Transform.translate(posX, posY), Transform.rotateZ(posT), Transform.scale(Math.max(1, velT), Math.max(1, velT), 1));
                  }else{
                    return Transform.translate(bbox.x, bbox.y);
                  }
                  // return Transform.translate(bbox.x, bbox.posY)
                })
                var surf = new Surface({size: [bbox.width, bbox.height]});
                var content = "<svg style='width: 100%; height: 100%;' viewBox='"+bbox.x + " " + bbox.y + " " + (bbox.width) + " " + (bbox.height) +"'>" + child.outerHTML + '</svg>'

                surf.setContent(content);
                var rn = new RenderNode();
                rn.add(v).add(mod).add(surf);


                return rn;
              })

              _.each(surfaces, function(surf){
                isolate.renderNode.add(surf);
              });


            });
            scope.$emit('registerChild', isolate);
          }
        }
      }
    };
  });
