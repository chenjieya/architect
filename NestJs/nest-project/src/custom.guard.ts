import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class CustomGuard implements CanActivate {
  @Inject(Reflector)
  private readonly reflect: Reflector;

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const metadata = this.reflect.get('SetUser', context.getHandler());
    console.log(metadata);

    const metadataClass = this.reflect.get('MyClass', context.getClass());

    console.log(metadataClass);

    return true;
  }
}
