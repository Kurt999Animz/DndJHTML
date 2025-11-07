// === Audio setup ===
    const flashSound = new Audio('sfx/flash.mp3');
    const hoverSound = new Audio('sfx/hover.mp3');
    const clickSound = new Audio('sfx/click.wav');
    const equipSound = new Audio('sfx/equip.mp3');
    const dragSound = new Audio('sfx/drag.mp3');
    const openSound = new Audio('sfx/open.mp3');
    const upgradeSound = new Audio('sfx/upgrade.mp3'); // Added upgrade sound
    hoverSound.preload = clickSound.preload = equipSound.preload = dragSound.preload = openSound.preload = upgradeSound.preload = 'auto';

    function tryPlay(audio) {
      audio.currentTime = 0;
      audio.play().catch((e) => { console.warn("Audio play failed:", e.message); });
    }

    // === Tabs ===
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.onclick = function () {
        console.log('OnClick: clicked tab button', this.dataset.tab);
        tryPlay(clickSound);
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.inventory-grid').forEach(g => g.classList.remove('active'));
        this.classList.add('active');
        document.getElementById(this.dataset.tab).classList.add('active');
      };
    });

    // === Core variables ===
    const uiWrap = document.getElementById('uiWrap');
    const slots = document.querySelectorAll('.slot');
    const items = document.querySelectorAll('.item');
    const inventoryGrids = document.querySelectorAll('.inventory-grid');
    let draggedItem = null;

    // === Category mapping ===
    const categoryMap = {
      weapon: 'weapons',
      head: 'armor',
      body: 'armor',
      accessory: 'armor',
      none: 'items'
    };

    // === Drag system ===
    uiWrap.ondragstart = function (e) {
      const item = e.target.closest('.item');
      if (!item) return;
      console.log('OnDragStart: started dragging item', item.dataset.item);
      draggedItem = item;
      item.classList.add('dragging');
      tryPlay(dragSound);
    };

    uiWrap.ondragend = function (e) {
      const item = e.target.closest('.item');
      if (!item) return;
      console.log('OnDragEnd: finished dragging item', item.dataset.item);
      item.classList.remove('dragging');
      draggedItem = null;
    };

    // === Drop to Equipment Slots ===
    slots.forEach(slot => {
      slot.onmouseover = function () {
        console.log('OnMouseOver: hovered over slot', this.dataset.slot);
        tryPlay(hoverSound);
      };

      slot.onmouseout = function () {
        console.log('OnMouseOut: left slot', this.dataset.slot);
        this.style.transform = '';
      };

      slot.ondragover = function (e) {
        e.preventDefault();
      };

      slot.ondrop = function (e) {
        e.preventDefault();
        console.log('OnDrop: dropped item on slot', this.dataset.slot);
        if (!draggedItem) return;
        const requiredSlot = draggedItem.dataset.slot;
        const targetSlot = this.dataset.slot;
        if (requiredSlot !== targetSlot) {

          return;
        }
        // Move existing equipped item back to inventory
        if (this.firstChild) {
          const oldItem = this.firstChild;
          const cat = categoryMap[oldItem.dataset.slot] || 'items';
          document.getElementById(cat).appendChild(oldItem);
        }
        // Equip new item
        this.innerHTML = '';
        this.appendChild(draggedItem);
        tryPlay(equipSound);
        // Show overlay if applicable
        const overlayPath = draggedItem.dataset.overlay;
        const overlayImg = document.querySelector(`.equip-overlay[data-slot="${targetSlot}"]`);
        if (overlayImg) {
          if (overlayPath) {
            overlayImg.src = overlayPath;
            overlayImg.style.display = 'block';
          } else {
            overlayImg.style.display = 'none';
          }
        }
        // No need to call refreshStatsPanel, observer will handle it
      };

      slot.onmousedown = function () {
        console.log('OnMouseDown: pressed mouse on slot', this.dataset.slot);
        this.style.transform = 'scale(0.97)';
      };

      slot.onmouseup = function () {
        console.log('OnMouseUp: released mouse on slot', this.dataset.slot);
        this.style.transform = '';
      };

      slot.onfocus = function () {
        console.log('OnFocus: focused on slot', this.dataset.slot);
        this.style.outline = '2px solid var(--accent)';
      };

      slot.onblur = function () {
        console.log('OnBlur: blurred from slot', this.dataset.slot);
        this.style.outline = '';
      };

      slot.onchange = function () {
        console.log('OnChange: slot changed', this.dataset.slot);
      };
    });

    // === Drop to Inventory (Unequip) ===
    inventoryGrids.forEach(grid => {
      grid.style.minHeight = '120px';
      grid.style.position = 'relative';
      grid.style.border = '1px solid transparent';

      grid.ondragover = function (e) {
        e.preventDefault();
      };

      grid.ondrop = function (e) {
        e.preventDefault();
        console.log('OnDrop: dropped item on inventory grid', this.id);
        if (!draggedItem) return;
        const fromSlot = draggedItem.closest('.slot');
        if (!fromSlot) return; // Only handle drops from equipment slots
        const itemType = draggedItem.dataset.slot;
        const correctGrid = document.getElementById(categoryMap[itemType] || 'items');
        if (this.id !== correctGrid.id) {
          // Optional: handle dropping in wrong grid (e.g., shake)
          return;
        }
        fromSlot.innerHTML = ''; // Empty the equipment slot
        correctGrid.appendChild(draggedItem); // Add to inventory grid
        tryPlay(equipSound);
        const overlayImg = document.querySelector(`.equip-overlay[data-slot="${fromSlot.dataset.slot}"]`);
        if (overlayImg) overlayImg.style.display = 'none';
        // No need to call refreshStatsPanel, observer will handle it
      };

      grid.onmousedown = function () {
        console.log('OnMouseDown: pressed mouse on inventory grid', this.id);
        this.style.opacity = '0.85';
      };

      grid.onmouseup = function () {
        console.log('OnMouseUp: released mouse on inventory grid', this.id);
        this.style.opacity = '';
      };

      grid.onmouseout = function () {
        console.log('OnMouseOut: left inventory grid', this.id);
        this.style.opacity = '';
      };

      grid.onfocus = function () {
        console.log('OnFocus: focused on inventory grid', this.id);
        this.style.outline = '2px solid var(--accent)';
      };

      grid.onblur = function () {
        console.log('OnBlur: blurred from inventory grid', this.id);
        this.style.outline = '';
      };

      grid.onchange = function () {
        console.log('OnChange: inventory grid changed', this.id);
      };
    });

    // === Item hover sounds & events ===
    // (Moved tooltip logic here and added stat preview)

    // === Slot Labels ===
    document.querySelectorAll('.slot').forEach(slot => {
      const label = document.createElement('div');
      label.textContent = slot.dataset.slot.charAt(0).toUpperCase() + slot.dataset.slot.slice(1);
      label.style.fontSize = '12px';
      label.style.color = 'rgba(255, 235, 190, 0.85)';
      label.style.textAlign = 'center';
      label.style.marginTop = '4px';
      label.style.pointerEvents = 'none';
      slot.insertAdjacentElement('afterend', label);
    });

    // === Title Screen Fade ===
    window.onload = function () {
      console.log('OnLoad: window loaded');
      tryPlay(openSound);
      setTimeout(() => {
        document.getElementById('titleScreen').classList.add('hidden');
      }, 2000);
      refreshStatsPanel(); // Initial stat load
      updateStatPointsUI(); // Initial stat points UI update
    };

    // === Auto visual refresh for equip slot borders ===
    function refreshEquipSlots() {
      slots.forEach(slot => {
        if (!slot.querySelector('.item')) {
          slot.style.border = '1px solid transparent';
        } else {
          slot.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(0,0,0,0.06))';
        }
      });
    }

    // === Item Data ===
    const itemData = {
      "off-magic-book": {
        name: "Offensive Magic Book",
        desc: "A tome of basic offensive spells.<br>Teaches <b>Magic Missile</b> and <b>Arcane Bolt</b>.",
        stats: {}
      },
      "def-magic-book": {
        name: "Defensive Magic Book",
        desc: "A guide to magical barriers.<br>Teaches <b>Shield</b> and <b>Sanctuary</b>.",
        stats: {}
      },
      "fire-magic-book": {
        name: "Fire Magic Basics Book",
        desc: "Crimson-bound volume of fire spells.<br>Teaches <b>Firebolt</b> and <b>Ignite</b>.",
        stats: {}
      },
      "adv-ice-book": {
        name: "Advanced Ice Magic Book",
        desc: "A rare book with advanced frost incantations.<br>Teaches <b>Frost Lance</b> and <b>Glacial Wall</b>.",
        stats: {}
      },
      "hat": {
        name: "Wizard Hat",
        desc: "Pointy hat for wizards.<br>Enhances magic focus.",
        stats: { INT: 1, "MP": 3 }
      },
      "robe": {
        name: "Wizard Robe",
        desc: "A robe woven with magical thread.<br>Offers mild protection.",
        stats: { CON: 1, WIS: 1, "MP": 4 }
      },
      "life-amulet": {
        name: "Life Amulet",
        desc: "A charm that pulses with life energy.<br>Worn as an accessory.",
        stats: { HP: 15, WIS: 1 }
      },
      "staff": {
        name: "Old Ice Staff",
        desc: "A staff that chills to the touch.<br>Amplifies ice magic.",
        stats: { INT: 2, "Ice DMG": 2 }
      },
      "healing-potion": {
        name: "Healing Potion",
        desc: "Restores <b>30 HP</b> instantly.<br>(x5)",
        stats: {}
      },
      "mana-potion": {
        name: "Mana Potion",
        desc: "Restores <b>20 MP</b> instantly.<br>(x10)",
        stats: {}
      },
      "rury-leaf": {
        name: "Rury Leaf",
        desc: "A common herb, used in potion-making.<br>(x50)",
        stats: {}
      },
      "baked-rury-pie": {
        name: "Baked Rury Pie",
        desc: "A hearty pie that recovers <b>10 HP</b> and <b>5 MP</b>.<br>(x3)",
        stats: {}
      }
    };

    // === Add item attributes to .item elements ===
    document.querySelectorAll('.item').forEach(item => {
      const key = item.dataset.item;
      if (itemData[key]) {
        item.setAttribute('data-name', itemData[key].name);
        item.setAttribute('data-desc', itemData[key].desc);
        item.setAttribute('data-stats', JSON.stringify(itemData[key].stats));
      }
    });

    // === Tooltip Logic ===
    const tooltip = document.getElementById('itemTooltip');
    function buildStatString(stats) {
      if (!stats || Object.keys(stats).length === 0) return '';
      let out = '';
      for (const [k, v] of Object.entries(stats)) {
        out += `<span><b>${k}</b>: ${v > 0 ? "+" : ""}${v}</span>`;
      }
      return out;
    }

    // === Stat Preview & Tooltip Logic on Items ===
    document.querySelectorAll('.item').forEach(item => {
      // Tooltip logic
      item.onmousemove = function (e) {
        const name = this.getAttribute('data-name') || '';
        const desc = this.getAttribute('data-desc') || '';
        const stats = JSON.parse(this.getAttribute('data-stats') || '{}');
        tooltip.innerHTML = `<div class="tt-name">${name}</div>
                    <div class="tt-desc">${desc}</div>
                    <div class="tt-stats">${buildStatString(stats)}</div>`;
        tooltip.classList.add('visible');
        const pad = 20;
        let x = e.clientX + pad, y = e.clientY + pad;
        const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
        if (x + tw > window.innerWidth) x = window.innerWidth - tw - 8;
        if (y + th > window.innerHeight) y = window.innerHeight - th - 8;
        tooltip.style.left = `${x}px`;
        tooltip.style.top = `${y}px`;
      };

      // Stat Preview logic
      item.onmouseenter = function () {
        tryPlay(hoverSound); // Play hover sound

        // Check if item is unequipped and equippable
        const isUnequipped = this.closest('.inventory-grid');
        const slotType = this.dataset.slot;
        if (isUnequipped && slotType && slotType !== 'none') {
          const itemStats = JSON.parse(this.getAttribute('data-stats') || '{}');
          showStatPreview(itemStats);
        }
      };

      item.onmouseleave = function () {
        tooltip.classList.remove('visible');
        hideStatPreview(); // Hide preview on mouse out
      };

      // Drag/focus/blur events
      item.onmouseout = function () {
        tooltip.classList.remove('visible');
        this.style.transform = '';
        hideStatPreview(); // Also hide on mouse out
        console.log('OnMouseOut/OnBlur: hide tooltip for item', this.dataset.item);
      };
      item.onmousedown = function () {
        console.log('OnMouseDown: pressed mouse on item', this.dataset.item);
        this.style.transform = 'scale(0.97)';
      };
      item.onmouseup = function () {
        console.log('OnMouseUp: released mouse on item', this.dataset.item);
        this.style.transform = '';
      };
      item.onfocus = function () {
        console.log('OnFocus: focused on item', this.dataset.item);
        this.style.outline = '2px solid var(--accent)';
      };
      item.onblur = function () {
        console.log('OnBlur: blurred from item', this.dataset.item);
        this.style.outline = '';
      };
      item.onchange = function () {
        console.log('OnChange: item changed', this.dataset.item);
      };

      item.setAttribute('tabindex', '0');
    });


    // === Character Stats Logic (Refactored) ===
    // Renamed from baseStats to currentStats to reflect permanent character attributes
    const currentStats = { 
      STR: 10, DEX: 12, CON: 8, INT: 15, WIS: 14, CHA: 13,
      HP: 100, MP: 50,
      "Fire DMG": 0, "Ice DMG": 0,
      statPoints: 3 // Player-allocatable points
    };

    const statDescriptions = {
      STR: "Increases physical strength. Boosts melee damage and carrying capacity.",
      DEX: "Increases agility and precision. Affects ranged damage, accuracy, and evasion.",
      CON: "Increases vitality and endurance. Boosts physical resistance.",
      INT: "Increases intelligence and enhances magical prowess. Boosts magic damage.",
      WIS: "Increases wisdom and attunement. Boosts magic resistance, MP regeneration, and buff duration.",
      CHA: "Increases charisma and presence. Affects persuasion, bartering, and companion effectiveness."
    };

    /**
     * General function to apply permanent stat changes from any source (e.g., level-up, quest reward).
     * @param {object} modifiers - An object of stat name/value pairs, e.g., {INT: 1, MP: 5}.
     */
    function applyPermanentStatModifier(modifiers) {
        if (!modifiers || typeof modifiers !== 'object') return;

        for (const [statName, value] of Object.entries(modifiers)) {
            if (currentStats[statName] === undefined) {
                // Initialize new stats (like damage types) if they don't exist
                currentStats[statName] = value;
            } else {
                currentStats[statName] += value;
            }
        }
        
        // Auto-update UI after applying permanent changes
        refreshStatsPanel();
    }


    // Renamed from getEquippedStats to calculateTotalStats
    function calculateTotalStats() {
      // 1. Start with the character's current permanent stats (Base + Allocated)
      let totalStats = { ...currentStats }; 
      
      // 2. Reset HP/MP to base values before equipment adds to them
      totalStats.HP = currentStats.HP;
      totalStats.MP = currentStats.MP;

      // 3. Add stats from equipped items
      document.querySelectorAll('.slot').forEach(slot => {
        const item = slot.querySelector('.item');
        if (item) {
          try {
            const itemStats = JSON.parse(item.getAttribute('data-stats') || '{}');
            for (const [k, v] of Object.entries(itemStats)) {
              if (totalStats[k] === undefined) totalStats[k] = v; // Add new stat if it doesn't exist (e.g., Ice DMG)
              else totalStats[k] += v;
            }
          } catch (e) { console.error("Failed to parse item stats", e); }
        }
      });
      return totalStats;
    }

    function refreshStatsPanel() {
      // Use the new calculation function
      const s = calculateTotalStats();

      // Update main stat panel
      ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach(statName => {
        const baseEl = document.getElementById(`stat-${statName}-base`);
        if (baseEl) {
          baseEl.textContent = s[statName] !== undefined ? s[statName] : '';
        }
        // Clear preview on refresh
        const previewEl = document.getElementById(`stat-${statName}-preview`);
        if (previewEl) previewEl.textContent = '';
      });

      // Update top bar HP/MP
      document.getElementById('hpMax-base').textContent = s.HP;
      document.getElementById('mpMax-base').textContent = s.MP;
      document.getElementById('hpMax-preview').textContent = '';
      document.getElementById('mpMax-preview').textContent = '';

      let hp = parseInt(document.getElementById('hpCurrent').textContent);
      let mp = parseInt(document.getElementById('mpCurrent').textContent);
      if (hp > s.HP) hp = s.HP;
      if (mp > s.MP) mp = s.MP;
      document.getElementById('hpCurrent').textContent = hp;
      document.getElementById('mpCurrent').textContent = mp;
      document.getElementById('hpBar').style.width = `${(hp / s.HP) * 100}%`;
      document.getElementById('mpBar').style.width = `${(mp / s.MP) * 100}%`;
    }

    // Observe changes to equipment for stat refresh
    const equipment = document.querySelector('.equipment');
    const equipObserver = new MutationObserver(() => {
      refreshEquipSlots();
      refreshStatsPanel();
    });
    equipObserver.observe(equipment, { childList: true, subtree: true });

    // Note: onunload doesn't work reliably in modern browsers
    window.onunload = function () {
      console.log('OnUnload: window unloading');
    };

    // === Stat Preview Functions ===
    function showStatPreview(itemStats) {
      if (!itemStats || Object.keys(itemStats).length === 0) return;

      for (const [stat, value] of Object.entries(itemStats)) {
        if (value === 0) continue;
        const sign = value > 0 ? '+' : '';

        if (stat === 'HP') {
          const el = document.getElementById('hpMax-preview');
          if (el) el.textContent = ` (${sign}${value})`;
        } else if (stat === 'MP') {
          const el = document.getElementById('mpMax-preview');
          if (el) el.textContent = ` (${sign}${value})`;
        } else {
          const el = document.getElementById(`stat-${stat}-preview`);
          if (el) el.textContent = ` (${sign}${value})`;
        }
      }
    }

    function hideStatPreview() {
      document.querySelectorAll('.stat-preview').forEach(el => {
        el.textContent = '';
      });
    }

    // === Stat Points Logic ===
    const statPointsBtn = document.getElementById('stat-points-btn');
    const statPointsValueEl = document.getElementById('stat-points-value');
    const statAllocateOverlay = document.getElementById('statAllocateOverlay');
    const statAllocateList = document.getElementById('stat-allocate-list');
    const statFloatText = document.getElementById('stat-float-text');

    function updateStatPointsUI() {
      // Now uses currentStats
      statPointsValueEl.textContent = currentStats.statPoints;
      statPointsBtn.disabled = currentStats.statPoints <= 0;
    }

    function showStatFloatText(text) {
      statFloatText.textContent = text;
      // Reset animation by removing and re-adding
      statFloatText.style.animation = 'none';
      statFloatText.offsetHeight; // Trigger reflow
      statFloatText.style.animation = null;
      statFloatText.style.animation = 'float-up 2s forwards ease-out';

    }

    statPointsBtn.onclick = function () {
      // Now uses currentStats
      if (currentStats.statPoints <= 0) return;
      tryPlay(clickSound);
      populateStatAllocateList();
      statAllocateOverlay.classList.add('active');
    };

    // Close overlay when clicking background
    statAllocateOverlay.onclick = function (e) {
      if (e.target === statAllocateOverlay) {
        statAllocateOverlay.classList.remove('active');
      }
    };

    function populateStatAllocateList() {
      statAllocateList.innerHTML = ''; // Clear old list
      ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA'].forEach(statName => {

        const el = document.createElement('div');
        el.className = 'stat-allocate-option';
        el.dataset.stat = statName;

        el.innerHTML = `
                    <span class="name">${statName} +1</span>
                    <span class="desc">${statDescriptions[statName] || 'Increases this stat.'}</span>
                `;

        // Add flash on hover
        el.onmouseenter = function () {
          tryPlay(flashSound);
          this.classList.add('flash');
          setTimeout(() => this.classList.remove('flash'), 200); // 0.2s
        };

        // Allocate point on click
        el.onclick = function () {
          // Now uses currentStats for allocation
          if (currentStats.statPoints > 0) {
            currentStats[statName]++; // Increase the base stat
            currentStats.statPoints--;

            tryPlay(upgradeSound); // Play upgrade sound
            refreshStatsPanel(); // Update UI
            updateStatPointsUI(); // Update points display
            statAllocateOverlay.classList.remove('active'); // Close popup

            // Show floating text
            showStatFloatText(`${statName} +1`);
          }
        };

        statAllocateList.appendChild(el);
      });
    }