import { HttpException, HttpStatus } from "@nestjs/common";

export class HttpUnauthorized extends HttpException {
  constructor() {
    super("Unauthorized", HttpStatus.UNAUTHORIZED)
  }
}

export class HttpBadRequest extends HttpException {
  constructor() {
    super("Bad request", HttpStatus.BAD_REQUEST)
  }
}

export class HttpMissingArg extends HttpException {
  constructor() {
    super("Missing argument", HttpStatus.BAD_REQUEST)
  }
}

export class HttpNotFound extends HttpException {
  constructor(what:string) {
    super(what + " not found", HttpStatus.NOT_FOUND)
  }
}
