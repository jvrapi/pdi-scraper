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


export interface FormatProps {
  format: FormatName,
  isLegal: boolean
}

export class Format {
  private readonly props: FormatProps

  constructor(props: FormatProps) {
    this.props = {
      ...props,
      isLegal: props.isLegal ?? true
    }
  }

  public get value() {
    return this.props.format;
  }

  public get isLegal() {
    return this.props.isLegal;
  }
}
