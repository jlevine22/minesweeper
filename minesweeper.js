var Minesweeper = (function(){
	var rows,
	    cols,
	    grid,
	    mines,
	    spaces,
	    status;
	
	var self = {
		newGame:function(options) {
			if (options) {
				rows = options.rows || 8;
				cols = options.cols || 8;
				grid = options.grid || $('#grid');
				mines = options.mines || 10;
				status = 'gameInProgress';
			}
			
			grid.children().remove();
			
			var spacePool = [];
			for (var n = (rows * cols); n > 0; n--) {
				if (n > mines) {
					spacePool.push('empty');
				}
				else {
					spacePool.push('bomb');
				}
			}
			spacePool.sort(function() {return 0.5 - Math.random()});
			
			spaces = [];
			
			for(var r=0; r < rows; r++) {
				$('<tr id="grid_' + r + '"></tr>').appendTo(grid);
				spaces[r] = [];
				for(var c=0; c < cols; c++) {
					$('<td id="grid_' + r + '_' + c + '" class="grid-space"></td>').appendTo($('#grid_' + r));
					spaces[r][c] = new MinesweeperGridSpace(r, c, spacePool.pop());
				}
			}
			
			$('.grid-space').bind('contextmenu', function(e) {
				e.preventDefault();
				return false;
			}).mousedown(function(e) {
			    if (e.which === 3 && !$(this).hasClass('revealed')) {
			        if ($(this).hasClass('flagged')) {
				        $(this).removeClass('flagged');
			        }
			        else {
			        	$(this).addClass('flagged');
			        }
			    }
			    else if (e.which === 1) {
				    if (status == 'gameOver') {
						alert('The game has ended. Start a new game!');
						return false;
					}
					$(this).removeClass('flagged');
					var coords = $(this).attr('id').split('_');
					var space = spaces[coords[1]][coords[2]];
					space.reveal(true);
					if (space.isBomb()) {
						status = 'gameOver';
						alert('Sorry! You lose :(');
					}
			    }
			});
		},
		gridWidth:function() {
			return cols;
		},
		gridHeight:function() {
			return rows;
		},
		spaceAtLocation:function(row,col) {
			return spaces[row][col];
		},
		cheat:function() {
			status = 'gameOver';
			for(var r=0; r < rows; r++) {
				for (var c=0; c < cols; c++) {
					spaces[r][c].reveal();
				}
			}
		},
		validate:function() {
			status = 'gameOver';
			var validated = true;
			var totalValidated = 0;
			
			function end() {
				if (validated) {
					alert('Congratulations! You win!');
				}
				else {
					alert('Sorry! You lose :(');
				}
			}
			
			var validate = function() {
				totalValidated++;
				var coords = $(this).attr('id').split('_');
				if (!spaces[coords[1]][coords[2]].isBomb()) {
					validated = false;
				}
				if (totalValidated == mines) {
					end();
				}
			}
			
			var flagged = $('.flagged');
			if (flagged.length == mines) {
				flagged.each(validate);
			}
			else {
				$('.grid-space').not('.revealed').each(validate);
			}
		}
	};
	
	return self;
})();

var MinesweeperGridSpace = function(row, col, type) {
	var type = type == 'bomb' ? 'bomb' : 'empty',
	    row = row,
	    col = col,
	    adjacentBombCount = -1;
	
	this.isBomb = function() {
		return (type == 'bomb');
	}
	
	this.validate = function() {

	}
	
	this.adjacentBombCount = function() {
		if (adjacentBombCount == -1) {
			adjacentBombCount = 0;
			for(var r = (row - 1); r < (row + 2); r++) {
				if (r < 0) continue;
				if (r > (Minesweeper.gridHeight()-1)) continue;
				for(var c = (col - 1); c < (col + 2); c++) {
					if (r == row && c == col) continue;
					if (c < 0) continue;
					if (c > (Minesweeper.gridWidth()-1)) continue;
					var space = Minesweeper.spaceAtLocation(r,c);
					if (space.isBomb()) {
						adjacentBombCount++;
					}
				}
			}
		}
		return adjacentBombCount;
	}
	
	this.revealAdjacentEmptySpaces = function () {
		for(var r = (row - 1); r < (row + 2); r++) {
			if (r < 0) continue;
			if (r > (Minesweeper.gridHeight()-1)) continue;
			for(var c = (col - 1); c < (col + 2); c++) {
				if (r == row && c == col) continue;
				if (c < 0) continue;
				if (c > (Minesweeper.gridWidth()-1)) continue;
				var space = Minesweeper.spaceAtLocation(r,c);
				if (!space.isBomb() && space.adjacentBombCount() == 0) {
					space.reveal();
				}
			}
		}		
	}
	
	this.reveal = function(revealEmptyAdjacentSpaces) {
		var element = $('#grid_' + row + '_' + col);
		if (!element.hasClass('revealed')) {
			element.addClass('revealed');
			if (this.isBomb()) {
				element.addClass('bomb');
			}
			else {
				if (this.adjacentBombCount() > 0) {
					element.addClass('number').html(this.adjacentBombCount());
				}
				else if (revealEmptyAdjacentSpaces == true) {
					this.revealAdjacentEmptySpaces();
				}
			}
		}
	}
};