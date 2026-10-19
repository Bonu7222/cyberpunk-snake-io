# cyberpunk snake 

build a modern neon version of class snake game because the original one felt abit too boring. wanted to make it look like its straight out of a cyberpunk movie

## features

-- 3 game modes:
classic: hit the wall u die
wrap around: go through the walss and come out the other side.
maze: dodge obstacles while collecting food.

--neon design: glowing snake, animated grid background and cool 3d effect.
-- particlesL when u eat food, it explodes into little glowing dots
-- custom audio: used the web audio api to generate bleeps and bloops without needing any mp3 file
--mobile support: has touch button if u open it from ur phone

## how to run

just open index.html in ur browser

## what i learned

writing a game loop is kinda hard ngl

--game state: managing the snake array, the food position and keeping track of the score
--speed control: at first the game was moving too fast, i had to learn how to use setinterval properly and make the game speed up slowly the more you eat so it doesnt become unplayable in 5 seconds.
--collision detection: checking if the snake head hits its own body or the walls it souds easy but one small bug and ur snake just teleports through yourself haha.
--web audio api: making sound effects out of thin air using oscillators. it was confusing at first but really cool once it worked.

overall it is fun little game and the neon aesthetic came out really nice.