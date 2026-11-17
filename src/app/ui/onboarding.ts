import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { IconComponent } from './icon';
import { HandGestureComponent } from './hand-gesture';
import { DEGREE_GESTURES, FIST_GESTURE, VOICING_GESTURES } from '../synth/gestures';
import { DEGREE_COLORS, ROMAN_DEGREES } from '../synth/music-theory';

const rgb = (deg: string) => `rgb(${(DEGREE_COLORS[deg] ?? [245, 181, 68]).join(',')})`;

/** First-run introduction: what the app does and how to play, in five short steps. */
@Component({
  selector: 'app-onboarding',
  imports: [IconComponent, HandGestureComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(keydown)': 'onKey($event)' },
  template: `
    <div
      class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-bg/80 backdrop-blur-md p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onb-title"
    >
      <div
        class="w-full sm:max-w-xl bg-surface border border-line rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[100dvh] sm:max-h-[90dvh]"
      >
        <!-- Progress -->
        <div class="flex items-center justify-between px-5 pt-5 sm:px-7 sm:pt-6">
          <div class="flex items-center gap-1.5" aria-hidden="true">
            @for (s of slides; track $index) {
              <span
                class="h-1.5 rounded-full transition-all"
                [class]="$index === index() ? 'w-6 bg-accent' : $index < index() ? 'w-1.5 bg-accent/60' : 'w-1.5 bg-line'"
              ></span>
            }
          </div>
          <span class="text-xs text-muted">Passo {{ index() + 1 }} di {{ slides.length }}</span>
          @if (!isLast()) {
            <button type="button" class="btn-ghost text-sm" (click)="go(slides.length - 1)">Salta</button>
          } @else if (started()) {
            <button type="button" class="icon-btn" (click)="dismiss.emit()" aria-label="Chiudi introduzione">
              <app-icon name="close" />
            </button>
          } @else {
            <span class="w-11"></span>
          }
        </div>

        <div class="px-5 sm:px-7 pt-4 pb-2 overflow-y-auto">
          <!-- Illustration -->
          <div
            class="rounded-2xl bg-surface-2 border border-line h-48 sm:h-56 flex items-center justify-center gap-3 px-4 overflow-hidden"
          >
            @switch (index()) {
              @case (0) {
                <app-hand-gesture [shape]="degrees.V.shape" side="left" [size]="104" [accent]="color('I')" />
                <span class="text-accent"><app-icon name="wave" [size]="80" [stroke]="1.5" /></span>
                <app-hand-gesture [shape]="voicings[1].shape" side="right" [size]="104" [accent]="'rgb(96,165,250)'" />
              }
              @case (1) {
                <div class="grid grid-cols-7 gap-1.5 sm:gap-2.5 w-full">
                  @for (r of romans; track r) {
                    <div class="flex flex-col items-center gap-1">
                      <app-hand-gesture [shape]="degrees[r].shape" [size]="44" [accent]="color(r)" />
                      <span class="text-xs font-semibold" [style.color]="color(r)">{{ r }}</span>
                    </div>
                  }
                </div>
              }
              @case (2) {
                <div class="flex flex-col items-center gap-2">
                  <app-hand-gesture [shape]="degrees.I.shape" [tilt]="-1" [size]="96" [accent]="color('I')" />
                  <span class="chip"><app-icon name="tilt-left" [size]="16" /> Minore</span>
                </div>
                <div class="flex flex-col items-center gap-2">
                  <app-hand-gesture [shape]="degrees.I.shape" [tilt]="1" [size]="96" [accent]="color('I')" />
                  <span class="chip"><app-icon name="tilt-right" [size]="16" /> Maggiore</span>
                </div>
              }
              @case (3) {
                <div class="grid grid-cols-4 gap-3">
                  @for (v of voicings; track v.index) {
                    <div class="flex flex-col items-center gap-1">
                      <app-hand-gesture [shape]="v.shape" side="right" [size]="58" accent="rgb(96,165,250)" />
                      <span class="text-[11px] text-muted text-center leading-tight">{{ v.majorLabel }}</span>
                    </div>
                  }
                </div>
                <div class="hidden sm:flex flex-col items-center text-muted gap-1 pl-2 border-l border-line">
                  <app-icon name="arrow-up" [size]="18" />
                  <span class="text-[11px]">Volume</span>
                  <app-icon name="arrow-down" [size]="18" />
                </div>
              }
              @case (4) {
                <div class="flex flex-col items-center gap-2">
                  <app-hand-gesture [shape]="fist.shape" [size]="92" />
                  <span class="chip">Pugno = silenzio</span>
                </div>
                <div class="flex flex-col items-center gap-2 text-muted">
                  <app-icon name="piano" [size]="56" [stroke]="1.4" />
                  <span class="chip">Tastiera e touch</span>
                </div>
              }
              @default {
                <div class="flex items-center gap-6 text-accent">
                  <app-icon name="camera" [size]="56" [stroke]="1.4" />
                  <app-icon name="piano" [size]="56" [stroke]="1.4" />
                  <app-icon name="library" [size]="56" [stroke]="1.4" />
                </div>
              }
            }
          </div>

          <!-- Text -->
          <h2 id="onb-title" #title tabindex="-1" class="mt-5 text-xl sm:text-2xl font-semibold tracking-tight outline-none">
            {{ slide().title }}
          </h2>
          <p class="mt-2 text-muted leading-relaxed">{{ slide().text }}</p>
          @if (slide().points.length) {
            <ol class="mt-4 space-y-2">
              @for (p of slide().points; track $index) {
                <li class="flex gap-3 items-start">
                  <span
                    class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent text-xs font-semibold"
                    >{{ $index + 1 }}</span
                  >
                  <span class="leading-snug">{{ p }}</span>
                </li>
              }
            </ol>
          }

          @if (isLast()) {
            <div class="mt-6 grid gap-2.5">
              <button type="button" class="btn-primary justify-center" (click)="startCamera.emit()">
                <app-icon name="camera" /> Suona con la webcam
              </button>
              <button type="button" class="btn-secondary justify-center" (click)="startVirtual.emit()">
                <app-icon name="piano" /> Suona con tastiera e touch
              </button>
              <button type="button" class="btn-secondary justify-center" (click)="openLibrary.emit()">
                <app-icon name="library" /> Scegli un brano da cui partire
              </button>
              @if (canInstall()) {
                <button type="button" class="btn-ghost justify-center" (click)="install.emit()">
                  <app-icon name="download" /> Installa come app
                </button>
              }
            </div>
            <p class="mt-4 text-xs text-muted flex gap-2 items-start">
              <app-icon name="info" [size]="16" />
              Il riconoscimento delle mani avviene sul tuo dispositivo: il video non viene inviato a nessun server.
            </p>
          }
        </div>

        <!-- Navigation -->
        <div class="flex items-center justify-between gap-3 px-5 sm:px-7 py-4 border-t border-line mt-3">
          <button type="button" class="btn-secondary" (click)="go(index() - 1)" [disabled]="index() === 0">
            <app-icon name="chevron-left" /> Indietro
          </button>
          @if (!isLast()) {
            <button type="button" class="btn-primary" (click)="go(index() + 1)">
              Avanti <app-icon name="chevron-right" />
            </button>
          } @else if (!started()) {
            <button type="button" class="btn-ghost" (click)="go(0)">Rivedi dall’inizio</button>
          } @else {
            <button type="button" class="btn-primary" (click)="dismiss.emit()">Torna a suonare</button>
          }
        </div>
      </div>
    </div>
  `,
})
export class OnboardingComponent {
  readonly startAtEnd = input(false);
  readonly started = input(false);
  readonly canInstall = input(false);

  readonly startCamera = output<void>();
  readonly startVirtual = output<void>();
  readonly openLibrary = output<void>();
  readonly install = output<void>();
  readonly dismiss = output<void>();

  protected readonly degrees = DEGREE_GESTURES;
  protected readonly voicings = VOICING_GESTURES;
  protected readonly fist = FIST_GESTURE;
  protected readonly romans = ROMAN_DEGREES;
  protected readonly color = rgb;

  protected readonly slides = [
    {
      title: 'Suona accordi con le mani',
      text: 'Gesture Synth trasforma i gesti delle mani in accordi. Ti basta la webcam, oppure tastiera e touch se preferisci.',
      points: [] as string[],
    },
    {
      title: 'Mano sinistra: scegli l’accordo',
      text: 'Ogni posizione della mano sinistra corrisponde a un grado della scala, da I a VII.',
      points: ['Da 1 a 5 dita alzate: gradi da I a V', 'Corna (indice e mignolo): VI', 'Pollice, indice e mignolo: VII'],
    },
    {
      title: 'Inclina: maggiore o minore',
      text: 'Con la stessa posizione puoi cambiare il colore dell’accordo inclinando la mano sinistra.',
      points: ['Inclinata a destra: accordo maggiore, luminoso', 'Inclinata a sinistra: accordo minore, malinconico'],
    },
    {
      title: 'Mano destra: colore e volume',
      text: 'La mano destra arricchisce l’accordo. È facoltativa: puoi iniziare con una sola mano.',
      points: [
        'Da 1 a 4 dita: fondamentale, rivolto, settima, dominante',
        'Alza la mano per aumentare il volume, abbassala per diminuirlo',
        'Pollice in fuori: un’ottava più in basso',
      ],
    },
    {
      title: 'Silenzio e alternative',
      text: 'Chiudi la mano a pugno o toglila dall’inquadratura per fermare il suono.',
      points: [
        'Senza webcam: tasti 1–7 per i gradi, M per maggiore o minore',
        'Su telefono e tablet usa la tastiera virtuale in basso',
        'Nella libreria trovi brani famosi con gli accordi già pronti',
      ],
    },
    {
      title: 'Pronto a suonare',
      text: 'Scegli come vuoi iniziare. Puoi rivedere queste istruzioni in qualsiasi momento dal pulsante Istruzioni.',
      points: [] as string[],
    },
  ];

  protected readonly index = signal(0);
  protected readonly slide = computed(() => this.slides[this.index()]);
  protected readonly isLast = computed(() => this.index() === this.slides.length - 1);

  private readonly titleRef = viewChild<ElementRef<HTMLElement>>('title');

  constructor() {
    effect(() => {
      if (this.startAtEnd()) this.index.set(this.slides.length - 1);
    });
    // Move focus to the slide title so screen readers announce each step
    effect(() => {
      this.index();
      const el = this.titleRef()?.nativeElement;
      if (!el) return;
      queueMicrotask(() => el.focus({ preventScroll: true }));
    });
  }

  protected go(i: number): void {
    this.index.set(Math.max(0, Math.min(this.slides.length - 1, i)));
  }

  protected onKey(event: KeyboardEvent): void {
    const tag = (event.target as HTMLElement | null)?.tagName;
    if (tag === 'BUTTON' && (event.key === 'Enter' || event.key === ' ')) return;
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      event.stopPropagation();
      this.go(this.index() + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      event.stopPropagation();
      this.go(this.index() - 1);
    } else if (event.key === 'Escape' && this.started()) {
      event.stopPropagation();
      this.dismiss.emit();
    }
  }
}
