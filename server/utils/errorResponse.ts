class ErrorResponse extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    
    // Set prototype explicitly to maintain instanceof checks
    Object.setPrototypeOf(this, ErrorResponse.prototype);
  }
}

export default ErrorResponse; 