//declare initial objects
var player;
var enemies = [];
var enemiesToSpawn = 10;
var enemiesLeft = enemiesToSpawn;
var enemiesAreSafe = true;

//HP
var hitPoints = 5;
var hitPointsString = "HP: ";
var hitPointsText;

//score
var score = 0;
var scoreString = "Score: ";
var scoreText;

var introText;

//Game started bool
var gameStarted;

//Game ended bool
var finishedGame;

var gamePlay = new Phaser.Class({
  Extends: Phaser.Scene,
  initialize: function GamePlay() {
    Phaser.Scene.call(this, { key: "GamePlay" });
  },

  preload: function () {
    this.load.image(
      "sky",
      "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/sky.png"
    );
    this.load.spritesheet(
      "dude",
      "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/dude.png",
      { frameWidth: 32, frameHeight: 48 }
    );
    this.load.spritesheet(
      "badGuys",
      "https://raw.githubusercontent.com/cattsmall/Phaser-game/5-2014-game/assets/baddie.png",
      { frameWidth: 32, frameHeight: 32 }
    );
  },

  create: function () {
    //Background first
    this.physics.add.sprite(config.width / 2, config.height / 2, "sky");

    //Create player
    player = this.physics.add.sprite(32, config.height - 150, "dude");
    //Create animation for player movement
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 0 }),
      repeat: -1,
    });
    this.anims.create({
      key: "down",
      frames: this.anims.generateFrameNumbers("dude", { start: 1, end: 1 }),
      repeat: -1,
    });
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 2, end: 2 }),
    });
    this.anims.create({
      key: "up",
      frames: this.anims.generateFrameNumbers("dude", { start: 3, end: 3 }),
    });
    //player doesn't go ofbound
    player.setCollideWorldBounds(true);

    //Keyboard inputs
    cursors = this.input.keyboard.createCursorKeys();

    //start enmies as unsafe
    enemiesAreSafe = false;

    //Create enemies
    enemies = this.physics.add.staticGroup({
      key: "badGuys",
      repeat: enemiesToSpawn - 1,
    });

    //Go through each child-enemy and make sure its on screen
    enemies.children.iterate(function (enemy) {
      enemy.setX(Phaser.Math.FloatBetween(32, config.width - 32));
      enemy.setY(Phaser.Math.FloatBetween(32, config.height - 32));

      if (enemy.x > config.width - 32) {
        enemy.setX(config.width - 48);
      } else if (enemy.x < 32) {
        enemy.setX(48);
      }

      if (enemy.y > config.height - 32) {
        enemy.setY(config.height - 48);
      } else if (enemy.y < 32) {
        enemy.setY(48);
      }
    });

    //enemy animation
    this.anims.create({
      key: "safe",
      frames: this.anims.generateFrameNumbers("badGuys", { start: 1, end: 1 }),
    });
    this.anims.create({
      key: "unsafe",
      frames: this.anims.generateFrameNumbers("badGuys", { start: 0, end: 0 }),
    });

    //update the physics colliders
    enemies.refresh();

    //Generate Texts
    //score
    scoreText = this.add.text(32, 24, scoreString + score);
    scoreText.visible = false;

    //HP
    hitPointsText = this.add.text(32, 64, hitPointsString + hitPoints);
    hitPoints.visible = false;

    //Intro Text
    introText = this.add.text(
      32,
      24,
      "Clear all the bad guys when they're weak!  \nClick to start playing, use the keyboard to move. \n\n(Click to start)"
    );
    //Game start with click event
    this.input.on("pointerdown", function () {
      if (!gameStarted) {
        startGame();
      }
    });

    //generate timer for safe/unsafe enemy
    timedEvent = this.time.addEvent({
      delay: 1000,
      callback: switchEnemyState,
      callbackScope: this,
      loop: true,
    });

    //when player overlap with enemy, run collide enemy function
    this.physics.add.overlap(player, enemies, collideWithEnemy, null, this);
  },

  update: function () {
    //Update objects and varialbes
    player.setVelocity(0, 0);
    if (gameStarted && !finishedGame) {
      if (cursors.left.isDown) {
        //Move left
        player.setVelocityX(-150);
        player.anims.play("left");
      } else if (cursors.right.isDown) {
        //Move right
        player.setVelocityX(150);
        player.anims.play("right");
      }
      if (cursors.up.isDown) {
        //Move up
        player.setVelocityY(-150);
        player.anims.play("up");
      } else if (cursors.down.isDown) {
        //Move down
        player.setVelocityY(150);
        player.anims.play("down");
      }

      scoreText.setText(scoreString + score);
      hitPointsText.setText(hitPointsString + hitPoints);
    }
  },
});

//Global functions

//Change enemies from safe to unsafe
function switchEnemyState() {
  if (gameStarted && !finishedGame) {
    if (enemiesAreSafe == false) {
      enemiesAreSafe = true;
      //foreach enemy
      enemies.children.iterate(function (enemy) {
        enemy.anims.play("safe");
      });
    } else {
      enemiesAreSafe = false;
      enemies.children.iterate(function (enemy) {
        enemy.anims.play("unsafe");
      });
    }
  }
}

//collision with enemy
function collideWithEnemy(player, enemy) {
  if (gameStarted && !finishedGame) {
    if (enemiesAreSafe == false) {
      hitPoints--;
      enemiesLeft--;
    } else {
      score++;
      enemiesLeft--;
    }
    enemy.disableBody(true, true);

    //Enemy inactive after colided while unsafe

    //End Game when nescessary
    if (hitPoints <= 0) {
      killGame();
      introText.setText("Game Over! Refresh to play again.");
    } else if (hitPoints > 0 && enemiesLeft === 0) {
      killGame();
      introText.setText("Great job! you won! Refresh to play again.");
    }
  }
}

function startGame() {
  introText.visible = false;
  scoreText.visible = true;
  hitPointsText.visible = true;
  gameStarted = true;
  finishedGame = false;
}

function killGame() {
  finishedGame = true;
  player.setVelocity(0, 0);
  introText.visible = true;
  scoreText.visible = false;
  hitPointsText.visible = false;
}

var config = {
  type: Phaser.AUTO,
  width: 640,
  height: 480,
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: gamePlay,
};
//
var game = new Phaser.Game(config);
