// src/components/smoke.js
export default function smokemachine(context, color) {
    color = color || [255, 255, 255];
    var particles = [];
    var preDrawCallback = function () {};
    var lastframe;
    var timer;

    function Particle(x, y, age, lifetime) {
        this.x = x;
        this.y = y;
        this.age = age;
        this.lifetime = lifetime;
        
        // Espalha a fumaça para a esquerda e para a direita
        var spread = (Math.random() * 2 - 1); 
        this.vel = {
            x: spread * 12, // Aceleração inicial para os lados
            y: (Math.random() * 2) // Fumaça cai só um pouquinho simulando o empuxo
        };
    }

    Particle.prototype.update = function (dt) {
        this.x += this.vel.x * (dt / 20);
        this.y += this.vel.y * (dt / 20);
        
        // Multiplicador: Faz a fumaça se abrir violentamente formando a base do triângulo
        this.vel.x *= 1.05; 
        
        this.age += dt;
    };

    Particle.prototype.draw = function (ctx) {
        var fade = 1 - (this.age / this.lifetime);
        // A fumaça cresce muito com o tempo (de 40px até 600px)
        var size = (this.age / this.lifetime) * 600 + 40; 
        
        ctx.beginPath();
        var gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, size);
        
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${fade * 0.8})`);
        gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
    };

    function addSmoke(x, y, count) {
        for (var i = 0; i < (count || 1); i++) {
            particles.push(new Particle(x, y, 0, Math.random() * 2000 + 1500));
        }
    }

    function loop(time) {
        if (!lastframe) lastframe = time;
        var dt = time - lastframe;
        lastframe = time;

        preDrawCallback(dt);

        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        for (var i = particles.length - 1; i >= 0; i--) {
            particles[i].update(dt);
            particles[i].draw(context);
            if (particles[i].age >= particles[i].lifetime) {
                particles.splice(i, 1);
            }
        }
        timer = requestAnimationFrame(loop);
    }

    return {
        start: function () { lastframe = performance.now(); timer = requestAnimationFrame(loop); },
        stop: function () { cancelAnimationFrame(timer); },
        addSmoke: addSmoke,
        setPreDrawCallback: function (cb) { preDrawCallback = cb; }
    };
}