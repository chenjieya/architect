import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getUser(): string {
    return 'Hello Post User!';
  }
}
