import { ApiBearerAuth, ApiOperation, ApiResponse, ApiResponseOptions } from '@nestjs/swagger'
import { UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'
import { AuthGuard } from '@nestjs/passport'

import { Public } from 'src/auth/jwt'

export function Route(params:{
  public?:boolean,
  method:Function,
  description:Partial<OperationObject>,
  responses?:ApiResponseOptions[]
}): MethodDecorator {
  return function (target: any, key: string | symbol, descriptor: PropertyDescriptor) {
    //Public or not
    if (params.public) {
      Public()(target, key, descriptor)
    } else {
      UseGuards(AuthGuard('jwt'))(target, key, descriptor)
      ApiBearerAuth()(target, key, descriptor)
    }

    //Get, Post, Delete...
    params.method(target, key, descriptor)
    
    //Swagger doc
    ApiOperation(params.description)(target, key, descriptor)    
    params.responses?.forEach((resp) => {
      ApiResponse(resp)(target, key, descriptor)
    })

    //???
    UsePipes(ValidationPipe)(target, key, descriptor)
  }
}