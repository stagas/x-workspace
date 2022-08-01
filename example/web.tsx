/** @jsxImportSource sigl */
import $ from 'sigl'

import { Rect } from 'sigl'
import { ContextMenuOption, WorkspaceElement, WorkspaceWindowElement } from '../src'

interface WindowItemElement extends $.Element<WindowItemElement> {}

@$.element()
class WindowItemElement extends $(WorkspaceWindowElement) {
  mounted($: WindowItemElement['$']) {
    $.Controls = $.part(() => <div></div>)
    $.ContextMenu = $.part(() => (
      <>
        <ContextMenuOption keyboard={['Ctrl', 'N']}>New</ContextMenuOption>
        <ContextMenuOption keyboard={['Alt', 'R']}>Remove the thing</ContextMenuOption>
        <ContextMenuOption>and another</ContextMenuOption>
        <hr />
        <ContextMenuOption disabled>and another</ContextMenuOption>
        <ContextMenuOption>and another</ContextMenuOption>
      </>
    ))
    $.Item = $.part(() => <div>hello this is a window</div>)
  }
}

interface SceneElement extends $.Element<SceneElement> {}

@$.element()
class SceneElement extends HTMLElement {
  Workspace = $.element(WorkspaceElement)
  WindowItem = $.element(WindowItemElement)

  items = new $.RefSet<WindowItemElement>([
    { rect: new Rect(0, 0, 200, 200), label: 'one' },
    { rect: new Rect(300, 0, 200, 200), label: 'two' },
  ])

  mounted($: SceneElement['$']) {
    $.render(({ Workspace, WindowItem, items }) => (
      <>
        <style>
          {/*css*/ `
          ${Workspace} {
            position: absolute;
            display: flex;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }

          ${WindowItem} {
            border: 5px solid pink;
          }
        `}
        </style>
        <Workspace>
          {items.map(item => <WindowItem {...item} />)}
        </Workspace>
      </>
    ))
  }
}

const Scene = $.element(SceneElement)

$.render(<Scene />, document.body)
