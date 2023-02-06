import chalk from 'chalk';

export class Loading {
  private timer: NodeJS.Timer;

  static start() {
    // const P = ['\\', '|', '/', '-'];

    const P = [
      '[LOADING     ]',
      '[LOADING .   ]',
      '[LOADING ..  ]',
      '[LOADING ... ]',
      '[LOADING ....]'
    ];

    let x = 0;
    return setInterval(() => {
      process.stdout.write(chalk.green.bold(`\r${P[x]}`));
      x += 1;
      x %= P.length;
    }, 250);
  }

  static stop(interval: NodeJS.Timer) {
    interval.unref();
    clearInterval(interval);

    process.stdout.clearLine(-1);
    process.stdout.cursorTo(0);
  }
}
