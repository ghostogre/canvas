function Rule(props) {
  this.x = props.x || 0;
  this.y = props.y || 0;
  this.vx = 0; // 标尺的移动速度
  this.ax = 0; // 标尺移动加速度
  this.color = props.color || "#ffffff";
  this.scaleX = props.scaleX || 1;
  this.scaleY = props.scaleY || 1;
  this.markShort = -props.markShort || -5;
  this.markLong = -props.markLong || -10;
  this.textHeight = -props.textHeight || -5;
  this.min = props.min || 1; //最小金额
  this.max = props.max || 10000; // 最大金额
  this.width = props.width || 1000; //尺子的宽度，是整个标尺的实际屏幕长度。
  this.step = props.step || 1000; // 步长
  this.seg = Math.floor(this.max / this.step); // 段数
  this.pxStep = Math.floor(this.width / this.seg); //每段在canvas上的实际宽度
  this.miniPxStep = this.pxStep / 10; //每个刻度在canvas上的实际像素距离
  this.ratioScale = Math.floor(this.max / this.width); //比例尺

  this.lineBottom = Object.assign(
    {},
    {
      mx: null,
      my: null,
      lx: null,
      ly: null,
      color: "#fff"
    },
    props.lineBottom || {}
  );

  this.lineRed = Object.assign(
    {},
    {
      mx: 0,
      my: 0,
      lx: 0,
      ly: 5,
      color: "red",
      isDrawRedLine: true
    },
    props.lineRed || {}
  );
}

Rule.prototype.draw = function(ctx) {
  var n = 0;
  ctx.save();
  ctx.translate(this.x, this.y);
  ctx.lineWidth = 1;
  ctx.scale(this.scaleX, this.scaleY);
  ctx.fillStyle = this.color;
  ctx.strokeStyle = this.color;
  ctx.textAlign = "center";
  ctx.beginPath();
  for (var i = 0; i <= this.width; i += this.miniPxStep) {
    ctx.moveTo(i, 0);
    if (n % 10 === 0) {
      ctx.lineTo(i, this.markLong);
      if (i === 0) {
        ctx.fillText(1, i, this.markLong + this.textHeight);
      } else {
        ctx.fillText(n / 10 * this.step, i, this.markLong + this.textHeight);
      }
    } else {
      ctx.lineTo(i, this.markShort);
    }
    n++;
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore();

  // 底部横线
  ctx.save();
  ctx.strokeStyle = this.lineBottom.color;
  ctx.scale(this.scaleX, this.scaleY);
  ctx.beginPath();
  ctx.moveTo(this.lineBottom.mx, this.lineBottom.my);
  ctx.lineTo(this.lineBottom.lx, this.lineBottom.ly);
  ctx.stroke();
  ctx.closePath();
  ctx.restore();

  //中心线
  if (this.lineRed.isDrawRedLine) {
    ctx.save();
    ctx.strokeStyle = this.lineRed.color;
    ctx.lineWidth = 1;
    ctx.scale(this.scaleX, this.scaleY);
    ctx.beginPath();
    ctx.moveTo(this.lineRed.mx, this.lineRed.my);
    ctx.lineTo(this.lineRed.lx, this.lineRed.ly);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
  }
};

var canvas = document.getElementById("canvas"),
  ctx = canvas.getContext("2d"),
  cW = canvas.width,
  cH = canvas.height,
  centerX = cW / 2,
  centerY = cH / 2;

var ruleX = centerX,
  ruleY = 80;
var isMouseDown = false,
  oldX = 0,
  offsetX = 0;
var mouse = utils.captureMouse(canvas);

var rule = new Rule({
  x: ruleX,
  y: ruleY,
  min: 500,
  max: 10000,
  width: 500,
  color: "282D4F",
  step: 1000,
  markShort: 5,
  markLong: 12,
  textHeight: 5,
  lineBottom: {
    mx: 0,
    my: ruleY,
    lx: cW,
    ly: ruleY,
    color: "#282D4F"
  },
  lineRed: {
    mx: centerX,
    my: 40,
    lx: centerX,
    ly: ruleY + 6,
    color: "#FC4442"
  }
});

//重置标尺的初始位置
rule.x = centerX - rule.min / rule.ratioScale;

var oP = document.getElementById("#record");

//钱数
var money = oP.val(rule.min);

//起点
var start = rule.x;

//终点
var end = rule.width;

//初始速度 摩擦系数
var speed = 0,
  fl = 0.95;

oP.blur(function(e) {
  money = +this.value;
  if (rule.min <= money && money <= rule.max) {
    oP.val(money);
    rule.x = centerX - money / rule.ratioScale;
  } else {
    checkBountry();
    oP.val(money);
  }
});

canvas.addEventListener("mousedown", function(e) {
  isMouseDown = true;
  offsetX = mouse.x - rule.x;
  oldX = rule.x;
  canvas.addEventListener("mouseup", onMouseUp, false);
  canvas.addEventListener("mousemove", onMouseMove, false);
});

function onMouseUp(event) {
  isMouseDown = false;
  canvas.removeEventListener("mouseup", onMouseUp, false);
  canvas.removeEventListener("mousemove", onMouseMove, false);
}

function onMouseMove(event) {
  rule.x = mouse.x - offsetX;
  money = Math.floor((centerX - rule.x) * rule.ratioScale);

  //设置速度
  speed = rule.x - oldX;
  oldX = rule.x;

  checkBountry();
  oP.val(money);
}

//检测边界值
function checkBountry() {
  if (money <= rule.min) {
    rule.x = start;
    money = rule.min;
  }

  if (money >= rule.max) {
    rule.x = centerX - end;
    money = rule.max;
  }
}

function move() {
  if (!isMouseDown && speed !== 0) {
    if (speed >= 1 || speed <= -1) {
      rule.x += speed;
      speed *= fl;
      money = Math.floor((centerX - rule.x) * rule.ratioScale);
      checkBountry();
      oP.val(money);
    }
  }
}

(function drawFrame() {
  window.requestAnimationFrame(drawFrame, canvas);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  move();
  rule.draw(ctx);
})();

