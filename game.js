const svg = document.querySelector('svg');
const svgWidth = svg.clientWidth;
const svgHeight = svg.clientHeight;
let ball;
let otherTargets;
let createWallCalled = false;
let blockCoordThatStartedWall = [];
let blockAbove, blockBelow;
let firstCall = true;
let firstTimeCreateWallCalled = true;
let ballYPositive = true;
let ballXPositive = true;
let ballX = 50;
let ballY = 98;

function createWall(target) {
  createWallCalled = true;
  let classes = target.classList;
  let x = Number(classes[0]);
  let y = Number(classes[1]);
  blockCoordThatStartedWall = [];
  blockCoordThatStartedWall.push(x,y);
  blockAbove = blockCoordThatStartedWall[1] - 1;
  blockBelow = blockCoordThatStartedWall[1] + 1;
  firstTimeCreateWallCalled = true;
  otherTargets = Array.from(document.getElementsByClassName(x));
  target.setAttribute('fill', 'black');
  target.classList.add('wall');
}

function fillRectangle(target, direction) {
  if (!target.classList.contains('wall')) {
    if (direction === 'enter') target.setAttribute('fill', 'red');
    if (direction === 'leave') target.setAttribute('fill', 'grey');
  }
}

for (let y = 0, y_index = 0; y < svgHeight; y += 25, y_index += 1) {
  for (let x = 0, x_index = 0; x < svgWidth; x += 25, x_index += 1) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('height', '25');
    rect.setAttribute('width', '25');
    rect.setAttribute('fill', 'grey');
    rect.setAttribute('stroke', 'yellow');
    rect.setAttribute('class', `${x_index} ${y_index}`)
    rect.addEventListener('mouseenter', (e) => fillRectangle(e.target, 'enter'));
    rect.addEventListener('mouseleave', (e) => fillRectangle(e.target, 'leave'));
    rect.addEventListener('click',(e) => createWall(e.target));
    svg.appendChild(rect);
  }
}


function createBall(cx, cy) {
  ball = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  ball.setAttribute('cx', cx);
  ball.setAttribute('cy', cy);
  ball.setAttribute('r', '12');
  ball.setAttribute('fill', 'red')
  ball.setAttribute('class', 'ball');
  svg.appendChild(ball);
}

function checkCollision() {
  if (ball) {
    //-- Exterior wall collision detection --//
      // Added cushioning of 5 for visual appeal
    if (Number(ball.cy.baseVal.value) >= svgHeight - 5) ballYPositive = false;
    if (Number(ball.cy.baseVal.value) <= 5) ballYPositive = true;
    if (Number(ball.cx.baseVal.value) >= svgWidth - 5) ballXPositive = false;
    if (Number(ball.cx.baseVal.value) <= 5) ballXPositive = true;
    //-- Interior wall collision detection --//
    // let walls = document.querySelectorAll('.wall');
    // console.log(walls)
    check()
  }
}

let validInteriorWalls = [];
let boxesWithWallClass = [];

function check() {
  let walls = Array.from(document.querySelectorAll('.wall'));
  // walls.map(box => {
  //   let classes = box.className.baseVal.split(" ");
  //   boxesWithWallClass.push({x: classes[0], y: classes[1]});
  // })
  walls.forEach(wall => {
    let directionToBounceBack = getBoundCheckIntersection(ball, wall)
    console.log('we hit wall:', directionToBounceBack);
  })
}

function getBoundCheckIntersection(item1, item2) {
  let item1Rect = item1.getBoundingClientRect();    //BOUNDING BOX OF THE FIRST OBJECT
  let item2Rect = item2.getBoundingClientRect();    //BOUNDING BOX OF THE SECOND OBJECT

   //CHECK IF THE TWO BOUNDING BOXES OVERLAP
  //  if (item2Rect.left > item1Rect.right) return ballXPositive = true;
  //  if (item2Rect.right < item1Rect.left) return ballXPositive = false;

  // ** -- PROBLEM IS WITH COLLLISION DETECTION FOR POP UP WALLS. SINCE BALL COULD
  //       BE ON EITHER SIDE OF WALL, NOT AS CUT AND DRY AS JUST CHECKING COORDS -- ** //
 return !(item2Rect.left > item1Rect.right ||
          item2Rect.right < item1Rect.left ||
          item2Rect.top > item1Rect.bottom ||
          item2Rect.bottom < item1Rect.top);
}


// Game loop
function update(progress) {
  if (createWallCalled) {
    if (firstTimeCreateWallCalled) {
      otherTargets.map((target, index) => {
        let classList = target.className.baseVal.split(" ");
        let xVal = Number(classList[0]);
        let yVal = Number(classList[1]);
        // The && check ensure we stay in the same vertical as originally clicked
        // Without it - horizontal walls would be formed occasionally
        if (yVal === blockAbove && xVal === blockCoordThatStartedWall[0] || yVal === blockBelow && xVal === blockCoordThatStartedWall[0]) {
          let firstIndex = index;
          let firstTarget = otherTargets.splice(firstIndex, 1);
          let currentBlock = firstTarget[0];
          currentBlock.setAttribute('fill', 'black');
          currentBlock.classList.add('wall');
        }
      })
      firstTimeCreateWallCalled = false;
    }
    // I'm mutating the array that I'm mapping over which is possibly why it's mapping more than it's supposed to
    blockAbove -= 1;
    if (blockAbove >= 0) {
      let currentBlock, targetIndex;
      otherTargets.map((target, index) => {
        let classes = target.className.baseVal.split(" ");
        let x = Number(classes[0])
        let y = Number(classes[1]);
        if (y === blockAbove && x === blockCoordThatStartedWall[0]) {
          targetIndex = index;
          let foundTarget = otherTargets.splice(targetIndex, 1);
          currentBlock = foundTarget[0];
          currentBlock.setAttribute('fill', 'black');
          currentBlock.classList.add('wall');
          return currentBlock;
        }
      })
    }

    blockBelow += 1;
    if (blockBelow <= 23) {
      let currentBlock, targetIndex;
      otherTargets.map((target, index) => {
        let classes = target.className.baseVal.split(" ");
        let x = Number(classes[0]);
        let y = Number(classes[1]);
        if (y === blockBelow && x === blockCoordThatStartedWall[0]) {
          targetIndex = index;
          let foundTarget = otherTargets.splice(targetIndex, 1);
          currentBlock = foundTarget[0];
          currentBlock.setAttribute('fill', 'black');
          currentBlock.classList.add('wall');
        }
      })
    }
  }

  // Update the state of the world for the elapsed time since last render
  if (ballYPositive) {
    ballY += 5;
  } else {
    ballY -= 5;
  }

  if (ballXPositive) {
    ballX += 5;
  } else {
    ballX -= 5;
  }
}

function draw() {
  // Draw the state of the world
  if (firstCall) {
    firstCall = false;
    createBall(ballX, ballY);
  } else {
    svg.removeChild(ball);
    createBall(ballX, ballY);
  }
}

function loop(timestamp) {
  let progress = timestamp - lastRender
  checkCollision()
  update(progress)
  draw()

  lastRender = timestamp
  window.requestAnimationFrame(loop)
}

let lastRender = 0
window.requestAnimationFrame(loop)
