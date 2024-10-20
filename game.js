let cvs = document.getElementById("mycanvas");
let ctx = cvs.getContext("2d");

let DEGREE = Math.PI / 180;
let frames = 0 ;

let state ={
    current: 0,
    getReady:0,
    game:1,
    over:2
}

function clickHandler(){
    switch (state.current) {
        case state.getReady:
            START.play();
            state.current = state.game;
            break;
        case state.game:
            FLAP.play();
            bluebird.flap();
            break;
    
        default:
            bluebird.speed = 0;
            bluebird.rotation = 0;
            pipes.position = [];
            Score.value =0;
            state.current = state.getReady;
            break;
    }
}

document.addEventListener("click",clickHandler);
document.addEventListener("keydown",(e)=>{
    if(e.which == 32){
        clickHandler();
    }
})

// -------soundes---------
let SCORE = new Audio();
SCORE.src = "audio/point.wav";

let FLAP = new Audio();
FLAP.src = "audio/wing.wav";

let HIT = new Audio();
HIT.src = "audio/hit.wav";

let DIE = new Audio();
DIE.src = "audio/die.wav";

let START = new Audio();
START.src = "audio/swoosh.wav";


// --------images------------

// ----bg-----
let bg_sprite = new Image();
bg_sprite.src = "sprites/background-day.png";

let bg_day = {
    x:0,
    y:0,
    draw: function(){
        ctx.drawImage(bg_sprite,0,0,288,512,this.x,this.y,cvs.width,cvs.height)
    }
}

// ------base--------
let base_sprite = new Image();
base_sprite.src = "sprites/base.png";

let base = {
    x:0,
    y:cvs.height -112,
    dx:2,
    draw: function(){
        ctx.drawImage(base_sprite,0,0,336,112,this.x,this.y,336,112)
    },
    update: function (){
        if(state.current == state.game){
            this.x = (this.x - this.dx) % (18);
        }  
    }
}

// -----bird-----
let birdup_sprite = new Image();
birdup_sprite.src = "sprites/bluebird-upflap.png";

let birdmid_sprite = new Image();
birdmid_sprite.src = "sprites/bluebird-midflap.png";

let birddown_sprite = new Image();
birddown_sprite.src = "sprites/bluebird-downflap.png";

let bluebird = {
    animation : [birdup_sprite,birdmid_sprite,birddown_sprite,birdmid_sprite],
    x:50,
    y:150,
    speed:0,
    gravity:0.25,
    rotation:0,
    jump:4.6,
    radius:12,
    animationIndex:0,
    draw: function(){
        let bird = this.animation[this.animationIndex];
        ctx.save();
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(bird,0,0,34,24,-17,-12,34,24);
        ctx.restore();
    },
    update: function(){
        let period = state.current == state.getReady ? 10 :5;
        this.animationIndex += frames % period == 0 ? 1 : 0;
        this.animationIndex = this.animationIndex % 4;
        if(state.current==state.getReady){
            this.y =150;
        }else{
            this.speed += this.gravity;
            this.y += this.speed;
            if(this.speed < this.jump){
                this.rotation = -25 *DEGREE;
            }else{
                this.rotation = 90*DEGREE;
            }
        }
        if(this.y+12> cvs.height-112){
            this.y = cvs.height - 122;
            this.animationIndex = 1;
            if(state.current == state.game){
                DIE.play();
                state.current = state.over;
            }
        }
    },
    flap : function(){
        this.speed = -this.jump;
    }
}

// ------message-------
let message = new Image();
message.src = "sprites/message.png";

let msg = {
    x:cvs.width/2 -184/2,
    y:100,
    draw: function(){
        if(state.current == state.getReady){
            ctx.drawImage(message,0,0,184,267,this.x,this.y,184,267)
        } 
    }
}

// ------gameover--------
let GameOver = new Image();
GameOver.src = "sprites/gameover.png";

let gmovr = {
    x:cvs.width/2 -215/2,
    y:150,
    draw: function(){
        if(state.current == state.over){
            ctx.drawImage(GameOver,0,0,192,42,this.x,this.y,220,55)
        }     
    }
}

// --------pipe---------
let Pipe = new Image();
Pipe.src = "sprites/pipe-green.png";

let RPipe = new Image();
RPipe.src = "sprites/reversepipe-green-removebg-preview.png";

let pipes = {
    dx:2,
    gap:100,
    position: [],
    maxYPos: -110,
    draw: function(){
        for(let i=0 ; i<this.position.length; i++){
            let p = this.position[i];
            
            let topYPos =p.y;
            let bottomYPos =p.y + 320 + this.gap;

            ctx.drawImage(Pipe,0,0,52,320,p.x,bottomYPos,52,320);
            ctx.drawImage(RPipe,0,0,100,621,p.x,topYPos,52,320);
        }
    },
    update: function(){
        if(state.current != state.game) return;
        if(frames % 100 == 0){
            this.position.push({
                x:cvs.width,
                y:this.maxYPos*(Math.random() + 1)
            })
        }

        for(let i=0 ; i<this.position.length; i++){
            let p = this.position[i];
            p.x -= this.dx;

            let bottomPipesPos = p.y +320 + this.gap;

            if (bluebird.x + bluebird.radius > p.x && bluebird.x - bluebird.radius < p.x +52 && bluebird.y + bluebird.radius > p.y && bluebird.y - bluebird.radius < p.y +300) {
                HIT.play();
                state.current = state.over;
            }

            if (bluebird.x + bluebird.radius > p.x && bluebird.x - bluebird.radius < p.x +52 && bluebird.y + bluebird.radius > bottomPipesPos +20 && bluebird.y - bluebird.radius < bottomPipesPos +320) {
                HIT.play();
                state.current = state.over;
            }


            if(p.x + 52 <= 0){
                this.position.shift();
                Score.value ++;
                SCORE.play();
                Score.best = Math.max(Score.value ,Score.best);
                localStorage.setItem("best",Score.best);
            }
        }
    }
}

// ------score--------
let Score = {
    best : parseInt(localStorage.getItem("best"))|| 0,
    value: 0,
    draw :function(){

        ctx.fillStyle= "#fff";
        ctx.strokeStyle= "#000";
        ctx.linewidth = 2;
        ctx.font = "35px IMPACT";

        if(state.current == state.game){
            
            ctx.fillText(this.value, cvs.width/2,50);
            ctx.strokeText(this.value, cvs.width/2,50);
        }else if(state.current == state.over){

            ctx.fillText( `Value :  ` + this.value, 100,250);
            ctx.strokeText(`Value :  ` +this.value, 100,250);

            ctx.fillText(`Best :  ` +this.best, 100,300);
            ctx.strokeText(`Best :  ` +this.best, 100,300);
        }
    }
}



// ------update------
function update(){
    bluebird.update();
    base.update();
    pipes.update();
}


// ------draw-------
function draw(){
    ctx.fillStyle = "#70c5ce"
    ctx.fillRect(0 ,0 ,cvs.width, cvs.height);
    bg_day.draw();
    pipes.draw();
    base.draw();
    bluebird.draw();
    msg.draw();
    gmovr.draw();
    Score.draw();
}

// ------animate-------
function animate(){
    update();
    draw();
    frames ++;
    // console.log(frames);
    requestAnimationFrame(animate);
}

animate();


