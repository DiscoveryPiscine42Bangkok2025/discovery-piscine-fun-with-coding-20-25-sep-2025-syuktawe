function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveTodoList() {
    var todoItems = document.querySelectorAll('#ft_list .todo-item');
    var todos = [];
    
    for (var i = 0; i < todoItems.length; i++) {
        todos.push(todoItems[i].textContent);
    }
    
    setCookie('ft_list_todos', JSON.stringify(todos), 365);
}

function loadTodoList() {
    var savedTodos = getCookie('ft_list_todos');
    var ftList = document.getElementById('ft_list');
    
    if (savedTodos) {
        try {
            var todos = JSON.parse(savedTodos);
            
            if (todos.length > 0) {
                ftList.innerHTML = '';
                
                for (var i = 0; i < todos.length; i++) {
                    createTodoElement(todos[i], false);
                }
            }
        } catch (e) {
            console.error('Error loading saved TODOs:', e);
        }
    }
}

function createTodoElement(text, save) {
    var ftList = document.getElementById('ft_list');
    
    var emptyMessage = ftList.querySelector('.empty-message');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    var todoDiv = document.createElement('div');
    todoDiv.className = 'todo-item';
    todoDiv.textContent = text;
    
    todoDiv.addEventListener('click', function() {
        removeTodo(this);
    });
    
    if (ftList.firstChild) {
        ftList.insertBefore(todoDiv, ftList.firstChild);
    } else {
        ftList.appendChild(todoDiv);
    }
    
    if (save !== false) {
        saveTodoList();
    }
}

function addNewTodo() {
    var todoText = prompt('Enter a new TO DO:');
    
    if (todoText && todoText.trim() !== '') {
        createTodoElement(todoText.trim(), true);
    }
}

function removeTodo(todoElement) {
    var todoText = todoElement.textContent;
    var confirmRemove = confirm('Do you want to remove this TO DO?\n\n"' + todoText + '"');
    
    if (confirmRemove) {
        todoElement.remove();
        
        var ftList = document.getElementById('ft_list');
        var remainingTodos = ftList.querySelectorAll('.todo-item');
        
        if (remainingTodos.length === 0) {
            var emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'No tasks yet. Click "New" to add one!';
            ftList.appendChild(emptyMessage);
        }
        
        saveTodoList();
    }
}

function initApp() {
    loadTodoList();
    
    var newBtn = document.getElementById('new-btn');
    newBtn.addEventListener('click', addNewTodo);
}

window.addEventListener('load', initApp);