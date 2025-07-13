document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const searchInput = document.getElementById('searchInput');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const totalTasksElement = document.getElementById('totalTasks');
    const completedTasksElement = document.getElementById('completedTasks');
    const activeTasksElement = document.getElementById('activeTasks');
    const editModal = document.getElementById('editModal');
    const editTaskInput = document.getElementById('editTaskInput');
    const saveEditBtn = document.getElementById('saveEditBtn');
    const closeBtn = document.querySelector('.close-btn');
    const emptyState = document.getElementById('emptyState');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const body = document.body;
    
    // Current year for footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();
    
    // State variables
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentEditId = null;
    
    // Initialize the app
    function init() {
        renderTasks();
        updateTaskStats();
        
        // Event listeners
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        searchInput.addEventListener('input', function() {
            renderTasks();
        });
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        
        closeBtn.addEventListener('click', closeModal);
        saveEditBtn.addEventListener('click', saveEditedTask);
        window.addEventListener('click', function(e) {
            if (e.target === editModal) {
                closeModal();
            }
        });
        
        // Theme switcher
        themeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const theme = this.dataset.theme;
                setTheme(theme);
            });
        });
        
        // Check for saved theme
        const savedTheme = localStorage.getItem('theme') || 'default';
        setTheme(savedTheme);
    }
    
    // Add a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            animateInputError();
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        taskInput.value = '';
        renderTasks();
        updateTaskStats();
        
        // Animate the new task
        animateNewTask();
    }
    
    // Animate input error
    function animateInputError() {
        taskInput.style.borderColor = 'var(--danger-color)';
        taskInput.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 300,
            iterations: 2
        });
        
        setTimeout(() => {
            taskInput.style.borderColor = '#eee';
        }, 1000);
    }
    
    // Animate new task addition
    function animateNewTask() {
        const firstTask = taskList.firstElementChild;
        if (firstTask) {
            firstTask.animate([
                { transform: 'scale(1)', opacity: 1 },
                { transform: 'scale(1.05)', opacity: 1 },
                { transform: 'scale(1)', opacity: 1 }
            ], {
                duration: 300
            });
        }
    }
    
    // Render tasks based on filter and search
    function renderTasks() {
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredTasks = tasks.filter(task => {
            const matchesSearch = task.text.toLowerCase().includes(searchTerm);
            
            if (currentFilter === 'all') {
                return matchesSearch;
            } else if (currentFilter === 'active') {
                return matchesSearch && !task.completed;
            } else if (currentFilter === 'completed') {
                return matchesSearch && task.completed;
            }
        });
        
        taskList.innerHTML = '';
        
        if (filteredTasks.length === 0) {
            emptyState.classList.add('show');
            taskList.style.display = 'none';
        } else {
            emptyState.classList.remove('show');
            taskList.style.display = 'block';
            
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                if (task.completed) taskItem.classList.add('completed');
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text">${task.text}</span>
                    <div class="task-actions">
                        <button class="edit-btn" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                taskList.appendChild(taskItem);
            });
        }
        
        // Add event listeners to new elements
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', toggleTaskCompletion);
        });
        
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', openEditModal);
        });
        
        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', deleteTask);
        });
    }
    
    // Toggle task completion status
    function toggleTaskCompletion(e) {
        const taskId = parseInt(e.target.dataset.id);
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = e.target.checked;
            saveTasks();
            renderTasks();
            updateTaskStats();
            
            // Animate completion
            if (e.target.checked) {
                e.target.closest('.task-item').animate([
                    { backgroundColor: 'var(--card-color)' },
                    { backgroundColor: 'rgba(0, 184, 148, 0.1)' },
                    { backgroundColor: 'var(--card-color)' }
                ], {
                    duration: 500
                });
            }
        }
    }
    
    // Delete a task
    function deleteTask(e) {
        const taskId = parseInt(e.target.closest('button').dataset.id);
        const taskItem = e.target.closest('.task-item');
        
        // Animate deletion
        taskItem.animate([
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(-100px)', opacity: 0 }
        ], {
            duration: 300,
            easing: 'ease-in'
        });
        
        setTimeout(() => {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks();
            renderTasks();
            updateTaskStats();
        }, 300);
    }
    
    // Open edit modal
    function openEditModal(e) {
        const taskId = parseInt(e.target.closest('button').dataset.id);
        const task = tasks.find(task => task.id === taskId);
        
        if (task) {
            currentEditId = taskId;
            editTaskInput.value = task.text;
            editModal.style.display = 'block';
            
            // Focus input and select text
            setTimeout(() => {
                editTaskInput.focus();
                editTaskInput.select();
            }, 100);
        }
    }
    
    // Save edited task
    function saveEditedTask() {
        const editedText = editTaskInput.value.trim();
        if (editedText === '') {
            animateInputError(editTaskInput);
            return;
        }
        
        const taskIndex = tasks.findIndex(task => task.id === currentEditId);
        
        if (taskIndex !== -1) {
            tasks[taskIndex].text = editedText;
            saveTasks();
            renderTasks();
            closeModal();
            
            // Animate the edited task
            const editedTask = document.querySelector(`.task-checkbox[data-id="${currentEditId}"]`)?.closest('.task-item');
            if (editedTask) {
                editedTask.animate([
                    { backgroundColor: 'var(--card-color)' },
                    { backgroundColor: 'rgba(253, 203, 110, 0.2)' },
                    { backgroundColor: 'var(--card-color)' }
                ], {
                    duration: 500
                });
            }
        }
    }
    
    // Close modal
    function closeModal() {
        editModal.style.display = 'none';
        currentEditId = null;
    }
    
    // Update task statistics
    function updateTaskStats() {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.completed).length;
        const activeTasks = totalTasks - completedTasks;
        
        totalTasksElement.textContent = totalTasks;
        completedTasksElement.textContent = completedTasks;
        activeTasksElement.textContent = activeTasks;
    }
    
    // Save tasks to local storage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Set theme
    function setTheme(theme) {
        body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
        
        // Update active theme button
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === theme) {
                btn.classList.add('active');
            }
        });
    }
    
    // Initialize the app
    init();
});