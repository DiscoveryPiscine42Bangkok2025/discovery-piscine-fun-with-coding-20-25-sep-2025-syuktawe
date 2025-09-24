var CookieManager = {
    set: function(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + value + expires + "; path=/";
        return this; 
    },
    
    get: function(name) {
        var nameEQ = name + "=";
        var cookies = document.cookie.split(';');
        
        var result = $.map(cookies, function(cookie) {
            cookie = $.trim(cookie);
            return cookie.indexOf(nameEQ) === 0 ? cookie.substring(nameEQ.length) : null;
        });
        
        return result.length > 0 ? result[0] : null;
    }
};

function saveTodoList() {
    var todos = $('#ft_list .todo-item').map(function() {
        return $(this).text();
    }).get();
    
    CookieManager.set('ft_list_todos', JSON.stringify(todos), 365);
    
    $(document).trigger('todolist:saved', [todos]);
}

function loadTodoList() {
    var savedTodos = CookieManager.get('ft_list_todos');
    var $ftList = $('#ft_list');
    
    return $.when(savedTodos).then(function(data) {
        if (data) {
            try {
                var todos = JSON.parse(data);
                
                if (todos.length > 0) {
                    $ftList.empty();
                    
                    $.each(todos, function(index, todoText) {
                        createTodoElement(todoText, false);
                    });
                }
                
                $(document).trigger('todolist:loaded', [todos]);
            } catch (e) {
                console.error('Error loading saved TODOs:', e);
                $(document).trigger('todolist:error', [e]);
            }
        }
    });
}

function createTodoElement(text, save) {
    var $ftList = $('#ft_list');
    
    $ftList.find('.empty-message').fadeOut(200, function() {
        $(this).remove();
    });
    
    var $todoDiv = $('<div></div>', {
        'class': 'todo-item',
        'text': text,
        'data-todo-text': text,
        'data-created': Date.now()
    })
    .hide()
    .on('click.todo', function() {
        removeTodo($(this));
    })
    .prependTo($ftList)
    .fadeIn(300);

    var currentCount = $ftList.data('todo-count') || 0;
    $ftList.data('todo-count', currentCount + 1);
    
    save = (save !== false);
    if (save) {
        saveTodoList();
    }
    
    $(document).trigger('todo:created', [$todoDiv, text]);
}

function addNewTodo() {
    var todoText = prompt('Enter a new TO DO:');
    
    todoText = $.trim(todoText);
    
    $.when(todoText && todoText.length > 0)
     .done(function() {
         createTodoElement(todoText, true);
     })
     .fail(function() {
         $(document).trigger('todo:invalid', [todoText]);
     });
}

function removeTodo($todoElement) {
    var todoText = $todoElement.data('todo-text') || $todoElement.text();
    var confirmRemove = confirm('Do you want to remove this TO DO?\n\n"' + todoText + '"');
    
    if (confirmRemove) {
        $todoElement.fadeOut(300).promise().done(function() {
            $(this).remove();
            
            var $ftList = $('#ft_list');
            var $remainingTodos = $ftList.find('.todo-item');
            
            $ftList.data('todo-count', $remainingTodos.length);
            
            if ($remainingTodos.length === 0) {
                $('<div></div>', {
                    'class': 'empty-message',
                    'text': 'No tasks yet. Click "New" to add one!'
                })
                .hide()
                .appendTo($ftList)
                .fadeIn(300);
            }
            
            saveTodoList();
            $(document).trigger('todo:removed', [todoText]);
        });
    }
}

$(function() {
    var $newBtn = $('#new-btn');
    var $ftList = $('#ft_list');
    
    $ftList.data('todo-count', 0);
    
    loadTodoList().always(function() {
        $newBtn
            .on('click.todo', addNewTodo)
            .data('initialized', true);
        
        $(document)
            .on('todolist:saved', function(event, todos) {
                console.log('Saved', todos.length, 'todos');
            })
            .on('todolist:loaded', function(event, todos) {
                console.log('Loaded', todos.length, 'todos');
            })
            .on('todo:created', function(event, $element, text) {
                console.log('Created todo:', text);
            })
            .on('todo:removed', function(event, text) {
                console.log('Removed todo:', text);
            })
            .on('todolist:error', function(event, error) {
                console.error('Todo list error:', error);
            });
    });
    
    $(document).on('keydown.todo', function(e) {
        // Ctrl/Cmd + N for new todo
        if ((e.ctrlKey || e.metaKey) && e.which === 78) {
            e.preventDefault();
            addNewTodo();
        }
    });
});