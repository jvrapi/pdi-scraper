export enum Colors {
  W = 'W',
  B = 'B',
  R = 'R',
  U = 'U',
  G = 'G'
}

export type ColorName = keyof typeof Colors;

export class Color {
  private readonly color: ColorName;

  constructor(color: ColorName) {
    this.color = color;
  }

  public get value() {
    return this.color;
  }
}
