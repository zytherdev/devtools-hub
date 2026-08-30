export type AttributeValue = string | true

export interface HTMLAttribute {
  name: string
  value: AttributeValue
}

export interface ElementNode {
  type: 'element'
  name: string
  attributes: HTMLAttribute[]
  children: HTMLNode[]
  selfClosing: boolean
}

export interface TextNode {
  type: 'text'
  value: string
}

export interface CommentNode {
  type: 'comment'
  value: string
}

export type HTMLNode =
  | ElementNode
  | TextNode
  | CommentNode

export interface HTMLDocument {
  type: 'root'
  children: HTMLNode[]
}

export type HTMLToken =
  | {
      type: 'open-tag'
      name: string
      attributes: HTMLAttribute[]
      selfClosing: boolean
    }
  | {
      type: 'close-tag'
      name: string
    }
  | {
      type: 'text'
      value: string
    }
  | {
      type: 'comment'
      value: string
    }