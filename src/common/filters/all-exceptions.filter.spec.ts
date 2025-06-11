import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { FastifyReply } from 'fastify';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockReply: Partial<FastifyReply>;
  let mockArgumentsHost: ArgumentsHost;

  const mockRequest = {
    method: 'GET',
    url: '/test',
  };

  beforeEach(() => {
    filter = new AllExceptionsFilter();

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    const mockHttpContext = {
      getResponse: () => mockReply,
      getRequest: () => mockRequest,
    };

    mockArgumentsHost = {
      switchToHttp: () => mockHttpContext,
    } as any;
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException(
      {
        message: 'Not Found',
        error: 'NotFoundError',
      },
      HttpStatus.NOT_FOUND,
    );

    filter.catch(exception, mockArgumentsHost);

    expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.NOT_FOUND,
      message: 'Not Found',
      error: 'NotFoundError',
    });
  });

  it('should handle generic Error correctly', () => {
    const exception = new Error('Something broke');

    filter.catch(exception, mockArgumentsHost);

    expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something broke',
      error: 'Error',
    });
  });

  it('should handle unknown exceptions correctly', () => {
    const exception = 'Unknown Error String';

    filter.catch(exception, mockArgumentsHost);

    expect(mockReply.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockReply.send).toHaveBeenCalledWith({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'InternalServerError',
    });
  });
});
