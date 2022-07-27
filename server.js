const express = require('express');
const expressNunjucks = require('express-nunjucks');
const app = express();
const isDev = app.get('env') === 'development';
const port = 3000

app.set('views', __dirname + '/templates');
app.use(express.static('public'));

const njk = expressNunjucks(app, {
    watch: isDev,
    noCache: isDev
});

app.get('/view', (req, res) => {
    res.render('view');
});

app.listen(port, (err) => {
    if (err) {
      return console.log('something bad happened', err)
    }
  
    console.log(`Server started: http://localhost:${port}`)
});