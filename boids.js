// Size of canvas. These get updated to fill the whole browser.
let width = 150;
let height = 150;

const numBoids = 100;
const visualRange = 75;

var boids = [];
let mouseX;
let mouseY;


function initBoids() {
  for (var i = 0; i < numBoids; i += 1) {
    boids[boids.length] = {
      x: Math.random() * width,
      y: Math.random() * height,
      dx: Math.random() * 10 - 5,
      dy: Math.random() * 10 - 5,
      perched: false,
      history: [],
    };
  }
}

function distance(boid1, boid2) {
  return Math.sqrt(
    (boid1.x - boid2.x) * (boid1.x - boid2.x) +
      (boid1.y - boid2.y) * (boid1.y - boid2.y),
  );
}

// TODO: This is naive and inefficient.
function nClosestBoids(boid, n) {
  // Make a copy
  const sorted = boids.slice();
  // Sort the copy by distance from `boid`
  sorted.sort((a, b) => distance(boid, a) - distance(boid, b));
  // Return the `n` closest
  return sorted.slice(1, n + 1);
}

// Called initially and whenever the window resizes to update the canvas
// size and width/height variables.
function sizeCanvas() {
  const canvas = document.getElementById("boids");
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
}

// Constrain a boid to within the window. If it gets too close to an edge,
// nudge it back in and reverse its direction.
function keepWithinBounds(boid) {
  const margin = 100;
  const turnFactor = 1;

  if (boid.x < margin) {
    if(!boid.perched)
      boid.dx += turnFactor;
  }
  if (boid.x > width - margin) {
    if(!boid.perched)
      boid.dx -= turnFactor
  }
  if (boid.y < margin) {
    if(!boid.perched)
      boid.dy += turnFactor;
  }
  if (boid.y > height - margin) {
    if(!boid.perched)
      boid.dy -= turnFactor;
  }

}

//perching
function perching(boid){

    //perch object size 300px width 5px height
    if (boid.x > 100 && boid.x < 400 && boid.y > height - 30 && boid.y < height - 25) //collides with the perch object
    {
      //rotate boid by 90 degree and stop motion 
      // ctx.rotate(-Math.PI/2);
      boid.perched = true;
      // alert("stop longer");
      boid.dx = 0;
      boid.dy = 0;
     //if predator gets too close disperse them  
     // auto disperse after sitting for sometime
    }


  // }

}

// Find the center of mass of the other boids and adjust velocity slightly to
// point towards the center of mass.
function flyTowardsCenter(boid) {
  const centeringFactor = 0.005; // adjust velocity by this %

  let centerX = 0;
  let centerY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    // if(!otherBoid.perched)
    if(!boid.perched)
    {
      if (distance(boid, otherBoid) < visualRange) {
        centerX += otherBoid.x;
        centerY += otherBoid.y;
        numNeighbors += 1;
      }
    }
  }
    if(!boid.perched){
  if (numNeighbors) {
    centerX = centerX / numNeighbors;
    centerY = centerY / numNeighbors;

    boid.dx += (centerX - boid.x) * centeringFactor;
    boid.dy += (centerY - boid.y) * centeringFactor;
    
  }
}
}

// Move away from other boids that are too close to avoid colliding
function avoidOthers(boid) {
  const minDistance = 20; // The distance to stay away from other boids
  const avoidFactor = 0.05; // Adjust velocity by this %
  let moveX = 0;
  let moveY = 0;
  for (let otherBoid of boids) {
 
    if (otherBoid !== boid) {
      if (distance(boid, otherBoid) < minDistance) {

        moveX += boid.x - otherBoid.x;
        moveY += boid.y - otherBoid.y;
      }
    }
  }
  
  if(!boid.perched)
  {
    boid.dx += moveX * avoidFactor;
    boid.dy += moveY * avoidFactor;
  }
}

//move away from predator 
function avoidPredator(boid,mouseX,mouseY)
{
  const predDistance = 100; //min distance to the predator
  const avoidFactor = 0.15; //escape velocity from predator
  let moveX = 0;
  let moveY = 0;
  let actualDis = Math.sqrt((boid.x - mouseX) * (boid.x - mouseX) + (boid.y - mouseY) * (boid.y - mouseY));
  if(actualDis < predDistance){

    if(boid.perched){
      //if it is perched on the perch-object then move it to the edge of the perched object so it can escape 
      boid.y -= 5; // height of the perch object 
      boid.perched = false;
    }

    moveX += boid.x - mouseX;
    moveY += boid.y - mouseY;
  }
  boid.dx += moveX * avoidFactor;
  boid.dy += moveY * avoidFactor;
}

// Find the average velocity (speed and direction) of the other boids and
// adjust velocity slightly to match.
function matchVelocity(boid) {
  const matchingFactor = 0.05; // Adjust by this % of average velocity

  let avgDX = 0;
  let avgDY = 0;
  let numNeighbors = 0;

  for (let otherBoid of boids) {
    // if(!otherBoid.perched)
    if(!boid.perched)
    {
      if (distance(boid, otherBoid) < visualRange) {
        avgDX += otherBoid.dx;
        avgDY += otherBoid.dy;
        numNeighbors += 1;
      }
    }
  }

  if(!boid.perched)
  {
    if (numNeighbors) {
      avgDX = avgDX / numNeighbors;
      avgDY = avgDY / numNeighbors;

      boid.dx += (avgDX - boid.dx) * matchingFactor;
      boid.dy += (avgDY - boid.dy) * matchingFactor;
    }
}
}

// Speed will naturally vary in flocking behavior, but real animals can't go
// arbitrarily fast.
function limitSpeed(boid) {
  const speedLimit = 15;

  const speed = Math.sqrt(boid.dx * boid.dx + boid.dy * boid.dy);
  if (speed > speedLimit) {
    boid.dx = (boid.dx / speed) * speedLimit;
    boid.dy = (boid.dy / speed) * speedLimit;
  }
}

const DRAW_TRAIL = false;

function drawPredator(ctx,mouseX,mouseY)
{
  ctx.beginPath();
  ctx.fillStyle = "#b10a1e";
  ctx.moveTo(mouseX + 7.5, mouseY);
  ctx.lineTo(mouseX - 7.5, mouseY - 5);
  ctx.lineTo(mouseX - 22.5 , mouseY);
  ctx.lineTo(mouseX - 7.5, mouseY + 5);
  ctx.lineTo(mouseX + 7.5, mouseY);
  ctx.fill();

}


function drawPerch(ctx)
{
  ctx.beginPath();
  const canvas = document.getElementById("boids");
  // width = window.innerWidth;
  height = window.innerHeight;
  // ctx.moveTo(100,height - 30);
  // ctx.lineTo(400,height - 30);
  ctx.rect(100,height-30,300,5);
  ctx.fillStyle = "green";
  ctx.fill();

}

function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.dy, boid.dx);
  ctx.translate(boid.x, boid.y);
  ctx.rotate(angle);
  ctx.translate(-boid.x, -boid.y);
  ctx.fillStyle = "#558cf4";
  ctx.beginPath();
  ctx.moveTo(boid.x, boid.y);
  ctx.lineTo(boid.x - 15, boid.y + 5);
  ctx.lineTo(boid.x - 15, boid.y - 5);
  ctx.lineTo(boid.x, boid.y);
  ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  if (DRAW_TRAIL) {
    ctx.strokeStyle = "#558cf466";
    ctx.beginPath();
    ctx.moveTo(boid.history[0][0], boid.history[0][1]);
    for (const point of boid.history) {
      ctx.lineTo(point[0], point[1]);
    }
    ctx.stroke();
  }
}

//location of the predator
addEventListener("mousemove",function(evnt)
{
  mouseX = evnt.clientX;
  mouseY = evnt.clientY;
})

// Main animation loop
function animationLoop() {
  // Update each boid
  for (let boid of boids) {

    // Update the velocities according to each rule
    flyTowardsCenter(boid);
    avoidOthers(boid);
    avoidPredator(boid,mouseX,mouseY);
    perching(boid);
    matchVelocity(boid);
    limitSpeed(boid);
    keepWithinBounds(boid);

    // Update the position based on the current velocity
    boid.x += boid.dx;
    boid.y += boid.dy;
    boid.history.push([boid.x, boid.y])
    boid.history = boid.history.slice(-50);
  }
  
  // Clear the canvas and redraw all the boids in their current positions
  const ctx = document.getElementById("boids").getContext("2d");
  ctx.clearRect(0, 0, width, height);
  for (let boid of boids) {
    drawBoid(ctx, boid);
  }

  drawPerch(ctx);
  drawPredator(ctx,mouseX,mouseY); //mouseX mouseY position of the predator

  // Schedule the next frame
  window.requestAnimationFrame(animationLoop);
}

window.onload = () => {
  // Make sure the canvas always fills the whole window
  window.addEventListener("resize", sizeCanvas, false);
 sizeCanvas();

  // Randomly distribute the boids to start
 initBoids();

  // Schedule the main animation loop
  window.requestAnimationFrame(animationLoop);
};
