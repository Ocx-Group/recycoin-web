import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Response } from '@app/core/models/response-model/response.model';

interface UploadResult {
  key: string;
  url: string;
}

@Injectable({
  providedIn: 'root',
})
export class ObjectStorageService {
  constructor(private readonly http: HttpClient) {}

  uploadProductImage(file: File, productId: number): Observable<string> {
    return this.upload(
      `${environment.apis.inventoryService}/storage/upload`,
      environment.tokens.inventoryService,
      file,
      'products',
      `${productId}.jpg`,
    );
  }

  uploadAccountImage(
    file: File,
    folder: string,
    fileName?: string,
  ): Observable<string> {
    return this.upload(
      `${environment.apis.accountService}/storage/upload`,
      environment.tokens.accountService,
      file,
      folder,
      fileName,
    );
  }

  private upload(
    url: string,
    token: string,
    file: File,
    folder: string,
    fileName?: string,
  ): Observable<string> {
    const body = new FormData();
    body.append('file', file);
    body.append('folder', folder);
    if (fileName) body.append('fileName', fileName);

    const headers = new HttpHeaders({
      Authorization: token.toString(),
      'X-Client-ID': environment.tokens.clientID.toString(),
    });

    return this.http.post<Response<UploadResult>>(url, body, { headers }).pipe(
      map(response => {
        if (!response.success)
          throw new Error(response.message || 'Upload failed');
        return response.data.url;
      }),
    );
  }
}
