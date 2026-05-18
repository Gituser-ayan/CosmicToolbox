/**
 * CosmicToolbox Notes Module
 * Full localStorage CRUD with autosave, search filtering, and animated card grid.
 */

document.addEventListener('DOMContentLoaded', () => {
  const notesGrid    = document.getElementById('notes-grid');
  const createBtn    = document.getElementById('notes-create-btn');
  const searchBox    = document.getElementById('notes-search-box');
  const editorCard   = document.getElementById('note-editor-card');
  const titleInput   = document.getElementById('note-title-input');
  const bodyInput    = document.getElementById('note-body-input');
  const saveBtn      = document.getElementById('note-save-btn');
  const cancelBtn    = document.getElementById('note-cancel-btn');
  const activeIdEl   = document.getElementById('note-active-id');
  const autosaveEl   = document.getElementById('note-autosave-indicator');

  if (!notesGrid) return;

  const STORAGE_KEY = 'cosmictoolbox_notes';
  let autosaveTimer = null;

  /* ── Storage helpers ── */
  function loadAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveAll(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  /* ── Generate simple unique ID ── */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  /* ── Truncate helper ── */
  function truncate(str, max) {
    return str.length <= max ? str : str.slice(0, max) + '…';
  }

  /* ── Render grid ── */
  function loadNotesGrid(query = '') {
    const notes = loadAll();
    const q     = query.toLowerCase().trim();

    const filtered = q
      ? notes.filter(n => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
      : notes;

    notesGrid.innerHTML = '';

    if (filtered.length === 0) {
      notesGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 0;">
          <div style="font-size: 36px; margin-bottom: 12px;">📡</div>
          <div style="color: var(--text-muted); font-size: 14px;">
            ${q ? 'No records match that query string.' : 'No records stored yet. Create your first entry above.'}
          </div>
        </div>
      `;
      return;
    }

    // Newest-first order
    [...filtered].reverse().forEach(note => {
      const card = document.createElement('div');
      card.className = 'glass-card interactive';
      card.style.cssText = 'cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; animation: fade-in 0.3s ease;';

      const date = new Date(note.updatedAt).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      card.innerHTML = `
        <div>
          <h4 style="font-family: var(--font-display); font-size: 16px; font-weight: 600; margin-bottom: 6px; word-break: break-word;">
            ${note.title || '<span style="color: var(--text-muted);">Untitled Record</span>'}
          </h4>
          <p style="font-size: 13px; color: var(--text-muted); line-height: 1.5; word-break: break-word;">
            ${truncate(note.body || '', 120)}
          </p>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 10px; border-top: 1px solid var(--border-glass);">
          <span style="font-size: 11px; color: var(--text-muted);">${date}</span>
          <div style="display: flex; gap: 8px;">
            <button class="cosmic-btn note-edit-btn" data-id="${note.id}" style="padding: 4px 10px; font-size: 12px;" title="Edit">Edit</button>
            <button class="cosmic-btn note-delete-btn" data-id="${note.id}" style="padding: 4px 10px; font-size: 12px; color: #f43f5e; border-color: rgba(244,63,94,0.3);" title="Delete">Del</button>
          </div>
        </div>
      `;

      notesGrid.appendChild(card);
    });

    // Bind edit / delete per card
    notesGrid.querySelectorAll('.note-edit-btn').forEach(btn =>
      btn.addEventListener('click', (e) => { e.stopPropagation(); openEditor(btn.dataset.id); })
    );
    notesGrid.querySelectorAll('.note-delete-btn').forEach(btn =>
      btn.addEventListener('click', (e) => { e.stopPropagation(); deleteNote(btn.dataset.id); })
    );
  }

  /* ── Editor open/close ── */
  function openEditor(id = null) {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    editorCard.style.display = 'block';

    if (id) {
      const notes = loadAll();
      const note  = notes.find(n => n.id === id);
      if (!note) return;
      activeIdEl.value  = note.id;
      titleInput.value  = note.title;
      bodyInput.value   = note.body;
    } else {
      activeIdEl.value  = '';
      titleInput.value  = '';
      bodyInput.value   = '';
    }

    titleInput.focus();
    if (autosaveEl) autosaveEl.textContent = 'Autosave armed...';
  }

  function closeEditor() {
    editorCard.style.display = 'none';
    clearTimeout(autosaveTimer);
    activeIdEl.value = '';
    titleInput.value = '';
    bodyInput.value  = '';
    loadNotesGrid(searchBox ? searchBox.value : '');
  }

  /* ── Save (create or update) ── */
  function saveNote(isAutoSave = false) {
    const notes = loadAll();
    const id    = activeIdEl.value;
    const title = titleInput.value.trim();
    const body  = bodyInput.value.trim();

    if (!title && !body) {
      if (!isAutoSave && window.CosmicOS) window.CosmicOS.showToast('Cannot commit an empty record.', 'error');
      return;
    }

    if (id) {
      const idx = notes.findIndex(n => n.id === id);
      if (idx !== -1) {
        notes[idx].title     = title;
        notes[idx].body      = body;
        notes[idx].updatedAt = Date.now();
      }
    } else {
      const newId = uid();
      notes.push({ id: newId, title, body, createdAt: Date.now(), updatedAt: Date.now() });
      activeIdEl.value = newId; // Set the active ID so subsequent autosaves update this note
    }

    saveAll(notes);
    
    if (autosaveEl) autosaveEl.textContent = '✓ Saved';

    if (!isAutoSave) {
      if (window.CosmicOS) {
        window.CosmicOS.playAudio('success');
        window.CosmicOS.showToast('Note saved!', 'info');
      }
      closeEditor();
    }
  }

  /* ── Delete ── */
  function deleteNote(id) {
    if (!confirm('Permanently purge this record from the database?')) return;
    const notes = loadAll().filter(n => n.id !== id);
    saveAll(notes);
    if (window.CosmicOS) {
      window.CosmicOS.playAudio('beep');
      window.CosmicOS.showToast('Note deleted.', 'error');
    }
    loadNotesGrid(searchBox ? searchBox.value : '');
    // Close editor if the deleted note was open
    if (activeIdEl.value === id) closeEditor();
  }

  /* ── Autosave on typing ── */
  function scheduleAutosave() {
    clearTimeout(autosaveTimer);
    if (autosaveEl) autosaveEl.textContent = 'Autosaving...';
    autosaveTimer = setTimeout(() => {
      saveNote(true);
    }, 1500);
  }

  /* ── Bind Events ── */
  if (createBtn) createBtn.addEventListener('click', () => openEditor(null));
  if (saveBtn)   saveBtn.addEventListener('click', () => saveNote(false));
  if (cancelBtn) cancelBtn.addEventListener('click', () => {
    if (window.CosmicOS) window.CosmicOS.playAudio('click');
    closeEditor();
  });

  if (titleInput) titleInput.addEventListener('input', scheduleAutosave);
  if (bodyInput)  bodyInput.addEventListener('input', scheduleAutosave);

  if (searchBox) {
    searchBox.addEventListener('input', () => {
      loadNotesGrid(searchBox.value);
    });
  }

  // Expose for global localStorage wipe in Settings
  window.loadNotesGrid = loadNotesGrid;

  // Initial grid render
  loadNotesGrid();
});
