class TriplePendulum {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.time = 0;
        this.animate = this.animate.bind(this);

        // Pendulum parameters
        this.lengths = [120, 100, 80];  // lengths of pendulum arms
        this.masses = [10, 8, 6];       // masses of bobs
        this.angles = [Math.PI/2, Math.PI/3, Math.PI/4];  // initial angles
        this.angleVelocities = [0, 0, 0];
        this.gravity = 0.5;
        this.damping = 0.999;
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 3;
    }

    updatePhysics() {
        // Calculate acceleration for each pendulum using the Euler-Lagrange equations
        const g = this.gravity;
        const [m1, m2, m3] = this.masses;
        const [l1, l2, l3] = this.lengths;
        const [a1, a2, a3] = this.angles;
        const [v1, v2, v3] = this.angleVelocities;

        // These are simplified physics calculations - real triple pendulum would be more complex
        const a1_acc = (-g * (2 * m1 + m2) * Math.sin(a1) - m2 * g * Math.sin(a1 - 2 * a2) - 
                       2 * Math.sin(a1 - a2) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(a1 - a2))) /
                       (l1 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2)));

        const a2_acc = (2 * Math.sin(a1 - a2) * (v1 * v1 * l1 * (m1 + m2) + g * (m1 + m2) * Math.cos(a1) +
                       v2 * v2 * l2 * m2 * Math.cos(a1 - a2))) /
                       (l2 * (2 * m1 + m2 - m2 * Math.cos(2 * a1 - 2 * a2)));

        const a3_acc = (2 * Math.sin(a2 - a3) * (v2 * v2 * l2 * (m2 + m3) + g * (m2 + m3) * Math.cos(a2) +
                       v3 * v3 * l3 * m3 * Math.cos(a2 - a3))) /
                       (l3 * (2 * m2 + m3 - m3 * Math.cos(2 * a2 - 2 * a3)));

        // Update velocities and angles
        this.angleVelocities[0] += a1_acc;
        this.angleVelocities[1] += a2_acc;
        this.angleVelocities[2] += a3_acc;

        for (let i = 0; i < 3; i++) {
            this.angleVelocities[i] *= this.damping;
            this.angles[i] += this.angleVelocities[i];
        }
    }

    drawPendulum() {
        const [l1, l2, l3] = this.lengths;
        const [a1, a2, a3] = this.angles;

        // Calculate positions
        const x1 = this.centerX + l1 * Math.sin(a1);
        const y1 = this.centerY + l1 * Math.cos(a1);
        
        const x2 = x1 + l2 * Math.sin(a2);
        const y2 = y1 + l2 * Math.cos(a2);

        const x3 = x2 + l3 * Math.sin(a3);
        const y3 = y2 + l3 * Math.cos(a3);

        // Draw pendulum arms
        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.lineTo(x3, y3);
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw bobs
        [
            {x: x1, y: y1, r: this.masses[0]},
            {x: x2, y: y2, r: this.masses[1]},
            {x: x3, y: y3, r: this.masses[2]}
        ].forEach((bob, i) => {
            this.ctx.beginPath();
            this.ctx.arc(bob.x, bob.y, bob.r, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsl(${(i * 120 + this.time * 50) % 360}, 70%, 50%)`;
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    animate() {
        // Clear canvas completely each frame
        this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.updatePhysics();
        this.drawPendulum();

        this.time += 0.01;
        requestAnimationFrame(this.animate);
    }
}