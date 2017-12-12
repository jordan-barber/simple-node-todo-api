const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql');

//mysql config
const mc = mysql.createConnection({
   host: 'localhost',
   user: 'root',
   password: 'root',
   database: 'demodb'
});

mc.connect();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function(req, res) {
    return res.status(400).send({ error: true, message: 'hello' })
});

//get todo list
app.get('/todos', function(req, res) {
    mc.query('SELECT * FROM tasks', function (error, results, fields) {
       if (error) {
           return res.status(500).send(err);
       } else {
            res.send({error: false, data: results});
       }
    });
});

//get a single todo
app.get('/todo/:id', function(req, res) {
   var task_id = req.params.id;

   if (!task_id) {
       return res.status(400).send({error: true, message: 'Please provide a task_id'});
   }

   mc.query('SELECT * FROM tasks where id=?', task_id, function (error, results, fields) {
       if (error) {
           return res.status(500).send(error);
       } else {
            return res.send({error: false, data: results[0]});
       }
   });
});

//search for a do by name
app.get('/todo/search/:keyword', function (req, res) {
    var keyword = req.params.keyword;

    mc.query("SELECT * FROM tasks WHERE task LIKE ? ", ['%' + keyword + '%'], function (error, results, fields) {
        if (error) {
            return res.send(500).send(error);
        } else {
            return res.send({error: false, data: results});
        }
    });
});

//add a new todo item
app.post('/todo', function (req, res) {
    var task = req.body.task;

    if (!task) {
        return res.status(400).send({error: true, message: 'Please provide a task'});
    }

    mc.query("INSERT INTO tasks SET ?", {task: task}, function (error, results, fields) {
        if (error) {
            return res.status(500).send(error);
        } else {
            return res.send({error: false, data: results, message: 'New tasks added!'});
        }
    });
});

//delete task
app.delete('/todo', function (req, res) {
    var task_id = req.body.task_id;

    if (!task_id) {
        return res.status(400).send({ error: true, message: 'Please provide task_id' });
    }
    mc.query('DELETE FROM tasks WHERE id = ?', [task_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({error: false, data: results, message: 'Task deleted.'});
    });
});


//  Update task with id
app.put('/todo', function (req, res) {
    var task_id = req.body.task_id;
    var task = req.body.task;

    if (!task_id || !task) {
        return res.status(400).send({ error: task, message: 'Please provide task and task_id' });
    }

    mc.query("UPDATE tasks SET task = ? WHERE id = ?", [task, task_id], function (error, results, fields) {
        if (error) throw error;
        return res.send({ error: false, data: results, message: 'Task has been updated successfully.' });
    });
});



app.listen(8080, function() {
    console.log('Node API is running on port 8080.')
});
