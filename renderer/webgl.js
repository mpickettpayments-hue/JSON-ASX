// renderer/webgl.js — WebGL adapter with HUD aesthetic scenes
export function createGLRenderer(canvas) {
  let gl = null;
  let ctx2d = null;
  let raf = null;
  let running = false;
  let scene = null;

  function init() {
    // Try WebGL first
    gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      console.warn('[WebGL] Unavailable, falling back to 2D canvas');
      ctx2d = canvas.getContext('2d');
    } else {
      console.log('[WebGL] Initialized successfully');
    }
    
    resize();
    window.addEventListener('resize', resize);
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(canvas.clientWidth * dpr);
    canvas.height = Math.floor(canvas.clientHeight * dpr);
    
    if (gl) {
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
  }

  // Scene registry with HUD aesthetic
  const scenes = {
    // Flat black scene
    flat: ({ gl, ctx2d }) => ({
      draw() {
        if (gl) {
          gl.clearColor(0.0, 0.0, 0.0, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        } else if (ctx2d) {
          ctx2d.fillStyle = '#000000';
          ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        }
      },
      dispose() {}
    }),

    // Starfield scene (cyan stars)
    starfield: ({ gl, ctx2d }) => {
      const stars = [];
      const numStars = 150;
      
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          speed: Math.random() * 0.5 + 0.1
        });
      }
      
      return {
        stars,
        draw() {
          if (gl) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
          } else if (ctx2d) {
            // 2D fallback with star field
            ctx2d.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx2d.fillRect(0, 0, canvas.width, canvas.height);
            
            this.stars.forEach(star => {
              ctx2d.beginPath();
              ctx2d.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
              ctx2d.fillStyle = '#00ffff';
              ctx2d.shadowBlur = 5;
              ctx2d.shadowColor = '#00ffff';
              ctx2d.fill();
              
              star.y += star.speed;
              if (star.y > canvas.height) {
                star.y = 0;
                star.x = Math.random() * canvas.width;
              }
            });
          }
        },
        dispose() {
          this.stars = [];
        }
      };
    },

    // Matrix rain scene (green falling characters)
    'matrix-rain': ({ gl, ctx2d }) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
      const fontSize = 16;
      const columns = Math.floor(canvas.width / fontSize);
      const drops = [];
      
      for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -100;
      }
      
      return {
        drops,
        draw() {
          if (ctx2d) {
            ctx2d.fillStyle = 'rgba(0, 0, 0, 0.05)';
            ctx2d.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx2d.fillStyle = '#00ff00';
            ctx2d.font = fontSize + 'px monospace';
            
            for (let i = 0; i < this.drops.length; i++) {
              const text = characters[Math.floor(Math.random() * characters.length)];
              ctx2d.fillText(text, i * fontSize, this.drops[i] * fontSize);
              
              if (this.drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
              }
              
              this.drops[i]++;
            }
          } else if (gl) {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
          }
        },
        dispose() {
          this.drops = [];
        }
      };
    },

    // Test cube scene (multicolored rotating cube)
    'test-cube': ({ gl, ctx2d }) => {
      if (!gl) {
        return scenes.starfield({ ctx2d });
      }

      // Simple rotating cube placeholder
      let rotation = 0;
      
      return {
        draw() {
          if (!gl) return;
          
          rotation += 0.01;
          
          // Animated background color
          const r = 0.02 + Math.sin(rotation) * 0.01;
          const g = 0.02 + Math.cos(rotation) * 0.01;
          const b = 0.06;
          
          gl.clearColor(r, g, b, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          
          // Note: Full Three.js cube rendering would happen here
          // For now, just animated background
        },
        dispose() {}
      };
    },

    // Fantasy scene (knight, chest, sword)
    fantasy: ({ gl, ctx2d, entities = [] }) => {
      if (!gl) {
        return scenes.starfield({ ctx2d });
      }

      return {
        t: 0,
        entities,
        draw() {
          if (!gl) return;
          
          this.t += 0.016;
          
          // Dark fantasy atmosphere
          gl.clearColor(0.01, 0.03, 0.01, 1.0);
          gl.clear(gl.COLOR_BUFFER_BIT);
          
          // Note: Full Three.js fantasy scene rendering would happen here
          // Entities would be rendered based on this.entities array
        },
        dispose() {
          this.entities = [];
        }
      };
    }
  };

  function loadScene(desc, ctx) {
    if (!gl && !ctx2d && !running) {
      init();
    }
    
    if (scene && scene.dispose) {
      scene.dispose();
    }
    
    const maker = scenes[desc.scene] || scenes.flat;
    scene = maker({ gl, ctx2d, ...desc });
    
    if (!running) {
      running = true;
      loop();
    }
    
    console.log(`[WebGL] Scene loaded: ${desc.scene}`);
    
    // Return cleanup function
    return () => {
      if (scene && scene.dispose) {
        scene.dispose();
      }
    };
  }

  function loop() {
    if (scene && scene.draw) {
      scene.draw();
    }
    raf = requestAnimationFrame(loop);
  }

  function unload(ctx) {
    if (scene && scene.dispose) {
      scene.dispose();
    }
    scene = null;
  }

  function stop() {
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
    running = false;
  }

  return { loadScene, unload, stop };
}
