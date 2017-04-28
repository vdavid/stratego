/* =Constant definitions
 ---------------------------------------------------------- */
var memoryGame = true;
/* If true, then forgets discovered fields */
var water = [[2, 4], [3, 4], [2, 5], [3, 5], [6, 4], [7, 4], [6, 5], [7, 5]];
var rankNames = ['marshal', 'general', 'colonel', 'major', 'captain', 'lieutenant', 'sergeant', 'miner', 'scout', 'spy', 'bomb', 'flag'];
var ranks = [{name: 'marshal', shortName: '1', startingCount: 1, startingCountOverrideForBlue: 1, startingCountOverrideForRed: 1, image: {}},
    {name: 'general', shortName: '2', startingCount: 1, startingCountOverrideForBlue: 1, startingCountOverrideForRed: 1, image: {}},
    {name: 'colonel', shortName: '3', startingCount: 2, startingCountOverrideForBlue: 2, startingCountOverrideForRed: 4, image: {}},
    {name: 'major', shortName: '4', startingCount: 3, startingCountOverrideForBlue: 3, startingCountOverrideForRed: 3, image: {}},
    {name: 'captain', shortName: '5', startingCount: 4, startingCountOverrideForBlue: 4, startingCountOverrideForRed: 4, image: {}},
    {name: 'lieutenant', shortName: '6', startingCount: 4, startingCountOverrideForBlue: 4, startingCountOverrideForRed: 4, image: {}},
    {name: 'sergeant', shortName: '7', startingCount: 4, startingCountOverrideForBlue: 4, startingCountOverrideForRed: 3, image: {}},
    {name: 'miner', shortName: '8', startingCount: 5, startingCountOverrideForBlue: 5, startingCountOverrideForRed: 6, image: {}},
    {name: 'scout', shortName: '9', startingCount: 8, startingCountOverrideForBlue: 8, startingCountOverrideForRed: 6, image: {}},
    {name: 'spy', shortName: 'S', startingCount: 1, startingCountOverrideForBlue: 1, startingCountOverrideForRed: 1, image: {}},
    {name: 'bomb', shortName: 'B', startingCount: 6, startingCountOverrideForBlue: 6, startingCountOverrideForRed: 6, image: {}},
    {name: 'flag', shortName: 'F', startingCount: 1, startingCountOverrideForBlue: 1, startingCountOverrideForRed: 1, image: {}}];
var directions = ['up', 'right', 'down', 'left'];

/* =Variable definitions
 ---------------------------------------------------------- */
var selectedField;
var currentGameStage = 'setup';
var currentPlayerColor;
var movementStack = [];
var pieceSelectionTargetElement;
var eventAfterPieceSelection;

/* =Assorted functions
 ---------------------------------------------------------- */

// function autoMove(move) {
//     var fromField = getFieldByCoordinates(move.fromX, move.fromX);
//     if (move.rank) {
//         $(fromField).addClass(ranks[move.rank].shortName);
//     }
//
//     boardFieldClickHandlerAtGameTime({target: fromField});
//     boardFieldClickHandlerAtGameTime({target: getFieldByCoordinates(move.toX, move.toY)});
// }

function undoLastMove() {
    var move = movementStack.pop();
    if (move) {
        $(getFieldByCoordinates(move.fromX, move.fromY)).removeClass(move.toColor).removeClass(move.toRank).addClass(move.fromColor).addClass(move.fromRank);
        $(getFieldByCoordinates(move.toX, move.toY)).removeClass(move.fromColor).removeClass(move.fromRank).addClass(move.toColor).addClass(move.toRank);
    }
}

function resetStacks() {
    $('.stack td').removeClass('selected');

    for (i = 0; i < 12; i++) {
        for (j = 0; j < 8; j++) {
            if (ranks[i].startingCountOverrideForBlue >= j + 1) {
                $('.blue.stack tr:nth-child(' + (i + 1) + ') td:nth-child(' + (j + 1) + ')').addClass('blue').addClass(ranks[i].name);
            }
            if (ranks[i].startingCountOverrideForRed >= j + 1) {
                $('.red.stack tr:nth-child(' + (i + 1) + ') td:nth-child(' + (j + 1) + ')').addClass('red').addClass(ranks[i].name);
            }
        }
    }
}

function figureOutUnknownPiece(tdElement, e) {
    $('.pieceListOverlay').css('background-color', $(tdElement).hasClass('blue') ? '#9ebaff' : '#ff9696');
    $('.pieceListOverlayContainer').show();

    pieceSelectionTargetElement = tdElement;
    eventAfterPieceSelection = e;
}

// /* =Testing only
//  ---------------------------------------------------------- */
//
// function putTestPieces() {
//     for (y = 0; y < 4; y++) {
//         for (x = 0; x < 10; x++) {
//             var randomRankId = Math.floor(Math.random() * 12);
//             $('.board tr:nth-child(' + (y + 1) + ') td:nth-child(' + (x + 1) + ')').addClass(ranks[randomRankId].name);
//         }
//     }
//     return;
//     for (y = 6; y < 10; y++) {
//         for (x = 0; x < 10; x++) {
//             var randomRankId = Math.floor(Math.random() * 12);
//             $('.board tr:nth-child(' + (y + 1) + ') td:nth-child(' + (x + 1) + ')').addClass(ranks[randomRankId].name);
//         }
//     }
// }

/* =Initialization
 ---------------------------------------------------------- */

$(window).load(function () {
    $('.blueRedOverlay > div').click(function (e) {
        currentPlayerColor = $(e.target).hasClass('blue') ? 'blue' : 'red';
        $('.blueRedOverlay').hide();

        generateBoard();
        resetStacks();
        createRankImages(parseInt($('.board td').css('width')) + 1);
        createRankClasses();
        setupEvents();
    });

    //putTestPieces();
});

function generateBoard() {
    /* Generates a new board, sets up lakes and player colors */
    $('.board').append('<table border="0" cellpadding="0" cellspacing="0"></table>');
    $('.board table').append('<tr><th></th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th></tr>');
    for (var i = 0; i < 10; i++) {
        $('.board table').append('<tr><th>' + (i + 1) + '</th><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }
    for (i = 0; i < 4; i++) {
        $('.board tr:nth-child(' + (i + 2) + ') td').addClass('blue');
    }
    for (i = 6; i < 10; i++) {
        $('.board tr:nth-child(' + (i + 2) + ') td').addClass('red');
    }
    for (i = 0; i < 8; i++) {
        $('.board tr:nth-child(' + (water[i][1] + 2) + ') td:nth-child(' + (water[i][0] + 2) + ')').addClass('water');
    }

    /* Generates the stacks on the two sides */
    $('.blue.stack').append('<table border="0" cellpadding="0" cellspacing="0"></table>');
    $('.red.stack').append('<table border="0" cellpadding="0" cellspacing="0"></table>');
    for (i = 0; i < 12; i++) {
        $('.blue.stack table').append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
        $('.red.stack table').append('<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>');
    }

    for (i = 0; i < 12; i++) {
        $('.pieceListOverlay').append('<div class="' + currentPlayerColor + ' ' + ranks[i].name + '"></div>');
    }
}

function createRankImages(size) {
    var canvas = document.createElement('canvas');
    $(canvas).attr('width', size).attr('height', size);
    var context = canvas.getContext('2d');

    var sprite = new Image();
    sprite.src = 'img/figures.png';

//	for (colorIndex = 0; colorIndex < 2; colorIndex++) {
    for (var i = 0; i <= 12; i++) {
        context.fillStyle = 'transparent';
        context.fillRect(0, 0, size, size);
        context.fillStyle = 'gray';
        context.font = "normal 12px sans-serif";
        context.fillText(i < 12 ? ranks[i].shortName : "M", 1, 10);
        context.drawImage(sprite, i * 48, 0, 48, 69, (1 - 48 / 69) * (size / 2), 0, 48 / 69 * size, size);
        if (i < 12) {
            ranks[i].image = canvas.toDataURL('image/png');
        } else {
            if (!memoryGame) {
                $.rule('.moved { background:url(' + canvas.toDataURL('image/png') + '); }').appendTo('link');
            }
        }
        //$('body').append(canvas);

        // TODO: Temporary solution until I find out how to clear a canvas to transparent background
        canvas = document.createElement('canvas');
        $(canvas).attr('width', size).attr('height', size);
        context = canvas.getContext('2d');
    }
//	}
}

function createRankClasses() {
    for (var i = 11; i >= 0; i--) {
        $.rule('.' + (memoryGame ? currentPlayerColor + '.' : '') + ranks[i].name + ' { background:url(' + ranks[i].image + '); }').appendTo('link');
    }
    if (!memoryGame) {
        $.rule('td.blue.moved { background-color:#7e9adf; }');
        $.rule('td.blue.revealed { background-color:#5e7abf; }');
        $.rule('td.red.moved { background-color:#df7676; }');
        $.rule('td.red.revealed { background-color:#bf5656; }');
    }
}

function setupEvents() {
    $('a#startGame').click(function () {
        currentGameStage = 'game';
        resetStacks();
        $('a#startGame').hide();
//		getServerSideMove();
        //currentPlayerColor = 'blue';
        return false;
    });

    $('a#undo').click(function () {
        undoLastMove();
    });

    $('.pieceListOverlay div').click(function (e) {
        $(pieceSelectionTargetElement).addClass(getRank(e.target));
        boardFieldClickHandlerAtGameTime(eventAfterPieceSelection);
        $('.pieceListOverlayContainer').hide();
    });

    $('.stack' + /*'.' + currentPlayerColor	+*/ ' td').click(function (e) {
        if (currentGameStage !== 'setup') {
            return;
        }

        selectField(e.target);
    });

    $('.board td').click(function (e) {
        if (currentGameStage === 'setup') {
            boardFieldClickHandlerAtSetupTime(e);
        } else { /* During game */
            boardFieldClickHandlerAtGameTime(e);
        }

        //selectField(e.target);
    });
}

/* =Event Handlers
 ---------------------------------------------------------- */

function boardFieldClickHandlerAtSetupTime(e) {
    /* Determines which color was clicked on. Return if neither blue nor red. */
    var currentColor = getColor(e.target);
    if (!currentColor) {
        return;
    }

    /* Determines if a piece is selected in the stack with the current color */
    var selectedInStack = $('.stack.' + currentColor + ' .selected');
    var selectedRank = '';
    if (selectedInStack.length) {
        selectedRank = getRank(selectedInStack);
    }

    /* Puts any existing piece at the clicked field back to the stack */
    var rank = getRank(e.target);
    if (rank) {
        $(e.target).removeClass(rank);
        addToStack(currentColor, rank);
    }

    /* Adds piece to board */
    $(e.target).addClass(selectedRank);

    /* Removes added piece from the stack and selects next piece */
    $(selectedInStack).removeClass(selectedRank).removeClass('selected');
    selectNextInStack(selectedInStack);
}

function boardFieldClickHandlerAtGameTime(e) {
    if ($(e.target).hasClass('possibleMove')) {
        var selectedField = $('.board .selected')[0];
        var color = getColor(selectedField);
        var rank = getRank(selectedField);
        var targetColor = getColor(e.target);
        var targetRank = getRank(e.target);
        var moveType;
        var battleWinner;

        /* First of all, if the rank has been unknown but this move revealed it, sets it as known. */
        if ($(e.target).hasClass('scoutMove')) {
            $(selectedField).addClass('scout').addClass('revealed');
            rank = 'scout';
            //} else if (!rank) {
            //$(selectedField).addClass('movable');
            //rank = 'movable';
        }

        /* If one of the fields is unknown, player has to tell about it first */
        if ((getColor(e.target) !== null) && (!rank)) {
            figureOutUnknownPiece(selectedField, e);
            return;
        } else if ((getColor(e.target) !== null) && (!targetRank)) {
            figureOutUnknownPiece(e.target, e);
            return;
        }

        /* Determines move type */
        if (getColor(e.target) === null) { /* Move */
            moveType = 'move';
        } else {
            battleWinner = fight(rank, targetRank);
            if (battleWinner === 'attacker') { /* Attacker wins */
                moveType = 'fight-attacker';
            } else if (battleWinner === 'defender') { /* Defender wins */
                moveType = 'fight-defender';
            } else { /* It's a tie */
                moveType = 'fight-tie';
            }
        }

        /* Saves move to stack so it can be undone. */
        var movementStackItem = {
            fromX: getFieldX(selectedField), fromY: getFieldY(selectedField), fromColor: color, fromRank: rank,
            toX: getFieldX(e.target), toY: getFieldY(e.target), toColor: targetColor, toRank: targetRank,
            type: moveType
        };
        movementStack.push(movementStackItem);
        addToLog(movementStackItem);

        /* Removes piece from its original position */
        var isMovedPieceRevealed = $(selectedField).hasClass('revealed');
        $(selectedField).removeClass(rank).removeClass(color).removeClass('selected').removeClass('moved').removeClass('revealed');

        /* Indicate move on the board */
        if (moveType === 'move') {
            $(e.target).addClass(rank).addClass(color).addClass('moved');
            if (isMovedPieceRevealed) {
                $(e.target).addClass('revealed');
            }

        } else if (moveType === 'fight-attacker') {
            $(e.target).removeClass(targetRank).removeClass(targetColor).addClass(rank).addClass(color).addClass('moved').addClass('revealed');
            $('.stack.' + targetColor + ' .' + targetRank + ':last').removeClass(targetRank);

        } else if (moveType === 'fight-defender') {
            $('.stack.' + color + ' .' + rank + ':last').removeClass(rank);
            $(e.target).addClass('revealed');

        } else if (moveType === 'fight-tie') {
            $(e.target).removeClass(targetRank).removeClass(targetColor).removeClass('moved').removeClass('revealed');
            $('.stack.' + color + ' .' + rank + ':last').removeClass(rank);
            $('.stack.' + targetColor + ' .' + targetRank + ':last').removeClass(targetRank);
        }

        /* Removes all possible move indicators from the board */
        $('.board td').removeClass('possibleMove').removeClass('scoutMove');

    } else {
        $('.board td').removeClass('selected').removeClass('possibleMove').removeClass('scoutMove');

        if ($(e.target).hasClass('blue') || $(e.target).hasClass('red')) {
            $(e.target).addClass('selected');
            showPossibleMoves(e.target);
        }
    }
}

/* =Core features
 ---------------------------------------------------------- */

function addToLog(item) {
    var fromRank = ranks[findRankIdByName(item.fromRank)];
    if (item.type === 'move') { /* Move */
        $('.log').prepend('<p class="' + item.fromColor + '">Move with a '
            + (item.fromRank ? '<strong>' + item.fromRank + ' </strong> (' + fromRank.shortName + ')' : '?')
            + ' from <strong>' + String.fromCharCode(65 + item.fromX) + item.fromY + '</strong> to <strong>'
            + String.fromCharCode(65 + item.toX) + item.toY + '</strong></p>');
    } else { /* Fight */
        var toRank = ranks[findRankIdByName(item.toRank)];
        $('.log').prepend('<p class="' + item.fromColor + '">Attack with a <strong>' + item.fromRank + '</strong> (' + fromRank.shortName
            + ') against a <strong>' + item.toRank + '</strong> (' + toRank.shortName + ') from <strong>'
            + String.fromCharCode(65 + item.fromX) + item.fromY + '</strong> to <strong>'
            + String.fromCharCode(65 + item.toX) + item.toY + '</strong> - The attack '
            + ((item.type === 'fight-attacker') ? 'was <strong>successful</strong>.' : ((item.type === 'fight-defender')
                ? 'was <strong>unsuccessful</strong>.' : 'resulted in a <strong>tie</strong>.')) + '</p>');
    }
//	addTolog({ fromX: '2', fromY: '3', fromColor: 'red', fromRank: 'scout', toX: '3', toY: '3', toColor: 'red', toRank: 'scout', type: 'move' })
}

function fight(attackerRank, defenderRank) {
    var attackerRankShortName = ranks[findRankIdByName(attackerRank)].shortName;
    var defenderRankShortName = ranks[findRankIdByName(defenderRank)].shortName;

    if (attackerRank === defenderRank) {
        return 'tie';
    } /* Two equal pieces tie */
    else if ((attackerRank === 'miner') && defenderRank === 'bomb') {
        return 'attacker';
    } /* Miner kills bomb */
    else if ((attackerRank === 'spy') && defenderRank === 'marshal') {
        return 'attacker';
    } /* Spy kills marshal */
    else if ((defenderRank === 'flag') || (defenderRank === 'spy')) {
        return 'attacker';
    } /* Any piece kills a flag or a spy */
    else if ((Number(attackerRankShortName) === attackerRankShortName) && ((Number(defenderRankShortName) === defenderRankShortName))) {
        return attackerRankShortName < defenderRankShortName ? 'attacker' : 'defender';
        /* A smaller number defeats a bigger one */
    } else {
        return 'defender';
    }
    /* In any other case, defender wins */
}

function showPossibleMoves(tdElement) {
    var color = getColor(tdElement);
    var rank = getRank(tdElement);

    /* Remove any previous highlight */
    $('.board td').removeClass('possibleMove').removeClass('scoutMove');

    var adjacentField;
    if ((rank === 'bomb') || (rank === 'flag')) {
        return false;

    } else if ((rank === 'scout') || (!rank)) {
        var lastField;
        var distance;
        for (var i = 0; i < 4; i++) {
            lastField = tdElement;
            distance = 1;
            while (true) {
                adjacentField = getAdjacentField(lastField, directions[i]);
                if (!adjacentField) {
                    break;
                }

                if ((getColor(adjacentField) === color) || $(adjacentField).hasClass('water')) {
                    break;

                } else if (getColor(adjacentField) === null) {
                    $(adjacentField).addClass('possibleMove');
                    if (distance > 1) {
                        $(adjacentField).addClass('scoutMove');
                    }
                    lastField = adjacentField;

                } else if (getColor(adjacentField) !== color) {
                    $(adjacentField).addClass('possibleMove');
                    if (distance > 1) {
                        $(adjacentField).addClass('scoutMove');
                    }
                    break;
                }
                distance++;
            }
        }

    } else {
        for (i = 0; i < 4; i++) {
            adjacentField = getAdjacentField(tdElement, directions[i]);
            if (adjacentField && (getColor(adjacentField) !== color) && !$(adjacentField).hasClass('water')) {
                $(adjacentField).addClass('possibleMove');
            }
        }
        //if (($(tdElement).previous()) && ($(tdElement).previous().)
    }
}

function getAdjacentField(tdElement, direction) {
    if (direction === 'up') {
        return getFieldByCoordinates(getFieldX(tdElement), getFieldY(tdElement) - 1);
    }
    else if (direction === 'right') {
        return getFieldByCoordinates(getFieldX(tdElement) + 1, getFieldY(tdElement));
    }
    else if (direction === 'down') {
        return getFieldByCoordinates(getFieldX(tdElement), getFieldY(tdElement) + 1);
    }
    else if (direction === 'left') {
        return getFieldByCoordinates(getFieldX(tdElement) - 1, getFieldY(tdElement));
    }
}

function getFieldByCoordinates(x, y) {
    if (x < 0 || x > 9 || y < 0 || y > 10) {
        return null;
    }

    return $('.board tr:nth-child(' + (y + 1) + ') td:nth-child(' + (x + 2) + ')')[0];
}

function getFieldX(tdElement) {
    return $(tdElement).parent().find('> *').toArray().indexOf(tdElement) - 1;
}

function getFieldY(tdElement) {
    return $(tdElement).parent().parent().find('> *').toArray().indexOf($(tdElement).parent()[0]);
}

function getRank(tdElement) {
    var classes = $(tdElement).attr('class').split(' ');
    for (var i = 0; i < classes.length; i++) {
        if (rankNames.indexOf(classes[i]) > -1) {
            return classes[i];
        }
    }

    return '';
}

function getColor(tdElement) {
    if ($(tdElement).hasClass('blue')) {
        return 'blue';
    }
    else if ($(tdElement).hasClass('red')) {
        return 'red';
    }

    return null;
}

function findRankIdByName(name) {
    for (var i = 0; i < 12; i++) {
        if (ranks[i].name === name) {
            return i;
        }
    }
    return null;
}

function addToStack(color, rankName) {
    var rankId = findRankIdByName(rankName);
    $('.stack.' + color + ' tr:nth-child(' + (rankId + 1) + ') td:not(".' + rankName + '"):first').addClass(rankName);
}

function selectNextInStack(tdElement) {
    lastElement = tdElement;
    if (!lastElement || !lastElement.length) {
        return;
    }
    while (true) {
        if (lastElement.next() && lastElement.next().attr('class')) {
            if (lastElement.next().attr('class').split(' ').length > 1) {
                lastElement.next().addClass('selected');
                return true;
            } else {
                lastElement = lastElement.next();
            }
        } else {
            if (lastElement.parent().next() && lastElement.parent().next().find('> td:first-child').attr('class')) {
                if ((lastElement.parent().next().find('> td:first-child').attr('class').split(' ').length > 1)) {
                    lastElement.parent().next().find('> td:first-child').addClass('selected');
                    return true;
                } else {
                    lastElement = lastElement.parent().next().find('> td:first-child');
                }
            } else {
                return false;
            }
        }
    }
}

function selectField(element) {
    $(element).parents('table').find('td').removeClass('selected');
    selectedField = null;

    if ($(element).hasClass('red') || $(element).hasClass('blue')) {
        selectedField = element;
        $(element).addClass('selected');
    }
}
