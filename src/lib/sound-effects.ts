// Authentic Pokémon Red & Blue Sound Effects and Music Player

class SoundEffectsEngine {
  private isMuted: boolean = false;
  private bgmAudio: HTMLAudioElement | null = null;
  private isBgmPlaying: boolean = false;
  private bgmVolume: number = 0.3;
  private sfxVolume: number = 0.5;
  private bgmListeners: Set<(playing: boolean) => void> = new Set();
  private volumeListeners: Set<() => void> = new Set();

  public subscribeBgm(callback: (playing: boolean) => void): () => void {
    this.bgmListeners.add(callback);
    callback(this.isBgmPlaying);
    return () => this.bgmListeners.delete(callback);
  }

  public subscribeVolume(callback: () => void): () => void {
    this.volumeListeners.add(callback);
    callback();
    return () => this.volumeListeners.delete(callback);
  }

  private notifyBgmListeners() {
    this.bgmListeners.forEach((fn) => fn(this.isBgmPlaying));
  }

  private notifyVolumeListeners() {
    this.volumeListeners.forEach((fn) => fn());
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.muted = muted;
    }
    this.notifyVolumeListeners();
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public setBgmVolume(vol: number) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.bgmVolume;
    }
    this.notifyVolumeListeners();
  }

  public getBgmVolume(): number {
    return this.bgmVolume;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    this.notifyVolumeListeners();
  }

  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  private playAudio(path: string, baseVolume: number = 0.5) {
    if (this.isMuted || typeof window === "undefined") return;
    try {
      const audio = new Audio(path);
      audio.volume = baseVolume * (this.sfxVolume / 0.5);
      audio.play().catch(() => {});
    } catch {
      // Audio autoplay policy or decode error safety
    }
  }

  // Authentic Pokémon Red & Blue sound effects from /public/audio/sfx:

  // 1. Capture fanfare: SFX_CAUGHT_MON.wav
  public playCatchSuccess() {
    this.playAudio("/audio/sfx/caught.wav", 0.65);
  }

  // 2. Deposit / Release sound: SFX_WITHDRAW_DEPOSIT.wav
  public playRelease() {
    this.playAudio("/audio/sfx/release.wav", 0.55);
  }

  // 3. Menu / Button press: SFX_PRESS_AB.wav
  public playButtonPress() {
    this.playAudio("/audio/sfx/press_ab.wav", 0.45);
  }

  // 4. Switch cursor / Biome select: SFX_SWITCH.wav
  public playSwitch() {
    this.playAudio("/audio/sfx/switch.wav", 0.45);
  }

  // 5. Open Start Menu / Drawer: SFX_START_MENU.wav
  public playMenuOpen() {
    this.playAudio("/audio/sfx/start_menu.wav", 0.5);
  }

  // 6. Action Denied / Collision: SFX_COLLISION.wav
  public playDenied() {
    this.playAudio("/audio/sfx/denied.wav", 0.45);
  }

  // 7. Pokédex registration: SFX_DEX_PAGE_ADDED.wav
  public playDexPage() {
    this.playAudio("/audio/sfx/dex_page.wav", 0.5);
  }

  // 8. Pokéball toss: SFX_BALL_TOSS.wav
  public playBallToss() {
    this.playAudio("/audio/sfx/ball_toss.wav", 0.5);
  }

  // Compatibility alias
  public playRadarPing() {
    this.playButtonPress();
  }

  // Background Music: Pokémon Red Title Screen Theme (/public/audio/pokemon-red-title.mp3)
  private initBgm() {
    if (!this.bgmAudio && typeof window !== "undefined") {
      this.bgmAudio = new Audio("/audio/pokemon-red-title.mp3");
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = this.bgmVolume;
      this.bgmAudio.onended = () => {
        this.isBgmPlaying = false;
        this.notifyBgmListeners();
      };
    }
  }

  public startBgm() {
    if (typeof window === "undefined" || this.isBgmPlaying) return;
    this.initBgm();
    if (!this.bgmAudio) return;

    this.bgmAudio.muted = this.isMuted;
    this.bgmAudio
      .play()
      .then(() => {
        this.isBgmPlaying = true;
        this.notifyBgmListeners();
      })
      .catch((e) => {
        console.warn("BGM auto-play policy blocked:", e);
      });
  }

  public toggleBgm(): boolean {
    if (typeof window === "undefined") return false;
    this.initBgm();
    if (!this.bgmAudio) return false;

    if (this.isBgmPlaying) {
      this.bgmAudio.pause();
      this.isBgmPlaying = false;
      this.notifyBgmListeners();
    } else {
      this.bgmAudio.muted = this.isMuted;
      this.bgmAudio
        .play()
        .then(() => {
          this.isBgmPlaying = true;
          this.notifyBgmListeners();
        })
        .catch((e) => {
          console.warn("BGM auto-play policy blocked:", e);
        });
    }

    return this.isBgmPlaying;
  }

  public getIsBgmPlaying(): boolean {
    return this.isBgmPlaying;
  }
}

export const sfx = new SoundEffectsEngine();
