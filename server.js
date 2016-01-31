var _ = require('underscore');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(3030);
var grid = [];

io.on('connection', function (socket) {
  console.log('connection!');
  if (!_.isEmpty(grid)) {
    io.emit('updated', grid);
  };

  socket.on('update', function (g) {
    if (_.isEmpty(g)) {
      return;
    };

    grid = g;
    io.emit('updated', g);
  });
});
