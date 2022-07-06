import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { forkJoin, combineLatest } from 'rxjs';

import {
  AngularFireStorage,
  AngularFireUploadTask,
} from '@angular/fire/compat/storage';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { v4 as uuid } from 'uuid';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css'],
})
export class UploadComponent implements OnDestroy {
  isDragOver = false;
  file: File | null = null;
  fileUploaded: boolean = false;
  percentage = 0;
  progressBarColor = 'bg-indigo-600';
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenShotTask?: AngularFireUploadTask;
  screenshots: string[] = [];
  selectedScreenshot = '';

  //Alert Component
  alertColor = '';
  alertMsg = '';
  showAlert = false;
  inSubmission = false;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe((user) => (this.user = user));
    this.ffmpegService.init();
  }

  uploadForm = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
  });

  ngOnDestroy() {
    this.task?.cancel();
  }

  async storeFile(event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }
    this.isDragOver = false;

    this.file = (event as DragEvent).dataTransfer
      ? (event as DragEvent).dataTransfer?.files.item(0) ?? null
      : (event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];
    this.uploadForm.controls.title.setValue(
      this.file.name.replace(/\.[^/.]+$/, '')
    );
    this.fileUploaded = true;
  }

  async uploadFile() {
    this.uploadForm.disable();

    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please Wait! Your clip is being uploaded.';
    this.inSubmission = true;
    this.progressBarColor = 'bg-indigo-600';
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    const screenshotBlob = await this.ffmpegService.blobFromURL(
      this.selectedScreenshot
    );
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenShotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);
    combineLatest([
      this.task.percentageChanges(),
      this.screenShotTask.percentageChanges(),
    ]).subscribe((progress) => {
      const [clipProgress, screenshotProgress] = progress;
      if (!clipProgress || !screenshotProgress) {
        return;
      }
      const total = clipProgress + screenshotProgress;
      this.percentage = total / 2;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenShotTask.snapshotChanges(),
    ])
      .pipe(
        switchMap(() =>
          forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()])
        )
      )
      .subscribe({
        next: async (urls) => {
          const [clipURL, screenshotURL] = urls;
          const clip = {
            uid: this.user?.uid as string,
            displayName: this.user?.displayName as string,
            title: this.uploadForm.controls.title.value as string,
            fileName: `${clipFileName}.mp4`,
            url: clipURL,
            screenshotURL: screenshotURL,
            screenshotFileName: `${clipFileName}.png`,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          };
          const clipDocRef = await this.clipService.createClip(clip);
          this.alertMsg =
            'Success! Your clip is now ready to share with the world! Redirecting...';
          this.progressBarColor = 'bg-green-300';

          setTimeout(() => {
            this.router.navigate(['clip', clipDocRef.id]);
          }, 1600);
        },
        error: (err) => {
          this.uploadForm.enable();
          this.alertMsg =
            'Sorry! An unexpected error occured! Please try again later.';
          this.progressBarColor = 'bg-white';
          this.alertColor = 'red';
          this.inSubmission = false;
          console.log(err);
        },
      });
  }

  selectScreenshot(newlySelectedScreenshot: string) {
    this.selectedScreenshot = newlySelectedScreenshot;
  }
}
