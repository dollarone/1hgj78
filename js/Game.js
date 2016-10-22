var PlatfomerGame = PlatformerGame || {};

//title screen
PlatformerGame.Game = function(){};

PlatformerGame.Game.prototype = {
    create: function() {

        //  A simple background for our game
        this.sky = this.game.add.sprite(0, 0, 'sky');
        this.sky.scale.setTo(1.2);

        this.map = this.game.add.tilemap('level1');

        this.map.addTilesetImage('coconut', 'coconut');

        this.backgroundLayer = this.map.createLayer('backgroundLayer');
        this.blockedLayer = this.map.createLayer('blockedLayer');
        

        this.map.setCollisionBetween(1, 10000, true, 'blockedLayer');

        // make the world boundaries fit the ones in the tiled map
        this.blockedLayer.resizeWorld();

        var result = this.findObjectsByType('marker', this.map, 'objectLayer');
        this.marker = this.game.add.sprite(result[0].x, result[0].y, 'coconut');
        this.game.physics.arcade.enable(this.marker);


/*
        this.blockedLayer = this.game.add.group();
        this.blockedLayer.enableBody = true;

        for (var i = 0; i < this.game.world.width / 32; i++) {
            var tile = this.blockedLayer.create(i * 32, this.game.world.height - 32, 'tiles');
            tile.body.immovable = true;
            if (i<5) {
                var tile = this.blockedLayer.create(i * 32, this.game.world.height - 64, 'tiles');
                tile.body.immovable = true;         
                var tile = this.blockedLayer.create(i * 32, this.game.world.height - 96, 'tiles');
                tile.body.immovable = true;         
                var tile = this.blockedLayer.create(i * 32, this.game.world.height - 128, 'tiles');
                tile.body.immovable = true;         
                var tile = this.blockedLayer.create(i * 32, this.game.world.height - 160, 'tiles');
                tile.body.immovable = true;         
                var tile = this.blockedLayer.create(i * 32, this.game.world.height - 192, 'tiles');
                tile.body.immovable = true;         
            }
        }
        */
        this.music = this.game.add.audio('music');
        this.yay = this.game.add.audio('yay');
        this.yay.volume = 0.5;
        this.music.loop = true;
        this.music.play();

        //  The score
        this.scoreText = this.game.add.text(16, 16, 'Force: 0\nAngle: 0', { fontSize: '32px', fill: '#000' });
        //this.scoreText.fixedToCamera = true;
        this.score = 0;

        //  Our controls.
        this.cursors = this.game.input.keyboard.createCursorKeys();
        
        this.timer = 0;
        this.showDebug = false; 


        this.player2 = this.game.add.sprite(92, 384-64, 'liamlimebody');
        this.player2.anchor.setTo(0.5);
        this.player = this.game.add.sprite(95, 324-64, 'liamlime');
        this.player.anchor.setTo(0.5);
        this.game.physics.arcade.enable(this.player);
        this.player.body.immovable = true; 

        this.force = 0;
        this.angle = 0;

        this.enterKey = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
        this.rKey = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
        this.readyToLaunch = true;
        this.foregroundLayer = this.map.createLayer('foregroundLayer');

    },

    reset: function() {
        var x = 70 + this.game.rnd.integerInRange(0,60);
        var y = 200 + this.game.rnd.integerInRange(0,200);

        this.player.body.immovable = true; 
        this.player.body.velocity.x = 0;
        this.player.body.velocity.y = 0;
        this.player.body.gravity.y = 0;
        this.player.x = x;
        this.player.y = y;
        this.player2.x = x;
        this.player2.y = y+60;
        this.readyToLaunch = true;
    },

    woop: function(marker, coconut) {
        coconut.x = 3000;
        this.yay.play();

    },

    update: function() {
        this.timer++;
        //  Collide the player and the stars with the platforms
        this.game.physics.arcade.collide(this.player, this.blockedLayer);
        this.game.physics.arcade.collide(this.coconut, this.blockedLayer);

        //  Checks to see if the player overlaps with any of the stars, if he does call the collectStar function
        this.game.physics.arcade.overlap(this.marker, this.player, this.woop, null, this);

        //  Reset the players velocity (movement)
        

        if (this.cursors.left.isDown)
        {
            this.angle -= 10;
            this.angle = this.angle % 360;
        }
        else if (this.cursors.right.isDown)
        {
            this.angle += 10;
            this.angle = this.angle % 360;
        }
        else if (this.cursors.up.isDown)
        {
            this.force += 10;
        }
        else if (this.cursors.down.isDown)
        {
            if (this.force > 9) {
               this.force -= 10;
            }
        }
        else if (this.rKey.isDown && !this.readyToLaunch) {
            this.reset();
        }

        this.scoreText.text = "Force: " + this.force + "\nAngle: " + this.angle;

        if (this.enterKey.isDown && this.readyToLaunch) {
            this.launch();
        }
        
        
    },

    launch : function() {
        this.readyToLaunch = false;
        this.player.body.immovable = false;
        this.player.body.velocity.x = this.force * Math.cos(this.angle/360);
        this.player.body.velocity.y = -this.force * Math.sin(this.angle/360);
        this.player.body.gravity.y = 300;
        this.player.body.bounce.y = 0.4;
    },

    death: function() {
        var result = this.findObjectsByType('playerStart', this.map, 'objectLayer');
        this.player.x = result[0].x;
        this.player.y = result[0].y;
        this.player.frame = 1; 

    },

    collectStar : function(player, star) {
        
        // Removes the star from the screen
        star.kill();
        if (star.dangerous) {
            player.kill();
        }

        //  Add and update the score
        this.score += 10;
        this.scoreText.text = 'Score: ' + this.score;

    },


    // find objects in a tiled layer that contains a property called "type" equal to a value
    findObjectsByType: function(type, map, layer) {
        var result = new Array();
        map.objects[layer].forEach(function(element) {
            if (element.properties.type === type) {
                // phaser uses top left - tiled bottom left so need to adjust:
                element.y -= map.tileHeight;
                result.push(element);
            }
        });
        return result;
    },

    createFromTiledObject: function(element, group) {
        var sprite = group.create(element.x, element.y, 'objects');
        sprite.frame = parseInt(element.properties.frame);

        // copy all of the sprite's properties
        Object.keys(element.properties).forEach(function(key) {
            sprite[key] = element.properties[key];
        });
    },


    render: function() {

        if (this.showDebug) {
            
            this.game.debug.body(this.player);
        }
    },

};