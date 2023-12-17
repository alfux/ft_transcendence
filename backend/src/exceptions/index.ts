import { HttpException, HttpStatus } from "@nestjs/common";

export class HttpUnauthorized extends HttpException {
  constructor(what?: string) {
    super(what===undefined ? "Unauthorized" : "Unauthorized: " + what, HttpStatus.UNAUTHORIZED)
  }
}

export class HttpBadRequest extends HttpException {
  constructor(what?: string) {
    super(what===undefined ? "Bad request" : "Bad request:" + what, HttpStatus.BAD_REQUEST)
  }
}

export class HttpMissingArg extends HttpException {
  constructor(what?: string) {
    super(what===undefined ? "Missing argument" : "Missing argument:" + what, HttpStatus.BAD_REQUEST)
  }
}

export class HttpNotFound extends HttpException {
  constructor(what:string) {
    super(what + " not found", HttpStatus.NOT_FOUND)
  }
}
