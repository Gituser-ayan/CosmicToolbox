/**
 * CosmicToolbox To-Do List
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('todo-input');
  const addBtn = document.getElementById('todo-add-btn');
  const list = document.getElementById('todo-list');

  if (!input) return;

  let todos = JSON.parse(localStorage.getItem('cosmic_todos') || '[]');

  function saveTodos() {
    localStorage.setItem('cosmic_todos', JSON.stringify(todos));
  }

  function renderTodos() {
    list.innerHTML = '';
    
    if (todos.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 32px; color: var(--text-muted); font-size: 13px;">No active missions. You're all caught up!</div>`;
      return;
    }

    todos.forEach((todo, index) => {
      const card = document.createElement('div');
      card.className = 'glass-card interactive';
      card.style.display = 'flex';
      card.style.justifyContent = 'space-between';
      card.style.alignItems = 'center';
      card.style.padding = '16px';
      
      const leftDiv = document.createElement('div');
      leftDiv.style.display = 'flex';
      leftDiv.style.alignItems = 'center';
      leftDiv.style.gap = '12px';

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.done;
      checkbox.style.width = '18px';
      checkbox.style.height = '18px';
      checkbox.style.accentColor = 'var(--accent-cyan)';
      checkbox.style.cursor = 'pointer';
      
      checkbox.addEventListener('change', () => {
        todos[index].done = checkbox.checked;
        saveTodos();
        renderTodos();
      });

      const text = document.createElement('span');
      text.textContent = todo.text;
      text.style.fontSize = '15px';
      text.style.color = todo.done ? 'var(--text-muted)' : 'var(--text-main)';
      text.style.textDecoration = todo.done ? 'line-through' : 'none';

      leftDiv.appendChild(checkbox);
      leftDiv.appendChild(text);

      const delBtn = document.createElement('button');
      delBtn.className = 'cosmic-btn';
      delBtn.style.padding = '4px 8px';
      delBtn.style.color = '#ef4444';
      delBtn.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      delBtn.style.fontSize = '12px';
      delBtn.textContent = 'Remove';
      
      delBtn.addEventListener('click', () => {
        todos.splice(index, 1);
        saveTodos();
        renderTodos();
      });

      card.appendChild(leftDiv);
      card.appendChild(delBtn);
      list.appendChild(card);
    });
  }

  function addTodo() {
    const val = input.value.trim();
    if (val) {
      todos.unshift({ text: val, done: false });
      input.value = '';
      saveTodos();
      renderTodos();
    }
  }

  addBtn.addEventListener('click', addTodo);
  input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  renderTodos();
});
