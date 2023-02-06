export type VersionName =
  | 'oversized'
  | 'foil'
  | 'nonFoil'
  | 'promo'
  | 'textLess';

export class Version {
  private readonly version: VersionName;

  constructor(version: VersionName) {
    this.version = version;
  }

  public get value() {
    return this.version;
  }
}
