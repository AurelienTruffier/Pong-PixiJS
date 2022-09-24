//vas chercher la taille de l'écran
let width = window.innerWidth;
let height = window.innerHeight;

//vitesses X et Y de déplacement de la balle
let ballXSpeed = 8;
let ballYSpeed = 8;

//scores des 2 joueurs
let player1Score = 0;
let player2Score = 0;

//constantes
const playerWidth = 24;
const playerHeight = 1/6 * height;
const playerSpeed = ballYSpeed - 1; //légèrement moins rapide que la vitesse verticale de la balle
const ballRadius = 18;
const scoreFontSize = 64;

//crée une app PIXI
const app = new PIXI.Application({width: width, height: height, antialias: true});
//l'ajoute dans le DOM
document.body.appendChild(app.view);

//permet de détecter les touches du clavier enfoncées/relachées
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

//création du premier joueur
let player1 = new PIXI.Graphics();
player1.beginFill(0xFFFFFF);
player1.drawRect(0, 0, playerWidth, playerHeight);
player1.endFill();
player1.x = 32;
//centre le joueur verticalement
player1.y = height/2 - player1.height/2;
player1.movement = 0;

//création du deuxième joueur
let player2 = new PIXI.Graphics();
player2.beginFill(0xFFFFFF);
player2.drawRect(0, 0, playerWidth, playerHeight);
player2.endFill();
player2.x = (width - 32) - playerWidth;
//centre le joueur verticalement
player2.y = height/2 - player2.height/2;
player2.movement = 0;

//dessin de la ligne qui sépare l'écran
let line = new PIXI.Graphics();
line.beginFill(0xFFFFFF);
line.drawRect(width/2, 0, 1, height);
line.endFill();

//dessin de la balle
let ball = new PIXI.Graphics();
ball.beginFill(0xFFFFFF);
ball.drawCircle(0, 0, ballRadius);
ball.endFill();

//création des 2 textes qui vont afficher les scores
let player1ScoreText = new PIXI.Text(player1Score, {
    fill: "#ffffff",
    fontSize: scoreFontSize,
    fontWeight: 'bolder',
});
let player2ScoreText = new PIXI.Text(player2Score, {
    fill: "#ffffff",
    fontSize: scoreFontSize,
    fontWeight: 'bolder',
});

//améliore le rendu des scores à l'écran
player1ScoreText.resolution = 2;
player2ScoreText.resolution = 2;

//ajoute tous les objets dans le canvas
app.stage.addChild(player1);
app.stage.addChild(line);
app.stage.addChild(ball);
app.stage.addChild(player2);
app.stage.addChild(player1ScoreText);
app.stage.addChild(player2ScoreText);

//positionne les 2 scores à l'écran
player1ScoreText.position.set(1/4 * width - (player1ScoreText.width/2), 2/100 * height);
player2ScoreText.position.set(3/4 * width - (player2ScoreText.width/2), 2/100 * height);

//place la balle au centre de l'écran en début de partie
replaceBall();

//boucle principale
app.ticker.add((delta) => {
    //actualise le score à l'écran
    updateScore();
    //on empêche le joueur de sortir de l'écran
    checkPlayerScreenLimit();
    //on empêche la balle de sortir de l'écran
    checkBallScreenLimit();
    //actualise la position Y du joueur 1, si le coeff est à 0 il n'y a pas de déplacement
    player1.y += player1.movement * playerSpeed * delta;
    //actualise la position Y du joueur 2
    player2.y = ball.y - (player1.height/2);
    //applique la nouvelle position des joueurs
    player1.position.set(player1.x, player1.y);
    player2.position.set(player2.x, player2.y);
    //actualise les positions X et Y de la balle
    ball.x += ballXSpeed * delta;
    ball.y += ballYSpeed * delta;
    //applique la nouvelle position de la balle
    ball.position.set(ball.x, ball.y);
    //si la balle est en collision avec le joueur1
    if(checkCollisionPlayer(ball.x, ball.y, ballRadius, player1.x, player1.y, player1.width, player1.height))
    {
        //marge de sécurité
        ball.x += 3;
        //la balle rebondit sur la raquette
        bounceX();
    }
    //si la balle est en collision avec le joueur2
    if(checkCollisionPlayer(ball.x, ball.y, ballRadius, player2.x, player2.y, player2.width, player2.height))
    {
        //marge de sécurité
        ball.x -= 3;
        //la balle rebondit sur la raquette
        bounceX();
    }
});

//quand une touche est enfoncé
function onKeyDown(key)
{
    //touche "z" ou flèche haut
    if(key.keyCode === 38 || key.keyCode === 90)
    {
        //coeff de déplacement à -1, déplacement vers le haut
        player1.movement = -1;
    }
    //touche "s" ou flèche bas
    if(key.keyCode === 83 || key.keyCode === 40)
    {
        //coeff de déplacement à 1, déplacement vers le bas
        player1.movement = 1;
    }
}

//quand une touche est relaché
function onKeyUp(key)
{
    //si une des touches de dépacement est relaché
    if(key.keyCode === 38 || key.keyCode === 90 || key.keyCode === 83 || key.keyCode === 40)
    {
        //coeff de déplacement à 0, aucun déplacement
        player1.movement = 0;
    }
}

//fonction servant à empêcher le joueur de sortir de l'écran
function checkPlayerScreenLimit()
{
    //si le joueur sort en haut de l'écran
    if(player1.y <= 0)
    {
        //fige le joueur
        player1.movement = 0;
        //le pousse dans la zone de jeu pour éviter de le bloquer
        player1.y++;
    }
    //si le joueur sort en bas de l'écran
    if(player1.y >= (height - playerHeight))
    {
        //fige le joueur
        player1.movement = 0;
        //le pousse dans la zone de jeu pour éviter de le bloquer
        player1.y--;
    }
}

//fonction servant à empêcher la balle de sortir de l'écran
function checkBallScreenLimit()
{
    //si la balle sort en haut de l'écran
    if(ball.y <= 0)
    {
        //marge de sécurité
        ball.y++;
        //rebondissement vertical
        bounceY();
    }
    //si la balle sort en bas de l'écran
    if(ball.y >= height)
    {
        //marge de sécurité
        ball.y--;
        //rebondissement vertical
        bounceY();
    }
    //si la balle sort à gauche de l'écran
    if(ball.x <= 0)
    {
        //replace la balle au centre de l'écran
        replaceBall();
        //ajoute 1 au score du joueur 2
        player2Score++;
    }
    //si la balle sort à droite de l'écran
    if(ball.x >= width)
    {
        //replace la balle au centre de l'écran
        replaceBall();
        //ajoute 1 au score du joueur 1
        player1Score++;
    }
}

//fonction servant à replacer la balle au centre de l'écran
function replaceBall()
{
    ball.x = width/2;
    ball.y = height/2;
}

//fonction servant à faire rebondir la balle sur l'axe X
function bounceX()
{
    //inverse la direction horizontale de la balle
    ballXSpeed = -ballXSpeed;
}

//fonction servant à faire rebondir la balle sur l'axe Y
function bounceY()
{
    //inverse la direction verticale de la balle
    ballYSpeed = -ballYSpeed;
}

//fonction servant à détecter si la balle est en collision avec un joueur
function checkCollisionPlayer(ballX, ballY, ballR, playerX, playerY, playerW, playerH)
{
	let circle_distance_x = Math.abs(ballX - playerX - playerW/2)
	let circle_distance_y = Math.abs(ballY - playerY - playerH/2)

	if(circle_distance_x > (playerW/2 + ballR)) 
    {
        return false; 
    }
	if(circle_distance_y > (playerH/2 + ballR)) 
    {
        return false;
    }
	if(circle_distance_x <= (playerW/2))
    {
        return true;
    }
	if(circle_distance_y <= (playerH/2))
    {
        return true;
    }
	let corner_distance_sq = Math.pow(circle_distance_x - playerW/2, 2) + Math.pow(circle_distance_y - playerH/2, 2);

	return corner_distance_sq <= Math.pow(ballR, 2);
}

//fonction à appeler pour actualiser les scores à l'écran
function updateScore()
{
    player1ScoreText.text = player1Score;
    player2ScoreText.text = player2Score;
}