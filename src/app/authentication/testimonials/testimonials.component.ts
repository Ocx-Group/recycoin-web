import {Component, OnInit, ViewChild, ElementRef, AfterViewInit, ChangeDetectionStrategy} from '@angular/core';
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
    changeDetection: ChangeDetectionStrategy.Eager,
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

  constructor() {
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
        })
        .catch(error => {
          console.error('Error al reproducir el video:', error);
          this.isPlaying = false;
        });
    } else {
      this.pauseVideo();
    }
  }

  private pauseVideo(): void {
    if (this.videoPlayer) {
      this.videoPlayer.nativeElement.pause();
      this.isPlaying = false;
    }
  }
}
