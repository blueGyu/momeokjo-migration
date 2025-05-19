interface CustomErrorInterface {
  message: string;
  status?: number;
  target?: string;
}

class CustomError extends Error {
  constructor(message: string, public status = 500, public target?: string) {
    super(message);
    this.status = status;
    this.message = message;
    this.target = target;
  }
}

const customErrorResponse = ({ message, status, target }: CustomErrorInterface) => {
  return new CustomError(message, status, target);
};

export default customErrorResponse;
