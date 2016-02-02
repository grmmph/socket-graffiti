#! /usr/bin/env node
module.exports = (function() {
  "use strict";

  // Command line args
  var userArgs = process.argv.slice(2);
  var defaultServer = 'http://localhost:9001';
  var server = userArgs[0] || defaultServer;

  // Imports
  var _ = require('underscore');
  var term = require('terminal-kit').realTerminal;
  var socket = require('socket.io-client')(defaultServer);

  // Constants
  const STAGE_WIDTH = 50;
  const STAGE_HEIGHT = 20;
  const terminate = function () {
    term.grabInput( false ) ;
    setTimeout( function() { process.exit() } , 100 ) ;
  };

  /**
   * @class Stage
   */
  class Stage {
    constructor() {
      this.grid = _.times(STAGE_HEIGHT, (i) => {
        return _.times(STAGE_WIDTH, () => {
          return 7;
        });
      });
    }

    drawItem(x, y, color) {
      term.moveTo(x, y).bgColor(color)(' \n');
    };

    drawStage() {
      _.each(this.grid, (line, y) => {
        _.each(line, (color, x) => {
          this.drawItem(x, y, color);
        });
      });
    };

    updateGridItem(newX, newY, newColor) {
      this.grid = _.map(this.grid, (line, y) => {
        return _.map(line, (color, x) => {
          if (x === newX && newY === y) {
            return newColor;
          }
          return color;
        });
      });
      this.drawStage();
    };

    updateGrid(grid) {
      this.grid = grid;
      this.drawStage();
    }
  };

  /**
   * @class Player
   */
  class Player {
    constructor(x, y, color) {
      this.x = x || 1;
      this.y = y || 1;
      this.color = color || 1;

      this.init();
    };

    draw() {
      stage.updateGridItem(this.x, this.y, this.color);
      this.move('RIGHT');

      socket.emit('update', stage.grid);
    };

    changeColor() {
      this.color++;
      if (this.color > 15) {
        this.color = 1;
      };

      this.drawLegend();
    }

    move(direction) {
      if (direction === 'UP') {
        this.y = this.y - 1;
      } else if (direction === 'DOWN') {
        this.y = this.y + 1;
      } else if (direction === 'LEFT') {
        this.x = this.x - 1;
      } else if (direction === 'RIGHT') {
        this.x = this.x + 1;
      }
      // term(' \n');
      term.moveTo(this.x, this.y);
    };

    drawLegend() {
      term.moveTo(1, STAGE_HEIGHT+1).defaultColor().bgDefaultColor()('Press X to paint | Move with the arrows | Press C to change color');
      term.moveTo(1, STAGE_HEIGHT+2).color(this.color).bgDefaultColor()('current color');
    };

    init() {
      this.drawLegend();
    }
  };

  // Init
  term.clear();
  
  var stage = new Stage();
  var p = new Player();
  term.windowTitle('socketgraffiti');
  term.setCursorColorRgb(40,50,30)
  term.grabInput(true);
  stage.drawStage();

  // Events callbacks
  socket.on('updated', function(grid) {
    stage.updateGrid(grid);
  });

  term.on( 'key' , function(key, matches, data) {
    p.move(key);
    if (key === "x") {
      p.draw();
    }
    if (key === "c") {
      p.changeColor();
    }
    if (key === 'CTRL_C') {
      terminate();
    }
  });
})();
