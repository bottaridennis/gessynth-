import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { IconComponent } from './icon';
import { Song, SongLevel, getSongSteps } from '../synth/songs';
import { DEGREE_COLORS, SCALE_MODES, formatNoteName } from '../synth/music-theory';

/** Searchable list of songs; emits the song to practise. */
@Component({
  selector: 'app-song-library',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-3">
      <label class="relative block">
        <span class="sr-only">Cerca un brano o un artista</span>
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted"><app-icon name="search" [size]="18" /></span>
        <input
          type="search"
          class="field pl-10"
          placeholder="Cerca titolo o artista"
          [value]="query()"
          (input)="query.set($any($event.target).value)"
          autocomplete="off"
        />
      </label>

      <div class="flex gap-2" role="group" aria-label="Filtra per difficoltà">
        @for (l of levels; track l) {
          <button
            type="button"
            class="seg-btn"
            [attr.aria-pressed]="level() === l"
            (click)="level.set(l)"
          >
            {{ l }}
          </button>
        }
      </div>

      <p class="text-xs text-muted">{{ filtered().length }} brani. Gli accordi sono indicati come gradi della scala: tocca un brano per suonarlo passo per passo.</p>

      <ul class="flex flex-col gap-2">
        @for (song of filtered(); track song.id) {
          <li>
            <button
              type="button"
              class="w-full text-left rounded-2xl border border-line bg-surface-2 hover:border-accent/60 focus-visible:border-accent p-3.5 transition-colors"
              [class.border-accent]="song.id === selectedId()"
              (click)="songSelected.emit(song)"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <div class="font-semibold truncate">{{ song.title }}</div>
                  <div class="text-sm text-muted truncate">{{ song.artist }}</div>
                </div>
                <div class="flex flex-col items-end gap-1 shrink-0">
                  <span class="chip">{{ formatNoteName(song.key) }} {{ modeName(song) }}</span>
                  <span class="text-[11px] text-muted">{{ song.level }} · {{ song.genre }}</span>
                </div>
              </div>
              <div class="mt-2.5 flex flex-wrap gap-1.5" aria-label="Accordi">
                @for (step of steps(song); track $index) {
                  <span
                    class="inline-flex items-baseline gap-1 rounded-lg px-2 py-0.5 text-sm font-semibold bg-bg/60 border border-line"
                    [style.color]="color(step.degree)"
                  >
                    {{ formatNoteName(step.chord) }}
                    <span class="text-[10px] font-medium text-muted">{{ step.degree }}</span>
                  </span>
                }
              </div>
            </button>
          </li>
        } @empty {
          <li class="text-muted text-sm py-6 text-center">Nessun brano trovato.</li>
        }
      </ul>
    </div>
  `,
})
export class SongLibraryComponent {
  readonly songs = input.required<Song[]>();
  readonly selectedId = input<string | null>(null);
  readonly songSelected = output<Song>();

  protected readonly levels: ('Tutti' | SongLevel)[] = ['Tutti', 'Facile', 'Intermedio'];
  protected readonly query = signal('');
  protected readonly level = signal<'Tutti' | SongLevel>('Tutti');
  protected readonly formatNoteName = formatNoteName;

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const lvl = this.level();
    return this.songs().filter(
      (s) =>
        (lvl === 'Tutti' || s.level === lvl) &&
        (!q || s.title.toLowerCase().includes(q) || s.artist.toLowerCase().includes(q))
    );
  });

  protected steps(song: Song) {
    return getSongSteps(song);
  }

  protected modeName(song: Song): string {
    const map: Record<string, string> = { major: 'maggiore', minor: 'minore', mixolydian: 'misolidio' };
    return map[song.mode] ?? SCALE_MODES.find((m) => m.id === song.mode)?.name ?? song.mode;
  }

  protected color(degree: string): string {
    return `rgb(${(DEGREE_COLORS[degree] ?? [245, 181, 68]).join(',')})`;
  }
}
