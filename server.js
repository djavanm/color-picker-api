const app = require('./app')

app.set('port', 3001);

app.listen(app.get('port'), () => {
  console.log(`App is listening on port ${app.get('port')}`)
});

module.exports = app;