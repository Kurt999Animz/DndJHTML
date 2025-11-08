    // === Audio Setup ===
    const hoverSound = new Audio('sfx/hover.mp3');
    const clickSound = new Audio('sfx/click.wav');
    const bgm = new Audio('sfx/bgm.mp3'); // Background music
    bgm.loop = true;
    hoverSound.preload = clickSound.preload = bgm.preload = 'auto';

    function tryPlay(audio) {
      audio.currentTime = 0;
      audio.play().catch(() => { });
    }

    // === Scale & Center ===
    function scaleAndCenter() {
      const container = document.getElementById('container');
      const targetWidth = 1280;
      const targetHeight = 720;

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const scale = Math.min(vw / targetWidth, vh / targetHeight);

      container.style.transform = `translate(-50%, -50%) scale(${scale})`;
      container.style.left = '50%';
      container.style.top = '50%';
    }

    window.addEventListener('resize', scaleAndCenter);
    window.addEventListener('orientationchange', scaleAndCenter);
    scaleAndCenter();

    // === Start -> Character Selection ===
    function goToCharSelect() {
      document.title = "-Character Selection-";
      tryPlay(clickSound);
      bgm.play().catch(() => { });
      document.getElementById('startMenu').style.display = 'none';
      document.getElementById('charSelect').style.display = 'flex';
    }

    // === Character Selection -> Load iframe dynamically ===
    function selectCharacter() {
      document.title = " ⌜Kotobuki⌟ - Level 1 Wizard ";
      tryPlay(clickSound);
      const iframe = document.getElementById('app');
      if (!iframe.src) iframe.src = 'app.html'; // Load the main app
      document.getElementById('charSelect').style.display = 'none';
      iframe.style.display = 'block';
    }

    // === Locked Character Logic ===
    let messageTimer = null;
    function showLockedMessage() {
      tryPlay(clickSound); // Use the 'fail' sound
      const messageDiv = document.getElementById('lockedMessage');
      
      // Clear existing timer if one is running
      if (messageTimer) {
        clearTimeout(messageTimer);
      }

      messageDiv.textContent = "Finish Kotobuki's story first";
      messageDiv.style.display = 'block';

      // Hide the message after 3 seconds
      messageTimer = setTimeout(() => {
        messageDiv.style.display = 'none';
        messageTimer = null;
      }, 3000);
    }

    // === Hover sounds for buttons ===
    document.querySelectorAll('.menu-button').forEach(btn => {
      btn.addEventListener('mouseenter', () => tryPlay(hoverSound));
    });

    // === Drag & Drop Feedback (optional) ===
    let draggedItem = null;
    function handleDragStart(e) {
      const item = e.target.closest('.item');
      if (!item) return;
      draggedItem = item;
      item.classList.add('dragging');
      tryPlay(dragSound);
    }

    function handleDragEnd(e) {
      const item = e.target.closest('.item');
      if (!item) return;
      item.classList.remove('dragging');
      draggedItem = null;
    }

    function handleSlotDrop(e, slot) {
      e.preventDefault();
      if (!draggedItem) return;
      const requiredSlot = draggedItem.dataset.slot;
      const targetSlot = slot.dataset.slot;
      if (requiredSlot !== targetSlot) {
        tryPlay(clickSound);
        return;
      }
      slot.innerHTML = '';
      slot.appendChild(draggedItem);
      tryPlay(equipSound);
      draggedItem = null;
    }

    // Select all stat-box elements
    const statBoxes = document.querySelectorAll('.stat-box');

    // Add an event listener to each one
    statBoxes.forEach(box => {
      // Example: on hover
      box.addEventListener('mouseenter', () => {
        tryPlay(hoverSound);
      });

    });
