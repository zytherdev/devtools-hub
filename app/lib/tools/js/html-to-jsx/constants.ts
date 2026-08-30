export const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

export const BOOLEAN_ATTRIBUTES = new Set([
  'async',
  'autofocus',
  'autoplay',
  'checked',
  'controls',
  'default',
  'defer',
  'disabled',
  'formnovalidate',
  'hidden',
  'ismap',
  'loop',
  'multiple',
  'muted',
  'nomodule',
  'novalidate',
  'open',
  'playsinline',
  'readonly',
  'required',
  'reversed',
  'scoped',
  'seamless',
  'selected',
])

export const ATTRIBUTE_MAPPINGS: Record<string, string> = {
  class: 'className',
  for: 'htmlFor',

  tabindex: 'tabIndex',
  readonly: 'readOnly',
  maxlength: 'maxLength',
  minlength: 'minLength',

  colspan: 'colSpan',
  rowspan: 'rowSpan',

  usemap: 'useMap',
  frameborder: 'frameBorder',

  contenteditable: 'contentEditable',
  spellcheck: 'spellCheck',

  autofocus: 'autoFocus',
  autocomplete: 'autoComplete',
  autocorrect: 'autoCorrect',
  autocapitalize: 'autoCapitalize',

  defaultchecked: 'defaultChecked',
  defaultvalue: 'defaultValue',

  srcdoc: 'srcDoc',
  srcset: 'srcSet',

  crossorigin: 'crossOrigin',
  allowfullscreen: 'allowFullScreen',
  allowpaymentrequest: 'allowPaymentRequest',

  referrerpolicy: 'referrerPolicy',
  fetchpriority: 'fetchPriority',

  playsinline: 'playsInline',
  formnovalidate: 'formNoValidate',

  // SVG
  viewbox: 'viewBox',
  preserveaspectratio: 'preserveAspectRatio',
  fillrule: 'fillRule',
  cliprule: 'clipRule',
  strokelinecap: 'strokeLinecap',
  strokelinejoin: 'strokeLinejoin',
  strokewidth: 'strokeWidth',
  textanchor: 'textAnchor',
  markerheight: 'markerHeight',
  markerwidth: 'markerWidth',
  markerunits: 'markerUnits',
  refx: 'refX',
  refy: 'refY',
  patternunits: 'patternUnits',
  patterncontentunits: 'patternContentUnits',
  gradientunits: 'gradientUnits',
}