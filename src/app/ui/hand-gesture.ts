import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { HandShape } from '../synth/gestures';

interface FingerRect {
  x: number;
  y: number;
  h: number;
  up: boolean;
}

/**
 * Parametric vector drawing of a hand pose, generated from which fingers are raised.
 * The hand is drawn as the player sees it (back of the hand, palm toward the camera):
 * the left hand has the thumb on the right, the right hand is mirrored.
 */
@Component({
  selector: 'app-hand-gesture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex shrink-0', role: 'img', '[attr.aria-label]': 'label()' },
  template: `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 72"
      [attr.width]="size()"
      [attr.height]="size() * 1.125"
      focusable="false"
      aria-hidden="true"
    >
      <g
        [attr.transform]="transform()"
        stroke="currentColor"
        stroke-width="2.2"
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <!-- wrist -->
        <rect x="21" y="56" width="22" height="13" rx="5" [attr.fill]="base" />
        <!-- fingers (behind the palm) -->
        @for (f of fingers(); track $index) {
          <rect [attr.x]="f.x" [attr.y]="f.y" width="9" [attr.height]="f.h" rx="4.5" [attr.fill]="f.up ? accentFill() : base" />
        }
        <!-- thumb -->
        @if (shape().thumb) {
          <rect x="45" y="27" width="9" height="25" rx="4.5" transform="rotate(38 49.5 50)" [attr.fill]="accentFill()" />
        } @else {
          <rect x="44" y="38" width="9" height="15" rx="4.5" transform="rotate(14 48.5 50)" [attr.fill]="base" />
        }
        <!-- palm -->
        <path d="M14 36a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v10c0 7.5-6 13-13 13h-10c-7 0-13-5.5-13-13z" [attr.fill]="base" />
      </g>
    </svg>
  `,
})
export class HandGestureComponent {
  readonly shape = input.required<HandShape>();
  readonly side = input<'left' | 'right'>('left');
  /** -1 tilted toward minor (left), 0 upright, 1 tilted toward major (right) */
  readonly tilt = input<-1 | 0 | 1>(0);
  readonly size = input(40);
  readonly label = input('');
  /** Colour of the raised fingers (defaults to the current text colour) */
  readonly accent = input<string | null>(null);

  protected readonly base = 'var(--color-surface-2, #1d2027)';
  protected readonly accentFill = computed(() => this.accent() ?? 'currentColor');

  // Pinky, ring, middle, index from left to right (left hand, back view)
  protected readonly fingers = computed<FingerRect[]>(() => {
    const s = this.shape();
    const spec: [boolean, number, number][] = [
      [s.pinky, 14.5, 15],
      [s.ring, 23, 7],
      [s.middle, 31.5, 3],
      [s.index, 40, 7],
    ];
    // Raised fingers reach their own height; folded ones only show the knuckle above the palm
    return spec.map(([up, x, top]) => ({ x, y: up ? top : 24, h: up ? 38 - top : 14, up }));
  });

  protected readonly transform = computed(() => {
    const parts: string[] = [];
    if (this.side() === 'right') parts.push('translate(64 0) scale(-1 1)');
    const tilt = this.tilt();
    if (tilt !== 0) {
      // Tilt is expressed from the player's point of view, independent of the mirroring
      const angle = (this.side() === 'right' ? -1 : 1) * tilt * 16;
      parts.push(`rotate(${angle} 33 46)`);
    }
    return parts.join(' ');
  });
}
