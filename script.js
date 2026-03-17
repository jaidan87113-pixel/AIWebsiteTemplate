// ----------------------
// GLOBAL MOUSE COORDINATES
// ----------------------
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;

// ----------------------
// LIQUID CURSOR
// ----------------------
const cursor = document.getElementById('liquid-cursor');
let posX = mouseX;
let posY = mouseY;

document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    const speed = 0.6;
    posX += (mouseX - posX) * speed;
    posY += (mouseY - posY) * speed;
    cursor.style.left = posX + 'px';
    cursor.style.top = posY + 'px';
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Hover scaling removed

// ----------------------
// SECTION CURSOR COLOR TRANSITION
// ----------------------
// Removed color transition to keep only outline

// ----------------------
// PARALLAX NODES (interactive)
// ----------------------
const parallaxSection = document.getElementById('parallax');
const canvas = document.getElementById('ai-nodes');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = parallaxSection.offsetWidth;
    canvas.height = parallaxSection.offsetHeight;
}
window.addEventListener('resize', () => {
    resizeCanvas();
    generateNodes();
});
resizeCanvas();

const numNodes = 40;
const attractionRadius = 50; // smaller than before for precise interaction
const attractionStrength = 0.02; // smoother push
const damping = 0.95;

let nodes = [];
let draggedNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

function generateNodes() {
    nodes = Array.from({ length: numNodes }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: 2 + Math.random() * 2
    }));
}
generateNodes();

function getMousePos(canvas, e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener('mousedown', (e) => {
    const mouse = getMousePos(canvas, e);
    for (let node of nodes) {
        const dx = mouse.x - node.x;
        const dy = mouse.y - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < node.radius + 10) { // some tolerance
            draggedNode = node;
            dragOffsetX = dx;
            dragOffsetY = dy;
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (draggedNode) {
        const mouse = getMousePos(canvas, e);
        draggedNode.x = mouse.x - dragOffsetX;
        draggedNode.y = mouse.y - dragOffsetY;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
    }
});

canvas.addEventListener('mouseup', () => {
    draggedNode = null;
});

function animateNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rect = canvas.getBoundingClientRect();
    const mouseCanvasX = mouseX - rect.left;
    const mouseCanvasY = mouseY - rect.top;

    nodes.forEach((n, i) => {
        if (n !== draggedNode) {
            // Attraction to cursor if within a small radius
            const dx = mouseCanvasX - n.x;
            const dy = mouseCanvasY - n.y;
            const dist = Math.sqrt(dx*dx + dy*dy);

            if(dist < attractionRadius){
                const force = (1 - dist / attractionRadius) * attractionStrength;
                n.vx += dx * force;
                n.vy += dy * force;
            }

            // Damping
            n.vx *= damping;
            n.vy *= damping;

            // Update positions
            n.x += n.vx;
            n.y += n.vy;
        }

        // Bounce edges
        if(n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if(n.y < 0 || n.y > canvas.height) n.vy *= -1;

        // Draw node
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI*2);
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.fill();

        // Connect nodes
        for(let j=i+1;j<nodes.length;j++){
            const n2 = nodes[j];
            const dx2 = n.x - n2.x;
            const dy2 = n.y - n2.y;
            const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);
            if(dist2 < 100){
                ctx.beginPath();
                ctx.moveTo(n.x, n.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = `rgba(255,255,255,${(1 - dist2/100) * 0.4})`;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    });

    requestAnimationFrame(animateNodes);
}
animateNodes();