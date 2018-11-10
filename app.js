const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const redis = require('redis');

const options = {
    host: 'redis',
    port: 6379,
    logErrors: true
  };

const client = redis.createClient(options);

client.on('connect', () => {
    console.log('Connected to redis...')
})

const port = 3000;

const app = express();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(methodOverride('_method'));

app.post('/user/search', (req, res) => {
    let id = req.body.id;

    client.hgetall(id, (err, obj) => {
        if (!obj) {
            res.render('searchusers', {
                error: 'User does not exist'
            })
        }
        else {
            obj.id = id;
            res.render('details', {
                user: obj
            })
        }
    })
})

app.get('/', (req, res) => {
    res.render('searchusers');
});

app.get('/user/add', (req, res) => {
    res.render('addusers');
});

app.post('/user/add', (req, res) => {
    const id = req.body.id;
    const firstName = req.body.first_name;
    const lastName = req.body.last_name;
    const email = req.body.email;
    const phone = req.body.phone;

    client.hmset(id, [
        'first_name', firstName,
        'last_name', lastName,
        'email', email,
        'phone', phone
    ], (err, reply) => {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect('/');
    }
    )
});

app.delete('/user/delete/:id', (req, res) => {
    client.del(req.params.id);
    res.redirect('/');
})

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
})