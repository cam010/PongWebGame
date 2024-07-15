// Get game elements
var paddle_l = document.getElementById("paddle_l");
var paddle_r = document.getElementById("paddle_r");
var ball = document.getElementById("ball");
var left_score_div = document.getElementById("score_left");
var right_score_div = document.getElementById("score_right");
var ball_speed_div = document.getElementById("ball_speed");
var bounce_angle_div = document.getElementById("bounce_angle");

// Constants
const WINHEIGHT = document.body.clientHeight;
const WINWIDTH = document.body.clientWidth;
console.log(WINWIDTH, WINHEIGHT);
const PADDLE_MOVE_SPEED = WINHEIGHT / 100; // 0.5%
const DEFAULT_BALL_SPEED = WINWIDTH / 200;
const ABS_MAX_BALL_VX = DEFAULT_BALL_SPEED * 1.5;
const ABS_MIN_BALL_VX = DEFAULT_BALL_SPEED * 0.9;
const BALL_DIAMETER = WINHEIGHT / 20;
const PADDLE_HEIGHT = WINHEIGHT / 6;
const PADDLE_WIDTH = WINWIDTH / 50;
const SCOREBOARD_FONT_SIZE = 10; //vh
const MAX_BOUNCE_ANGLE = Math.PI / 3; // 60 deg

// Scoreboard
left_score_div.style.left = WINWIDTH * 0.25 + "px"; // 25% of screenwidth
left_score_div.style.top = WINHEIGHT * 0.02 + "px"; // 2% of screenheight
right_score_div.style.left = WINWIDTH * 0.75 - SCOREBOARD_FONT_SIZE + "px"; // 75% of screenwidth
right_score_div.style.top = WINHEIGHT * 0.02 + "px"; // 2% of screenheight
left_score_div.style.fontSize = SCOREBOARD_FONT_SIZE + "vh";
right_score_div.style.fontSize = SCOREBOARD_FONT_SIZE + "vh";

// Ball Variables
var ball_vy = DEFAULT_BALL_SPEED;
var ball_vx = DEFAULT_BALL_SPEED;
var ball_x;
var ball_y;
var bounce_angle = 0;
ball.style.width = BALL_DIAMETER + "px";
ball.style.height = BALL_DIAMETER + "px";

// Set ball position;
put_ball_in_centre();
set_ball_pos();
start_ball();

// Set paddle size
paddle_l.style.height = PADDLE_HEIGHT + "px";
paddle_r.style.height = PADDLE_HEIGHT + "px";

// Set initial paddle position
var paddle_l_y = WINHEIGHT / 2 - PADDLE_HEIGHT / 2;
var paddle_r_y = WINHEIGHT / 2 - PADDLE_HEIGHT / 2;
paddle_l.style.top = paddle_l_y + "px";
paddle_r.style.top = paddle_r_y + "px";

const paddle_l_x = WINWIDTH * 0.01;
const paddle_r_x = WINWIDTH * 0.97;
paddle_l.style.left = paddle_l_x + "px";
paddle_r.style.left = paddle_r_x + "px";

// Log keypresses
var keyState = {};
document.addEventListener("keydown", log_key_down);
document.addEventListener("keyup", log_key_up);

function log_key_down(e) {
  keyState[e.code] = true;
}

function log_key_up(e) {
    keyState[e.code] = false;
}

// Move paddles
function set_paddle_l_y() {
  paddle_l.style.top = paddle_l_y + "px";
}

function set_paddle_r_y() {
  paddle_r.style.top = paddle_r_y + "px";
}

function move_l_paddle(direction) {
  if (direction == "up") {
    paddle_l_y -= PADDLE_MOVE_SPEED;
  } else if (direction == "down") {
    paddle_l_y += PADDLE_MOVE_SPEED;
  }
  set_paddle_l_y();
  console.log("paddlel " + paddle_l_y);
}

function move_r_paddle(direction) {
  if (direction == "up") {
    paddle_r_y -= PADDLE_MOVE_SPEED;
  } else if (direction == "down") {
    paddle_r_y += PADDLE_MOVE_SPEED;
  }
  set_paddle_r_y();
  console.log("paddler " + paddle_r_y);
}

function simulate_border_for_paddles() {
  // Top Border
  if (paddle_l_y < 0) {
    paddle_l_y = 0;
    set_paddle_l_y();
  }

  if (paddle_r_y < 0) {
    paddle_r_y = 0;
    set_paddle_r_y();
  }

  // Bottom Border
  if (paddle_l_y + PADDLE_HEIGHT + 1 > WINHEIGHT) {
    console.log(paddle_l_y);
    paddle_l_y = WINHEIGHT - PADDLE_HEIGHT - 1;
    set_paddle_l_y();
  }
  if (paddle_r_y + PADDLE_HEIGHT + 1 > WINHEIGHT) {
    paddle_r_y = WINHEIGHT - PADDLE_HEIGHT - 1;
    set_paddle_r_y();
  }
}

// Move ball
function set_ball_pos() {
  ball.style.top = ball_y + "px";
  ball.style.left = ball_x + "px";
}

function move_ball() {
  ball_x += ball_vx;
  ball_y += ball_vy;
  set_ball_pos();
  simulate_border_for_ball();
  bounce_off_paddle();
}
setInterval(move_ball, 10);

function start_ball() {
  ball_vx = DEFAULT_BALL_SPEED;
  ball_vy = DEFAULT_BALL_SPEED;
  update_speed();
}

function stop_ball() {
  ball_vx = 0;
  ball_vy = 0;
}

function put_ball_in_centre() {
  ball_x = WINWIDTH / 2 - BALL_DIAMETER;
  ball_y = WINHEIGHT / 2 - BALL_DIAMETER;
}

function simulate_border_for_ball() {
  // Top and Bottom Borders
  if (ball_y < 0) {
    ball_y = 0;
    ball_vy = -ball_vy;
  } else if (ball_y + BALL_DIAMETER > WINHEIGHT) {
    ball_y = WINHEIGHT - BALL_DIAMETER - 1;
    ball_vy = -ball_vy;
  }

  // Left and Right Borders
  var game_over = false;
  var point;

  if (ball_x < 0) {
    ball_x = 0;
    game_over = true;
    point = "right";
  } else if (ball_x + BALL_DIAMETER > WINWIDTH) {
    ball_x = WINWIDTH - BALL_DIAMETER;
    game_over = true;
    point = "left";
  }

  set_ball_pos();

  if (game_over) {
    stop_ball();
    if (point == "left") {
      give_point_to_left();
    } else if (point == "right") {
      give_point_to_right();
    }
    put_ball_in_centre();
    start_ball();
  }
}

function get_bounce_angle(paddle_y) {
  var paddle_centre = get_paddle_centre(paddle_y);
  var ball_centre = get_ball_centre();
  var relative_paddle_distance = get_relative_paddle_distance(
    paddle_centre,
    ball_centre
  );
  var normalised_paddle_distance = get_normalised_distance(
    relative_paddle_distance
  );
  return normalised_paddle_distance * MAX_BOUNCE_ANGLE;
}

function get_paddle_centre(paddle_y) {
  return paddle_y + PADDLE_HEIGHT / 2;
}

function get_ball_centre() {
  return ball_y + BALL_DIAMETER / 2;
}

function get_relative_paddle_distance(paddle_centre, ball_centre) {
  return paddle_centre - ball_centre;
}

function get_normalised_distance(relative_paddle_distance) {
  return relative_paddle_distance / (PADDLE_HEIGHT / 2);
}

function constrain_ball_velocity() {
  vx_negative = ball_vx < 0;
  vy_negative = ball_vy < 0;

  // Constrain vx to bounds
  if (ball_vx < ABS_MIN_BALL_VX && !vx_negative) {
    console.log("ball vx too slow ", ball_vx);
    ball_vx = ABS_MIN_BALL_VX;
  } else if (ball_vx > -ABS_MIN_BALL_VX && vx_negative) {
    console.log("ball vx too slow ", ball_vx);
    ball_vx = -ABS_MIN_BALL_VX;
  } else if (ball_vx > ABS_MAX_BALL_VX && !vx_negative) {
    console.log("ball vx too fast", ball_vx);
    ball_vx = ABS_MAX_BALL_VX;
  } else if (ball_vx < -ABS_MAX_BALL_VX && vx_negative) {
    console.log("ball vx too slow ", ball_vx);
    ball_vx = -ABS_MAX_BALL_VX;
  }

  // Constrain vy to bounds
  if (ball_vy < ABS_MIN_BALL_VX && !vy_negative) {
    console.log("ball vy too slow ", ball_vy);
    ball_vy = ABS_MIN_BALL_VX;
  } else if (ball_vy > -ABS_MIN_BALL_VX && vy_negative) {
    console.log("ball vy too slow ", ball_vy);
    ball_vy = -ABS_MIN_BALL_VX;
  } else if (ball_vy > ABS_MAX_BALL_VX && !vy_negative) {
    console.log("ball vy too fast", ball_vx);
    ball_vy = ABS_MAX_BALL_VX;
  } else if (ball_vy < -ABS_MAX_BALL_VX && vy_negative) {
    console.log("ball vy too slow ", ball_vx);
    ball_vy = -ABS_MAX_BALL_VX;
  }
}

function bounce_off_paddle() {
  // https://gamedev.stackexchange.com/a/4255
  if (
    // Hits Left Paddle
    ball_x < paddle_l_x + PADDLE_WIDTH &&
    ball_y > paddle_l_y &&
    ball_y < paddle_l_y + PADDLE_HEIGHT
  ) {
    bounce_angle = get_bounce_angle(paddle_l_y);
    normalised_paddle_distance = get_normalised_distance(
      get_relative_paddle_distance(
        get_paddle_centre(paddle_l_y),
        get_ball_centre()
      )
    );
    ball_x = paddle_l_x + PADDLE_WIDTH;
    ball_vy =
      DEFAULT_BALL_SPEED *
      -Math.sin(bounce_angle) *
      Math.abs(normalised_paddle_distance * 5);
    ball_vx =
      DEFAULT_BALL_SPEED *
      Math.cos(bounce_angle) *
      Math.abs(normalised_paddle_distance * 5);
    console.log(normalised_paddle_distance);
  } else if (
    // Hits Right Paddle
    ball_x >= paddle_r_x - BALL_DIAMETER &&
    ball_y > paddle_r_y &&
    ball_y < paddle_r_y + PADDLE_HEIGHT
  ) {
    bounce_angle = get_bounce_angle(paddle_r_y);
    normalised_paddle_distance = get_normalised_distance(
      get_relative_paddle_distance(
        get_paddle_centre(paddle_r_y),
        get_ball_centre()
      )
    );
    ball_x = paddle_r_x - BALL_DIAMETER;
    ball_vy =
      DEFAULT_BALL_SPEED *
      Math.sin(bounce_angle) *
      Math.abs(normalised_paddle_distance * 5);
    ball_vx =
      DEFAULT_BALL_SPEED *
      -Math.cos(bounce_angle) *
      Math.abs(normalised_paddle_distance * 5);
    console.log(normalised_paddle_distance);
  }
  constrain_ball_velocity();
  update_speed();
  update_bounce_angle(bounce_angle);
}

// Game Admin
var left_points = 0;
var right_points = 0;

//https://stackoverflow.com/a/12273538
function game_loop() {
  if (keyState["KeyW"] && !keyState["KeyS"]) {
    move_l_paddle("up");
  }
  if (keyState["KeyS"] && !keyState["KeyW"]) {
    move_l_paddle("down");
  }
  if (keyState["ArrowUp"] && !keyState["ArrowDown"]) {
    move_r_paddle("up");
  }
  if (keyState["ArrowDown"] && !keyState["ArrowUp"]) {
    move_r_paddle("down");
  }
  simulate_border_for_paddles()
}

setInterval(game_loop, 10);


function give_point_to_left() {
  left_points += 1;
  update_score();
}

function give_point_to_right() {
  right_points += 1;
  update_score();
}

function update_score() {
  left_score_div.innerHTML = left_points.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  right_score_div.innerHTML = right_points.toLocaleString("en-US", {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
}

function update_speed() {
  var ball_speed_ms = (calculate_ball_speed() / 10).toFixed(2);
  ball_speed_div.innerHTML = "Ball Speed: " + ball_speed_ms + "px/ms";
}

function calculate_ball_speed() {
  return Math.sqrt(ball_vx ** 2 + ball_vy ** 2);
}

function update_bounce_angle() {
    bounce_angle_deg = bounce_angle * (180/Math.PI);
    bounce_angle_div.innerHTML = "Bounce Angle: " + bounce_angle_deg.toFixed(2) + "deg";
}
