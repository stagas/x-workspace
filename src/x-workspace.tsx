/** @jsxImportSource sigl */
import $ from 'sigl'

import type { ValuesOf } from 'everyday-types'

import { ImmMap, ImmSet } from 'immutable-map-set'
import { onContextMenu } from 'x-context-menu'
import { KnobElement } from 'x-knob'
import { PopupElement, PopupScene } from 'x-popup'
import { SurfaceElement, SurfaceState } from 'x-surface'

export type { ImmMap, ImmSet }

export * from 'x-context-menu'
export * from 'x-popup'
export * from 'x-surface'

import { WorkspaceWindowElement } from './x-workspace-window'

export const WorkspaceWindowControl = ({ action, title, children }: {
  action?: () => void
  title?: string
  children?: JSX.Element
}): JSX.Element => (
  <a
    part="control"
    title={title}
    onpointerdown={action && $.event.stop()}
    onclick={action && $.event.stop.prevent(action)}
  >
    {children}
  </a>
)

export interface WorkspaceElement extends $.Element<WorkspaceElement> {}

@$.element()
export class WorkspaceElement extends HTMLElement {
  Surface = $.element(SurfaceElement)
  Popup = $.element(PopupElement)
  Knob = $.element(KnobElement)

  root = $(this).shadow()

  @$.attr() state: ValuesOf<typeof SurfaceState> = SurfaceState.Idle

  surface?: SurfaceElement | null
  windows = $(this).slotted(
    el => {
      if (el instanceof WorkspaceWindowElement) {
        el.workspace = this
        return el
      }
    }
  ) as $.ChildOf<WorkspaceWindowElement>[]

  labelsScene = $(this).reduce(({ surface }) => new PopupScene(surface))

  contextMenusScene = $(this).reduce(({ surface }) => new PopupScene(surface))
  ContextMenu?: () => JSX.Element
  onContextMenu?: (
    Options: (props: { event: MouseEvent }) => JSX.Element,
  ) => $.EventHandler<any, MouseEvent>
  contextMenusPart?: HTMLElement

  mounted($: WorkspaceElement['$']) {
    $.effect(({ labelsScene, contextMenusScene }) =>
      () => {
        labelsScene.destroy()
        contextMenusScene.destroy()
      }
    )

    $.state = $.fulfill(({ surface }) => (
      fulfill => surface.$.effect(({ state }) => fulfill(state.current))
    ))

    const LabelsPart = $.part(({ windows }) => windows.map(({ Label }) => Label && <Label />))

    $.onContextMenu = $.reduce(({ surface, contextMenusPart, contextMenusScene }) =>
      Options =>
        onContextMenu({
          popupDestination: contextMenusPart,
          surface,
          scene: contextMenusScene,
          Options,
        })
    )

    $.effect(({ host, onContextMenu, ContextMenu }) => (
      $.on(host).contextmenu(onContextMenu(ContextMenu))
    ))

    $.render(({ Surface, Popup, Knob }) => (
      <>
        <style>
          {$.css /*css*/`
          :host {}

          *::selection {
            color: #fff;
            background: #41f;
          }

          [part=labels],
          [part=context-menus] {
            position: absolute;
            z-index: 2;
            left: 0;
            top: 0;
            width: 100%;
          }

          :host([state=${SurfaceState.Overlay}]) [part=labels],
          :host([state=${SurfaceState.FullSize}]) [part=labels],
          :host([state=${SurfaceState.MinimapPanning}]) [part=labels],
          :host([state=${SurfaceState.Pinching}]) [part=labels],
          :host([state=${SurfaceState.Selecting}]) [part=labels],
          :host([state=${SurfaceState.Connecting}]) [part=labels] {
            pointer-events: none;
          }

          :host([state=${SurfaceState.FullSize}]) [part=labels] {
            visibility: hidden;
          }

          ${Surface} {
            z-index: 0;
          }

          ${Popup} {
            &.label {
              &::part(contents) {
                display: flex;
                flex-flow: row nowrap;
                align-items: flex-end;
                /* align-items: center; */
                justify-content: center;
                gap: 4px;
              }

              .name {
                cursor: pointer;

                white-space: pre;
                font-size: 10.5pt;
                /* line-height: 20px; */
                font-family: system-ui;
                -webkit-text-stroke-width: 0.1px;

                /* margin: 1px; */
                /* padding: 10px 8px; */
                padding: 2.5px 8.5px;
                box-sizing: border-box;

                opacity: 0.82;
                /* border-radius: 4.5px; */
                /* border: 1px solid #aaa6; */
                /* border-top-color: #0006; */

                color: #eee;
                background: #000;
                /* text-shadow: 0 -1px 1px #000; */
                /* box-shadow: 0 1px 6px 1px #0009; */
                /* background: linear-gradient(to bottom,
                  #fff 0%,
                  #777 2%,
                  #444 20%,
                  #111 50%,
                  #000 70%,
                  #070707 100%
                ); */
              }
              ${Knob} {
                height: 37px;
                margin-bottom: -6px;
                margin-left: -3px;
                margin-right: -3px;
              }
              &::part(arrow) {
                fill: #aaaa;
                stroke: #0005;
                /* transition: opacity 120ms linear; */
              }
              &::part(contents) {
              }
              &::part(contents) {
              }
              &:active,
              &:focus,
              &:hover {
                /* &::part(contents) { */
                .name {
                  opacity: 0.9;
                  color: #fff;
                }
              }
            }
          }

          .context-menu {
            z-index: 999999999;
            &::part(contents) {
              padding: 2px;
            }
            &-contents {
              display: flex;
              flex-flow: column nowrap;
              padding: 8px 0;
              border: 1.5px solid #fff;
              border-radius: 6px;
              background: #161616;
              font-family: sans-serif;
              font-size: 10.5pt;
              box-shadow: 0 3px 5.5px 5px #0008;
              box-sizing: border-box;
              overflow: hidden;
            }
            hr {
              height: 0px;
              border: none;
              border-top: 1px solid #0003;
              border-bottom: 1px solid #fff4;
              width: 100%;
            }
            &-option {
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 25px;
              white-space: nowrap;
              padding: 4px 14px;
              min-height: 19px;
              margin-left: -1px;
              margin-right: -1px;
              &-disabled {
                color: #777;
              }
              &-kbd {
                display: flex;
                justify-content: space-between;
                gap: 5px;
              }
              &-kbd kbd {
                font-size: 9pt;
                margin-top: -1px;
                padding: 3px 5px;
                background: #373737;
                border-radius: 6px;
                box-shadow: 0 2px #0005;
              }
              &:not(.context-menu-option-disabled):hover {
                background: #3f3f3f;
                color: #fff;
              }
            }
          }

          /* x-popup.contextmenu::part(arrow) {
            z-index: 10;
          }
          x-popup.contextmenu::part(contents) {
            padding: 12px;
            border-color: #fff;
          } */
          `('')}
        </style>

        <Surface ref={$.ref.surface} minZoom={0.015}>
          <slot></slot>
        </Surface>

        <div part="labels">
          <LabelsPart />
        </div>

        <div part="context-menus" ref={$.ref.contextMenusPart}></div>
      </>
    ))
  }
}
