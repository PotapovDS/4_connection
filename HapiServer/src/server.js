'use strict';
const Hapi = require('@hapi/hapi');

const START_GAME = [
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

let field = fieldClone();

// fieldClone(field, START_GAME)

let currentPlayer = 1;

function fieldClone(){
   return START_GAME.map((i) => i.slice());
}

// -------логика игры ----------

// проверяем является ли ход победным
function checkWin(column, row, currentPlayer) {
  if (checkWinVertical(column, row)){
    return true;
  } else {
    if (checkWinDiagonal(column, row, currentPlayer)) {
      return true;
    } else {
      if (checkWinHorizontal(column, row, currentPlayer)){
        return true
      } else {
        return false
      }
    }
  }
}

// проверка по вертикали
function checkWinVertical(column, row){
  let count = 1;
  for (let i = row; i > 0; i--) {
    if (field[column][i] === field[column][i - 1]) {
      count++;
    }
  }
  return (count === 4) ? true : false;
}

// проверка по горизонтали
function checkWinHorizontal(column, row, currentPlayer){
  let count = 0;
  for (let i = 0; i < 7; i++){
    if (field[i][row] === currentPlayer){
      count++;
    } else {
      count = 0;
    }
    if (count === 4) return true;
  }
  return false;
}

//проверка по диагонали
function checkWinDiagonal(column, row, currentPlayer){
  //сохраняем начальное значение позиции
  let reserveColumn = column;
  let reserveRow = row;

  let count = 0;
  // проверка слева вправо
  //находим начало диагонали
  if (column > 0 && row > 0){
    let min = Math.min(column, row);
    column -= min;
    row -= min;
  }
  while (column < 7 && row < 6) {
    if (field[column][row] === currentPlayer){
      count++;
    } else count = 0;

    if (count === 4) return true
    column++; row++;
  }
  //возвращаем начальное значение позиции
  column = reserveColumn;
  row = reserveRow;
  // проверка справа налево
  //находим начало диагонали
  if (column < 6 && row > 0){
    let min = Math.min((6 - column), row);
    column += min;
    row -= min;
  }

  while (column >= 0 && row < 6) {
    if (field[column][row] === currentPlayer){
      count++;
    } else count = 0;
    if (count === 4) return true
    column--; row++;
  }
  return false;
}

//проверяем заполнен ли ряд, если да, ход не засчитывается, перехода хода нет
// function checkFullColumn(arr) {
//   if (arr.indexOf(0) === -1) {
//     alert('этот ряд заполнен');
//     return true;
//   }
// }

//проверяем есь ли возможнось хода
function checkNoMove() {
  for (let i = 0; i <= 6; i++) {
    if (field[i][5] === 0) return false;
  }
  return true;
}

// ----- сервер и роуты ---------

async function createServer() {
  // Инициализируем сервер
  const server = await new Hapi.server({
    host: 'localhost',
    port: 4000,
    routes: {
        cors: true
      }
  });

  server.route({
    method: 'PATCH',
    path: '/game',
    handler: (req, res) => {
      field = fieldClone();
      console.log(field, 'START_GAME', START_GAME);
      return(field);
    }
  });

  server.route({
    method: 'POST',
    path: '/game',
    handler: (req, res) => {
        let isEndGame = req.payload.isEndGame;
        const column = req.payload.column;
        let arr = field[column];
        const raw = arr.indexOf(0);

        field[column][raw] = currentPlayer;

        if (checkNoMove()){
          field = false; // присваиваем полю значение, указывающее на отсутствие ходов
          return({field, currentPlayer, isEndGame});
        }
        if (checkWin(column, raw, currentPlayer)){
          field = fieldClone();
          isEndGame = true;
          return({field, currentPlayer, isEndGame});
        }
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        return({field, currentPlayer, isEndGame});
      }
  });

  server.route({
    method: 'GET',
    path: '/game/status',
    handler: (req, res) => {
      return {
        field,
        currentPlayer
      };
    }
  });

  // Запускаем сервер
  try {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
  } catch (err) {
    console.log(JSON.stringify(err));
  }

  return server;
}

module.exports = createServer;
