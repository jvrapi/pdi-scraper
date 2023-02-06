export type FormatName =
  | 'standard'
  | 'future'
  | 'historic'
  | 'gladiator'
  | 'pioneer'
  | 'explorer'
  | 'modern'
  | 'legacy'
  | 'pauper'
  | 'vintage'
  | 'penny'
  | 'commander'
  | 'brawl'
  | 'historicbrawl'
  | 'alchemy'
  | 'paupercommander'
  | 'duel'
  | 'oldschool'
  | 'premodern';

export class Format {
  private readonly _format: FormatName;

  private readonly _isLegal: boolean;

  constructor(format: FormatName, isLegal?: boolean) {
    this._format = format;
    this._isLegal = isLegal ?? true;
  }

  public get value() {
    return this._format;
  }

  public get isLegal() {
    return this._isLegal;
  }
}
