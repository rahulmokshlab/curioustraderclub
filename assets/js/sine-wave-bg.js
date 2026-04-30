/**
 * Sine Wave Background — Curious Trader
 * Multi-layer animated canvas, scroll-driven, 60fps, prefers-reduced-motion safe.
 */
(function () {
    'use strict';

    var canvas = document.getElementById('sine-wave-canvas');
    if (!canvas) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        canvas.style.display = 'none';
        return;
    }

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var W = 0, H = 0;
    var time = 0;
    var scrollY = 0;
    var raf;

    // Five wave layers: amplitude, frequency, speed, phase offset, opacity
    var layers = [
        { a: 36,  f: 0.0055, s: 0.28,  ph: 0.0,  op: 0.038 },
        { a: 22,  f: 0.0090, s: 0.45,  ph: 1.6,  op: 0.028 },
        { a: 48,  f: 0.0038, s: 0.18,  ph: 3.1,  op: 0.020 },
        { a: 16,  f: 0.0120, s: 0.62,  ph: 0.9,  op: 0.032 },
        { a: 28,  f: 0.0068, s: 0.36,  ph: 2.4,  op: 0.016 }
    ];

    function resize() {
        W = window.innerWidth;
        H = window.innerHeight;
        canvas.width  = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        canvas.style.width  = W + 'px';
        canvas.style.height = H + 'px';
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    }

    // Throttled scroll: update at most once per rAF cycle
    var scrollPending = false;
    window.addEventListener('scroll', function () {
        if (!scrollPending) {
            scrollPending = true;
            requestAnimationFrame(function () {
                scrollY = window.scrollY || window.pageYOffset || 0;
                scrollPending = false;
            });
        }
    }, { passive: true });

    window.addEventListener('resize', function () {
        resize();
    });

    function getStrokeColor() {
        var isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        return isDark ? '100, 160, 255' : '37, 99, 235';
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Scroll influence: gently modulate amplitude & frequency
        var sf = Math.min(scrollY * 0.00035, 0.6);
        var color = getStrokeColor();

        for (var i = 0; i < layers.length; i++) {
            var l   = layers[i];
            var amp  = l.a * (1 + sf * 0.8);
            var freq = l.f + sf * 0.0008;
            var midY = H * 0.5 + (i % 2 === 0 ? H * 0.05 : -H * 0.05);

            ctx.beginPath();
            ctx.lineWidth   = 1.2;
            ctx.strokeStyle = 'rgba(' + color + ', ' + l.op + ')';

            var step = Math.max(2, Math.round(3 / dpr)); // dpr-aware step for quality vs perf
            for (var x = 0; x <= W; x += step) {
                var y = midY + Math.sin(x * freq + time * l.s + l.ph) * amp;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        }

        time += 0.016; // ~60fps tick
        raf = requestAnimationFrame(draw);
    }

    resize();
    draw();
})();
