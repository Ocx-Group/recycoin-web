import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  videoUrl: string;
  quote: string;
}

@Component({
    selector: 'app-testimonials',
    templateUrl: './testimonials.component.html',
    styleUrls: ['./testimonials.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule]
})
export class TestimonialsComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  currentIndex = 0;
  isPlaying = false;
  previewFrame: string = '';

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Adolfo Moreno',
      role: 'Licenciado',
      company: '',
      videoUrl: '/assets/videos/testimonio1.mp4',
      quote: 'Increíble experiencia trabajando con este equipo...'
    },
  ];

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.setupVideoPreview();
  }

  setupVideoPreview() {
    const video = this.videoPlayer.nativeElement;

    video.addEventListener('loadeddata', () => {
      video.pause();
      video.currentTime = 0;

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        this.previewFrame = canvas.toDataURL('image/jpeg');
        // Listener del video o play().then(): fuera de todo evento de plantilla.
        this.cdr.markForCheck();
      }
    });
  }

  nextTestimonial(): void {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.pauseVideo();
    this.setupVideoPreview();
  }

  prevTestimonial(): void {
    this.currentIndex = (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
    this.pauseVideo();
    this.setupVideoPreview();
  }

  togglePlay(): void {
    if (this.videoPlayer.nativeElement.paused) {
      this.videoPlayer.nativeElement.play()
        .then(() => {
          this.isPlaying = true;
          // Listener del video o play().then(): fuera de todo evento de plantilla.
          this.cdr.markForCheck();
        })
        .catch(error => {
          console.error('Error al reproducir el video:', error);
          this.isPlaying = false;
          // Listener del video o play().then(): fuera de todo evento de plantilla.
          this.cdr.markForCheck();
        });
    } else {
      this.pauseVideo();
    }
  }

  private pauseVideo(): void {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
      this.isPlaying = false;
      // Listener del video o play().then(): fuera de todo evento de plantilla.
      this.cdr.markForCheck();
    }
  }
}
