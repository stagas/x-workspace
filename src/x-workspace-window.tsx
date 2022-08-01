/** @jsxImportSource sigl */
import $ from 'sigl'

import { cheapRandomId } from 'everyday-utils'
import { IconSvg } from 'icon-svg'
import { onContextMenu } from 'x-context-menu'
import { PopupElement } from 'x-popup'
import { SurfaceItemElement, SurfaceMoveElement, SurfaceResizeElement } from 'x-surface'
import { WorkspaceElement, WorkspaceWindowControl } from './x-workspace'

export interface WorkspaceWindowElement extends $.Element<WorkspaceWindowElement> {}

@$.element()
export class WorkspaceWindowElement extends $(SurfaceItemElement) {
  @$.attr.out() id = cheapRandomId()
  @$.attr.out() label = $.String
  @$.attr.out() vertical = $.Boolean
  @$.attr() fullSize = false

  Popup = $.element(PopupElement)
  SurfaceMove = $.element(SurfaceMoveElement)
  SurfaceResize = $.element(SurfaceResizeElement)

  // refs
  workspace?: WorkspaceElement
  labelPopup?: PopupElement

  ExtraLabel: () => JSX.Element = () => null
  Label?: () => JSX.Element
  Item?: () => JSX.Element
  Controls?: () => JSX.Element
  ContextMenu?: () => JSX.Element
  onContextMenu?: (
    Options: (props: { event: MouseEvent }) => JSX.Element,
  ) => $.EventHandler<any, MouseEvent>

  doRenameLabel = $(this).reduce(({ $, labelPopup }) =>
    () => {
      const p = labelPopup.querySelector('.name') as HTMLElement
      p.contentEditable = 'plaintext-only'
      p.spellcheck = false
      p.onkeydown = e => {
        if (e.key === 'Enter' || e.key === 'Escape') {
          e.preventDefault()
          e.stopPropagation()
          p.blur()
        }
      }
      p.oninput = () => {
        // prevent editing the text out completely
        // that renders it uneditable
        // the nbsp will be trimmed anyway
        const value = p.textContent
        if (value === '') {
          p.innerHTML = '&nbsp;'
        }
      }
      // labelPopup.translate = false
      // labelPopup.tabIndex = 0
      p.focus()

      const range = document.createRange()
      range.setStartBefore(p.firstChild!)
      range.setEndAfter(p.lastChild!)
      const selection = window.getSelection()!
      selection.removeAllRanges()
      selection.addRange(range)

      setTimeout(() => {
        p.onblur = () => {
          p.contentEditable = 'false'
          $.label = p.textContent = p.textContent!.trim()
          p.onblur = null
          selection.removeAllRanges()
        }
      })
    }
  )

  mounted($: WorkspaceWindowElement['$']) {
    $.effect.once(({ host }) => {
      host.tabIndex = 0
    })

    // $.effect(({ host, rect }) => {
    //   $.dataset(host, rect.toJSON())
    // })

    // $.effect(({ label: _, workspace }) => {
    //   //!? 'update windows'
    //   if (workspace.windows) workspace.windows = [...workspace.windows]
    // })

    $.effect(({ host, surface }) =>
      $.on(host).pointerdown(e => {
        if (e.buttons & $.MouseButton.Right) {
          e.stopPropagation()
        }
        if (surface.pointers.size === 0) {
          e.stopPropagation()
        }
      })
    )

    $.onContextMenu = $.fulfill(({ workspace }) => (
      fulfill => workspace.$.effect(({ onContextMenu }) => fulfill(onContextMenu))
    ))

    // $.effect(({ workspace }) =>
    //   workspace.$.effect(({ surface }) => {
    //     $.surface = surface
    //   })
    // )

    $.effect(({ host, onContextMenu, ContextMenu }) => (
      $.on(host).contextmenu(onContextMenu(ContextMenu))
    ))

    $.Label = $.fulfill((
      { host, Popup, ExtraLabel, ContextMenu, label, workspace },
    ) =>
      fulfill =>
        workspace.$.effect(
          ({ labelsScene, surface, contextMenusPart, contextMenusScene }) => {
            fulfill(() => (
              <Popup
                ref={$.ref.labelPopup}
                key={host.id}
                class="label"
                scene={labelsScene}
                surface={surface}
                dest={host as unknown as SurfaceItemElement}
                placement="nwr"
                oncontextmenu={onContextMenu({
                  popupDestination: contextMenusPart,
                  surface,
                  scene: contextMenusScene,
                  Options: ContextMenu,
                })}
                onkeyup={e => {
                  // if (!(e.buttons & $.MouseButton.Left)) return
                  if (e.key === 'Enter') {
                    surface.centerItem?.(host as unknown as SurfaceItemElement)
                  }
                }}
                onpointerdown={e => {
                  if (!(e.buttons & $.MouseButton.Left)) return

                  if (surface.pointers.size === 0) {
                    e.stopPropagation()
                    e.preventDefault()
                    surface.centerItem?.(host as unknown as SurfaceItemElement)
                  }
                }}
              >
                <div class="name">
                  {label}
                </div>
                <ExtraLabel />
              </Popup>
            ))
          }
        )
    )

    $.render((
      { host, SurfaceMove, SurfaceResize, Controls, Item, surface, fullSize },
    ) => (
      <>
        <style>
          ${$.css /*css*/`
            :host {
              contain: size layout style;
              outline: none;
              z-index: 0;
              display: flex;
              flex: 1;
              box-sizing: border-box;
              flex-flow: column nowrap;
              box-shadow: 8px 8px #0007;
            }

            :host(.moving) {
              box-shadow: 30px 30px #0005;
            }

            ${IconSvg} {
              cursor: pointer;
              contain: size layout style paint;
              display: flex;
              height: 25px;
              width: 25px;
              color: #bbb;

              &::part(svg) {
                stroke-width: 2px;
              }

              &:hover {
                color: #fff;
              }
            }

            ${SurfaceMove} {
              contain: layout style;
              --surface-move-height: 30px;
              position: absolute;
              right: 0;
              top: calc(-1 * var(--surface-move-height));
              display: flex;
              width: auto;
              box-sizing: border-box;
              align-items: center;
              justify-content: center;
              background: #000; /*var(--black);*/
              z-index: 0;
              min-height: var(--surface-move-height);
              height: var(--surface-move-height);
              cursor: grab;

              &::before {
                content: ' ';
                background: #000;
                width: 20px;
                height: var(--surface-move-height);
                /* height: calc(var(--surface-move-height) - 0.5px); */
                z-index: -1;
                position: absolute;
                left: -12px;
                transform: skewX(-22deg);
                top: 0;
              }
            }

            ${SurfaceResize} {
              contain: size layout style paint;
              position: absolute;
              display: inline-flex;
              box-sizing: border-box;
              align-items: center;
              justify-content: center;
              z-index: 1;
              color: #04a;
              width: 56px;
              height: 56px;
              transform: rotate(-45deg);
              right: -28px;
              bottom: -28px;
              cursor: nwse-resize;
            }
            :host([fullsize]) {
              ${SurfaceMove},
              ${SurfaceResize} {
                display: none;
              }
            }

            [part=controls] {
              contain: layout style paint;
              display: flex;
              box-sizing: border-box;
              flex-flow: row nowrap;
              padding: 4px 4px 4px 0;
              margin-left: -2px;
              z-index: 1;
              gap: 7px;
              align-items: center;
              justify-content: flex-end;
            }
            :host([fullsize]) {
              [part=controls] {
                contain: initial;
                background: #0007;
                position: absolute;
                top: 2px;
                right: 2px;
                z-index: 999;
                padding: 0;
              }
            }

            [part=contents] {
              contain: size layout style;
              position: absolute;
              z-index: 0;
              width: 100%;
              height: 100%;
              flex: 1;
              display: flex;

              > * {
                contain: size layout style;
                z-index: 0;
                resize: none;
              }
            }
          `('')}
        </style>

        <SurfaceMove
          dest={host}
          surface={surface}
          // onsurfacemoveitemmovestart={() => {
          //   host.classList.add('moving')
          // }}
          // onsurfacemoveitemmoveend={({ detail: { rect: itemRect } }) => {
          //   host.classList.remove('moving')
          //   Object.assign(rect, itemRect.toPositionObject())
          // }}
        >
          <div part="controls">
            <Controls />
            <WorkspaceWindowControl>
              <IconSvg
                set="tabler"
                icon="grip-vertical"
                style="cursor: grab"
              />
            </WorkspaceWindowControl>
          </div>
        </SurfaceMove>
        <SurfaceResize
          dest={host}
          surface={surface}
          // onsurfaceresizeitemresizeend={({ detail: { rect: itemRect } }) => {
          //   Object.assign(rect, itemRect.toSizeObject())
          // }}
        >
          <IconSvg
            set="tabler"
            icon="tornado"
            style="pointer-events: none"
          />
        </SurfaceResize>
        <div part="contents">
          {fullSize && (
            <div part="controls">
              <Controls />
            </div>
          )}
          <Item />
        </div>
      </>
    ))
  }
}
