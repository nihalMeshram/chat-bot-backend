import { Injectable } from '@nestjs/common';
import { Subject, Observable, map } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class DocumentStatusService {
  private subjects: Map<string, Subject<string>> = new Map();

  /**
   * Subscribes to status updates for a document.
   * Returns an Observable that emits MessageEvents for SSE.
   */
  subscribe(docId: string): Observable<MessageEvent> {
    if (!this.subjects.has(docId)) {
      this.subjects.set(docId, new Subject<string>());
    }

    const subject = this.subjects.get(docId)!;

    return subject.asObservable().pipe(
      // Wrap raw status string into SSE MessageEvent structure
      map((status) => ({
        data: { documentId: docId, status },
      }))
    );
  }

  /**
   * Emits a status update for the given document.
   */
  emitStatus(docId: string, status: string) {
    const subject = this.subjects.get(docId);
    if (subject) {
      subject.next(status);
    }
  }

  /**
   * Completes and cleans up the subject for the document.
   */
  complete(docId: string) {
    const subject = this.subjects.get(docId);
    if (subject) {
      subject.complete();
      this.subjects.delete(docId);
    }
  }
}
