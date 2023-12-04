import { Obstacle } from "./obstacle";
import { Ball } from "./ball";

export class	GameBoard
{
	upper_border:	Obstacle;
	lower_border:	Obstacle;
	left_racket:	Obstacle;
	right_racket:	Obstacle;
	ball:			Ball;

	constructor()
	{
		this.upper_border = new Obstacle([0, 9, 0], [-1, 0, 0], 16, 0);
		this.lower_border = new Obstacle([0, -9, 0], [1, 0, 0], 16, 0);
		this.left_racket = new Obstacle([-14, 0, 0], [0, -1, 0], 2, 0);
		this.right_racket = new Obstacle([14, 0, 0], [0, 1, 0], 2, 0);
		this.ball = new Ball(0.5);
	}
}
