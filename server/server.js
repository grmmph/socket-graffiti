(function () {
  "use strict";
  const PORT = 3030;

  var _ = require('underscore');
  var app = require('express')();
  var server = require('http').Server(app);
  var io = require('socket.io')(server);
  var grid = [];

  server.listen(PORT);
  console.log("listening on port " + PORT);

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

})();
