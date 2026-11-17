import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Vector icon set drawn for Gesture Synth (24x24 grid, 1.75 stroke, round caps).
 * Shapes are data, rendered as native SVG elements: no icon font, no network, no innerHTML.
 */
type Shape =
  | { d: string; fill?: boolean }
  | { c: [number, number, number]; fill?: boolean }
  | { r: [number, number, number, number, number]; fill?: boolean };

const ICONS = {
  camera: [
    { d: 'M3 8.5A2.5 2.5 0 0 1 5.5 6h1.8l1.5-2h6.4l1.5 2h1.8A2.5 2.5 0 0 1 21 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5z' },
    { c: [12, 12.5, 3.5] },
  ],
  'camera-off': [
    { d: 'M7.3 6H5.5A2.5 2.5 0 0 0 3 8.5v8A2.5 2.5 0 0 0 5.5 19h12.2M21 16.2V8.5A2.5 2.5 0 0 0 18.5 6h-1.8l-1.5-2H8.8' },
    { d: 'M3 3l18 18' },
  ],
  piano: [
    { r: [3, 5, 18, 14, 2.5] },
    { d: 'M9 13v6M15 13v6' },
    { r: [7.5, 5, 3, 8, 0.8], fill: true },
    { r: [13.5, 5, 3, 8, 0.8], fill: true },
  ],
  sliders: [
    { d: 'M4 7h9M19 7h1M4 17h3M13 17h7' },
    { c: [16, 7, 2.5] },
    { c: [10, 17, 2.5] },
  ],
  library: [
    { d: 'M3.5 6h10M3.5 11h10M3.5 16h6' },
    { d: 'M18 15V4.5l3 1.5' },
    { c: [15.5, 16.5, 2.5] },
  ],
  help: [
    { c: [12, 12, 9] },
    { d: 'M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.6' },
    { c: [12, 16.9, 0.9], fill: true },
  ],
  hand: [
    {
      d: 'M8.5 12.5V5.8a1.5 1.5 0 0 1 3 0V11m0-6.2a1.5 1.5 0 0 1 3 0V11m0-4.7a1.5 1.5 0 0 1 3 0v7.2c0 4.2-2.8 7.5-6.6 7.5-2.4 0-4-1-5.3-3L3.9 14.6a1.6 1.6 0 0 1 2.7-1.8l1.9 2.4',
    },
  ],
  volume: [
    { d: 'M4 9.5h3.2L12 5.5v13l-4.8-4H4z' },
    { d: 'M15.5 9.2a4 4 0 0 1 0 5.6M18.3 6.6a7.6 7.6 0 0 1 0 10.8' },
  ],
  'volume-off': [{ d: 'M4 9.5h3.2L12 5.5v13l-4.8-4H4z' }, { d: 'M16 9.5l5 5M21 9.5l-5 5' }],
  download: [{ d: 'M12 4v10.5M7.5 10l4.5 4.5 4.5-4.5M5 19.5h14' }],
  play: [{ d: 'M8 5.5v13l10.5-6.5z', fill: true }],
  pause: [
    { r: [6.5, 5.5, 4, 13, 1.2], fill: true },
    { r: [13.5, 5.5, 4, 13, 1.2], fill: true },
  ],
  stop: [{ r: [6, 6, 12, 12, 2.5], fill: true }],
  close: [{ d: 'M6.5 6.5l11 11M17.5 6.5l-11 11' }],
  'chevron-left': [{ d: 'M14.5 5.5L8 12l6.5 6.5' }],
  'chevron-right': [{ d: 'M9.5 5.5L16 12l-6.5 6.5' }],
  'skip-next': [{ d: 'M6 6l8.5 6L6 18z', fill: true }, { d: 'M18 6v12' }],
  'skip-prev': [{ d: 'M18 6l-8.5 6L18 18z', fill: true }, { d: 'M6 6v12' }],
  check: [{ d: 'M5 12.5l4.5 4.5L19 7.5' }],
  'tilt-right': [{ d: 'M7 17L17 7M9.5 7H17v7.5' }],
  'tilt-left': [{ d: 'M17 17L7 7M14.5 7H7v7.5' }],
  reset: [{ d: 'M4.5 12a7.5 7.5 0 1 0 2.2-5.3' }, { d: 'M4.5 4.5v4h4' }],
  search: [{ c: [10.5, 10.5, 6.5] }, { d: 'M20 20l-4.8-4.8' }],
  info: [{ c: [12, 12, 9] }, { d: 'M12 11v5.5' }, { c: [12, 7.8, 0.9], fill: true }],
  share: [
    { d: 'M12 3.5v11M8 7.5l4-4 4 4' },
    { d: 'M8 10.5H6.5a1.5 1.5 0 0 0-1.5 1.5v7a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5v-7a1.5 1.5 0 0 0-1.5-1.5H16' },
  ],
  'plus-square': [{ r: [4, 4, 16, 16, 3] }, { d: 'M12 8.5v7M8.5 12h7' }],
  target: [{ c: [12, 12, 8.5] }, { c: [12, 12, 4.5] }, { c: [12, 12, 1.2], fill: true }],
  guide: [
    { d: 'M3 5.8c2.2-1.2 5.6-1.4 9 .8 3.4-2.2 6.8-2 9-.8v13c-2.2-1.2-5.6-1.4-9 .8-3.4-2.2-6.8-2-9-.8z' },
    { d: 'M12 6.6v13' },
  ],
  wave: [{ d: 'M2.5 12c2.4 0 2.4-6 4.8-6s2.4 12 4.7 12 2.4-12 4.7-12 2.4 6 4.8 6' }],
  keyboard: [
    { r: [2.5, 6, 19, 12, 2.5] },
    { d: 'M6.5 10h.01M10 10h.01M13.5 10h.01M17 10h.01M7.5 14h9' },
  ],
  'arrow-up': [{ d: 'M12 19V5M6.5 10.5L12 5l5.5 5.5' }],
  'arrow-down': [{ d: 'M12 5v14M6.5 13.5L12 19l5.5-5.5' }],
} satisfies Record<string, Shape[]>;

export type IconName = keyof typeof ICONS;

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', 'aria-hidden': 'true' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      [attr.width]="size()"
      [attr.height]="size()"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (s of shapes(); track $index) {
        @if (isPath(s)) {
          <path [attr.d]="s.d" [attr.fill]="s.fill ? 'currentColor' : 'none'" [attr.stroke]="s.fill ? 'none' : null" />
        } @else if (isCircle(s)) {
          <circle
            [attr.cx]="s.c[0]"
            [attr.cy]="s.c[1]"
            [attr.r]="s.c[2]"
            [attr.fill]="s.fill ? 'currentColor' : 'none'"
            [attr.stroke]="s.fill ? 'none' : null"
          />
        } @else {
          <rect
            [attr.x]="s.r[0]"
            [attr.y]="s.r[1]"
            [attr.width]="s.r[2]"
            [attr.height]="s.r[3]"
            [attr.rx]="s.r[4]"
            [attr.fill]="s.fill ? 'currentColor' : 'none'"
            [attr.stroke]="s.fill ? 'none' : null"
          />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<IconName>();
  readonly size = input(20);
  readonly stroke = input(1.75);

  protected readonly shapes = computed<Shape[]>(() => ICONS[this.name()] ?? []);

  protected isPath(s: Shape): s is { d: string; fill?: boolean } {
    return 'd' in s;
  }

  protected isCircle(s: Shape): s is { c: [number, number, number]; fill?: boolean } {
    return 'c' in s;
  }
}
