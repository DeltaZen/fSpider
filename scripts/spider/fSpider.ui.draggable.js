(function ($, window, document, undefined) {
    $.fn.draggable = function (options) {
        var opts = $.extend({ }, $.fn.draggable.defaults, options);
        var $contain = $(opts.containment);

        return this.each(function () {
            var $this = $(this);

            var containDim = null;
            var dim = null;
            var originalPos = null;
            var cursor = null;
            var offset = {};

            initialize();

            function initialize() {
                //capture original position (for relative position type)
                originalPos = { left: $this.offset().left, top: $this.offset().top };
                var cssPos = {
                    left: parseFloat($this.css('left')),
                    top: parseFloat($this.css('top')),
                    right: parseFloat($this.css('right')),
                    bottom: parseFloat($this.css('bottom'))
                };
                if (isNaN(cssPos.left) !== true) {
                    originalPos.left -= parseFloat(cssPos.left);
                }
                if (isNaN(cssPos.top) !== true) {
                    originalPos.top -= parseFloat(cssPos.top);
                }

                captureDimensions();

                //attach mousedown
                $this.on('mousedown', onMouseDown);

                //fix positions on window resize
                $(window).on('resize', function () {
                    captureDimensions();
                    fixOverDrag();
                });
            }

            function onMouseDown(evt) {
                if (isIgnoreNode(evt.target) === true) {
                    return;
                }

                //attach move/up listeners
                $(document).on('mousemove', onMouseMove);
                $(document).on('mouseup', onMouseUp);

                //change cursor
                cursor = document.body.style.cursor;
                document.body.style.cursor = opts.cursor;

                //capture offset
                offset.left = evt.offsetX;
                offset.top = evt.offsetY;

                $(document.body).css({ 'user-select': 'none' });

                opts.dragstart.call(evt);
            }

            function onMouseUp(evt) {
                //detach move/up listeners
                $(document).off('mouseup', onMouseUp);
                $(document).off('mousemove', onMouseMove);

                //change cursor
                document.body.style.cursor = cursor;

                $(document.body).css({ 'user-select': 'auto' });

                opts.dragend.call(evt);
            }

            function onMouseMove(evt) {
                var pos = {
                    left: evt.clientX - offset.left,
                    top: evt.clientY - offset.top
                };
                positionMe(pos);
                fixOverDrag();

                opts.dragging.call(evt);
            }

            function positionMe(pos) {
                var posType = $this.css('position');

                //figure out if we should use top or bottom, left or right
                var left, top, right, bottom;
                left = pos.left;
                top = pos.top;
                right = containDim.width - (left + dim.width);
                bottom = containDim.height - (top + dim.height);

                if (posType == 'relative') {
                    left -= originalPos.left;
                    top -= originalPos.top;
                }

                if (left < right) {
                    $this.css({ 'left': left + 'px', 'right': '' });
                } else {
                    if (posType == 'relative') {
                        right = dim.width - containDim.width + right + originalPos.left;
                    }
                    $this.css({ 'left': '', 'right': right + 'px' });
                }
                if (top < bottom) {
                    $this.css({ 'top': top + 'px', 'bottom': '' });
                } else {
                    if (posType == 'relative') {
                        bottom = dim.height - containDim.height + bottom + originalPos.top;
                    }
                    $this.css({ 'top': '', 'bottom': bottom + 'px' });
                }
            }

            function fixOverDrag() {
                var reposition = false;

                var parentPos = $contain.offset();
                var pos = $this.offset();

                //left
                if (pos.left < parentPos.left) {
                    pos.left = 0;
                    reposition = true;
                }
                //top
                if (pos.top < parentPos.top) {
                    pos.top = 0;
                    reposition = true;
                }
                //right
                if (pos.left + dim.width > (parentPos.left + containDim.width)) {
                    pos.left = containDim.width - dim.width;
                    reposition = true;
                }
                //bottom
                if (pos.top + dim.height > (parentPos.top + containDim.height)) {
                    pos.top = containDim.height - dim.height;
                    reposition = true;
                }

                if (reposition === true) {
                    positionMe(pos);
                }
            }

            function isIgnoreNode(target) {
                return opts.ignoreNodeNames.indexOf(target.nodeName) >= 0;
            }

            function captureDimensions() {
                containDim = { width: $contain[0].clientWidth, height: $contain[0].clientHeight };
                dim = { width: $this[0].clientWidth, height: $this[0].clientHeight };
            }
        });
    };

    $.fn.draggable.defaults = {
        containment: 'body',
        cursor: 'move',
        scroll: false,
        ignoreNodeNames: [
            'BUTTON',
            'INPUT',
            'SELECT'
        ],
        dragstart: function () {},
        dragging: function () {},
        dragend: function () {}
    };
})(window.jQuery, window, window.document);