/* @flow */
import * as t from '@babel/types';
import type {Node} from '@babel/traverse';

import type ConversionContext from './ConversionContext';
import type {Options} from './createConversionContext';

/**
 * Collects the program level pragmas which override the plugin options.
 * Pragmas are specified via comments like `flow-prepack: ignore`
 * Collected options are applied to the conversion context, if the program
 * has a `flow-prepack: ignore` comment or doesn't use any flow types this function
 * will return `false`, if any other flow-prepack pragmas are present or the file
 * does use flow, the function returns `true`.
 */
export default function collectProgramOptions (context: ConversionContext, node: Node): boolean {
  if (t.isFile(node)) {
    node = node.program;
  }
  const options = collectOptionsFromPragma(context, node);
  if (!options) {
    // if we have no options, check to see whether flow is in use in this file
    return hasFlowNodes(node);
  }
  else if (options.ignore) {
    return false;
  }
  return true;
}

const HAS_FLOW = new Error('This is not really an error, we use it to bail out of t.traverseFast() early when we find a flow element, and yes, that is ugly.');

function collectOptionsFromPragma (context: ConversionContext, node: Node): ? Options {
  const comments = node.leadingComments || node.comments;
  if (comments && comments.length > 0) {
    for (const comment of comments) {
      const matches = /^\s*flow-prepack:\s*([\w,\s]+)?$/i.exec(comment.value);
      if (matches) {
        const raw = ((matches[1] && matches[1].trim()) || '');
        const keys = raw.split(/[\s,]+/g);
        if (!raw || keys.length === 0) {
          // we have a comment but no options, this is strict by default.
          return {};
        }
        else {
          const options = {};
          for (const key of keys) {
            options[key] = true;
          }
          return options;
        }
      }
    }
  }
  if (t.isProgram(node)) {
    const {body} = node;
    if (body.length > 0) {
      return collectOptionsFromPragma(context, body[0]);
    }
  }
}



function hasFlowNodes (node: Node): boolean {
  try {
    throwIfFlow(node);
    t.traverseFast(node, throwIfFlow);
    return false;
  }
  catch (e) {
    if (e === HAS_FLOW) {
      return true;
    }
    else {
      throw e;
    }
  }
}

function throwIfFlow (node: Node) {
  if (t.isFlow(node)) {
    throw HAS_FLOW;
  }
  else if (t.isImportDeclaration(node) && (node.importKind === 'type' || node.importKind === 'typeof')) {
    throw HAS_FLOW;
  }
}