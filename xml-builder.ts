import { EmptyTag, HTMLEntities } from './constants';
import { XMLBuilderOptions } from './types';

/*
  x9:   tab
  x20:  space
  XD:   carriage return
  xA:   line feed
*/

export class XMLBuilder {
  private lf: string;
  private spacing: number;
  private attributePrefix = '@';
  private nameSpacePrefix: string;

  constructor(private options: XMLBuilderOptions = {}) {
    const {
      options: { minifiy },
    } = this;

    this.lf = minifiy ? '' : '\n';
    this.spacing = minifiy ? 0 : 1;
    this.nameSpacePrefix = '';
  }

  private setFormatParams() {
    const {
      options: { minifiy, nameSpacePrefix },
    } = this;

    this.lf = minifiy ? '' : '\n';
    this.spacing = minifiy ? 0 : 1;
    this.nameSpacePrefix = nameSpacePrefix ? `${nameSpacePrefix}:` : '';
  }

  private escapeHTMLEntities(input: string) {
    return input.replace(/[&<>'"]/g, (match) => {
      switch (match) {
        case '&':
          return HTMLEntities.Ampersand;
        case '<':
          return HTMLEntities.LesserThan;
        case '>':
          return HTMLEntities.GreaterThan;
        case '"':
          return HTMLEntities.Quote;
        case "'":
          return HTMLEntities.Apostrophe;
        default:
          return match;
      }
    });
  }

  private createWhitespace(spaces: number) {
    let whitespace = '';
    let count = spaces;

    while (count) {
      whitespace += ' ';

      count -= 1;
    }

    return whitespace;
  }

  private createAttributes(attributes: Record<string, any>): string {
    return Object.entries(attributes).reduce(
      (acc, [attr, val]) =>
        (val === '' || val === undefined) && this.options.suppressEmptyNode && this.options.suppressEmptyAttribute !== false
          ? acc
          : `${acc} ${attr}="${this.createValue(val)}"`,
      '',
    );
  }

  private createStartTag(name: string, attributes: Record<string, any> = {}) {
    return `<${this.nameSpacePrefix}${name}${this.createAttributes(attributes)}>`;
  }

  private createEndTag(name: string) {
    return `</${this.nameSpacePrefix}${name}>${this.lf}`;
  }

  private createTagPair(name: string, value: any): string {
    return `<${this.nameSpacePrefix}${name}>${value}</${this.nameSpacePrefix}${name}>${this.lf}`;
  }

  private createEmptyTag(name: string, attributes: Record<string, any> = {}): string {
    return `<${this.nameSpacePrefix}${name}${this.createAttributes(attributes)}/>${this.lf}`;
  }

  private createValue(input: any) {
    if (typeof input === 'string') return this.escapeHTMLEntities(input);

    if (input === null) return 'null';

    if (input === undefined) return '';

    if (input instanceof Date) return input.toJSON();

    return input.toString();
  }

  private createElement(obj: Record<string, any>, indent: number): string {
    const {
      spacing,
      lf,
      options: { suppressEmptyNode },
    } = this;

    return Object.entries(obj).reduce((outerXML, [element, node]) => {
      const { attributes = {}, ...rest } = typeof node !== 'object' ? { $value: node } : node;

      const properties: Record<string, any> = {};
      const hasValue = rest['$value']?.lenth > 0;

      let hasChildren = false;

      Object.keys(rest).forEach((key) => {
        if (key === '$value') properties[key] = rest[key];

        if (key.startsWith(this.attributePrefix)) {
          attributes[key.slice(1)] = rest[key];
        } else {
          properties[key] = rest[key];

          if (key !== '$value') hasChildren = true;
        }
      });

      return (
        `${outerXML}${this.createWhitespace(indent)}${
          hasChildren || hasValue || !suppressEmptyNode ? this.createStartTag(element, attributes) : this.createEmptyTag(element, attributes)
        }${hasChildren ? lf : ''}` +
        `${Object.entries(properties).reduce((innerXML, [childElement, childNode]) => {
          if (childNode === EmptyTag) return `${innerXML}${this.createWhitespace(indent + spacing)}${this.createEmptyTag(childElement)}`;

          switch (typeof childNode) {
            case 'string':
            case 'number':
            case 'boolean': {
              const value = this.createValue(childNode);

              if (childElement === '$value') return innerXML + value;

              return `${innerXML}${this.createWhitespace(indent + spacing)}${this.createTagPair(childElement, value)}`;
            }
            case 'object':
              if (childNode instanceof Date || childNode === null)
                return `${innerXML}${this.createWhitespace(indent + spacing)}${this.createTagPair(childElement, this.createValue(childNode))}`;

              if (Array.isArray(childNode)) {
                if (childNode.length === 0) return `${innerXML}${this.createWhitespace(indent + spacing)}${this.createTagPair(childElement, childNode)}`;

                return childNode.reduce((childXML, child) => `${childXML}${this.createElement({ [childElement]: child }, indent + spacing)}`, innerXML);
              }

              return innerXML + this.createElement({ [childElement]: childNode }, indent + spacing);
            default:
              return innerXML;
          }
        }, '')}` +
        `${this.createWhitespace(hasChildren ? indent : 0)}${hasChildren || hasValue || !suppressEmptyNode ? this.createEndTag(element) : ''}`
      );
    }, '');
  }

  build(
    obj: Record<string, any>,
    options: {
      xmlDeclaration?: {
        version: string;
        encoding: string;
      };
    } & XMLBuilderOptions = {},
  ): string {
    const { suppressEmptyNode, minifiy, suppressEmptyAttribute, nameSpacePrefix } = this.options;
    const { xmlDeclaration } = options;

    if (options.minifiy !== undefined) this.options.minifiy = options.minifiy;
    if (options.suppressEmptyNode !== undefined) this.options.suppressEmptyNode = options.suppressEmptyNode;
    if (options.suppressEmptyAttribute !== undefined) this.options.suppressEmptyAttribute = options.suppressEmptyAttribute;
    if (options.nameSpacePrefix !== undefined) this.options.nameSpacePrefix = options.nameSpacePrefix;

    this.setFormatParams();

    const root = this.createElement(obj, 0).trim();

    this.options.minifiy = minifiy;
    this.options.suppressEmptyNode = suppressEmptyNode;
    this.options.suppressEmptyAttribute = suppressEmptyAttribute;
    this.options.nameSpacePrefix = nameSpacePrefix;

    if (xmlDeclaration) return `<?xml version="${xmlDeclaration.version}" encoding="${xmlDeclaration.encoding}"?>${this.lf}${root}`;

    return root;
  }
}
