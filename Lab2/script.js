'use strict';

let deletedTask = null;
let lists = {};

document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const listSelector = document.getElementById('listSelector');
    const listsContainer = document.getElementById('listsContainer');
    const newListInput = document.getElementById('newListName');
    const addListBtn = document.getElementById('addListBtn');
    const searchInput = document.getElementById('searchInput');
    const caseCheckbox = document.getElementById('caseSensitive');

    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const modalText = document.getElementById('modalText');
    const confirmDeleteBtn = document.getElementById('confirmDelete');
    let taskToDelete = null;

    function createList(name) {
        if (lists[name]) return;

        lists[name] = [];

        const index = Object.keys(lists).length - 1;
        const card = document.createElement('div');
        card.className = 'accordion-item';

        card.innerHTML = `
            <h2 class="accordion-header" id="heading${index}">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                    ${name}
                </button>
            </h2>
            <div id="collapse${index}" class="accordion-collapse collapse">
                <div class="accordion-body" id="list-${name}"></div>
            </div>
        `;

        listsContainer.appendChild(card);
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        listSelector.appendChild(option);
    }

    function renderTasks() {
        const searchTerm = searchInput.value.trim();
        const caseSensitive = caseCheckbox.checked;
    
        Object.entries(lists).forEach(([listName, tasks]) => {
            const container = document.getElementById(`list-${listName}`);
            container.innerHTML = '';
    
            const listMatches = caseSensitive
                ? listName.includes(searchTerm)
                : listName.toLowerCase().includes(searchTerm.toLowerCase());
    
            let hasVisibleTasks = false;
    
            tasks.forEach(task => {
                const taskMatches = caseSensitive
                    ? task.text.includes(searchTerm)
                    : task.text.toLowerCase().includes(searchTerm.toLowerCase());
    
                if (!taskMatches && !listMatches && searchTerm !== '') return;
    
                hasVisibleTasks = true;
    
                const div = document.createElement('div');
                div.className = 'task-item' + (task.done ? ' done' : '');
    
                const contentWrapper = document.createElement('div');
                contentWrapper.className = 'task-content';
    
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.className = 'form-check-input task-check';
                checkbox.checked = task.done;
                checkbox.addEventListener('click', () => {
                    task.done = checkbox.checked;
                    task.date = task.done ? new Date().toLocaleString() : '';
                    renderTasks();
                });
    
                const textSpan = document.createElement('span');
                textSpan.textContent = task.text;
                textSpan.className = 'task-text';
    
                const dateSpan = document.createElement('span');
                dateSpan.className = 'task-date';
                if (task.done) dateSpan.textContent = task.date;
    
                contentWrapper.appendChild(checkbox);
                contentWrapper.appendChild(textSpan);
                if (task.done) contentWrapper.appendChild(dateSpan);
    
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn-delete btn-sm';
                deleteBtn.textContent = 'X';
                deleteBtn.addEventListener('click', () => {
                    modalText.textContent = `Czy na pewno chcesz usunąć zadanie o treści: "${task.text}"?`;
                    taskToDelete = { listName, task };
                    confirmModal.show();
                });
    
                div.appendChild(contentWrapper);
                div.appendChild(deleteBtn);
                container.appendChild(div);
            });
    
            const listWrapper = container.closest('.accordion-item');
            if (!hasVisibleTasks && searchTerm !== '') {
                listWrapper.classList.add('d-none');
            } else {
                listWrapper.classList.remove('d-none');
            }
        });
    }
    

    confirmDeleteBtn.addEventListener('click', () => {
        if (taskToDelete) {
            const { listName, task } = taskToDelete;
            const idx = lists[listName].indexOf(task);
            if (idx > -1) {
                deletedTask = { listName, task, index: idx };
                lists[listName].splice(idx, 1);
            }
            taskToDelete = null;
            renderTasks();
            confirmModal.hide();
        }
    });

    addTaskBtn.addEventListener('click', () => {
        const text = taskInput.value.trim();
        const listName = listSelector.value;

        if (text && listName) {
            lists[listName].push({ text, done: false, date: '' });
            taskInput.value = '';
            renderTasks();
        }
    });

    addListBtn.addEventListener('click', () => {
        const name = newListInput.value.trim();
        if (name) {
            createList(name);
            newListInput.value = '';
        }
    });

    searchInput.addEventListener('input', renderTasks);
    caseCheckbox.addEventListener('change', renderTasks);

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'z' && deletedTask) {
            lists[deletedTask.listName].splice(deletedTask.index, 0, deletedTask.task);
            deletedTask = null;
            renderTasks();
        }
    });

    // listy początkowe, aby to do list nie było puste
    ['Mało pilne', 'Pilne', 'Na wczoraj'].forEach(createList);
});
