/**
 * Particles Network Background
 * 酷炫的粒子网络背景效果
 */
(function() {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'particles-canvas';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 150 };
  let animationId;

  // 配置
  const config = {
    particleCount: 80,
    particleMinSize: 1,
    particleMaxSize: 3,
    lineDistance: 150,
    lineWidth: 0.8,
    particleSpeed: 0.3,
    colors: {
      particle: 'rgba(88, 166, 255, 0.8)',
      line: 'rgba(88, 166, 255, 0.15)',
      lineHover: 'rgba(88, 166, 255, 0.4)',
      glow: 'rgba(88, 166, 255, 0.6)'
    }
  };

  // 粒子类
  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * (config.particleMaxSize - config.particleMinSize) + config.particleMinSize;
      this.baseSize = this.size;
      this.speedX = (Math.random() - 0.5) * config.particleSpeed;
      this.speedY = (Math.random() - 0.5) * config.particleSpeed;
      this.brightness = Math.random() * 0.5 + 0.5;
      this.pulse = Math.random() * Math.PI * 2;
    }

    update() {
      // 移动
      this.x += this.speedX;
      this.y += this.speedY;

      // 边界检测
      if (this.x < 0 || this.x > width) this.speedX *= -1;
      if (this.y < 0 || this.y > height) this.speedY *= -1;

      // 脉冲效果
      this.pulse += 0.02;
      this.size = this.baseSize + Math.sin(this.pulse) * 0.5;

      // 鼠标交互
      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          this.x -= Math.cos(angle) * force * 2;
          this.y -= Math.sin(angle) * force * 2;
          this.size = this.baseSize + force * 2;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      
      // 发光效果
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0, config.colors.glow);
      gradient.addColorStop(0.5, config.colors.particle);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  // 初始化
  function init() {
    resize();
    particles = [];
    
    const count = Math.min(config.particleCount, Math.floor((width * height) / 15000));
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  // 调整大小
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  // 绘制连线
  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < config.lineDistance) {
          const opacity = 1 - dist / config.lineDistance;
          
          // 检查是否靠近鼠标
          let isNearMouse = false;
          if (mouse.x !== null && mouse.y !== null) {
            const midX = (particles[i].x + particles[j].x) / 2;
            const midY = (particles[i].y + particles[j].y) / 2;
            const mouseDist = Math.sqrt(
              Math.pow(mouse.x - midX, 2) + Math.pow(mouse.y - midY, 2)
            );
            isNearMouse = mouseDist < mouse.radius;
          }

          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          
          if (isNearMouse) {
            ctx.strokeStyle = `rgba(88, 166, 255, ${opacity * 0.6})`;
            ctx.lineWidth = config.lineWidth * 1.5;
          } else {
            ctx.strokeStyle = `rgba(88, 166, 255, ${opacity * 0.15})`;
            ctx.lineWidth = config.lineWidth;
          }
          
          ctx.stroke();
        }
      }
    }

    // 鼠标与粒子连线
    if (mouse.x !== null && mouse.y !== null) {
      for (let i = 0; i < particles.length; i++) {
        const dx = mouse.x - particles[i].x;
        const dy = mouse.y - particles[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const opacity = 1 - dist / mouse.radius;
          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(particles[i].x, particles[i].y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${opacity * 0.5})`;
          ctx.lineWidth = config.lineWidth;
          ctx.stroke();
        }
      }
    }
  }

  // 动画循环
  function animate() {
    ctx.clearRect(0, 0, width, height);

    // 绘制背景渐变
    const bgGradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height)
    );
    bgGradient.addColorStop(0, 'rgba(22, 27, 34, 0.3)');
    bgGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // 更新和绘制粒子
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    drawLines();

    animationId = requestAnimationFrame(animate);
  }

  // 事件监听
  window.addEventListener('resize', () => {
    resize();
    // 重新初始化粒子数量
    const targetCount = Math.min(config.particleCount, Math.floor((width * height) / 15000));
    while (particles.length < targetCount) {
      particles.push(new Particle());
    }
    while (particles.length > targetCount) {
      particles.pop();
    }
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  // 减少动画检测
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  function handleMotionPreference() {
    if (prefersReducedMotion.matches) {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, width, height);
      // 绘制静态版本
      particles.forEach(p => p.draw());
      drawLines();
    } else {
      animate();
    }
  }

  prefersReducedMotion.addEventListener('change', handleMotionPreference);

  // 启动
  init();
  handleMotionPreference();
})();
