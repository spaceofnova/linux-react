export interface TerminalStyle {
  foreground?: string;
  background?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export class ANSIParser {
  private static readonly COLOR_REGEX = /\[(\d+(?:;\d+)*m)\](\([^)]+\))\[0m\]/g;

  static parseText(text: string): { text: string, styles: TerminalStyle[] } {
    const result: { text: string, styles: TerminalStyle[] } = {
      text: '',
      styles: []
    };

    let lastIndex = 0;
    let match;

    while ((match = this.COLOR_REGEX.exec(text)) !== null) {
      // Add any text before this match with no styles
      const beforeText = text.slice(lastIndex, match.index);
      result.text += beforeText;
      result.styles.push(...Array(beforeText.length).fill({}));

      // Process the color values
      const values = match[1].slice(0, -1).split(';').map(n => parseInt(n, 10));
      const style = this.processColorValues(values);

      // Add the text content with the style
      const content = match[2].slice(1, -1); // Remove ( and )
      result.text += content;
      result.styles.push(...Array(content.length).fill(style));

      lastIndex = match.index + match[0].length;
    }

    // Add any remaining text with no styles
    const remainingText = text.slice(lastIndex);
    result.text += remainingText;
    result.styles.push(...Array(remainingText.length).fill({}));

    return result;
  }

  private static processColorValues(values: number[]): TerminalStyle {
    const style: TerminalStyle = {};

    if (values.length === 1) {
      // Single value - use for all RGB channels
      const val = values[0];
      style.foreground = `rgb(${val}, ${val}, ${val})`;
    } else if (values.length === 3) {
      // RGB values
      style.foreground = `rgb(${values[0]}, ${values[1]}, ${values[2]})`;
    }

    return style;
  }
}
