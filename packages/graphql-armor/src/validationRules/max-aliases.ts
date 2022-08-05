import {
  FieldNode,
  FragmentDefinitionNode,
  FragmentSpreadNode,
  InlineFragmentNode,
  OperationDefinitionNode,
  ValidationContext,
} from 'graphql';
import { MaxAliasesOptions } from '../config';

class MaxAliasesVisitor {
  public readonly OperationDefinition: Record<string, any>;

  private readonly context: ValidationContext;
  private readonly options: MaxAliasesOptions;
  private onError: (msg: string) => any;

  constructor(context: ValidationContext, options: MaxAliasesOptions, onError: (msg: string) => any) {
    this.context = context;
    this.options = options;
    this.onError = onError;

    this.OperationDefinition = {
      enter: this.onOperationDefinitionEnter,
    };
  }

  onOperationDefinitionEnter(operation: OperationDefinitionNode): void {
    const aliases = this.countAliases(operation);
    if (aliases > this.options.n) {
      this.onError('Too many aliases.');
    }
  }

  private countAliases(
    node: FieldNode | FragmentDefinitionNode | InlineFragmentNode | OperationDefinitionNode | FragmentSpreadNode,
  ): number {
    let aliases = 0;
    if ('alias' in node && node.alias) {
      aliases++;
    }
    if ('selectionSet' in node && node.selectionSet) {
      for (let child of node.selectionSet.selections) {
        aliases += this.countAliases(child);
      }
    }
    return aliases;
  }
}

export const maxAliasesRule =
  (options: MaxAliasesOptions, onError: (msg: string) => any) => (context: ValidationContext) =>
    new MaxAliasesVisitor(context, options, onError);