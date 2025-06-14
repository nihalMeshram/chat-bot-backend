import { DocumentStatusService } from './document-status.service';
import { MessageEvent } from '@nestjs/common';
import { take } from 'rxjs/operators';

describe('DocumentStatusService', () => {
  let service: DocumentStatusService;

  beforeEach(() => {
    service = new DocumentStatusService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('subscribe', () => {
    it('should return an observable that emits status updates', (done) => {
      const docId = 'doc-123';
      const status = 'processing';

      const observable = service.subscribe(docId);

      observable.pipe(take(1)).subscribe({
        next: (event: MessageEvent) => {
          expect(event).toEqual({
            data: { documentId: docId, status },
          });
          done();
        },
        error: done.fail,
      });

      service.emitStatus(docId, status);
    });

    it('should not emit for other document IDs', (done) => {
      const docId1 = 'doc-1';
      const docId2 = 'doc-2';

      const spy = jest.fn();
      service.subscribe(docId1).subscribe(spy);

      service.emitStatus(docId2, 'unrelated');

      setTimeout(() => {
        expect(spy).not.toHaveBeenCalled();
        done();
      }, 50);
    });
  });

  describe('emitStatus', () => {
    it('should emit status to subscribers of the same document', (done) => {
      const docId = 'doc-456';
      const status = 'ingested';

      service.subscribe(docId).pipe(take(1)).subscribe({
        next: (event: MessageEvent) => {
          expect((event.data as { documentId: string; status: string }).status).toBe(status);
          done();
        },
        error: done.fail,
      });

      service.emitStatus(docId, status);
    });

    it('should do nothing if no subscribers exist for a document', () => {
      expect(() => service.emitStatus('non-existent-id', 'status')).not.toThrow();
    });
  });

  describe('complete', () => {
    it('should complete and remove the subject from the map', () => {
      const docId = 'doc-789';
      const subjectSpy = jest.fn();

      service.subscribe(docId).subscribe(subjectSpy);
      service.complete(docId);

      // After complete, it should be deleted
      expect((service as any).subjects.has(docId)).toBe(false);
    });

    it('should do nothing if subject does not exist', () => {
      expect(() => service.complete('unknown-id')).not.toThrow();
    });
  });
});
